/**
 * Configuración del municipio — editar este archivo para personalizar el visor.
 * Reemplaza logos, nombre del municipio, dependencia y paleta de colores.
 */
window.MUNICIPIO_CONFIG = {
  municipio:     'Apaseo el Grande',
  estado:        'Guanajuato',
  dependencia:   'Protección Civil y Bomberos',

  geoserver: {
    url:       '/geoserver',
    workspace: 'apaseo_gde'
  },

  // Llaves de servicios externos (tokens de CLIENTE: viajan en el visor, no son secretos).
  // Reemplazar por las del municipio. Vacío = esa función se desactiva.
  servicios: {
    cesiumToken:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTJhNDMyYS1mNzdhLTQ2MzItOGJlOS1iMGZiYmQzYTU1MWYiLCJpZCI6NDM4MDkyLCJzdWIiOiJhbmdlbHNlcmdpbyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJhdGxhcy1tdW5pY2lwYWwtY2VzaXVtIiwiaWF0IjoxNzgwMDk3NTYyfQ.lk79bwoXbJKDWyQUVX3PE4MhEFH9ArcigrPB7KQ1m1k', // Cesium ion (vista 3D) — https://ion.cesium.com/tokens
    googleApiKey: ''   // Google (búsqueda de direcciones / Street View) — pendiente: llave propia de Apaseo
  },

  // Capa de límite municipal: se dibuja siempre encima y se protege del modo radio.
  limiteMunicipalLayer: 'limite_municipal',

  mapa: {
    center:         [-100.6235, 20.5914], // [longitud, latitud] WGS84 — centro del municipio de Apaseo el Grande
    zoom:           12,
    // Extensión del límite municipal (EPSG:3857), derivada de la capa limite_municipal
    homeExtent3857: [-11217092.9685, 2328133.4185, -11185615.2763, 2358316.6365],
    // Mismo extent en grados [oeste, sur, este, norte] — usado por la vista 3D (Cesium)
    homeExtentWGS84: [-100.76486, 20.46445, -100.48209, 20.71827],
    // Vista inicial de la cámara 3D
    vista3D: { height: 42000, pitch: -55 }
  },

  // Sesgo del buscador de lugares (Google Places): radio alrededor del centro del mapa.
  geocoder: { radioMetros: 25000 },

  // Recursos enlazados desde el panel "Acerca de".
  recursos: {
    atlasPdf:       'pdf/atlas_municipal.pdf', // se sube/reemplaza desde el panel admin (pestaña Ajustes)
    programasPcUrl: ''                        // URL de Programas de PC (vacío = se oculta)
  },

  logo:          'assets/images/branding/apaseo-pc.png',
  logoEscudo:    'assets/images/branding/apaseo-pc.png',
  logoMunicipio: 'assets/images/branding/apaseo-logo-horizontal.png',

  colores: {
    primary:      '#1e73be',
    primaryDark:  '#155a94',
    primaryLight: '#52aae9',
    accent:       '#2d9bea'
  },

  contacto: {
    telefono:     '(413) 158-3911',
    telefonoHref: 'tel:+524131583911',
    direccion:    'Melchor Ocampo #113, Zona Centro, C.P. 38160, Apaseo el Grande, Gto.',
    mapsUrl:      'https://www.google.com/maps/search/?api=1&query=Melchor+Ocampo+113,+Zona+Centro,+Apaseo+el+Grande,+Gto.'
  }
};
