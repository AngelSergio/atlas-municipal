/**
 * Configuración del municipio — editar este archivo para personalizar el visor.
 * Reemplaza logos, nombre del municipio, dependencia y paleta de colores.
 */
window.MUNICIPIO_CONFIG = {
  municipio:     'Celaya',
  estado:        'Guanajuato',
  dependencia:   'Protección Civil y Bomberos',

  geoserver: {
    url:       '/geoserver',
    workspace: 'pc'
  },

  mapa: {
    center:         [-100.8167, 20.5289], // [longitud, latitud] WGS84
    zoom:           12,
    homeExtent3857: [-11233767.3321, 2315094.3382, -11204184.5071, 2356006.2018]
  },

  logo:          'assets/images/branding/logo-pcb.png',
  logoEscudo:    'assets/images/branding/logo-pcb-escudo.png',
  logoMunicipio: 'assets/images/branding/celaya-logo-horizontal.png',

  colores: {
    primary:      '#931D3D',
    primaryDark:  '#781634',
    primaryLight: '#B04159',
    accent:       '#B04159'
  },

  contacto: {
    telefono:     '(461) 615-0911',
    telefonoHref: 'tel:+524616150911',
    direccion:    'Orquídeas #123, Col. Rosalinda I, C.P. 38060, Celaya, Gto.',
    mapsUrl:      'https://www.google.com/maps/search/?api=1&query=Orqu%C3%ADdeas+123,+Col.+Rosalinda+I,+Celaya,+Gto.'
  }
};
