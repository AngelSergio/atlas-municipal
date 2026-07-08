/**
 * Configuración del municipio — VILLAGRÁN, GUANAJUATO
 * ---------------------------------------------------------------
 * Instancia del Atlas Municipal de Peligros y Riesgos para Villagrán, Gto.
 * Este es el municipio.config.js de la rama/despliegue `villagran`.
 *
 * Pendientes marcados con  [CONFIRMAR]  antes de producción.
 */
window.MUNICIPIO_CONFIG = {
  municipio:     'Villagrán',
  estado:        'Guanajuato',
  dependencia:   'Protección Civil y Bomberos',

  geoserver: {
    url:       '/geoserver',
    workspace: 'villagran'          // [CONFIRMAR] crear este workspace en GeoServer + datastore a PostGIS
  },

  // Llaves de servicios externos (tokens de CLIENTE: viajan en el visor, no son secretos).
  servicios: {
    // Token de Cesium ion reutilizado (vista 3D). Se puede sustituir por uno propio de Villagrán.
    cesiumToken:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTJhNDMyYS1mNzdhLTQ2MzItOGJlOS1iMGZiYmQzYTU1MWYiLCJpZCI6NDM4MDkyLCJzdWIiOiJhbmdlbHNlcmdpbyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJhdGxhcy1tdW5pY2lwYWwtY2VzaXVtIiwiaWF0IjoxNzgwMDk3NTYyfQ.lk79bwoXbJKDWyQUVX3PE4MhEFH9ArcigrPB7KQ1m1k',
    googleApiKey: ''   // [CONFIRMAR] llave propia de Villagrán (búsqueda de direcciones / Street View). Vacío = se desactiva.
  },

  // Capa de límite municipal: se dibuja siempre encima y se protege del modo radio.
  limiteMunicipalLayer: 'limite_municipal',

  mapa: {
    center:          [-100.9825, 20.5175], // [longitud, latitud] WGS84 — centro del municipio de Villagrán
    zoom:            12,
    // Extensión del municipio (EPSG:3857). [CONFIRMAR] recalcular con la capa real limite_municipal.
    homeExtent3857:  [-11252730.7253, 2324634.4763, -11229910.2297, 2344246.2711],
    // Mismo extent en grados [oeste, sur, este, norte] — usado por la vista 3D (Cesium)
    homeExtentWGS84: [-101.08500, 20.43500, -100.88000, 20.60000],
    // Vista inicial de la cámara 3D
    vista3D: { height: 42000, pitch: -55 }
  },

  // Sesgo del buscador de lugares (Google Places): radio alrededor del centro del mapa.
  geocoder: { radioMetros: 20000 },

  // Recursos enlazados desde el panel "Acerca de".
  recursos: {
    atlasPdf:       'pdf/atlas_municipal.pdf', // se sube/reemplaza desde el panel admin (pestaña Ajustes)
    programasPcUrl: ''                         // URL de Programas de PC (vacío = se oculta)
  },

  logo:          'assets/images/branding/villagran-pc.png',   // escudo de Protección Civil (también splash)
  logoEscudo:    'assets/images/branding/villagran-pc.png',
  logoMunicipio: 'assets/images/branding/villagran-logo.png', // logo institucional del municipio (corazón/arcos)

  // Paleta derivada del logo municipal: magenta (primario) + vino/cantera (acento).
  colores: {
    primary:      '#9c3f86',
    primaryDark:  '#742e63',
    primaryLight: '#c78ab9',
    accent:       '#8a3b2c'
  },

  contacto: {
    telefono:     '(411) 119-3300',
    telefonoHref: 'tel:+524111193300',
    direccion:    'Presidencia Municipal de Villagrán, Zona Centro, Villagrán, Gto.', // [CONFIRMAR] domicilio de Protección Civil
    mapsUrl:      'https://www.google.com/maps/search/?api=1&query=Presidencia+Municipal+de+Villagr%C3%A1n,+Guanajuato'
  }
};
