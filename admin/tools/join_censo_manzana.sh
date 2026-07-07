#!/usr/bin/env bash
#
# Une un CSV del Censo INEGI (RESAGEBURB — "Principales resultados por AGEB y
# manzana urbana") a una capa de manzanas geoestadísticas ya cargada en PostGIS,
# por CVEGEO. Agrega las columnas de población y refresca GeoServer.
#
# Reutilizable para CUALQUIER municipio: el formato del CSV de INEGI es idéntico;
# solo cambian los datos. Requisitos por municipio:
#   1) Cargar la manzana geoestadística (shapefile) en PostGIS — recuerda elegir
#      codificación Latin1 si el .dbf no trae .cpg.
#   2) Bajar el CSV RESAGEBURB del municipio (UTF-8) y correr este script.
#
# Uso:
#   admin/tools/join_censo_manzana.sh <tabla_manzanas> <archivo_censo.csv>
# Ej:
#   admin/tools/join_censo_manzana.sh manzanas_geoestadisticas "/ruta/11 Guanajuato - 005 Apaseo el Grande.csv"
#
set -euo pipefail

TABLE="${1:?Falta el nombre de la tabla de manzanas}"
CSV="${2:?Falta la ruta del CSV del Censo}"
CFG="/etc/atlas-apaseo/config.php"
[ -f "$CSV" ] || { echo "No existe el CSV: $CSV" >&2; exit 1; }

cfg() { php -r '$c=require $argv[1]; $k=explode(".",$argv[2]); $v=$c; foreach($k as $p){$v=$v[$p]??"";} echo $v;' "$CFG" "$1"; }
PGDB=$(cfg postgis.db);   PGUSER=$(cfg postgis.user); PGPASS=$(cfg postgis.pass)
GSUSER=$(cfg geoserver.user); GSPASS=$(cfg geoserver.pass)
[ -n "$GSUSER" ] || GSUSER=admin
PGCONN="host=127.0.0.1 dbname=$PGDB user=$PGUSER password=$PGPASS"

echo "1) Cargando el CSV a la tabla temporal _censo_stg…"
# AUTODETECT_TYPE=NO -> todo texto (evita fallos con los '*' de confidencialidad).
# ogr2ogr puede terminar con 'Segmentation fault' (mismatch libpq/GDAL) pero carga bien.
ogr2ogr -f PostgreSQL "PG:$PGCONN" "$CSV" -nln _censo_stg \
  -oo AUTODETECT_TYPE=NO -oo EMPTY_STRING_AS_NULL=YES -overwrite 2>/dev/null || true

echo "2) Uniendo por CVEGEO (ENTIDAD+MUN+LOC+AGEB+MZA) y agregando población…"
PGPASSWORD="$PGPASS" psql -h 127.0.0.1 -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1 -q <<SQL
ALTER TABLE ${TABLE}
  ADD COLUMN IF NOT EXISTS pobtot integer,
  ADD COLUMN IF NOT EXISTS pobfem integer,
  ADD COLUMN IF NOT EXISTS pobmas integer,
  ADD COLUMN IF NOT EXISTS p_60ymas integer,
  ADD COLUMN IF NOT EXISTS pob65_mas integer;

UPDATE ${TABLE} m SET
  pobtot    = NULLIF(s.pobtot,'*')::numeric::int,
  pobfem    = NULLIF(s.pobfem,'*')::numeric::int,
  pobmas    = NULLIF(s.pobmas,'*')::numeric::int,
  p_60ymas  = NULLIF(s.p_60ymas,'*')::numeric::int,
  pob65_mas = NULLIF(s.pob65_mas,'*')::numeric::int
FROM _censo_stg s
WHERE m.cvegeo = (s.entidad||s.mun||s.loc||s.ageb||s.mza);

DROP TABLE IF EXISTS _censo_stg;
SELECT count(*) FILTER (WHERE pobtot IS NOT NULL) AS manzanas_con_poblacion,
       COALESCE(sum(pobtot),0) AS poblacion_urbana FROM ${TABLE};
SQL

echo "3) Refrescando GeoServer (para que exponga las columnas nuevas)…"
curl -s -o /dev/null -w "   reset: HTTP %{http_code}\n" -u "$GSUSER:$GSPASS" \
  -XPOST "http://localhost/geoserver/rest/reset" || true

echo "Listo. En el panel → Capas, pon a '${TABLE}' el papel 'Población' con campo 'pobtot'."
