# Análisis de riesgo por ubicación (consulta ciudadana)

Documenta cómo funciona y cómo se **configura por municipio** la herramienta
*"Análisis de riesgo por ubicación"* del visor (botón de la barra superior).

Al hacer clic en un punto (o dibujar un polígono) y elegir un radio, la herramienta
consulta por WFS las capas del Atlas y arma un reporte con: **población** del entorno,
**colonia** donde cae el punto, **peligros** cercanos o que lo contienen, y
**equipamiento expuesto**.

Módulo: `assets/js/analisis-demografico.js`.

---

## 1. El sistema de "papeles" (roles)

El análisis **no adivina** para qué sirve cada capa: hay que decirle qué **papel**
cumple cada una. Esto se asigna **desde el panel admin → pestaña Capas**, en el control
**"Análisis"** de cada capa (un selector de papel + el campo relevante).

| Papel | Qué hace en el análisis | Campo que usa |
|---|---|---|
| **Colonia** | Dice en qué colonia/asentamiento cae el punto | Nombre de la colonia |
| **Población** | Suma población del entorno (radio/polígono) | Campo numérico (`pobtot`) |
| **Peligro** | Si es polígono, revisa si el punto cae dentro; si es punto/línea, cercanía | (opcional) nivel de peligro |
| **Equipamiento expuesto** | Infraestructura cercana en riesgo (escuelas, hospitales…) | (opcional) nombre |
| *— No usar —* | La capa no participa en el análisis | — |

**Mínimo recomendado:** una capa de *Población* o *Colonia* (contexto) + al menos una de
*Peligro*. El resto es opcional y se suma cuando exista.

### Cómo se guarda

El papel/campo se guarda por capa en `admin/data/catalog.json` (clave `analisis`) y se
regenera a `municipio.layers.js` bajo `window.MUNICIPIO_LAYERS.analisis`, agrupado por
papel. El módulo lee de ahí; **no hay nombres de capa hardcodeados**. Si un municipio no
define nada, el módulo cae a los valores heredados del visor original (Celaya).

---

## 2. Configuración actual de Apaseo el Grande

| Capa | Papel | Campo |
|---|---|---|
| `colonias_apaseo` | Colonia | `nombre` |
| `manzanas_geoestadisticas` | Población | `pobtot` |
| `zonas_inundacion_fluvial_apaseo` | Peligro | `peligro` |
| `zonas_inundacion_pluvial_apaseo` | Peligro | `peligro` |
| `sierra_de_los_agustino` | Peligro | `intensidad` |
| `puntos_de_riesgo_de_inundacion_cepc_cmpc_2026` | Peligro | `peligro` |
| `red_hidrografica` | Peligro | — |
| `escuelas` | Equipamiento | `nombre_ct` |

---

## 3. Cargar las capas que se requieran

La intención es **cargar todas las capas necesarias** (manzanas, gasolineras, ductos,
fallas, etc.) y asignarles su papel. No hay lista fija.

### Codificación (acentos)

Los shapefiles de INEGI/gobierno suelen venir en **Latin1 sin `.cpg`**. Al publicarlos en
*Publicar capa*, elige **Codificación de origen = Latin1 / ISO-8859-1**. Si se deja en
"Auto", las filas con acentos fallan y **solo se cargan algunas** (síntoma típico: "aparece
un solo polígono" o faltan muchos rasgos).

### Nombres de columna

`ogr2ogr` pasa las columnas a **minúsculas** al cargar a PostGIS (`POBTOT` → `pobtot`).
Al asignar el campo en el panel, usa el nombre en minúscula.

---

## 4. Población por manzana (unir el Censo INEGI)

La **manzana geoestadística** de INEGI trae la geometría pero **sin población** (solo
claves). La población vive en un CSV aparte: **RESAGEBURB** — *"Principales resultados por
AGEB y manzana urbana"*. Se unen por **`CVEGEO`** (`ENTIDAD+MUN+LOC+AGEB+MZA`, 16 dígitos).

### Herramienta reutilizable

```bash
admin/tools/join_censo_manzana.sh <tabla_manzanas> <archivo_censo.csv>
# ej:
admin/tools/join_censo_manzana.sh manzanas_geoestadisticas \
  "/ruta/11 Guanajuato - 005 Apaseo el Grande.csv"
```

El script: carga el CSV a una tabla temporal, agrega las columnas `pobtot, pobfem, pobmas,
p_60ymas, pob65_mas` a la tabla de manzanas y las llena por `CVEGEO`, trata los `*` de
confidencialidad como `NULL`, y refresca GeoServer (`POST /rest/reset`) para exponer las
columnas nuevas. Es **genérico**: el formato del CSV de INEGI es idéntico para todos los
municipios.

### Pasos por municipio

1. Publicar la manzana geoestadística (recordar **Latin1**).
2. Bajar el CSV RESAGEBURB del municipio y correr el script.
3. Panel → Capas → papel **Población**, campo **`pobtot`**.

---

## 5. Portar a otro municipio (resumen)

1. Editar `municipio.config.js` (nombre, workspace, `limiteMunicipalLayer`, centro…).
2. Cargar las capas del municipio (con su codificación correcta).
3. Para población por manzana: unir el Censo con el script de la §4.
4. En el panel → Capas, asignar los **papeles** de análisis a cada capa.

Todo queda en el catálogo del municipio; el código no cambia.

---

## 6. Limitaciones conocidas

- El Censo **RESAGEBURB es urbano**: un punto en zona rural puede dar población 0. Se puede
  complementar con una capa de *localidades* (población por localidad) si se requiere.
- El panel demográfico muestra los campos que existan en la capa (población total,
  femenina, mayores de 60…). Discapacidad/viviendas solo aparecen si el CSV/capa los trae.
- Si se **reedita el estilo** de una capa clasificada (importada), se pierde su
  clasificación; el papel de análisis **no** se ve afectado por eso.

Ver también: [Importación de capas de servicios ArcGIS](../admin/tools/) y el panel admin.
