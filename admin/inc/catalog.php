<?php
/**
 * Catálogo de capas: fuente única en catalog.json. Desde él se regenera
 * municipio.layers.js (window.MUNICIPIO_LAYERS) que consume el visor.
 */
declare(strict_types=1);

/** Temas por defecto (espejo de la estructura original del visor). */
function catalog_default(): array {
    return [
        'themes' => [
            ['id' => 'medio-fisico',            'name' => 'Medio físico',            'icon' => 'fa-mountain',             'expanded' => false],
            ['id' => 'medio-sociodemografico',  'name' => 'Medio sociodemográfico',  'icon' => 'fa-users',                'expanded' => true],
            ['id' => 'peligros',                'name' => 'Peligros',                'icon' => 'fa-exclamation-triangle', 'expanded' => false],
            ['id' => 'riesgos',                 'name' => 'Riesgos',                 'icon' => 'fa-exclamation-circle',   'expanded' => false],
            ['id' => 'obras',                   'name' => 'Obras',                   'icon' => 'fa-helmet-safety',        'expanded' => false],
        ],
        'layers' => [
            [
                'layer'   => 'limite_municipal',
                'name'    => 'Límite Municipal',
                'theme'   => 'medio-sociodemografico',
                'visible' => true,
                'order'   => 0,
                'style'   => 'apaseo_gde:limite_municipal',
                'extent'  => [-11217092.9685, 2328133.4185, -11185615.2763, 2358316.6365],
            ],
        ],
    ];
}

function catalog_load(): array {
    $path = config()['paths']['catalog'];
    $c = json_read($path, []);
    if (empty($c['themes'])) $c = catalog_default();
    if (!isset($c['layers'])) $c['layers'] = [];
    return $c;
}

function catalog_save(array $c): bool {
    return json_write(config()['paths']['catalog'], $c);
}

function catalog_find(array $c, string $layer): int {
    foreach ($c['layers'] as $i => $l) {
        if (($l['layer'] ?? '') === $layer) return $i;
    }
    return -1;
}

/** Agrega o actualiza una capa en el catálogo. */
function catalog_upsert(array $entry): bool {
    $c = catalog_load();
    $i = catalog_find($c, $entry['layer']);
    if ($i >= 0) {
        $c['layers'][$i] = array_merge($c['layers'][$i], $entry);
    } else {
        $maxOrder = 0;
        foreach ($c['layers'] as $l) {
            if (($l['theme'] ?? '') === ($entry['theme'] ?? '')) {
                $maxOrder = max($maxOrder, (int)($l['order'] ?? 0) + 1);
            }
        }
        $entry['order'] = $entry['order'] ?? $maxOrder;
        $c['layers'][] = $entry;
    }
    return catalog_save($c) && regenerate_layers_js($c);
}

function catalog_remove(string $layer): bool {
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    if ($i < 0) return true;
    array_splice($c['layers'], $i, 1);
    return catalog_save($c) && regenerate_layers_js($c);
}

/** Regenera municipio.layers.js a partir del catálogo. */
function regenerate_layers_js(?array $c = null): bool {
    $c = $c ?? catalog_load();

    // extents
    $extents = [];
    foreach ($c['layers'] as $l) {
        if (!empty($l['extent']) && is_array($l['extent']) && count($l['extent']) === 4) {
            $extents[$l['layer']] = array_map('floatval', $l['extent']);
        }
    }

    // children por tema, ordenados
    $children = [];
    foreach ($c['themes'] as $t) {
        $rows = array_values(array_filter($c['layers'], fn($l) => ($l['theme'] ?? '') === $t['id']));
        usort($rows, fn($a, $b) => ((int)($a['order'] ?? 0)) <=> ((int)($b['order'] ?? 0)));
        $layers = array_map(fn($l) => [
            'name'    => $l['name'],
            'layer'   => $l['layer'],
            'visible' => (bool)($l['visible'] ?? false),
        ], $rows);
        $child = [
            'id'       => $t['id'],
            'name'     => $t['name'],
            'icon'     => $t['icon'],
            'expanded' => (bool)($t['expanded'] ?? false),
            'layers'   => $layers,
        ];
        $children[] = $child;
    }

    $struct = [
        'extents' => (object)$extents,
        'groups'  => [[
            'id'           => 'temas',
            'name'         => 'TEMAS',
            'icon'         => 'fa-folder-open',
            'iconExpanded' => 'fa-folder-open',
            'iconCollapsed'=> 'fa-folder',
            'expanded'     => true,
            'children'     => $children,
        ]],
    ];

    $json = json_encode($struct, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $banner = "/**\n"
        . " * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.\n"
        . " * No editar a mano: usar https://<host>/atlas-apaseo-gde/admin/\n"
        . " * Fuente: admin/data/catalog.json   |   Regenerado: " . date('c') . "\n"
        . " */\n";
    $js = $banner . "window.MUNICIPIO_LAYERS = " . $json . ";\n";

    // Escritura en sitio: apache puede sobrescribir el archivo pero no tiene
    // permiso de rename en el directorio del visor (root:webadmin).
    $target = config()['paths']['layersjs'];
    return file_put_contents($target, $js, LOCK_EX) !== false;
}
