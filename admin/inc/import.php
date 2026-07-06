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
function import_fetch_geojson(string $queryUrl, string $metaUrl, string $work): array {
    // Nombre legible de la capa (metadatos).
    $name = '';
    $meta = import_http_get($metaUrl . '?f=json', 40);
    if ($meta['ok']) {
        $md = json_decode($meta['body'], true);
        if (is_array($md)) $name = (string)($md['name'] ?? '');
    }

    // Descarga con paginación defensiva: se detiene si el servidor no pagina
    // (mismos OBJECTID) para no entrar en un bucle infinito.
    $all = null; $offset = 0; $pageSize = 2000; $guard = 0; $truncated = false;
    $seen = []; $oidField = 'OBJECTID';
    do {
        $u = $queryUrl . '?' . http_build_query([
            'where'             => 'OBJECTID>-1',   // 'OBJECTID>-1' pasa WAF donde '1=1' se bloquea
            'outFields'         => '*',
            'outSR'             => '4326',
            'returnGeometry'    => 'true',
            'resultOffset'      => $offset,
            'resultRecordCount' => $pageSize,
            'f'                 => 'json',
        ]);
        $r = import_http_get($u, 90);
        if (!$r['ok']) return ['ok' => false, 'error' => "El servicio no respondió (HTTP {$r['code']}). {$r['error']}"];
        $d = json_decode($r['body'], true);
        if (!is_array($d) || isset($d['error'])) {
            $em = $d['error']['message'] ?? trim(substr(strip_tags($r['body']), 0, 180));
            return ['ok' => false, 'error' => "El servicio devolvió un error: " . ($em ?: 'respuesta no válida')];
        }
        $oidField = (string)($d['objectIdFieldName'] ?? $oidField);
        $feats = $d['features'] ?? [];
        $newCount = 0;
        foreach ($feats as $f) {
            $oid = $f['attributes'][$oidField] ?? null;
            if ($oid !== null) {
                if (isset($seen[$oid])) continue;   // dedupe entre páginas
                $seen[$oid] = true;
            }
            $newCount++;
            if ($all === null) $all = ['features' => []] + $d;
            $all['features'][] = $f;
        }
        if ($all === null) $all = $d;   // primera página sin OID
        $exceeded = !empty($d['exceededTransferLimit']);
        $offset  += count($feats);
        $guard++;
        if ($newCount === 0) { if ($exceeded) $truncated = true; break; }  // el server no avanzó
    } while ($exceeded && $guard < 50);

    if ($all === null || empty($all['features'])) {
        return ['ok' => false, 'error' => 'El servicio no devolvió ninguna entidad.'];
    }

    // Convertir Esri JSON -> GeoJSON con ogr2ogr (driver ESRIJSON).
    $esriPath    = $work . '/esri.json';
    $geojsonPath = $work . '/import.geojson';
    if (file_put_contents($esriPath, json_encode($all)) === false) {
        return ['ok' => false, 'error' => 'No se pudo escribir el archivo temporal.'];
    }
    $cmd = 'ogr2ogr -f GeoJSON ' . escapeshellarg($geojsonPath)
        . ' ' . escapeshellarg('ESRIJSON:' . $esriPath) . ' 2>&1';
    $o = []; $rc = 0; exec($cmd, $o, $rc);
    if (!is_file($geojsonPath) || filesize($geojsonPath) < 32) {
        return ['ok' => false, 'error' => 'No se pudo convertir a GeoJSON. ' . h(implode(' ', array_slice($o, -3)))];
    }

    $gj    = json_decode((string)file_get_contents($geojsonPath), true);
    $count = is_array($gj['features'] ?? null) ? count($gj['features']) : count($all['features']);
    $geom  = $gj['features'][0]['geometry']['type'] ?? '';
    return ['ok' => true, 'path' => $geojsonPath, 'name' => $name,
            'features' => $count, 'geom' => $geom, 'truncated' => $truncated];
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

        // 3) Descargar y convertir.
        $res = import_fetch_geojson($ep['query'], $ep['meta'], $work);
        if (!$res['ok']) { flash('error', 'No se pudo importar: ' . $res['error']); return; }

        // 4) Guardar el GeoJSON para descarga.
        $importsDir = config()['paths']['uploads'] . '/imports';
        @mkdir($importsDir, 0700, true);
        import_gc($importsDir);
        $token     = bin2hex(random_bytes(16));
        $finalName = catalog_slug($res['name'] !== '' ? $res['name'] : 'capa_importada') . '.geojson';
        $finalPath = $importsDir . '/' . $token . '.geojson';
        if (!copy($res['path'], $finalPath)) { flash('error', 'No se pudo guardar el archivo para descarga.'); return; }

        $_SESSION['import_result'] = [
            'token'    => $token,
            'path'     => $finalPath,
            'filename' => $finalName,
            'name'     => $res['name'],
            'features' => $res['features'],
            'geom'     => $res['geom'],
            'source'   => $href,
        ];
        $warn = !empty($res['truncated'])
            ? ' AVISO: el servicio limitó la descarga; podrían faltar entidades.' : '';
        flash('ok', "Importadas {$res['features']} entidades ({$res['geom']}). "
            . "Descarga el GeoJSON y publícalo en “Publicar capa”." . $warn);
    } finally {
        rrmdir($work);
    }
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
