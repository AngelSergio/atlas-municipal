/**
 * Configuración del municipio — PLANTILLA
 * ----------------------------------------
 * 1. Copia este archivo como  municipio.config.js
 * 2. Rellena los valores con los datos de tu municipio
 * 3. Nunca subas municipio.config.js al repositorio (está en .gitignore)
 */
window.MUNICIPIO_CONFIG = {
  municipio:   'Nombre del Municipio',
  estado:      'Nombre del Estado',
  dependencia: 'Nombre de la Dependencia',   // Ej: "Protección Civil Municipal"

  geoserver: {
    url:       '/geoserver',                  // URL relativa para localhost; cambiar a absoluta en producción
    workspace: 'nombre_workspace'             // Nombre del workspace en GeoServer
  },

  // Nombre de la capa de límite municipal en GeoServer (se dibuja siempre encima)
  limiteMunicipalLayer: 'limite_municipal',

  mapa: {
    center:          [-100.0, 20.0],          // [longitud, latitud] WGS84 — centro del municipio
    zoom:            12,
    homeExtent3857:  [-11200000, 2300000, -11100000, 2400000],  // EPSG:3857 [W, S, E, N]
    homeExtentWGS84: [-100.5, 20.0, -99.5, 21.0],              // WGS84 [O, S, E, N] — para vista 3D
    vista3D: { height: 42000, pitch: -55 }
  },

  // Radio de sesgo del buscador de lugares (Google Places) en metros
  geocoder: { radioMetros: 25000 },

  recursos: {
    atlasPdf:       '/pdf/ATLAS_MUNICIPIO.pdf',  // PDF del Atlas de Riesgos (dejar vacío '' para ocultar)
    programasPcUrl: ''                            // URL de Programas de PC (vacío = se oculta)
  },

  // Rutas a los logos — colocar las imágenes en assets/images/branding/
  logo:          'assets/images/branding/logo-proteccion-civil.png',
  logoEscudo:    'assets/images/branding/logo-proteccion-civil.png',
  logoMunicipio: 'assets/images/branding/logo-municipio.png',

  // Paleta de colores principal (variables CSS --color-primary, etc.)
  colores: {
    primary:      '#1e73be',
    primaryDark:  '#155a94',
    primaryLight: '#52aae9',
    accent:       '#2d9bea'
  },

  contacto: {
    telefono:     '(000) 000-0000',
    telefonoHref: 'tel:+520000000000',
    direccion:    'Dirección de la dependencia',
    mapsUrl:      ''   // URL de Google Maps al domicilio
  }
};
