<?php
/**
 * Cliente mínimo de la API REST de GeoServer (autenticación admin, server-side).
 */
declare(strict_types=1);

function gs_request(string $method, string $path, ?string $body = null, string $contentType = 'application/xml'): array {
    $g = config()['geoserver'];
    $url = rtrim($g['rest'], '/') . '/' . ltrim($path, '/');
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($body !== null) $headers[] = 'Content-Type: ' . $contentType;
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_USERPWD        => $g['user'] . ':' . $g['pass'],
        CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 60,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    return ['code' => $code, 'body' => (string)$resp, 'error' => $err, 'ok' => ($code >= 200 && $code < 300)];
}

/** Publica un featuretype del datastore configurado (GeoServer calcula bbox). */
function gs_publish_featuretype(string $table, string $title): array {
    $g = config()['geoserver'];
    $ws = $g['workspace']; $ds = $g['datastore'];
    $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $xml = "<featureType><name>$table</name><nativeName>$table</nativeName>"
         . "<title>$t</title><srs>EPSG:4326</srs><enabled>true</enabled></featureType>";
    $r = gs_request('POST', "workspaces/$ws/datastores/$ds/featuretypes", $xml);
    // Recalcular bbox nativo y lat/lon explícitamente.
    if ($r['ok']) {
        gs_request('PUT', "workspaces/$ws/datastores/$ds/featuretypes/$table?recalculate=nativebbox,latlonbbox",
            "<featureType><name>$table</name><srs>EPSG:4326</srs></featureType>");
    }
    return $r;
}

function gs_featuretype_exists(string $table): bool {
    $g = config()['geoserver'];
    $r = gs_request('GET', "workspaces/{$g['workspace']}/datastores/{$g['datastore']}/featuretypes/$table.json");
    return $r['ok'];
}

/** Crea (o reemplaza) un estilo SLD en el workspace y lo asigna por defecto a la capa. */
function gs_apply_style(string $table, string $styleName, string $sld): array {
    $g = config()['geoserver'];
    $ws = $g['workspace'];

    // ¿existe el estilo?
    $exists = gs_request('GET', "workspaces/$ws/styles/$styleName.json")['ok'];
    if (!$exists) {
        $meta = "<style><name>$styleName</name><filename>$styleName.sld</filename></style>";
        $c = gs_request('POST', "workspaces/$ws/styles", $meta);
        if (!$c['ok']) return $c;
    }
    // Subir el cuerpo SLD.
    $put = gs_request('PUT', "workspaces/$ws/styles/$styleName",
        $sld, 'application/vnd.ogc.sld+xml');
    if (!$put['ok']) return $put;

    // Asignar como estilo por defecto de la capa.
    $assign = gs_request('PUT', "layers/$ws:$table",
        "<layer><defaultStyle><name>$ws:$styleName</name></defaultStyle></layer>");
    return $assign;
}

/** Elimina la capa, featuretype y estilo asociado de GeoServer. */
function gs_delete_layer(string $table, ?string $styleName = null): array {
    $g = config()['geoserver'];
    $ws = $g['workspace']; $ds = $g['datastore'];
    $log = [];
    $r = gs_request('DELETE', "layers/$ws:$table?recurse=true");
    $log[] = "layer:{$r['code']}";
    $r2 = gs_request('DELETE', "workspaces/$ws/datastores/$ds/featuretypes/$table?recurse=true");
    $log[] = "featuretype:{$r2['code']}";
    if ($styleName) {
        $r3 = gs_request('DELETE', "workspaces/$ws/styles/$styleName?purge=true");
        $log[] = "style:{$r3['code']}";
    }
    return ['ok' => true, 'log' => implode(' ', $log)];
}
