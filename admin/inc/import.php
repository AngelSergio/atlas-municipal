<?php
/**
 * Importación de capas desde servicios ArcGIS.
 *
 * Los KMZ/KML del Atlas de CENAPRED (y similares de gobierno) suelen ser un
 * <NetworkLink> — un puntero en vivo a un ArcGIS MapServer, sin geometría dentro.
 * Este módulo lee ese enlace (o una URL pegada directamente), descarga los datos
 * por la API REST de ArcGIS y los convierte a GeoJSON descargable, para que luego
 * se publiquen por el flujo normal de "Publicar capa".
 */
declare(strict_types=1);

/**
 * Sufijos de host permitidos para la descarga remota (defensa anti-SSRF).
 * Cubre servicios ArcGIS de gobierno mexicano y de la UNAM (CENAPRED).
 */
const IMPORT_ALLOWED_HOST_SUFFIXES = ['.gob.mx', '.unam.mx'];

/** ¿El host de la URL está permitido y no apunta a una dirección interna? */
function import_host_allowed(string $url): bool {
    $p = parse_url($url);
    if (!$p || !in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true)) return false;
    $host = strtolower($p['host'] ?? '');
    if ($host === '' || $host === 'localhost') return false;
    // Bloquear IPs privadas / reservadas (loopback, 10.x, 192.168.x, link-local…).
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        if (!filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return false;
    }
    foreach (IMPORT_ALLOWED_HOST_SUFFIXES as $suf) {
        if (substr($host, -strlen($suf)) === $suf) return true;
    }
    return false;
}

/** Extrae el primer href de un <NetworkLink> dentro de un KML. */
function import_networklink_href(string $kmlPath): ?string {
    $xml = @file_get_contents($kmlPath, false, null, 0, 262144);
    if ($xml === false || stripos($xml, '<NetworkLink') === false) return null;
    if (preg_match('#<href>\s*(.*?)\s*</href>#is', $xml, $m)) {
        return html_entity_decode(trim($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    return null;
}

/**
 * Traduce una URL de servicio al endpoint REST /query de ArcGIS.
 * Acepta un KmlServer con LayerIDs, o una URL REST .../MapServer|FeatureServer/<id>.
 * Devuelve ['query'=>url, 'meta'=>url] o null si no la reconoce.
 */
function import_arcgis_endpoints(string $url): ?array {
    // Caso 1: KmlServer con parámetro LayerIDs (típico del NetworkLink de CENAPRED).
    if (stripos($url, 'KmlServer') !== false) {
        $pu = parse_url($url);
        parse_str($pu['query'] ?? '', $q);
        $ids = $q['LayerIDs'] ?? $q['layerIDs'] ?? $q['layerids'] ?? '';
        if ($ids === '') return null;
        $id = (int)explode(',', (string)$ids)[0];
        $path = preg_replace('#/KmlServer/?$#i', '', $pu['path'] ?? '');   // .../MapServer
        $path = preg_replace('#/arcgis/services/#i', '/arcgis/rest/services/', $path);
        $baseHost = ($pu['scheme'] ?? 'http') . '://' . ($pu['host'] ?? '')
            . (isset($pu['port']) ? ':' . $pu['port'] : '');
        $rest = $baseHost . $path;
        return ['query' => "$rest/$id/query", 'meta' => "$rest/$id"];
    }
    // Caso 2: URL REST directa a una capa .../MapServer/<id> o .../FeatureServer/<id>.
    if (preg_match('#^(https?://.+?/(?:MapServer|FeatureServer))/(\d+)(?:/query)?/?(?:\?.*)?$#i', $url, $m)) {
        $rest = preg_replace('#/arcgis/services/#i', '/arcgis/rest/services/', $m[1]);
        return ['query' => "$rest/{$m[2]}/query", 'meta' => "$rest/{$m[2]}"];
    }
    return null;
}

/** GET HTTP con User-Agent de navegador (algunos WAF bloquean sin él). */
function import_http_get(string $url, int $timeout = 90): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT        => $timeout,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
            . '(KHTML, like Gecko) Chrome/125 Safari/537.36',
    ]);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return ['ok' => $body !== false && $code === 200, 'code' => $code, 'body' => (string)$body, 'error' => $err];
}

/**
 * Descarga todas las entidades de una capa ArcGIS y las convierte a GeoJSON.
 * Devuelve ['ok'=>bool, 'path'=>geojson, 'name'=>str, 'features'=>int, 'geom'=>str, 'truncated'=>bool, 'error'=>str].
 */
function import_fetch_geojson(string $queryUrl, string $metaUrl, string $work, ?array $bbox = null): array {
    // Filtro espacial opcional (recorte al municipio): envolvente en EPSG:4326.
    $spatial = [];
    if ($bbox && count($bbox) === 4) {
        $spatial = [
            'geometry'     => implode(',', $bbox),   // xmin,ymin,xmax,ymax
            'geometryType' => 'esriGeometryEnvelope',
            'inSR'         => '4326',
            'spatialRel'   => 'esriSpatialRelIntersects',
        ];
    }

    // Metadatos: nombre, campo de OBJECTID y renderer (clasificación de colores).
    $name = ''; $oidField = 'OBJECTID';
    $renderer = null; $classField = ''; $categories = 0;
    $meta = import_http_get($metaUrl . '?f=json', 40);
    if ($meta['ok']) {
        $md = json_decode($meta['body'], true);
        if (is_array($md)) {
            $name = (string)($md['name'] ?? '');
            if (!empty($md['objectIdField'])) $oidField = (string)$md['objectIdField'];
            $r = $md['drawingInfo']['renderer'] ?? null;
            if (is_array($r)) {
                $renderer = $r;
                if (($r['type'] ?? '') === 'uniqueValue') {
                    $classField = (string)($r['field1'] ?? '');
                    $categories = count($r['uniqueValueInfos'] ?? []);
                } elseif (($r['type'] ?? '') === 'classBreaks') {
                    $classField = (string)($r['field'] ?? '');
                    $categories = count($r['classBreakInfos'] ?? []);
                }
            }
        }
    }

    // Conteo total (para saber cuándo terminó y avisar si algo quedó fuera).
    $total = null;
    $rc0 = import_http_get($queryUrl . '?' . http_build_query(array_merge([
        'where' => "$oidField>-1", 'returnCountOnly' => 'true', 'f' => 'json',
    ], $spatial)), 40);
    if ($rc0['ok']) { $cd = json_decode($rc0['body'], true); if (isset($cd['count'])) $total = (int)$cd['count']; }

    // Descarga paginada por RANGO de OBJECTID, ESCRITA A DISCO conforme llega. Este
    // ArcGIS NO soporta paginación por resultOffset (supportsPagination=false) y topa en
    // maxRecordCount (~1000 registros); se avanza pidiendo los OBJECTID mayores al último
    // ya traído ("OBJECTID>N", que además pasa el WAF donde "1=1" se bloquea). No se
    // acumula en memoria (una capa de decenas de miles de polígonos la agotaría): se va
    // ensamblando el Esri JSON en un archivo temporal página por página.
    $esriPath    = $work . '/esri.json';
    $geojsonPath = $work . '/import.geojson';
    $fh = fopen($esriPath, 'w');
    if (!$fh) return ['ok' => false, 'error' => 'No se pudo abrir el archivo temporal.'];

    $guard = 0; $lastOid = -1; $truncated = false; $collected = 0; $geomEsri = '';
    $headerDone = false;
    do {
        $u = $queryUrl . '?' . http_build_query(array_merge([
            'where'          => "$oidField>$lastOid",
            'outFields'      => '*',
            'outSR'          => '4326',
            'returnGeometry' => 'true',
            'f'              => 'json',
        ], $spatial));
        $r = import_http_get($u, 90);
        if (!$r['ok']) { fclose($fh); return ['ok' => false, 'error' => "El servicio no respondió (HTTP {$r['code']}). {$r['error']}"]; }
        $d = json_decode($r['body'], true);
        if (!is_array($d) || isset($d['error'])) {
            fclose($fh);
            $em = $d['error']['message'] ?? trim(substr(strip_tags($r['body']), 0, 180));
            return ['ok' => false, 'error' => "El servicio devolvió un error: " . ($em ?: 'respuesta no válida')];
        }
        if (isset($d['objectIdFieldName'])) $oidField = (string)$d['objectIdFieldName'];
        $feats = $d['features'] ?? [];
        if (!$feats) break;
        // OID máximo de la página → base de la siguiente consulta.
        $pageMax = $lastOid;
        foreach ($feats as $f) {
            $oid = $f['attributes'][$oidField] ?? null;
            if ($oid !== null && (int)$oid > $pageMax) $pageMax = (int)$oid;
        }
        // Cabecera del Esri JSON (geometryType/spatialReference/fields), una sola vez.
        if (!$headerDone) {
            $geomEsri = (string)($d['geometryType'] ?? '');
            $wrapper = $d; unset($wrapper['features'], $wrapper['exceededTransferLimit']);
            $wj = json_encode($wrapper, JSON_UNESCAPED_UNICODE);
            $wj = substr($wj, 0, strrpos($wj, '}'));           // quita la '}' final
            if (substr($wj, -1) !== '{') $wj .= ',';
            fwrite($fh, $wj . '"features":[');
            $headerDone = true;
        }
        // Features de la página (encode de un solo lote, sin acumular entre páginas).
        $fjson = json_encode($feats, JSON_UNESCAPED_UNICODE);   // "[ {..},{..} ]"
        $fjson = substr($fjson, 1, -1);                          // quita corchetes
        if ($fjson !== '') {
            fwrite($fh, ($collected > 0 ? ',' : '') . $fjson);
            $collected += count($feats);
        }
        $exceeded = !empty($d['exceededTransferLimit']);
        unset($d, $feats, $fjson);                               // liberar memoria de la página
        if ($pageMax <= $lastOid) { if ($exceeded) $truncated = true; break; }
        $lastOid = $pageMax;
        $guard++;
        if (!$exceeded) break;   // última página parcial: terminó
    } while ($guard < 1000);
    fwrite($fh, ']}');
    fclose($fh);

    if ($collected === 0) return ['ok' => false, 'error' => 'El servicio no devolvió ninguna entidad.'];
    if ($total !== null && $collected < $total) $truncated = true;

    // Convertir Esri JSON -> GeoJSON con ogr2ogr (driver ESRIJSON).
    $cmd = 'ogr2ogr -f GeoJSON ' . escapeshellarg($geojsonPath)
        . ' ' . escapeshellarg('ESRIJSON:' . $esriPath) . ' 2>&1';
    $o = []; $rc = 0; exec($cmd, $o, $rc);
    if (!is_file($geojsonPath) || filesize($geojsonPath) < 32) {
        return ['ok' => false, 'error' => 'No se pudo convertir a GeoJSON. ' . h(implode(' ', array_slice($o, -3)))];
    }

    // No se re-decodifica el GeoJSON (puede pesar decenas de MB): el conteo es $collected
    // y la geometría se deriva del tipo Esri.
    $geomMap = ['esriGeometryPoint' => 'Point', 'esriGeometryMultipoint' => 'MultiPoint',
                'esriGeometryPolyline' => 'Line', 'esriGeometryPolygon' => 'Polygon'];
    $geom = $geomMap[$geomEsri] ?? $geomEsri;
    return ['ok' => true, 'path' => $geojsonPath, 'name' => $name,
            'features' => $collected, 'geom' => $geom, 'truncated' => $truncated,
            'renderer' => $renderer, 'classField' => $classField, 'categories' => $categories];
}

/**
 * Nombre de la tabla del límite municipal, leído de municipio.config.js (fuente única
 * que cada instalación edita). Así el recorte funciona en cualquier municipio sin tocar
 * código. Cae a 'limite_municipal' si no lo encuentra.
 */
function import_boundary_table(): string {
    $default = 'limite_municipal';
    $layersjs = config()['paths']['layersjs'] ?? '';
    if ($layersjs === '') return $default;
    $cfg = dirname($layersjs) . '/municipio.config.js';
    if (!is_readable($cfg)) return $default;
    $js = (string)file_get_contents($cfg);
    if (preg_match('/limiteMunicipalLayer\s*:\s*[\'"]([A-Za-z0-9_]+)[\'"]/', $js, $m)) {
        return pg_safe_table($m[1]);
    }
    return $default;
}

/** Conteo de features de un GeoJSON vía ogrinfo (barato, no carga todo en PHP). */
function import_feature_count(string $geojsonPath): ?int {
    $o = [];
    exec('ogrinfo -so -al ' . escapeshellarg($geojsonPath) . ' 2>/dev/null', $o);
    foreach ($o as $line) {
        if (preg_match('/Feature Count:\s*(\d+)/', $line, $m)) return (int)$m[1];
    }
    return null;
}

/** Borra GeoJSON de importación con más de 24 h. */
function import_gc(string $dir): void {
    foreach (glob($dir . '/*.geojson') ?: [] as $f) {
        if (is_file($f) && (time() - filemtime($f)) > 86400) @unlink($f);
    }
}

/**
 * Handler de la acción "import_fetch": recibe KMZ/KML o URL, descarga y convierte,
 * y deja el GeoJSON listo para descargar (en $_SESSION['import_result']).
 */
function import_handle(): void {
    // Capas grandes (miles de polígonos) requieren varias consultas y memoria.
    @set_time_limit(600);
    @ini_set('memory_limit', '512M');
    unset($_SESSION['import_result']);
    $url  = trim((string)($_POST['service_url'] ?? ''));
    $work = config()['paths']['uploads'] . '/' . bin2hex(random_bytes(6));
    @mkdir($work, 0700, true);
    try {
        // 1) Resolver el href del servicio: desde archivo KMZ/KML o desde URL pegada.
        $href = '';
        $fileErr = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
        if (!empty($_FILES['file']['name']) && $fileErr === UPLOAD_ERR_OK) {
            $orig = $_FILES['file']['name'];
            $ext  = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
            if (!in_array($ext, ['kml', 'kmz'], true)) {
                flash('error', 'Para importar por archivo usa un .kml o .kmz.'); return;
            }
            $dest = $work . '/' . basename($orig);
            if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
                flash('error', 'No se pudo recibir el archivo.'); return;
            }
            $kmlPath = $dest;
            if ($ext === 'kmz') {
                $za = new ZipArchive();
                if ($za->open($dest) !== true) { flash('error', 'KMZ ilegible.'); return; }
                $za->extractTo($work); $za->close();
                $k = glob($work . '/doc.kml') ?: glob($work . '/*.kml') ?: glob($work . '/**/*.kml');
                if (!$k) { flash('error', 'El KMZ no contiene un .kml.'); return; }
                $kmlPath = $k[0];
            }
            $href = (string)import_networklink_href($kmlPath);
            if ($href === '') {
                flash('error', 'El archivo no contiene un NetworkLink. Si ya trae geometría, publícalo directo en “Publicar capa”.');
                return;
            }
        } elseif ($url !== '') {
            $href = $url;
        } else {
            flash('error', 'Sube un KMZ/KML con NetworkLink o pega la URL del servicio.'); return;
        }

        // 2) Validar host (anti-SSRF) y reconocer el endpoint ArcGIS.
        if (!import_host_allowed($href)) {
            flash('error', 'Por seguridad solo se permiten servicios en dominios .gob.mx o .unam.mx (ArcGIS de gobierno).');
            return;
        }
        $ep = import_arcgis_endpoints($href);
        if (!$ep) {
            flash('error', 'No reconozco el servicio. Debe ser un ArcGIS MapServer/FeatureServer o un KmlServer con LayerIDs.');
            return;
        }

        // 3) Recorte al municipio (opcional): bbox del límite en 4326 como filtro del servicio.
        $clip      = !empty($_POST['clip']);
        $clipExact = !empty($_POST['clip_exact']);
        $bbox = null;
        if ($clip) {
            $bt   = import_boundary_table();
            $bbox = pg_extent_4326($bt);
            if (!$bbox) {
                flash('error', "No se pudo obtener el límite municipal ('$bt') para recortar. "
                    . "¿Está cargado en PostGIS? Puedes reintentar sin recorte.");
                return;
            }
        }

        // 4) Descargar y convertir (con o sin recorte por envolvente).
        $res = import_fetch_geojson($ep['query'], $ep['meta'], $work, $bbox);
        if (!$res['ok']) { flash('error', 'No se pudo importar: ' . $res['error']); return; }

        // 4b) Recorte EXACTO al polígono del municipio (opcional, tras el recorte por bbox).
        $clippedExact = false;
        if ($clip && $clipExact) {
            $bg = pg_boundary_geojson(import_boundary_table());
            if ($bg) {
                $boundaryPath = $work . '/boundary.geojson';
                $clippedPath  = $work . '/clipped.geojson';
                file_put_contents($boundaryPath,
                    '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":' . $bg . '}]}');
                exec('ogr2ogr -f GeoJSON ' . escapeshellarg($clippedPath) . ' ' . escapeshellarg($res['path'])
                    . ' -clipsrc ' . escapeshellarg($boundaryPath) . ' 2>&1');
                if (is_file($clippedPath) && filesize($clippedPath) > 32) {
                    $res['path']     = $clippedPath;
                    $res['features'] = import_feature_count($clippedPath) ?? $res['features'];
                    $clippedExact    = true;
                }
            }
        }

        // 5) Guardar el GeoJSON para descarga.
        $importsDir = config()['paths']['uploads'] . '/imports';
        @mkdir($importsDir, 0700, true);
        import_gc($importsDir);
        $token     = bin2hex(random_bytes(16));
        $finalName = catalog_slug($res['name'] !== '' ? $res['name'] : 'capa_importada') . '.geojson';
        $finalPath = $importsDir . '/' . $token . '.geojson';
        if (!copy($res['path'], $finalPath)) { flash('error', 'No se pudo guardar el archivo para descarga.'); return; }

        $_SESSION['import_result'] = [
            'token'      => $token,
            'path'       => $finalPath,
            'filename'   => $finalName,
            'name'       => $res['name'],
            'features'   => $res['features'],
            'geom'       => $res['geom'],
            'source'     => $href,
            'renderer'   => $res['renderer'] ?? null,
            'classField' => $res['classField'] ?? '',
            'categories' => $res['categories'] ?? 0,
            'table'      => pg_safe_table(catalog_slug($res['name'] !== '' ? $res['name'] : 'capa_importada')),
        ];
        $warn = !empty($res['truncated'])
            ? ' AVISO: el servicio limitó la descarga; podrían faltar entidades.' : '';
        $clipMsg = $clip ? ($clippedExact ? ' Recortada al borde del municipio.' : ' Recortada al municipio (envolvente).') : '';
        flash('ok', "Importadas {$res['features']} entidades ({$res['geom']}).{$clipMsg} "
            . "Descarga el GeoJSON y publícalo en “Publicar capa”." . $warn);
    } finally {
        rrmdir($work);
    }
}

/**
 * Publica directamente la capa recién importada, conservando su clasificación
 * original (colores + leyenda) si el servicio traía un renderer. Reutiliza el
 * núcleo publish_source() del controlador.
 */
function import_publish_handle(): void {
    @set_time_limit(600);
    $r   = $_SESSION['import_result'] ?? null;
    $tok = (string)($_POST['token'] ?? '');
    if (!$r || !hash_equals((string)($r['token'] ?? ''), $tok) || !is_file((string)($r['path'] ?? ''))) {
        flash('error', 'No hay una importación reciente para publicar. Vuelve a importar la capa.');
        return;
    }
    $themes = array_column(catalog_load()['themes'], 'id');
    $theme  = (string)($_POST['theme'] ?? '');
    if (!in_array($theme, $themes, true)) { flash('error', 'Selecciona un tema válido.'); return; }

    $title = trim((string)($_POST['title'] ?? '')) ?: ($r['name'] !== '' ? $r['name'] : 'Capa importada');
    $base  = trim((string)($_POST['layer_name'] ?? '')) ?: ($r['table'] ?? '');
    $table = pg_safe_table($base);
    if ($table === '') { flash('error', 'Nombre técnico de capa inválido.'); return; }

    $res = publish_source($r['path'], $table, $title, $theme, [
        'overwrite' => true,   // re-publicar desde el importador sobrescribe
        'visible'   => !empty($_POST['visible']),
        'renderer'  => $r['renderer'] ?? null,
    ]);
    if (!$res['ok']) { flash('error', $res['error']); return; }

    $styleMsg = !empty($r['renderer'])
        ? " con su clasificación original ({$r['categories']} categorías por “{$r['classField']}”)."
        : ($res['style_ok'] ? ' con estilo básico.' : '.');
    flash('ok', "Capa '{$res['table']}' publicada ({$res['rows']} elementos)" . $styleMsg
        . ' Recarga el visor (Ctrl+F5) para verla.');
    unset($_SESSION['import_result']);   // ya publicada
}

/** Handler GET de descarga del GeoJSON importado (valida token contra la sesión). */
function import_download(): void {
    $r   = $_SESSION['import_result'] ?? null;
    $tok = (string)($_GET['token'] ?? '');
    if (!$r || !hash_equals((string)($r['token'] ?? ''), $tok) || !is_file((string)($r['path'] ?? ''))) {
        http_response_code(404);
        exit('Descarga no disponible. Vuelve a importar la capa.');
    }
    header('Content-Type: application/geo+json; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . preg_replace('/[^A-Za-z0-9._-]/', '_', $r['filename']) . '"');
    header('Content-Length: ' . (string)filesize($r['path']));
    readfile($r['path']);
    exit;
}
