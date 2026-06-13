/**
 * Catálogo de capas del municipio — PLANTILLA
 * ---------------------------------------------
 * 1. Copia este archivo como  municipio.layers.js
 * 2. Agrega las capas publicadas en tu workspace de GeoServer
 * 3. Nunca subas municipio.layers.js al repositorio (está en .gitignore)
 *
 * extents: extensiones EPSG:3857 para zoom automático al activar la capa.
 *          Obtén el bbox desde GeoServer → Layer Preview o desde PostGIS:
 *          SELECT ST_Extent(ST_Transform(geom, 3857)) FROM nombre_tabla;
 *
 * groups:  árbol jerárquico que aparece en el panel lateral del visor.
 *          Cada entrada en `layers` debe tener:
 *            - name:    Etiqueta visible en el panel
 *            - layer:   Nombre exacto de la capa en GeoServer (workspace:capa o solo capa)
 *            - visible: true | false  (estado inicial)
 */
window.MUNICIPIO_LAYERS = {

  extents: {
    // "nombre_capa": [oeste, sur, este, norte]  en EPSG:3857
    "limite_municipal": [-11217092, 2328133, -11185615, 2358316]
  },

  groups: [
    {
      id: 'temas',
      name: 'TEMAS',
      icon: 'fa-folder-open',
      iconExpanded: 'fa-folder-open',
      iconCollapsed: 'fa-folder',
      expanded: true,
      children: [
        {
          id: 'medio-fisico',
          name: 'Medio físico',
          icon: 'fa-mountain',
          expanded: false,
          layers: [
            // { name: 'Curvas de Nivel', layer: 'curvas_nivel', visible: false }
          ]
        },
        {
          id: 'medio-sociodemografico',
          name: 'Medio sociodemográfico',
          icon: 'fa-users',
          expanded: true,
          layers: [
            { name: 'Límite Municipal', layer: 'limite_municipal', visible: true }
          ]
        },
        {
          id: 'peligros',
          name: 'Peligros',
          icon: 'fa-exclamation-triangle',
          expanded: false,
          layers: [
            // { name: 'Zonas de Inundación', layer: 'inundacion', visible: false }
          ]
        },
        {
          id: 'riesgos',
          name: 'Riesgos',
          icon: 'fa-exclamation-circle',
          expanded: false,
          layers: [
            // { name: 'Riesgo Sísmico', layer: 'riesgo_sismico', visible: false }
          ]
        },
        {
          id: 'obras',
          name: 'Obras',
          icon: 'fa-helmet-safety',
          expanded: false,
          layers: [
            // { name: 'Obras en Proceso', layer: 'obras_proceso', visible: false }
          ]
        }
      ]
    }
  ]
};
