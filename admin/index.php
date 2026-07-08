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
require __DIR__ . '/inc/import.php';

$action = $_POST['action'] ?? $_GET['action'] ?? '';

/* ============================ Acciones POST ============================ */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Si el cuerpo excede post_max_size, PHP descarta $_POST y $_FILES por
    // completo: se detecta por un POST con Content-Length pero $_POST vacío.
    // Sin esto, el fallo se confundiría con "Token CSRF inválido".
    if (empty($_POST) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        $max = ini_get('post_max_size');
        flash('error', "El archivo es demasiado grande: supera el máximo permitido ($max). Comprime el shapefile o avísame para subir el límite.");
        redirect('index.php');
    }

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

    if ($action === 'import_fetch') {
        import_handle();
        redirect('index.php');
    }

    if ($action === 'import_publish') {
        import_publish_handle();
        redirect('index.php');
    }

    if ($action === 'atlas_pdf') {
        atlas_pdf_handle();
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
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }

    if ($action === 'theme_add') {
        theme_add((string)($_POST['name'] ?? ''), (string)($_POST['icon'] ?? ''));
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }
    if ($action === 'theme_update') {
        theme_update((string)($_POST['id'] ?? ''), (string)($_POST['name'] ?? ''), (string)($_POST['icon'] ?? ''));
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }
    if ($action === 'theme_move') {
        theme_move((string)($_POST['id'] ?? ''), (string)($_POST['dir'] ?? ''));
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }
    if ($action === 'theme_delete') {
        theme_delete((string)($_POST['id'] ?? ''));
        redirect('index.php');
    }

    if ($action === 'basemap_update') {
        $c = catalog_load();
        $c['basemap'] = [
            'enabled'  => isset($_POST['enabled']),
            'name'     => trim((string)($_POST['name'] ?? '')) ?: 'Capas Base',
            'icon'     => trim((string)($_POST['icon'] ?? '')) ?: 'fa-map',
            'expanded' => isset($_POST['expanded']),
        ];
        catalog_save($c); regenerate_layers_js($c);
        flash('ok', 'Grupo de mapas de fondo actualizado.');
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }

    if ($action === 'layer_style') {
        layer_style(
            (string)($_POST['layer'] ?? ''),
            (string)($_POST['style_type'] ?? ''),
            (string)($_POST['color'] ?? '#1e73be'),
            (float)($_POST['width'] ?? 2)
        );
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }

    if ($action === 'layer_analysis') {
        layer_analysis(
            (string)($_POST['layer'] ?? ''),
            (string)($_POST['role'] ?? ''),
            (string)($_POST['field'] ?? '')
        );
        if (is_ajax()) ajax_ok();
        redirect('index.php');
    }

    if ($action === 'layer_move') {
        $ok = layer_move((string)($_POST['layer'] ?? ''), (string)($_POST['dir'] ?? ''));
        if ($ok) flash('ok', 'Orden actualizado.');
        if (is_ajax()) ajax_ok($ok);
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

    $err = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    if (empty($_FILES['file']) || $err !== UPLOAD_ERR_OK) {
        $msgs = [
            UPLOAD_ERR_INI_SIZE   => 'El archivo supera el máximo permitido (' . ini_get('upload_max_filesize') . ').',
            UPLOAD_ERR_FORM_SIZE  => 'El archivo supera el tamaño máximo del formulario.',
            UPLOAD_ERR_PARTIAL    => 'La subida se interrumpió; vuelve a intentarlo.',
            UPLOAD_ERR_NO_FILE    => 'No seleccionaste ningún archivo.',
            UPLOAD_ERR_NO_TMP_DIR => 'Error del servidor: no hay carpeta temporal.',
            UPLOAD_ERR_CANT_WRITE => 'Error del servidor: no se pudo escribir el archivo.',
        ];
        flash('error', $msgs[$err] ?? 'No se pudo recibir el archivo (código ' . $err . ').');
        return;
    }
    $orig = $_FILES['file']['name'];
    $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    if (!in_array($ext, ['zip', 'geojson', 'json', 'kml', 'kmz'], true)) {
        flash('error', 'Formato no soportado. Usa .zip (shapefile), .geojson, .kml o .kmz.'); return;
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
        } elseif ($ext === 'kmz') {
            // Un KMZ es un ZIP con un .kml adentro (por convención doc.kml) e íconos.
            $za = new ZipArchive();
            if ($za->open($dest) !== true) { flash('error', 'KMZ ilegible.'); return; }
            $za->extractTo($work); $za->close();
            $kml = glob($work . '/doc.kml') ?: glob($work . '/*.kml') ?: glob($work . '/**/*.kml');
            if (!$kml) { flash('error', 'El KMZ no contiene un .kml.'); return; }
            $src = $kml[0];
        } else {
            $src = $dest;
        }

        // KML/KMZ tipo NetworkLink: no tiene geometría, es un puntero a un servidor
        // remoto (p. ej. exportado desde el Atlas de CENAPRED/ArcGIS). ogr2ogr fallaría
        // con un error críptico; damos un mensaje claro antes de intentar cargarlo.
        if (in_array($ext, ['kml', 'kmz'], true) && is_file($src)) {
            $head = (string)file_get_contents($src, false, null, 0, 65536);
            if (stripos($head, '<NetworkLink') !== false && stripos($head, '<Placemark') === false) {
                flash('error', 'Este KML/KMZ no contiene datos: es un enlace en vivo (NetworkLink) '
                    . 'a un servidor remoto, no geometría descargable. Descarga la capa real '
                    . '(por ejemplo como GeoJSON desde el servicio de origen) y súbela.');
                return;
            }
        }

        $res = publish_source($src, $table, $title, $theme, [
            'overwrite'    => !empty($_POST['overwrite']),
            'src_epsg'     => preg_replace('/\D/', '', (string)($_POST['src_epsg'] ?? '')),
            'src_encoding' => (string)($_POST['src_encoding'] ?? ''),
            'visible'      => isset($_POST['visible']),
            'style_type'   => (string)($_POST['style_type'] ?? ''),
            'color'        => (string)($_POST['color'] ?? '#1e73be'),
            'width'        => (float)($_POST['width'] ?? 2),
        ]);
        if (!$res['ok']) { flash('error', $res['error']); return; }
        flash('ok', "Capa '{$res['table']}' publicada ({$res['rows']} elementos, geom {$res['geom']})"
            . ($res['style_ok'] ? ' con estilo aplicado.' : ' — ESTILO no aplicado (revisa GeoServer).'));
    } finally {
        rrmdir($work);
    }
}

/**
 * Núcleo de publicación reutilizable: carga un archivo geoespacial a PostGIS, lo
 * publica en GeoServer, aplica un estilo (plano por preset, o CLASIFICADO desde un
 * renderer ArcGIS) y lo registra en el catálogo. Lo usan publish_handle (subida
 * manual) e import_publish_handle (publicar desde el importador con su estilo).
 * $opts: overwrite, src_epsg, src_encoding, visible, style_type, color, width, renderer.
 */
function publish_source(string $src, string $table, string $title, string $theme, array $opts = []): array {
    if (pg_table_exists($table) && empty($opts['overwrite'])) {
        return ['ok' => false, 'error' => "La capa '$table' ya existe en PostGIS. Marca 'sobrescribir' para reemplazarla."];
    }
    $load = pg_load_file($src, $table, ($opts['src_epsg'] ?? '') ?: null, ($opts['src_encoding'] ?? '') ?: null);
    if (!$load['ok']) return ['ok' => false, 'error' => 'ogr2ogr no cargó datos. ' . h(substr($load['log'], -300))];

    pg_grant_select($table);

    $pub = gs_publish_featuretype($table, $title);
    if (!$pub['ok'] && $pub['code'] !== 409) {
        return ['ok' => false, 'error' => "GeoServer no publicó la capa (HTTP {$pub['code']}). " . h(substr($pub['body'], 0, 200))];
    }

    $geom      = pg_geom_type($table);
    $styleName = $table;

    // Estilo: primero se intenta el renderer clasificado (importación); si no, preset plano.
    $sld = null; $stype = null;
    if (!empty($opts['renderer']) && is_array($opts['renderer'])) {
        $cols = pg_columns($table);
        // Podar la leyenda a las categorías realmente presentes (uniqueValue).
        $present = [];
        $r = $opts['renderer'];
        if (($r['type'] ?? '') === 'uniqueValue' && !empty($r['field1'])) {
            $field = strtolower((string)$r['field1']);
            foreach ($cols as $c) if (strcasecmp($c, (string)$r['field1']) === 0) { $field = $c; break; }
            $present = pg_distinct_values($table, $field);
        }
        $sld = sld_from_arcgis_renderer($r, $styleName, $geom, $cols, $present);
        if ($sld !== null) $stype = 'classified';
    }
    $color = (string)($opts['color'] ?? '#1e73be');
    $width = (float)($opts['width'] ?? 2); if ($width <= 0) $width = 2;
    if ($sld === null) {
        $stype = ($opts['style_type'] ?? '') !== '' ? (string)$opts['style_type'] : sld_suggest_type($geom);
        $allowed = sld_allowed_types($geom);
        if (!isset($allowed[$stype])) $stype = array_key_first($allowed);
        $sld = sld_generate($styleName, $stype, $color, $width);
    }
    $st = gs_apply_style($table, $styleName, $sld);
    $styleRef = $st['ok'] ? config()['geoserver']['workspace'] . ':' . $styleName : '';

    catalog_upsert([
        'layer'      => $table,
        'name'       => $title,
        'theme'      => $theme,
        'visible'    => !empty($opts['visible']),
        'style'      => $styleRef,
        'geom'       => $geom,
        'style_type' => $stype,
        'color'      => $color,
        'width'      => $width,
        'extent'     => pg_extent_3857($table),
    ]);

    return ['ok' => true, 'rows' => $load['rows'], 'geom' => $geom, 'table' => $table, 'style_ok' => $st['ok']];
}

/** Sube/reemplaza el PDF oficial del Atlas que enlaza el botón "información" del visor. */
function atlas_pdf_handle(): void {
    $err = $_FILES['pdf']['error'] ?? UPLOAD_ERR_NO_FILE;
    if (empty($_FILES['pdf']) || $err !== UPLOAD_ERR_OK) {
        $map = [
            UPLOAD_ERR_INI_SIZE  => 'El PDF supera el máximo permitido (' . ini_get('upload_max_filesize') . ').',
            UPLOAD_ERR_FORM_SIZE => 'El PDF supera el tamaño máximo del formulario.',
            UPLOAD_ERR_NO_FILE   => 'No seleccionaste ningún archivo.',
            UPLOAD_ERR_PARTIAL   => 'La subida se interrumpió; vuelve a intentarlo.',
        ];
        flash('error', $map[$err] ?? 'No se pudo recibir el PDF (código ' . $err . ').');
        return;
    }
    $tmp = $_FILES['pdf']['tmp_name'];
    if (strtolower(pathinfo($_FILES['pdf']['name'], PATHINFO_EXTENSION)) !== 'pdf') {
        flash('error', 'El archivo debe ser un .pdf.'); return;
    }
    // Verificar la firma real del archivo (%PDF-), no solo la extensión.
    if (strncmp((string)file_get_contents($tmp, false, null, 0, 5), '%PDF-', 5) !== 0) {
        flash('error', 'El archivo no es un PDF válido.'); return;
    }
    $dir = dirname(config()['paths']['layersjs']) . '/pdf';
    if (!is_dir($dir) && !@mkdir($dir, 0775, true)) {
        flash('error', 'No se pudo crear la carpeta pdf/.'); return;
    }
    $dest = $dir . '/atlas_municipal.pdf';
    if (!move_uploaded_file($tmp, $dest)) {
        flash('error', 'No se pudo guardar el PDF (revisa permisos de la carpeta pdf/).'); return;
    }
    @chmod($dest, 0644);
    flash('ok', 'Documento del Atlas actualizado. Se enlaza desde el botón “información” del visor.');
}

function theme_add(string $name, string $icon): void {
    $name = trim($name);
    if ($name === '') { flash('error', 'El nombre del tema es obligatorio.'); return; }
    $c = catalog_load();
    $id = $base = catalog_slug($name);
    $n = 2;
    while (catalog_theme_find($c, $id) >= 0) { $id = $base . '-' . $n; $n++; }
    $c['themes'][] = [
        'id'       => $id,
        'name'     => $name,
        'icon'     => trim($icon) !== '' ? trim($icon) : 'fa-layer-group',
        'expanded' => false,
    ];
    catalog_save($c); regenerate_layers_js($c);
    flash('ok', "Tema “{$name}” creado.");
}

function theme_update(string $id, string $name, string $icon): void {
    $c = catalog_load();
    $i = catalog_theme_find($c, $id);
    if ($i < 0) { flash('error', 'Tema no encontrado.'); return; }
    $name = trim($name);
    if ($name === '') { flash('error', 'El nombre no puede quedar vacío.'); return; }
    $c['themes'][$i]['name'] = $name;
    if (trim($icon) !== '') $c['themes'][$i]['icon'] = trim($icon);
    catalog_save($c); regenerate_layers_js($c);
    flash('ok', 'Tema actualizado.');
}

function theme_move(string $id, string $dir): void {
    $c = catalog_load();
    $i = catalog_theme_find($c, $id);
    if ($i < 0) return;
    $j = $dir === 'up' ? $i - 1 : $i + 1;
    if ($j < 0 || $j >= count($c['themes'])) return;
    $tmp = $c['themes'][$i]; $c['themes'][$i] = $c['themes'][$j]; $c['themes'][$j] = $tmp;
    catalog_save($c); regenerate_layers_js($c);
    flash('ok', 'Orden de temas actualizado.');
}

function theme_delete(string $id): void {
    $c = catalog_load();
    $i = catalog_theme_find($c, $id);
    if ($i < 0) { flash('error', 'Tema no encontrado.'); return; }
    $count = catalog_theme_count($c, $id);
    if ($count > 0) {
        flash('error', "No se puede eliminar “{$c['themes'][$i]['name']}”: tiene $count capa(s). Muévelas a otro tema primero.");
        return;
    }
    if (count($c['themes']) <= 1) { flash('error', 'Debe quedar al menos un tema.'); return; }
    $nm = $c['themes'][$i]['name'];
    array_splice($c['themes'], $i, 1);
    catalog_save($c); regenerate_layers_js($c);
    flash('ok', "Tema “{$nm}” eliminado.");
}

function layer_style(string $layer, string $type, string $color, float $width): void {
    if ($layer === '') return;
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    if ($i < 0) { flash('error', 'Capa no encontrada en el catálogo.'); return; }

    $allowed = sld_allowed_types($c['layers'][$i]['geom'] ?? '');
    if (!isset($allowed[$type])) $type = array_key_first($allowed);
    if ($width <= 0) $width = 2;

    $styleName = $layer; // mismo nombre que la capa
    $sld = sld_generate($styleName, $type, $color, $width);
    $st = gs_apply_style($layer, $styleName, $sld);
    if (!$st['ok']) {
        flash('error', "GeoServer no aplicó el estilo (HTTP {$st['code']}).");
        return;
    }
    $c['layers'][$i]['style']      = config()['geoserver']['workspace'] . ':' . $styleName;
    $c['layers'][$i]['style_type'] = $type;
    $c['layers'][$i]['color']      = $color;
    $c['layers'][$i]['width']      = $width;
    catalog_save($c);
    // Regenerar para que el metadato del visor (styleType/color/width) no quede desfasado.
    regenerate_layers_js($c);
    flash('ok', "Estilo de '$layer' actualizado. Recarga el visor (Ctrl+F5) para verlo.");
}

/** Asigna (o limpia) el papel de una capa en el análisis ciudadano + el campo elegido. */
function layer_analysis(string $layer, string $role, string $field): void {
    if ($layer === '') return;
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    if ($i < 0) { flash('error', 'Capa no encontrada en el catálogo.'); return; }

    $roles = ['colonia', 'poblacion', 'peligro', 'equipamiento'];
    if ($role === '' || !in_array($role, $roles, true)) {
        unset($c['layers'][$i]['analisis']);           // quitar del análisis
    } else {
        $c['layers'][$i]['analisis'] = ['role' => $role, 'field' => trim($field)];
    }
    catalog_save($c);
    regenerate_layers_js($c);
    flash('ok', "Análisis de '$layer' actualizado. Recarga el visor (Ctrl+F5).");
}

function layer_move(string $layer, string $dir): bool {
    $c = catalog_load();
    $i = catalog_find($c, $layer);
    if ($i < 0) return false;
    $theme = $c['layers'][$i]['theme'] ?? '';
    // Índices de la misma temática ordenados por 'order'.
    $sib = [];
    foreach ($c['layers'] as $idx => $l) if (($l['theme'] ?? '') === $theme) $sib[] = $idx;
    usort($sib, fn($a, $b) => ((int)($c['layers'][$a]['order'] ?? 0)) <=> ((int)($c['layers'][$b]['order'] ?? 0)));
    $pos = array_search($i, $sib, true);
    $swap = $dir === 'up' ? $pos - 1 : $pos + 1;
    if ($pos === false || $swap < 0 || $swap >= count($sib)) return false;
    $a = $sib[$pos]; $b = $sib[$swap];
    $tmp = $c['layers'][$a]['order'] ?? 0;
    $c['layers'][$a]['order'] = $c['layers'][$b]['order'] ?? 0;
    $c['layers'][$b]['order'] = $tmp;
    return catalog_save($c) && regenerate_layers_js($c);
}

/** ¿La petición actual es AJAX? (fetch del panel para reordenar sin recargar). */
function is_ajax(): bool {
    if (($_POST['ajax'] ?? '') === '1') return true;
    return strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';
}

/** Responde JSON y termina. */
function json_out(array $data): void {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

/** Respuesta AJAX estándar: ok + mensajes flash pendientes (para mostrarlos como toast). */
function ajax_ok(bool $ok = true): void {
    json_out(['ok' => $ok, 'flash' => flash_take()]);
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

/* ===================== Descarga de capa importada (GET) ===================== */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'import_download') {
    if (!is_authenticated()) { http_response_code(403); exit('No autorizado.'); }
    import_download();
}

/* ============================ Vistas ============================ */
require __DIR__ . '/inc/views.php';
