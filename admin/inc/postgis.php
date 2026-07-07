<?php
/**
 * Carga de archivos geoespaciales a PostGIS vía ogr2ogr e inspección con php-pgsql.
 * El loader conecta como rol RW (apaseo_loader); tras cargar concede SELECT a geoserver_ro.
 */
declare(strict_types=1);

/** Conexión php-pgsql como rol de escritura. */
function pg_rw() {
    static $c = null;
    if ($c === null) {
        $p = config()['postgis'];
        $conn = sprintf('host=%s port=%s dbname=%s user=%s password=%s',
            $p['host'], $p['port'], $p['db'], $p['user'], $p['pass']);
        $c = @pg_connect($conn);
        if (!$c) throw new RuntimeException('No se pudo conectar a PostGIS.');
    }
    return $c;
}

/** Normaliza un nombre de capa/tabla a un identificador seguro. */
function pg_safe_table(string $name): string {
    $n = strtolower(trim($name));
    $n = preg_replace('/[^a-z0-9_]+/', '_', $n);
    $n = preg_replace('/_+/', '_', $n);
    $n = trim($n, '_');
    if ($n === '' || !preg_match('/^[a-z]/', $n)) $n = 'capa_' . $n;
    return substr($n, 0, 60);
}

function pg_table_exists(string $table): bool {
    $r = pg_query_params(pg_rw(),
        "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1",
        [$table]);
    return $r && pg_num_rows($r) > 0;
}

function pg_row_count(string $table): int {
    $q = pg_query(pg_rw(), 'SELECT count(*) AS n FROM ' . pg_ident(pg_rw(), $table));
    if (!$q) return 0;
    return (int)(pg_fetch_assoc($q)['n'] ?? 0);
}

/** Tipo de geometría dominante (POINT/LINESTRING/POLYGON/MULTI*). */
function pg_geom_type(string $table): string {
    $q = pg_query(pg_rw(),
        'SELECT GeometryType(geom) AS t FROM ' . pg_ident(pg_rw(), $table) . ' WHERE geom IS NOT NULL LIMIT 1');
    if (!$q) return 'GEOMETRY';
    return (string)(pg_fetch_assoc($q)['t'] ?? 'GEOMETRY');
}

/** Extent en EPSG:3857 [minx,miny,maxx,maxy] para el zoom del visor. */
function pg_extent_3857(string $table): ?array {
    $sql = 'SELECT ST_XMin(e) a, ST_YMin(e) b, ST_XMax(e) c, ST_YMax(e) d FROM '
         . '(SELECT ST_Extent(ST_Transform(geom,3857)) e FROM ' . pg_ident(pg_rw(), $table) . ') s';
    $q = pg_query(pg_rw(), $sql);
    if (!$q) return null;
    $r = pg_fetch_assoc($q);
    if (!$r || $r['a'] === null) return null;
    return [ (float)$r['a'], (float)$r['b'], (float)$r['c'], (float)$r['d'] ];
}

/** Nombres reales de columnas de una tabla (ogr2ogr suele minusculizarlos). */
function pg_columns(string $table): array {
    $q = pg_query_params(pg_rw(),
        "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1",
        [$table]);
    if (!$q) return [];
    $cols = [];
    while ($r = pg_fetch_assoc($q)) $cols[] = $r['column_name'];
    return $cols;
}

/** Extent en EPSG:4326 [minx,miny,maxx,maxy] (para recortar importaciones al municipio). */
function pg_extent_4326(string $table): ?array {
    if (!pg_table_exists($table)) return null;
    $sql = 'SELECT ST_XMin(e) a, ST_YMin(e) b, ST_XMax(e) c, ST_YMax(e) d FROM '
         . '(SELECT ST_Extent(ST_Transform(geom,4326)) e FROM ' . pg_ident(pg_rw(), $table) . ') s';
    $q = pg_query(pg_rw(), $sql);
    if (!$q) return null;
    $r = pg_fetch_assoc($q);
    if (!$r || $r['a'] === null) return null;
    return [ (float)$r['a'], (float)$r['b'], (float)$r['c'], (float)$r['d'] ];
}

/** Geometría del límite (unión disuelta, EPSG:4326) como GeoJSON, para recorte exacto. */
function pg_boundary_geojson(string $table): ?string {
    if (!pg_table_exists($table)) return null;
    $sql = 'SELECT ST_AsGeoJSON(ST_Union(ST_Transform(geom,4326))) g FROM ' . pg_ident(pg_rw(), $table);
    $q = pg_query(pg_rw(), $sql);
    if (!$q) return null;
    $g = pg_fetch_assoc($q)['g'] ?? null;
    return ($g !== null && $g !== '') ? (string)$g : null;
}

function pg_ident($conn, string $id): string {
    return pg_escape_identifier($conn, $id);
}

/** Concede SELECT al usuario de solo lectura de GeoServer. */
function pg_grant_select(string $table): void {
    $ro = config()['postgis']['ro_user'];
    pg_query(pg_rw(), 'GRANT SELECT ON ' . pg_ident(pg_rw(), $table) . ' TO ' . pg_ident(pg_rw(), $ro));
}

function pg_drop_table(string $table): void {
    pg_query(pg_rw(), 'DROP TABLE IF EXISTS ' . pg_ident(pg_rw(), $table) . ' CASCADE');
}

/**
 * Carga un archivo (.shp/.geojson/.kml) a PostGIS reproyectando a EPSG:4326.
 * Devuelve ['ok'=>bool, 'rows'=>int, 'log'=>string].
 * NOTA: ogr2ogr puede terminar con segfault en este servidor (mismatch libpq/GDAL)
 * AUNQUE cargue los datos; por eso el éxito se decide por el conteo de filas, no
 * por el código de salida.
 */
function pg_load_file(string $srcPath, string $table, ?string $srcEpsg = null, ?string $srcEncoding = null): array {
    $p = config()['postgis'];
    $pgconn = sprintf('PG:host=%s port=%s dbname=%s user=%s password=%s',
        $p['host'], $p['port'], $p['db'], $p['user'], $p['pass']);

    $args = ['ogr2ogr'];

    // Codificación de origen del shapefile (.dbf). Si el shapefile no trae .cpg y
    // viene en Latin1/CP1252 (común en datos de gobierno mexicano), GDAL lo lee mal
    // y pierde los acentos. Forzar SHAPE_ENCODING le indica el origen y lo recodifica
    // a UTF-8. 'auto'/vacío respeta el .cpg/LDID del propio archivo.
    $ext = strtolower(pathinfo($srcPath, PATHINFO_EXTENSION));
    $encMap = ['utf-8' => 'UTF-8', 'utf8' => 'UTF-8', 'latin1' => 'ISO-8859-1',
               'iso-8859-1' => 'ISO-8859-1', 'cp1252' => 'CP1252', 'windows-1252' => 'CP1252'];
    $enc = $encMap[strtolower((string)$srcEncoding)] ?? '';
    if ($ext === 'shp' && $enc !== '') {
        array_push($args, '--config', 'SHAPE_ENCODING', $enc);
    }

    array_push($args,
        '-f', 'PostgreSQL', $pgconn, $srcPath,
        '-nln', $table,
        '-nlt', 'PROMOTE_TO_MULTI',
        '-lco', 'GEOMETRY_NAME=geom',
        '-lco', 'FID=gid',
        '-lco', 'PRECISION=NO',
        '-t_srs', 'EPSG:4326',
        '-overwrite', '-skipfailures'
    );
    if ($srcEpsg && preg_match('/^\d{4,6}$/', $srcEpsg)) {
        array_push($args, '-s_srs', 'EPSG:' . $srcEpsg);
    }

    $cmd = implode(' ', array_map('escapeshellarg', $args)) . ' 2>&1';
    $out = [];
    $code = 0;
    exec($cmd, $out, $code);
    $log = implode("\n", $out);

    // El segfault (code 139) no es concluyente: verificar por la tabla.
    $rows = pg_table_exists($table) ? pg_row_count($table) : 0;
    $ok = $rows > 0;
    if (!$ok && $log === '') $log = "ogr2ogr terminó con código $code y sin filas cargadas.";
    return ['ok' => $ok, 'rows' => $rows, 'log' => $log, 'code' => $code];
}
