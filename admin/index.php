<?php
/**
 * Panel administrativo — Atlas de Peligros y Riesgos de Apaseo el Grande.
 * Carga y publicación de capas (PostGIS + GeoServer) y gestión del catálogo.
 */
declare(strict_types=1);

require __DIR__ . '/inc/bootstrap.php';
require __DIR__ . '/inc/auth.php';
require __DIR__ . '/inc/postgis.php';
require __DIR__ . '/inc/geoserver.php';
require __DIR__ . '/inc/sld.php';
require __DIR__ . '/inc/catalog.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

/* ============================ Acciones POST ============================ */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Setup inicial: solo permitido si aún no hay contraseña.
    if ($action === 'setup' && !admin_is_setup()) {
        csrf_check();
        $pw = (string)($_POST['password'] ?? '');
        $pw2 = (string)($_POST['password2'] ?? '');
        if ($pw !== $pw2)            flash('error', 'Las contraseñas no coinciden.');
        elseif (strlen($pw) < 10)    flash('error', 'La contraseña debe tener al menos 10 caracteres.');
        elseif (admin_setup($pw))    { flash('ok', 'Contraseña configurada. Inicia sesión.'); }
        else                         flash('error', 'No se pudo guardar la contraseña.');
        redirect('index.php');
    }

    // Login.
    if ($action === 'login' && admin_is_setup()) {
        csrf_check();
        $rem = admin_lock_remaining();
        if ($rem > 0) {
            flash('error', 'Demasiados intentos. Espera ' . ceil($rem / 60) . ' min.');
        } elseif (admin_login((string)($_POST['password'] ?? ''))) {
            flash('ok', 'Sesión iniciada.');
            redirect('index.php');
        } else {
            flash('error', 'Contraseña incorrecta.');
        }
        redirect('index.php');
    }

    // A partir de aquí se requiere sesión.
    if (!is_authenticated()) { http_response_code(403); exit('No autorizado.'); }
    csrf_check();

    if ($action === 'logout') { admin_logout(); redirect('index.php'); }

    if ($action === 'change_password') {
        $ok = admin_change_password((string)($_POST['current'] ?? ''), (string)($_POST['new'] ?? ''));
        flash($ok ? 'ok' : 'error', $ok ? 'Contraseña actualizada.' : 'No se pudo cambiar (verifica la actual y mínimo 10 caracteres).');
        redirect('index.php');
    }

    if ($action === 'publish') {
        publish_handle();
        redirect('index.php');
    }

    if ($action === 'layer_update') {
        $layer = (string)($_POST['layer'] ?? '');
        $c = catalog_load();
        $i = catalog_find($c, $layer);
        if ($i >= 0) {
            $c['layers'][$i]['name']    = trim((string)($_POST['name'] ?? $c['layers'][$i]['name']));
            $c['layers'][$i]['theme']   = (string)($_POST['theme'] ?? $c['layers'][$i]['theme']);
            $c['layers'][$i]['visible'] = isset($_POST['visible']);
            catalog_save($c); regenerate_layers_js($c);
            flash('ok', 'Capa actualizada: ' . h($layer));
        }
        redirect('index.php');
    }

    if ($action === 'layer_move') {
        layer_move((string)($_POST['layer'] ?? ''), (string)($_POST['dir'] ?? ''));
        redirect('index.php');
    }

    if ($action === 'layer_delete') {
        layer_delete((string)($_POST['layer'] ?? ''), isset($_POST['purge']));
        redirect('index.php');
    }

    if ($action === 'regenerate') {
        flash(regenerate_layers_js() ? 'ok' : 'error', 'municipio.layers.js regenerado.');
        redirect('index.php');
    }

    redirect('index.php');
}

/* ============================ Lógica de negocio ============================ */

function publish_handle(): void {
    $themes = array_column(catalog_load()['themes'], 'id');
    $theme  = (string)($_POST['theme'] ?? '');
    if (!in_array($theme, $themes, true)) { flash('error', 'Tema inválido.'); return; }

    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        flash('error', 'Archivo no recibido (¿supera el tamaño máximo?).'); return;
    }
    $orig = $_FILES['file']['name'];
    $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    if (!in_array($ext, ['zip', 'geojson', 'json', 'kml'], true)) {
        flash('error', 'Formato no soportado. Usa .zip (shapefile), .geojson o .kml.'); return;
    }

    $title = trim((string)($_POST['title'] ?? '')) ?: pathinfo($orig, PATHINFO_FILENAME);
    $base  = (string)($_POST['layer_name'] ?? '') ?: pathinfo($orig, PATHINFO_FILENAME);
    $table = pg_safe_table($base);
    if ($table === '') { flash('error', 'Nombre de capa inválido.'); return; }

    // Workdir temporal fuera del webroot.
    $work = config()['paths']['uploads'] . '/' . bin2hex(random_bytes(6));
    @mkdir($work, 0700, true);
    $src = null;
    try {
        $dest = $work . '/' . basename($orig);
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
            flash('error', 'No se pudo guardar el archivo subido.'); return;
        }
        if ($ext === 'zip') {
            $za = new ZipArchive();
            if ($za->open($dest) !== true) { flash('error', 'ZIP ilegible.'); return; }
            $za->extractTo($work); $za->close();
            $shp = glob($work . '/*.shp') ?: glob($work . '/**/*.shp');
            if (!$shp) { flash('error', 'El ZIP no contiene un .shp.'); return; }
            $src = $shp[0];
        } else {
            $src = $dest;
        }

        // Evitar pisar una capa existente sin querer.
        if (pg_table_exists($table) && empty($_POST['overwrite'])) {
            flash('error', "La capa '$table' ya existe en PostGIS. Marca 'sobrescribir' para reemplazarla.");
            return;
        }

        $srcEpsg = preg_replace('/\D/', '', (string)($_POST['src_epsg'] ?? ''));
        $load = pg_load_file($src, $table, $srcEpsg ?: null);
        if (!$load['ok']) {
            flash('error', 'ogr2ogr no cargó datos. ' . h(substr($load['log'], -300)));
            return;
        }

        // Permiso de lectura para GeoServer.
        pg_grant_select($table);

        // Publicar en GeoServer.
        $pub = gs_publish_featuretype($table, $title);
        if (!$pub['ok'] && $pub['code'] !== 409) { // 409 = ya existía
            flash('error', "GeoServer no publicó la capa (HTTP {$pub['code']}). " . h(substr($pub['body'], 0, 200)));
            return;
        }

        // Estilo.
        $geom  = pg_geom_type($table);
        $stype = (string)($_POST['style_type'] ?? sld_suggest_type($geom));
        $color = (string)($_POST['color'] ?? '#1e73be');
        $styleName = $table;
        $sld = sld_generate($styleName, $stype, $color);
        $st = gs_apply_style($table, $styleName, $sld);
        $styleRef = $st['ok'] ? config()['geoserver']['workspace'] . ':' . $styleName : '';

        // Extent para el zoom del visor.
        $extent = pg_extent_3857($table);

        // Catálogo + regeneración.
        catalog_upsert([
            'layer'   => $table,
            'name'    => $title,
            'theme'   => $theme,
            'visible' => isset($_POST['visible']),
            'style'   => $styleRef,
            'extent'  => $extent,
        ]);

        flash('ok', "Capa '$table' publicada ({$load['rows']} elementos, geom $geom)"
            . ($st['ok'] ? ' con estilo aplicado.' : ' — ESTILO no aplicado (revisa GeoServer).'));
    } finally {
        rrmdir($work);
    }
}

function layer_move(string $layer, string $dir): void {
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    if ($i < 0) return;
    $theme = $c['layers'][$i]['theme'] ?? '';
    // Índices de la misma temática ordenados por 'order'.
    $sib = [];
    foreach ($c['layers'] as $idx => $l) if (($l['theme'] ?? '') === $theme) $sib[] = $idx;
    usort($sib, fn($a, $b) => ((int)($c['layers'][$a]['order'] ?? 0)) <=> ((int)($c['layers'][$b]['order'] ?? 0)));
    $pos = array_search($i, $sib, true);
    $swap = $dir === 'up' ? $pos - 1 : $pos + 1;
    if ($pos === false || $swap < 0 || $swap >= count($sib)) return;
    $a = $sib[$pos]; $b = $sib[$swap];
    $tmp = $c['layers'][$a]['order'] ?? 0;
    $c['layers'][$a]['order'] = $c['layers'][$b]['order'] ?? 0;
    $c['layers'][$b]['order'] = $tmp;
    catalog_save($c); regenerate_layers_js($c);
    flash('ok', 'Orden actualizado.');
}

function layer_delete(string $layer, bool $purge): void {
    if ($layer === '') return;
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    $style = $i >= 0 ? ($c['layers'][$i]['style'] ?? '') : '';
    $styleName = $style && strpos($style, ':') !== false ? explode(':', $style, 2)[1] : null;

    if ($purge) {
        gs_delete_layer($layer, $styleName);
        pg_drop_table($layer);
    }
    catalog_remove($layer);
    flash('ok', $purge
        ? "Capa '$layer' eliminada del visor, GeoServer y PostGIS."
        : "Capa '$layer' quitada del catálogo (sigue publicada en GeoServer).");
}

function rrmdir(string $dir): void {
    if (!is_dir($dir)) return;
    foreach (scandir($dir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = "$dir/$f";
        is_dir($p) ? rrmdir($p) : @unlink($p);
    }
    @rmdir($dir);
}

/* ============================ Vistas ============================ */
require __DIR__ . '/inc/views.php';
