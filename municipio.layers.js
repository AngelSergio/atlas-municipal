/**
 * Catálogo de capas del municipio — editar este archivo para agregar,
 * quitar o reorganizar capas WMS al instalar en un nuevo municipio.
 *
 * LAYER_EXTENTS: extensiones EPSG:3857 para zoom automático al activar capa.
 * LAYER_GROUPS:  árbol jerárquico que aparece en el panel lateral del visor.
 */
window.MUNICIPIO_LAYERS = {

  extents: {
    "Estado": [-11365506.9429,2261235.3742,-11094348.4660,2492413.1658],
    "Manzanas_INEGI_2020": [-11231812.8316,2321893.9467,-11214292.7322,2349109.2308],
    "manzanas_densidad_poblacion": [-11231812.8316,2321893.9467,-11214292.7322,2349109.2308],
    "MPIO_Colindantes": [-11244944.4149,2304603.7116,-11198735.9079,2361848.1988],
    "COLONIAS_CYA": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2255],
    "Mpio": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2255],
    "CP_CYA": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2255],
    "Comunidades_cya": [-11232191.9954, 2316967.9550, -11206563.5091, 2353904.3052],
    "Subprovincia_Fisiografica": [-11392342.2143,2228851.7296,-10939345.5863,2565633.1720],
    "Provincia_Fisiografica": [-11392342.2143,2228851.7296,-10939345.5863,2565633.1720],
    "Geomorfologia": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Fallas_y_Fracturas_Regionales": [-11231544.7102,2295022.4036,-11198702.0055,2416848.9669],
    "Bancos_de_Nivel": [-11232977.6722,2317454.6382,-11211358.5728,2354002.5305],
    "Litologia": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Edafologia": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Hidrografía_Subcuenca": [-11273717.5336,2262278.7866,-11140517.9451,2383724.6354],
    "Clima": [-11233419.0663, 2315258.1411,-11202623.9224, 2354790.2969],
    "USV2018": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Banco_materiales": [-11233222.5988,2317341.6520,-11211267.6645,2354104.5184],
    "Epicentros": [-11434031.1356,2221326.9265,-11010522.9875,2470789.7229],
    "Global_Intensidades": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Ace_Max_sismo_23_jun_2020": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Ace_Suelo_Max_0s_T10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_15s_T10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_5s_T10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_1_s_T10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0s_T100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_15s_T100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_5s_T100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_1_s_T100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0s_T500": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_15s_T500": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_0_5s_T500": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Ace_Suelo_Max_1_s_T500": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Uso_Agricola_1970": [-11233767.3320,2315094.3382,-11205096.3897,2355996.8040],
    "Uso_Agricola_2009": [-11233767.3320,2315094.3381,-11205096.3897,2355996.8039],
    "Uso_Agricola_2014": [-11233767.3320,2315094.3381,-11205096.3897,2355996.8039],
    "Uso_Agricola_2018": [-11233767.3320,2315094.3381,-11205096.3897,2355996.8039],
    "Fallas": [-11231191.0745,2326296.4677,-11211152.1455,2342295.4814],
    "Fracturas": [-11223025.4773,2334726.6402,-11219789.3550,2341072.3491],
    "Peligros_Fallas_Fracturas": [-11231175.3582,2326420.7163,-11211155.9167,2342169.5571],
    "Puntos_de_revision": [-11227002.5199,2326966.4335,-11214106.7179,2342195.9079],
    "Fallas_Celaya_2020": [-11231175.3582,2326420.4562,-11211155.9806,2345258.6932],
    "Grieta_comunidad_La_Cruz": [-11220852.1578,2327096.3471,-11220462.1118,2327342.4820],
    "Rio_Laja": [-11233313.1714,2328768.9607,-11215066.9560,2350644.4596],
    "IndiceN_Inundacion": [-11238141.7224, 2319938.5118, -11211226.9187, 2353028.4673],
    "Encharcamientos": [-11228225.9674,2325095.8835,-11219201.6302,2344927.0020],
    "Afectacion_canal_la_luz": [-11220161.1943,2327526.2859,-11219894.0542,2328170.5484],
    "Zona_Afectacion_Canales_arroyos": [-11231432.6239,2321599.4157,-11216710.6671,2341385.6719],
    "Afectacion_10_de_abril_encharcamiento_2018": [-11223525.4461,2339136.1136,-11223207.2955,2339574.8177],
    "Afectacion_parque_industrial_marquez": [-11220215.0500,2323117.7470,-11219407.1578,2324273.5197],
    "Afectacion_desbordamiento_rio_laja_2018": [-11222029.7507,2327139.3074,-11217003.1943,2332568.3807],
    "canal_zaca": [-11230937.7570,2336743.5783,-11230663.3931,2337215.5177],
    "Subcuenca_Rio_Laja_Celaya": [-11261217.5372,2317147.1548,-11191359.8723,2377384.5485],
    "Red_hidrografica": [-11261212.1003,2318021.4215,-11192600.3248,2376350.9766],
    "Microcuenca_Rio_Laja_Celaya": [-11237254.7288,2317335.6334,-11205987.1023,2347395.1058],
    "usv": [-11249478.2902,2315258.1389,-11192965.9062,2377198.7271],
    "Coeficiente_Escorrentia": [-11249988.1539,2314919.9987,-11192521.4259,2377597.7035],
    "Potencial_de_Escurrimientos": [-11249486.3602,2317162.4882,-11192959.4706,2377191.8014],
    "TR2_Inundacion_pluvial": [-11249312.0254,2317141.6474,-11192958.6083,2377198.5855],
    "TR5_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR10_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR20_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR50_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR100_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR200_Inundacion_pluvial": [-11249346.0365,2317142.1032,-11192958.6083,2377198.5855],
    "TR500_Inundacion_pluvial": [-11249322.9234,2317142.1032,-11192958.6083,2377198.5855],
    "TR2_Inundacion_pluvial_urbana": [-11237289.5871,2317338.3143,-11206141.4815,2347401.7726],
    "TR5_Inundacion_pluvial_urbana": [-11237450.7717,2317092.6282,-11206094.3916,2347741.8235],
    "TR10_Inundacion_pluvial_urbana": [-11237285.5724,2317338.3143,-11206142.0509,2347403.1995],
    "TR20_Inundacion_pluvial_urbana": [-11237285.5724,2317338.3143,-11206142.0509,2347403.1995],
    "TR50_Inundacion_pluvial_urbana": [-11237450.4582,2317092.6282,-11206094.8733,2347715.4972],
    "TR100_Inundacion_pluvial_urbana": [-11237294.4330,2317338.3143,-11206166.1294,2347410.5365],
    "TR200_Inundacion_pluvial_urbana": [-11237450.4582,2317092.6282,-11206119.5484,2347715.2420],
    "TR500_Inundacion_pluvial_urbana": [-11237273.4632,2317338.3143,-11206166.1294,2347410.5365],
    "TR2_Peligro_inundacion_fluvial": [-11222941.5745,2328433.2228,-11215833.6288,2339699.4906],
    "TR5_Peligro_inundacion_fluvial": [-11222939.6792,2328427.9153,-11215835.7539,2339703.6824],
    "TR10_Peligro_inundacion_fluvial": [-11222938.1575,2328426.2604,-11215835.7539,2339706.2590],
    "TR20_Peligro_inundacion_fluvial": [-11222939.6792,2328427.9153,-11215835.7539,2339702.6901],
    "TR50_Peligro_inundacion_fluvial": [-11222939.7005,2328420.4868,-11215835.6391,2339702.6668],
    "TR100_Peligro_inundacion_fluvial": [-11222939.6792,2328422.5495,-11215829.3234,2339704.6282],
    "TR200_Peligro_inundacion_fluvial": [-11223052.8198,2328374.8464,-11215720.5922,2339709.5547],
    "TR500_Peligro_inundacion_fluvial": [-11222939.6792,2326889.8937,-11215730.0617,2339704.6282],
    "Presencia_de_tornados": [-11233580.2754,2315102.4080,-11202258.8826,2354951.8436],
    "Helada_TR05": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Helada_TR10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Helada_TR20": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Helada_TR50": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Helada_TR100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Sequia_TR05": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Sequia_TR10": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2256],
    "Sequia_TR20": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "Sequia_TR50": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Sequia_TR100": [-11233600.1313,2315252.0339,-11204562.8802,2355812.2255],
    "Ondas_gelidas_1920_2019": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Dias_con_ondas_de_calor": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Maxima_duracion_OC": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Tormentas_granizo": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Indice_peligro_tormentas_electricas": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Tormentas_electricas": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "Densidad_Ciclones": [-11233767.3321,2315094.3382,-11204184.5071,2356006.2018],
    "refugios_temporales_celaya": [-11224323.1716,2336420.0147,-11222736.8129,2336761.0711],
    "Disp_residuos": [-11232544.0027,2333089.6660,-11224401.9770,2333768.9208],
    "Plantas": [-11230403.8980,2333329.3298,-11222731.5547,2338396.3985],
    "Sitio_final": [-11233632.4438,2332183.4324,-11231594.3873,2334601.5170],
    "ACCIDENTES_PC_": [-11227316.0912,2330365.9176,-11211003.8592,2344577.4271],
    "Gasolineras_celaya": [-11231738.1805,2318763.6173,-11214795.0749,2347693.7971],
    "Puentes_RNC": [-11233767.3321, 2315094.3382, -11204184.5070, 2356006.2018],
    "Puentes_tipo_linea_INEGI_2024": [-11233767.3321, 2315094.3382, -11204184.5070, 2356006.2018],
    "LINEAS_ALTA_TENSION": [-11237363.8898,2309301.8300,-11200322.2915,2357483.9960],
    "INMUEBLES_RIESGO_COLAPSO": [-11223360.9382,2327366.9754,-11219480.2183,2336616.9491],
    "Baldios_celaya": [-11228634.4895,2330401.5211,-11217463.7705,2342139.2512],
    "Ferrocarril": [-11233146.2313,2315581.1765,-11210905.6629,2350492.6543],
    "Carreteras_RNC": [-11233595.6291,2315495.7783,-11207798.4588,2352345.6304],
    "Caminos": [-11233420.7084,2315253.0799,-11206162.0726,2355776.7553],
    "Calles": [-11233294.4208,2317471.5171,-11206623.2779,2353870.4655],
    "Rios_Arroyos": [-11235879.9372,2314426.6542,-11204577.3521,2355397.7654],
    "Pozos_carcamos_tanques": [-11230710.4058,2328766.3611,-11217342.3914,2342142.7164],
    "Balnerios": [-11226005.8731,2322155.9728,-11213754.1274,2348273.6437],
    "Densidad_incidentes_socio_organizativos": [-11233600.1313,2315252.0340,-11204562.8801,2355812.2256],
    "PANTEONES_MPIO_CELAYA": [-11229602.0708,2318914.0258,-11211577.4769,2346606.0647],
    "Riesgo_Inestabilidad_Laderas": [-11233767.3321, 2315094.3382, -11204184.5070, 2356006.2018],
    "Riesgo_Fallas_fracturas": [-11232237.8373,2326162.2494,-11210773.6805,2342387.9942],
    "Riesgo_Subsidencia": [-11233419.0663, 2315258.1411,-11202623.9224, 2354790.2969],
    "Riesgo_helada": [-11233767.3321, 2315094.3382, -11204184.5070, 2356006.2018],
    "Riesgo_sequia": [-11233767.3321, 2315094.3382, -11204184.5070, 2356006.2018],
    "Riesgo_Inundaciones_Pluviales": [-11249322.9234,2317142.1032,-11192958.6083,2377198.5855],
    "Riesgo_inundaciones_pluviales_urbanas": [-11237273.4632,2317338.3143,-11206166.1294,2347410.5365],
    "Riesgo_Inundaciones_Fluviales": [-11222939.6792,2326889.8937,-11215730.0617,2339704.6282],
    "Riesgo_Incendios_Forestales": [-11233767.3320,2315094.3382,-11204184.5071,2356006.2018],
    "obras_hidrometeorologicos_mantenimiento": [-11230273.1297,2327549.5909,-11216888.8836,2341384.7739],
    "obras_hidrometeorologicos": [-11228216.8057,2326803.7152,-11215665.5074,2336826.0944]
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
          icon: 'fa-exclamation-triangle',
          expanded: false,
          subgroups: [
            {
              name: 'EDAFOLOGÍA',
              layers: [
                { name: 'Edafología', layer: 'Edafologia' }
              ]
            },
            {
              name: 'FISIOGRAFÍA',
              layers: [
                { name: 'Provincia Fisiográfica', layer: 'Provincia_Fisiografica' },
                { name: 'Subprovincia Fisiográfica', layer: 'Subprovincia_Fisiografica' }
              ]
            },
            {
              name: 'GEOLOGÍA',
              layers: [
                { name: 'Bancos de Nivel', layer: 'Bancos_de_Nivel' },
                { name: 'Fallas y Fracturas Regionales', layer: 'Fallas_y_Fracturas_Regionales' },
                { name: 'Litología', layer: 'Litologia' }
              ]
            },
            {
              name: 'GEOMORFOLOGÍA',
              layers: [
                { name: 'Geomorfología', layer: 'Geomorfologia' }
              ]
            },
            {
              name: 'HIDROGRAFÍA E HIDROLOGÍA',
              layers: [
                { name: 'Hidrografía Subcuenca', layer: 'Hidrografía_Subcuenca' }
              ]
            },
            {
              name: 'USO DE SUELO Y VEGETACIÓN',
              layers: [
                { name: 'Uso de Suelo y Vegetación 2018', layer: 'USV2018' }
              ]
            }
          ]
        },
        {
          id: 'medio-sociodemografico',
          name: 'Medio sociodemográfico',
          icon: 'fa-users',
          expanded: false,
          layers: [
            { name: 'Estado', layer: 'Estado' },
            { name: 'Límite Municipal', layer: 'Mpio', visible: true, wmsUrl: '/geoserver/pc/wms', wmsLayer: 'Mpio' },
            { name: 'Códigos Postales', layer: 'CP_CYA' },
            { name: 'Comunidades Rurales', layer: 'Comunidades_cya' },
            { name: 'Colonias', layer: 'COLONIAS_CYA' },
            { name: 'Manzanas INEGI 2020', layer: 'Manzanas_INEGI_2020' },
            { name: 'Densidad de Población', layer: 'manzanas_densidad_poblacion' },
            { name: 'Municipios Colindantes', layer: 'MPIO_Colindantes' }
          ]
        },
        {
          id: 'peligros',
          name: 'Peligros',
          icon: 'fa-exclamation-triangle',
          expanded: false,
          subgroups: [
            {
              name: 'GEOLÓGICOS',
              tooltip: 'Sismos, erupciones volcánicas, tsunamis, inestabilidad de laderas, flujos, caídos o derrumbes, hundimientos, subsidencia y agrietamientos.',
              layers: [
                { name: 'Epicentros', layer: 'Epicentros' },
                { name: 'Global de Intensidades', layer: 'Global_Intensidades' },
                { name: 'Aceleración Máxima sismo 23 jun 2020', layer: 'Ace_Max_sismo_23_jun_2020' },
                { name: 'Acel. Suelo (0s) T10 años', layer: 'Ace_Suelo_Max_0s_T10' },
                { name: 'Acel. Suelo (0.15s) T10 años', layer: 'Ace_Suelo_Max_0_15s_T10' },
                { name: 'Acel. Suelo (0.5s) T10 años', layer: 'Ace_Suelo_Max_0_5s_T10' },
                { name: 'Acel. Suelo (1s) T10 años', layer: 'Ace_Suelo_Max_1_s_T10' },
                { name: 'Acel. Suelo (0s) T100 años', layer: 'Ace_Suelo_Max_0s_T100' },
                { name: 'Acel. Suelo (0.15s) T100 años', layer: 'Ace_Suelo_Max_0_15s_T100' },
                { name: 'Acel. Suelo (0.5s) T100 años', layer: 'Ace_Suelo_Max_0_5s_T100' },
                { name: 'Acel. Suelo (1s) T100 años', layer: 'Ace_Suelo_Max_1_s_T100' },
                { name: 'Acel. Suelo (0s) T500 años', layer: 'Ace_Suelo_Max_0s_T500' },
                { name: 'Acel. Suelo (0.15s) T500 años', layer: 'Ace_Suelo_Max_0_15s_T500' },
                { name: 'Acel. Suelo (0.5s) T500 años', layer: 'Ace_Suelo_Max_0_5s_T500' },
                { name: 'Acel. Suelo (1s) T500 años', layer: 'Ace_Suelo_Max_1_s_T500' },
                { name: 'Uso Agrícola 1970', layer: 'Uso_Agricola_1970' },
                { name: 'Uso Agrícola 2009', layer: 'Uso_Agricola_2009' },
                { name: 'Uso Agrícola 2014', layer: 'Uso_Agricola_2014' },
                { name: 'Uso Agrícola 2018', layer: 'Uso_Agricola_2018' },
                { name: 'Fallas', layer: 'Fallas' },
                { name: 'Fracturas', layer: 'Fracturas' },
                { name: 'Peligro Fallas y Fracturas', layer: 'Peligros_Fallas_Fracturas' },
                { name: 'Puntos de revisión', layer: 'Puntos_de_revision' },
                { name: 'Fallas Celaya 2020', layer: 'Fallas_Celaya_2020' },
                { name: 'Grieta comunidad La Cruz', layer: 'Grieta_comunidad_La_Cruz' }
              ]
            },
            {
              name: 'HIDROMETEOROLÓGICOS',
              tooltip: 'Ciclones tropicales, lluvias extremas, inundaciones, tormentas, heladas, sequías, ondas cálidas y gélidas, tornados.',
              layers: [
                { name: 'Río Laja', layer: 'Rio_Laja' },
                { name: 'Índice Nacional de Inundación', layer: 'IndiceN_Inundacion' },
                { name: 'Encharcamientos', layer: 'Encharcamientos' },
                { name: 'Afectación canal la luz', layer: 'Afectacion_canal_la_luz' },
                { name: 'Zona Afectación Canales y arroyos', layer: 'Zona_Afectacion_Canales_arroyos' },
                { name: 'Afectación 10 de abril encharcamiento 2018', layer: 'Afectacion_10_de_abril_encharcamiento_2018' },
                { name: 'Afectación parque industrial Marques', layer: 'Afectacion_parque_industrial_marquez' },
                { name: 'Afectación desbordamiento río laja 2018', layer: 'Afectacion_desbordamiento_rio_laja_2018' },
                { name: 'Zona afectada canal de la zaca', layer: 'canal_zaca' },
                { name: 'Subcuenca Río Laja-Celaya', layer: 'Subcuenca_Rio_Laja_Celaya' },
                { name: 'Red hidrográfica', layer: 'Red_hidrografica' },
                { name: 'Microcuenca Río Laja-Celaya', layer: 'Microcuenca_Rio_Laja_Celaya' },
                { name: 'USV2018', layer: 'usv' },
                { name: 'Coeficiente Escorrentía', layer: 'Coeficiente_Escorrentia' },
                { name: 'Potencial de Escurrimientos', layer: 'Potencial_de_Escurrimientos' },
                { name: 'TR2 Inundación pluvial', layer: 'TR2_Inundacion_pluvial' },
                { name: 'TR5 Inundación pluvial', layer: 'TR5_Inundacion_pluvial' },
                { name: 'TR10 Inundación pluvial', layer: 'TR10_Inundacion_pluvial' },
                { name: 'TR20 Inundación pluvial', layer: 'TR20_Inundacion_pluvial' },
                { name: 'TR50 Inundación pluvial', layer: 'TR50_Inundacion_pluvial' },
                { name: 'TR100 Inundación pluvial', layer: 'TR100_Inundacion_pluvial' },
                { name: 'TR200 Inundación pluvial', layer: 'TR200_Inundacion_pluvial' },
                { name: 'TR500 Inundación pluvial', layer: 'TR500_Inundacion_pluvial' },
                { name: 'TR2 Inundación pluvial urbana', layer: 'TR2_Inundacion_pluvial_urbana' },
                { name: 'TR5 Inundación pluvial urbana', layer: 'TR5_Inundacion_pluvial_urbana' },
                { name: 'TR10 Inundación pluvial urbana', layer: 'TR10_Inundacion_pluvial_urbana' },
                { name: 'TR20 Inundación pluvial urbana', layer: 'TR20_Inundacion_pluvial_urbana' },
                { name: 'TR50 Inundación pluvial urbana', layer: 'TR50_Inundacion_pluvial_urbana' },
                { name: 'TR100 Inundación pluvial urbana', layer: 'TR100_Inundacion_pluvial_urbana' },
                { name: 'TR200 Inundación pluvial urbana', layer: 'TR200_Inundacion_pluvial_urbana' },
                { name: 'TR500 Inundación pluvial urbana', layer: 'TR500_Inundacion_pluvial_urbana' },
                { name: 'TR2 Peligro inundación fluvial', layer: 'TR2_Peligro_inundacion_fluvial' },
                { name: 'TR5 Peligro inundación fluvial', layer: 'TR5_Peligro_inundacion_fluvial' },
                { name: 'TR10 Peligro inundación fluvial', layer: 'TR10_Peligro_inundacion_fluvial' },
                { name: 'TR20 Peligro inundación fluvial', layer: 'TR20_Peligro_inundacion_fluvial' },
                { name: 'TR50 Peligro inundación fluvial', layer: 'TR50_Peligro_inundacion_fluvial' },
                { name: 'TR100 Peligro inundación fluvial', layer: 'TR100_Peligro_inundacion_fluvial' },
                { name: 'TR200 Peligro inundación fluvial', layer: 'TR200_Peligro_inundacion_fluvial' },
                { name: 'TR500 Peligro inundación fluvial', layer: 'TR500_Peligro_inundacion_fluvial' },
                { name: 'Presencia de tornados', layer: 'Presencia_de_tornados' },
                { name: 'Helada TR05', layer: 'Helada_TR05' },
                { name: 'Helada TR10', layer: 'Helada_TR10' },
                { name: 'Helada TR20', layer: 'Helada_TR20' },
                { name: 'Helada TR50', layer: 'Helada_TR50' },
                { name: 'Helada TR100', layer: 'Helada_TR100' },
                { name: 'Sequía TR05', layer: 'Sequia_TR05' },
                { name: 'Sequía TR10', layer: 'Sequia_TR10' },
                { name: 'Sequía TR20', layer: 'Sequia_TR20' },
                { name: 'Sequía TR50', layer: 'Sequia_TR50' },
                { name: 'Sequía TR100', layer: 'Sequia_TR100' },
                { name: 'Ondas gélidas 1920-2019', layer: 'Ondas_gelidas_1920_2019' },
                { name: 'Días con ondas de calor', layer: 'Dias_con_ondas_de_calor' },
                { name: 'Máxima duración de O.C.', layer: 'Maxima_duracion_OC' },
                { name: 'Tormentas de granizo', layer: 'Tormentas_granizo' },
                { name: 'Índice peligro tormentas eléctricas', layer: 'Indice_peligro_tormentas_electricas' },
                { name: 'Tormentas eléctricas', layer: 'Tormentas_electricas' },
                { name: 'Densidad de ciclones', layer: 'Densidad_Ciclones' }
              ]
            },
            {
              name: 'QUÍMICO TECNOLÓGICOS',
              tooltip: 'Situaciones de emergencia causadas por sustancias químicas peligrosas.',
              layers: [
                { name: 'Accidentes PC', layer: 'ACCIDENTES_PC_' },
                { name: 'Gasolineras', layer: 'Gasolineras_celaya' }
              ]
            },
            {
              name: 'SANITARIO ECOLÓGICOS',
              tooltip: 'Epidemias, plagas, contaminación del aire, agua, suelo y alimentos.',
              layers: [
                { name: 'Exposición a sitio de disposición final', layer: 'Sitio_final' },
                { name: 'Plantas de tratamiento de aguas residuales', layer: 'Plantas' },
                { name: 'Sitios de disposición final', layer: 'Disp_residuos' },
                { name: 'Refugios temporales', layer: 'refugios_temporales_celaya' }
              ]
            },
            {
              name: 'SOCIO-ORGANIZATIVO',
              tooltip: 'Errores humanos, concentraciones masivas, terrorismo, accidentes de transporte.',
              layers: [
                { name: 'Líneas de alta tensión', layer: 'LINEAS_ALTA_TENSION' },
                { name: 'Puentes tipo linea INEGI 2024', layer: 'Puentes_tipo_linea_INEGI_2024' },
                { name: 'Puentes RNC 2024', layer: 'Puentes_RNC' },
                { name: 'Inmuebles en Riesgo de Colapso', layer: 'INMUEBLES_RIESGO_COLAPSO' },
                { name: 'Lotes Baldíos', layer: 'Baldios_celaya' },
                { name: 'Ferrocarril', layer: 'Ferrocarril' },
                { name: 'Carreteras', layer: 'Carreteras_RNC' },
                { name: 'Caminos', layer: 'Caminos' },
                { name: 'Calles', layer: 'Calles' },
                { name: 'Ríos y arroyos', layer: 'Rios_Arroyos' },
                { name: 'Pozos, cárcamos y tanques', layer: 'Pozos_carcamos_tanques' },
                { name: 'Panteones', layer: 'PANTEONES_MPIO_CELAYA' },
                { name: 'Balnearios', layer: 'Balnerios', wmsUrl: '/geoserver/pc/wms', wmsLayer: 'Balnerios' },
                { name: 'Densidad incidentes socio-organizativos', layer: 'Densidad_incidentes_socio_organizativos' }
              ]
            }
          ]
        },
        {
          id: 'riesgos',
          name: 'Riesgos',
          icon: 'fa-exclamation-circle',
          expanded: false,
          layers: [
            { name: 'Riesgo Inestabilidad de Laderas', layer: 'Riesgo_Inestabilidad_Laderas' },
            { name: 'Riesgo Fallas o fracturas', layer: 'Riesgo_Fallas_fracturas' },
            { name: 'Riesgo Subsidencia', layer: 'Riesgo_Subsidencia' },
            { name: 'Riesgo Helada', layer: 'Riesgo_helada' },
            { name: 'Riesgo Sequías', layer: 'Riesgo_sequia' },
            { name: 'Riesgo Inundaciones pluviales', layer: 'Riesgo_Inundaciones_Pluviales' },
            { name: 'Riesgo Inundaciones pluviales urbanas', layer: 'Riesgo_inundaciones_pluviales_urbanas' },
            { name: 'Riesgo Inundaciones fluviales', layer: 'Riesgo_Inundaciones_Fluviales' },
            { name: 'Riesgo Incendios Forestales', layer: 'Riesgo_Incendios_Forestales' }
          ]
        },
        {
          id: 'obras',
          name: 'Obras',
          icon: 'fa-helmet-safety',
          expanded: false,
          layers: [
            { name: 'Obras hidrometeorológicos', layer: 'obras_hidrometeorologicos' },
            { name: 'Obras hidrometeorológicos mantenimiento', layer: 'obras_hidrometeorologicos_mantenimiento' }
          ]
        }
      ]
    },
    {
      id: 'capas-base',
      name: 'Capas Base',
      icon: 'fa-map',
      expanded: false,
      isBasemapGroup: true
    }
  ]

};
