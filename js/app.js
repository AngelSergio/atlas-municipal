// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    geoserverUrl: '/geoserver',
    workspace: 'pc',
    center: [-100.8167, 20.5289], // Celaya lon, lat
    zoom: 12,
    homeExtent3857: [-11233767.3321, 2315094.3382, -11204184.5071, 2356006.2018],
    minZoom: 8,
    maxZoom: 28
};

// ========================================
// LAYER EXTENTS (EPSG:3857)
// Extensiones predefinidas para zoom rápido
// ========================================
const LAYER_EXTENTS = {
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
    "obras_hidrometeorologicos": [-11228216.8057,2326803.7152,-11215665.5074,2336826.0944],
};


const GOOGLE_PLACES_API_KEY = 'AIzaSyBuC0CL7cegUQk4ietLseI6LxePNOw2ld8';
const CELAYA_BIAS = { lat: 20.5235, lng: -100.8157 };
const CELAYA_BIAS_RADIUS = 25000;
let googlePlacesPromise = null;
window.AtlasGooglePlacesConfig = {
    apiKey: GOOGLE_PLACES_API_KEY,
    bias: CELAYA_BIAS,
    radius: CELAYA_BIAS_RADIUS
};

function loadGooglePlacesApi() {
    if (window.google?.maps?.places) return Promise.resolve(window.google.maps);
    if (window.__atlasGoogleMapsPromise) {
        return window.__atlasGoogleMapsPromise.then(() => window.google?.maps);
    }
    if (googlePlacesPromise) return googlePlacesPromise;
    googlePlacesPromise = new Promise((resolve, reject) => {
        const existing = document.getElementById('google-places-api');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.google?.maps), { once: true });
            existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Maps Places')), { once: true });
            return;
        }

        window.__atlasGoogleMapsReady = function () {
            resolve(window.google?.maps);
        };

        window.__atlasGoogleMapsPromise = googlePlacesPromise;
        const script = document.createElement('script');
        script.id = 'google-places-api';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=es&region=MX&loading=async&callback=__atlasGoogleMapsReady`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('No se pudo cargar Google Maps Places'));
        document.head.appendChild(script);
    });
    return googlePlacesPromise;
}

// ========================================
// LAYER DEFINITIONS
// ========================================
const LAYER_GROUPS = [
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
                    {
                        // Límite Municipal layer: keep the route explicit so it points to
                        // the pc GeoServer instance and pc workspace requested for
                        // this viewer.
                        name: 'Límite Municipal',
                        layer: 'Mpio',
                        visible: true,
                        wmsUrl: '/geoserver/pc/wms',
                        wmsLayer: 'Mpio'
                    },
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
];

// ========================================
// GLOBAL VARIABLES
// ========================================
let map;
let wmsLayers = {};
window.wmsLayers = wmsLayers; // Expuesto para cesium-3d.js (Opción A)
let activeLayers = [];
window.activeLayers = [];
let cesium2DLayerSnapshot = null;
let wmsLayerExtents = {};
let wmsCapabilitiesPromise = null;
let measureDraw = null;
let measureSource = null;
let measureLayer = null;
let measureTooltip = null;
let measureTooltipElement = null;
let measureAnimationFrame = null;
let measureMotionPhase = 0;
let measureDashOffset = 0;
let measureDirectionalFlowActive = false;
let measureElevationDebounce = null;
let measureElevationRequestSeq = 0;
let currentMeasureMode = null;
let measureModeBeforePrint = null;
let objectAnalysisActive = false;
let objectAnalysisDraw = null;
let objectAnalysisSource = null;
let objectAnalysisLayer = null;
let profileAnalysisActive = false;
let profileAnalysisDraw = null;
let profileAnalysisSource = null;
let profileAnalysisLayer = null;
let profileModeBeforePrint = false;
let profileHadDrawBeforePrint = false;
let profileAnimationFrame = null;
let profileMotionPhase = 0;
let profileDashOffset = 0;
let profileDirectionalFlowActive = false;
let terrain3DActive = false;
let terrain3DDraw = null;
let terrain3DSource = null;
let terrain3DLayer = null;
let lastElevationProfileData = null;
let lastTerrain3DData = null;
let currentLocationSource = null;
let currentLocationLayer = null;
let currentLocationOverlay = null;
let currentLocationHideTimer = null;
let currentLocationBusy = false;
let currentLocationLoadingStartedAt = 0;
let rioLajaAnimationLayer = null;
let rioLajaAnimationSource = null;
let rioLajaAnimationLoaded = false;
let rioLajaAnimationLoading = false;
let rioLajaAnimationFrame = null;
let rioLajaAnimationOffset = 0;
let gasolinerasStyledLayer = null;
let gasolinerasStyledSource = null;
let gasolinerasStyledLoaded = false;
let gasolinerasStyledLoading = false;
let gasolinerasAnimationFrame = null;
let gasolinerasAnimationPhase = 0;
let gasolinerasAnimationLastTick = 0;
const GASOLINERAS_ANIMATION_INTERVAL = 1000 / 14;

// ========================================
// BASEMAP LAYERS
// ========================================
const basemapDefinitions = [
    {
        id: 'google-roadmap',
        name: 'Google Roadmap',
        subtitle: 'Calles y referencia',
        previewClass: 'roadmap',
        previewShort: 'Roadmap',
        baseUrl: 'https://mt1.google.com/vt/lyrs=m&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        trafficUrl: 'https://mt1.google.com/vt/lyrs=m,traffic&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        layer: null
    },
    {
        id: 'google-hybrid',
        name: 'Híbrido',
        subtitle: 'Satélite con etiquetas',
        previewClass: 'hybrid',
        previewShort: 'Hybrid',
        baseUrl: 'https://mt1.google.com/vt/lyrs=y&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        trafficUrl: 'https://mt1.google.com/vt/lyrs=y,traffic&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        layer: null
    },
    {
        id: 'google-satellite',
        name: 'Satélite',
        subtitle: 'Imagen satelital',
        previewClass: 'satellite',
        previewShort: 'Sat',
        baseUrl: 'https://mt1.google.com/vt/lyrs=s&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        trafficUrl: 'https://mt1.google.com/vt/lyrs=s,traffic&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        layer: null
    },
    {
        id: 'google-terrain',
        name: 'Google Terrain',
        subtitle: 'Relieve y topografía',
        previewClass: 'terrain',
        previewShort: 'Relieve',
        baseUrl: 'https://mt1.google.com/vt/lyrs=p&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        trafficUrl: 'https://mt1.google.com/vt/lyrs=p,traffic&hl=es-MX&x={x}&y={y}&z={z}&s=Ga',
        layer: null
    }
];

function createGoogleXyzSource(url) {
    return new ol.source.XYZ({
        url,
        attributions: '© Google',
        crossOrigin: 'anonymous'
    });
}

basemapDefinitions.forEach((def, index) => {
    def.layer = new ol.layer.Tile({
        source: createGoogleXyzSource(def.baseUrl),
        visible: index === 0
    });
});

const basemaps = Object.fromEntries(basemapDefinitions.map(def => [def.id, def.layer]));
let currentBasemapId = 'google-roadmap';
let trafficModeEnabled = false;
let streetViewCoverageEnabled = true;

// ========================================
// HOME / ZOOM GENERAL
// ========================================
function getHomePadding() {
    // El sidebar está fuera del viewport del mapa (layout flex),
    // así que NO debe sumarse como padding izquierdo del fit.
    // Si se compensa aquí, el municipio queda cargado de un lado.
    return [80, 60, 40, 60];
}

function zoomToGeneral(duration = 600) {
    if (!map) return;
    const extent = CONFIG.homeExtent3857;
    if (!extent || extent.length !== 4) return;
    map.updateSize();
    map.getView().fit(extent, {
        padding: getHomePadding(),
        duration: duration,
        nearest: true
    });
}

class ZoomGeneralControl extends ol.control.Control {
    constructor() {
        const button = document.createElement('button');
        button.type = 'button';
        button.title = 'Zoom general';
        button.setAttribute('aria-label', 'Zoom general');
        button.innerHTML = '<svg class="zoom-general-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"></path></svg>';

        const element = document.createElement('div');
        element.className = 'ol-zoom-general-control ol-unselectable ol-control';
        element.appendChild(button);

        super({ element });

        button.addEventListener('click', () => {
            zoomToGeneral();
            showToast('Zoom general aplicado', 'success');
        });
    }
}

// ========================================
// INITIALIZE MAP
// ========================================

// ── Tooltip flotante inteligente para botones del header ──
function initHeaderTooltips() {
    const tip = document.createElement('div');
    tip.id = 'header-tooltip';
    document.body.appendChild(tip);

    let hideTimer = null;

    function showTip(btn) {
        const label = btn.dataset.tip;
        if (!label) return;
        clearTimeout(hideTimer);
        tip.textContent = label;
        tip.classList.remove('visible');

        const r = btn.getBoundingClientRect();
        const vw = window.innerWidth;
        const tipW = tip.offsetWidth || 120;

        // Centrar sobre el botón
        let left = r.left + r.width / 2 - tipW / 2;
        // Ajuste borde derecho
        if (left + tipW + 8 > vw) left = vw - tipW - 8;
        // Ajuste borde izquierdo
        if (left < 8) left = 8;

        // Flecha relativa al centro del botón
        const arrowLeft = (r.left + r.width / 2) - left;
        tip.style.setProperty('--arrow-left', arrowLeft + 'px');
        tip.style.left = left + 'px';
        tip.style.top = (r.bottom + 8) + 'px';
        tip.classList.add('visible');
    }

    function hideTip() {
        hideTimer = setTimeout(() => tip.classList.remove('visible'), 80);
    }

    document.querySelectorAll('.tb-btn[data-tip]').forEach(btn => {
        btn.addEventListener('mouseenter', () => showTip(btn));
        btn.addEventListener('mouseleave', hideTip);
        btn.addEventListener('click', hideTip);
    });
}

// Migra title→data-tip en botones del header para evitar doble tooltip (nativo + CSS)
function migrateHeaderBtnTitles() {
    document.querySelectorAll('.tb-btn[title]').forEach(btn => {
        const tip = btn.getAttribute('title');
        if (tip) {
            btn.setAttribute('data-tip', tip);
            btn.removeAttribute('title');
        }
    });
}

function preventUiElementDragging() {
    document.addEventListener('dragstart', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('.legend-panel, .header-brand, .header-tools, .header-logo, .sidebar, .geocoder-container, .coords-container, .route-container, .ol-control, .ol-scale-line, .intro-splash__content--logo')) {
            event.preventDefault();
        }
    });
}

function preventMapNativeDragging() {
    const mapElement = document.getElementById('map');
    if (!mapElement || mapElement.dataset.nativeDragBlocked === '1') return;

    const allowNativeInteraction = (target) => {
        if (!(target instanceof Element)) return false;
        return Boolean(target.closest([
            '#ol-street-view--pegman-draggable',
            '.ol-street-view--draggable',
            '.ol-street-view--dropzone',
            'input',
            'textarea',
            'select',
            'option',
            'button',
            '[contenteditable="true"]',
            '.geocoder-selection-popup',
            '.current-location-popup'
        ].join(', ')));
    };

    const blockNativeDrag = (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (!mapElement.contains(target)) return;
        if (allowNativeInteraction(target)) return;
        if (target.closest('.ol-viewport, .ol-layer, .ol-overlaycontainer, .ol-overlaycontainer-stopevent, canvas, img')) {
            event.preventDefault();
        }
    };

    const sanitizeViewportElements = () => {
        mapElement.querySelectorAll('.ol-layer img, .ol-layer canvas, .ol-viewport img, .ol-viewport canvas').forEach((element) => {
            element.setAttribute('draggable', 'false');
            element.draggable = false;
        });
    };

    mapElement.addEventListener('dragstart', blockNativeDrag, true);
    mapElement.addEventListener('selectstart', blockNativeDrag, true);

    sanitizeViewportElements();

    const observer = new MutationObserver(() => {
        sanitizeViewportElements();
    });
    observer.observe(mapElement, { childList: true, subtree: true });

    mapElement.dataset.nativeDragBlocked = '1';
}



function isStreetViewPluginActive() {
    return !!document?.body?.classList.contains('ol-street-view--activated');
}

function closeActiveStreetView() {
    const streetViewControl = window.__atlasStreetViewControl;
    if (!isStreetViewPluginActive() || !streetViewControl || typeof streetViewControl.hideStreetView !== 'function') {
        return false;
    }

    try {
        streetViewControl.hideStreetView();
        return true;
    } catch (error) {
        console.warn('No se pudo cerrar Street View antes del cambio de modo', error);
        return false;
    }
}

window.__atlasStreetViewApi = {
    isActive: isStreetViewPluginActive,
    close: closeActiveStreetView
};

function relocateMapOverlaysIntoViewport() {
    const mapElement = document.getElementById('map');
    const mapContainer = document.querySelector('.map-container');
    if (!mapElement || !mapContainer || mapElement.dataset.streetviewOverlayRelocated === '1') return;

    const selectors = [
        '#geocoder-container',
        '#coords-container',
        '#route-container',
        '#atlas-cesium-shell',
        '.map-brand',
        '#loading',
        '#status-dock',
        '#legend-panel'
    ];

    selectors.forEach((selector) => {
        const element = mapContainer.querySelector(selector);
        if (element && element.parentElement !== mapElement) {
            mapElement.appendChild(element);
        }
    });

    mapElement.dataset.streetviewOverlayRelocated = '1';
}

function initMap() {
    relocateMapOverlaysIntoViewport();

    // Create map
    map = new ol.Map({
        target: 'map',
        layers: [...Object.values(basemaps)],
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        view: new ol.View({
            center: ol.proj.fromLonLat(CONFIG.center),
            zoom: CONFIG.zoom,
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom
        }),
        controls: ol.control.defaults.defaults({ attribution: false }).extend([
            new ol.control.ScaleLine({ target: document.getElementById('scale-slot') }),
            new ZoomGeneralControl(),
            new ol.control.CanvasTitle({
                title: 'Atlas Municipal de Peligros y Riesgos de Celaya',
                visible: false
            })
        ])
    });
    // Todas las capas base deben quedarse SIEMPRE por debajo de las capas temáticas.
    // Si se les da un zIndex mayor (por ejemplo satélite/terrain), terminan tapando los WMS.
    Object.values(basemaps).forEach((layer) => layer.setZIndex(-100));
    // Se elimina la inicialización del Street View personalizado. En su lugar se configura el plugin ol-street-view.
    // Configuración del plugin ol-street-view. El plugin creará su propio control (pegman)
    // y el visor panorámico asociado, replicando la interfaz del proyecto PGO2026.
    try {
        const opt_options = {};
        // Utilizar la misma clave de Google utilizada para Places; esto habilita Street View.
        // Añadimos '&libraries=places' tal como se hace en PGO2026 para que la API cargue también la biblioteca Places
        opt_options.apiKey = GOOGLE_PLACES_API_KEY + '&libraries=places';
        opt_options.language = 'es';
        // Tamaño mediano inicial para el visor y permitir cambio de tamaño
        opt_options.size = 'md';
        opt_options.resizable = true;
        // Mostrar botón para alternar entre tamaño compacto y expandido
        opt_options.sizeToggler = true;
        // Cuando se expande, el mapa ocupa un área predeterminada
        opt_options.defaultMapSize = 'expanded';
        // El target debe ser el id del contenedor del mapa
        opt_options.target = 'map';
        // Textos en español para la UI
        opt_options.i18n = { dragToInit: 'Ver imágenes de Street View' };
        // Instanciar el control StreetView si la clase está disponible
        if (typeof StreetView !== 'undefined') {
            const streetView = new StreetView(opt_options);
            map.addControl(streetView);
            window.__atlasStreetViewControl = streetView;
            window.__atlasStreetViewCoverageLayer = streetView.getStreetViewLayer ? streetView.getStreetViewLayer() : null;
            streetView.on('streetViewInit', () => {
                document.dispatchEvent(new CustomEvent('atlas:streetview:open'));
                syncStreetViewCoverageAppearance();
                updateStreetViewCoverageToggleUi();
            });
            streetView.on('streetViewExit', () => {
                document.dispatchEvent(new CustomEvent('atlas:streetview:close'));
                syncStreetViewCoverageAppearance();
                updateStreetViewCoverageToggleUi();
            });
        } else {
            console.warn('StreetView plugin no está disponible. Asegúrese de cargar ol-street-view.js');
        }
    } catch (e) {
        console.error('No se pudo inicializar Street View:', e);
    }
    if (window.setupAtlasCoordsTool) {
        window.setupAtlasCoordsTool({ map, ol, showToast });
    }
    if (window.setupAtlasRouteTool) {
        window.setupAtlasRouteTool({ map, ol, showToast });
    }

    setupStreetViewCoverageObserver();
    updateStreetViewCoverageToggleUi();

    // ── Botón central (rueda) = paneo igual que botón izquierdo ──────────
    map.addInteraction(new ol.interaction.DragPan({
        condition: function (mapBrowserEvent) {
            return mapBrowserEvent.originalEvent.button === 1;
        }
    }));
    // Bloquear el autoscroll del navegador al presionar la rueda
    map.getViewport().addEventListener('mousedown', function (e) {
        if (e.button === 1) { e.preventDefault(); }
    }, false);
    // ─────────────────────────────────────────────────────────────────────
    if (window.setupAtlasPrint) {
        window.setupAtlasPrint({
            map,
            ol,
            showToast,
            title: 'Atlas Municipal de Peligros y Riesgos de Celaya'
        });
    }

    const zoomInButton = document.querySelector('.ol-zoom-in');
    const zoomOutButton = document.querySelector('.ol-zoom-out');
    if (zoomInButton) {
        zoomInButton.title = 'Acercar';
        zoomInButton.setAttribute('aria-label', 'Acercar');
    }
    if (zoomOutButton) {
        zoomOutButton.title = 'Alejar';
        zoomOutButton.setAttribute('aria-label', 'Alejar');
    }
    
    window.__atlasMap = map;
    window.__atlasOl = ol;
    // Create WMS layers
    createWMSLayers();
    createRioLajaAnimationLayer();
    createGasolinerasStyledLayer();
    
    // Build layer tree UI
    buildLayerTree();
    preventUiElementDragging();
    preventMapNativeDragging();
    migrateHeaderBtnTitles();
    initHeaderTooltips();
    
    if (window.setupAtlasTempLayers) {
        window.setupAtlasTempLayers({
            map,
            ol,
            showToast,
            showFeatureInfo
        });
    }
    if (window.setupAtlasViewHistory) {
        window.setupAtlasViewHistory({ map });
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Mouse position
    map.on('pointermove', updateCoordinates);
    
    // Click for feature info
    map.on('singleclick', handleMapClick);
    
    // === CURSORES DE MAPA ===
    // Flecha con "?" en reposo  →  manita mientras se arrastra
    (function setupMapCursors() {
        var vp = map.getViewport();
        vp.style.cursor = 'help';          // flecha + signo de interrogación
        var dragging = false;

        vp.addEventListener('pointerdown', function () {
            dragging = true;
            vp.style.cursor = 'grabbing';  // manita cerrada al arrastrar
        });
        window.addEventListener('pointerup', function () {
            if (!dragging) return;
            dragging = false;
            vp.style.cursor = 'help';      // vuelve a flecha + ?
        });
    })();
    // === FIN CURSORES ===

    // Loading indicator
    map.on('loadstart', () => document.getElementById('loading').classList.add('visible'));
    map.on('loadend', () => document.getElementById('loading').classList.remove('visible'));

    // Vista inicial
    setTimeout(() => {
        if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            const view = map.getView();
            view.setCenter(ol.proj.fromLonLat(CONFIG.center));
            view.setZoom(11);
        } else {
            zoomToGeneral(0);
        }
        window.AtlasViewHistory?.reset?.();
    }, 120);
}

// ========================================
// CREATE WMS LAYERS
// ========================================
function createWMSLayers() {
    function processGroup(group) {
        if (group.layers) {
            group.layers.forEach(layerDef => {
                const layerKey = layerDef.layer;
                wmsLayers[layerKey] = new ol.layer.Image({
                    source: new ol.source.ImageWMS({
                        url: layerDef.wmsUrl || `${CONFIG.geoserverUrl}/${CONFIG.workspace}/wms`,
                        params: {
                            'LAYERS': layerDef.wmsLayer || layerDef.layer,
                            'FORMAT': 'image/png',
                            'TRANSPARENT': true
                        },
                        ratio: 2,
                        serverType: 'geoserver'
                    }),
                    visible: layerDef.visible || false,
                    opacity: 0.9,
                    properties: {
                        name: layerDef.name,
                        layerKey: layerKey
                    }
                });
                map.addLayer(wmsLayers[layerKey]);
                wmsLayers[layerKey].setZIndex(100);
                if (layerKey === 'Mpio') {
                    wmsLayers[layerKey].setOpacity(1);
                    wmsLayers[layerKey].setZIndex(1200);
                }
                
                if (layerDef.visible) {
                    activeLayers.push(layerKey);
                }
            });
        }
        
        if (group.subgroups) {
            group.subgroups.forEach(subgroup => {
                subgroup.layers.forEach(layerDef => {
                    const layerKey = layerDef.layer;
                    wmsLayers[layerKey] = new ol.layer.Image({
                        source: new ol.source.ImageWMS({
                            url: layerDef.wmsUrl || `${CONFIG.geoserverUrl}/${CONFIG.workspace}/wms`,
                        params: {
                            'LAYERS': layerDef.wmsLayer || layerDef.layer,
                                'FORMAT': 'image/png',
                                'TRANSPARENT': true
                            },
                            ratio: 2,
                            serverType: 'geoserver'
                        }),
                        visible: layerDef.visible || false,
                        opacity: 0.9,
                        properties: {
                            name: layerDef.name,
                            layerKey: layerKey
                        }
                    });
                    map.addLayer(wmsLayers[layerKey]);
                    wmsLayers[layerKey].setZIndex(100);
                    if (layerKey === 'Mpio') {
                        wmsLayers[layerKey].setOpacity(1);
                        wmsLayers[layerKey].setZIndex(1200);
                    }
                    
                    if (layerDef.visible) {
                        activeLayers.push(layerKey);
                    }
                });
            });
        }
        
        if (group.children) {
            group.children.forEach(child => processGroup(child));
        }
    }
    
    LAYER_GROUPS.forEach(group => processGroup(group));
    syncActiveLayersGlobal();
}

// ========================================
// BUILD LAYER TREE UI
// ========================================

function getRioLajaWfsCandidates() {
    return [
        `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(`${CONFIG.workspace}:Rio_Laja`)}&outputFormat=application/json&srsName=EPSG:3857`,
        `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent('Rio_Laja')}&outputFormat=application/json&srsName=EPSG:3857`,
        `${CONFIG.geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(`${CONFIG.workspace}:Rio_Laja`)}&outputFormat=application/json&srsName=EPSG:3857`
    ];
}

function createRioLajaAnimationStyles() {
    return [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 88, 148, 0.18)',
                width: 10,
                lineCap: 'round',
                lineJoin: 'round'
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(88, 216, 255, 0.75)',
                width: 4,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash: [14, 18],
                lineDashOffset: rioLajaAnimationOffset
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255, 255, 255, 0.55)',
                width: 2,
                lineCap: 'round',
                lineJoin: 'round',
                lineDash: [3, 26],
                lineDashOffset: rioLajaAnimationOffset * 1.6
            })
        })
    ];
}

function ensureRioLajaAnimationData() {
    if (!rioLajaAnimationSource || rioLajaAnimationLoaded || rioLajaAnimationLoading) {
        return Promise.resolve(rioLajaAnimationLoaded);
    }

    rioLajaAnimationLoading = true;
    const candidates = getRioLajaWfsCandidates();

    return (async () => {
        for (const url of candidates) {
            try {
                const response = await fetch(url);
                if (!response.ok) continue;
                const data = await response.json();
                const features = new ol.format.GeoJSON().readFeatures(data, {
                    featureProjection: map.getView().getProjection()
                });
                if (!features.length) continue;
                rioLajaAnimationSource.clear(true);
                rioLajaAnimationSource.addFeatures(features);
                rioLajaAnimationLoaded = true;
                return true;
            } catch (error) {
                console.warn('No fue posible cargar la geometría animada de Río Laja:', error);
            }
        }
        return false;
    })().finally(() => {
        rioLajaAnimationLoading = false;
    });
}

function stopRioLajaAnimation() {
    if (rioLajaAnimationFrame) {
        cancelAnimationFrame(rioLajaAnimationFrame);
        rioLajaAnimationFrame = null;
    }
}

function startRioLajaAnimation() {
    if (!rioLajaAnimationLayer?.getVisible?.() || rioLajaAnimationFrame) return;

    const animate = () => {
        if (!rioLajaAnimationLayer?.getVisible?.()) {
            rioLajaAnimationFrame = null;
            return;
        }
        rioLajaAnimationOffset -= 1.15;
        rioLajaAnimationLayer.changed();
        rioLajaAnimationFrame = requestAnimationFrame(animate);
    };

    rioLajaAnimationFrame = requestAnimationFrame(animate);
}

function syncRioLajaAnimationVisibility() {
    const rioBaseLayer = wmsLayers['Rio_Laja'];
    if (!rioBaseLayer || !rioLajaAnimationLayer) return;

    const visible = !!rioBaseLayer.getVisible();
    rioLajaAnimationLayer.setVisible(visible);

    if (!visible) {
        stopRioLajaAnimation();
        return;
    }

    ensureRioLajaAnimationData().finally(() => {
        if (rioLajaAnimationLayer?.getVisible?.()) {
            startRioLajaAnimation();
        }
    });
}

function createRioLajaAnimationLayer() {
    if (!map || rioLajaAnimationLayer) return;

    rioLajaAnimationSource = new ol.source.Vector();
    rioLajaAnimationLayer = new ol.layer.Vector({
        source: rioLajaAnimationSource,
        visible: false,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        renderBuffer: 180,
        zIndex: 420,
        style: () => createRioLajaAnimationStyles()
    });

    map.addLayer(rioLajaAnimationLayer);

    const rioBaseLayer = wmsLayers['Rio_Laja'];
    if (rioBaseLayer) {
        rioBaseLayer.on('change:visible', syncRioLajaAnimationVisibility);
        syncRioLajaAnimationVisibility();
    }
}



function getGasolinerasWfsCandidates() {
    return [
        `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(`${CONFIG.workspace}:Gasolineras_celaya`)}&outputFormat=application/json&srsName=EPSG:3857`,
        `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent('Gasolineras_celaya')}&outputFormat=application/json&srsName=EPSG:3857`,
        `${CONFIG.geoserverUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(`${CONFIG.workspace}:Gasolineras_celaya`)}&outputFormat=application/json&srsName=EPSG:3857`
    ];
}

function getGasolinerasStyledFeatureName(feature) {
    const props = feature?.getProperties?.() || {};
    const keys = ['NOMBRE', 'Nombre', 'nombre', 'RAZON_SOCIAL', 'razon_social', 'ESTACION', 'Estacion', 'estacion'];
    for (const key of keys) {
        const value = props[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return '';
}

function createGasolinerasStyles(feature, resolution) {
    const zoom = map?.getView?.()?.getZoom?.() ?? CONFIG.zoom;
    const showLabel = zoom >= 15 && resolution <= 9;
    const label = showLabel ? getGasolinerasStyledFeatureName(feature) : '';

    let featurePhaseOffset = feature?.get?.('_gasAnimOffset');
    if (typeof featurePhaseOffset !== 'number') {
        const coord = feature?.getGeometry?.()?.getFirstCoordinate?.() || feature?.getGeometry?.()?.getCoordinates?.() || [0, 0];
        const seed = Math.abs(((coord[0] || 0) * 0.00011) + ((coord[1] || 0) * 0.00007));
        featurePhaseOffset = seed % (Math.PI * 2);
        feature?.set?.('_gasAnimOffset', featurePhaseOffset, true);
    }

    let cache = feature?.get?.('_gasStyleCache');
    if (!cache) {
        const outerCircle = new ol.style.Circle({
            radius: 11.5,
            fill: new ol.style.Fill({ color: 'rgba(214, 101, 91, 0.10)' }),
            stroke: new ol.style.Stroke({ color: 'rgba(214, 101, 91, 0.14)', width: 1.2 })
        });
        const coreCircle = new ol.style.Circle({
            radius: 7.5,
            fill: new ol.style.Fill({ color: '#ffffff' }),
            stroke: new ol.style.Stroke({ color: '#d6655b', width: 2.0 })
        });
        const innerCircle = new ol.style.Circle({
            radius: 2.0,
            fill: new ol.style.Fill({ color: 'rgba(214, 101, 91, 0.14)' }),
            stroke: new ol.style.Stroke({ color: 'rgba(214, 101, 91, 0.32)', width: 0.55 })
        });
        const gasIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="18" fill="#ffffff" stroke="#D6655B" stroke-width="2.7"/>
  <g fill="none" stroke="#B63E35" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15.2 28.6V15.2c0-1.5 1.2-2.7 2.7-2.7h7.3c1.5 0 2.7 1.2 2.7 2.7v13.4" stroke-width="2.9"/>
    <rect x="17.6" y="15.3" width="7.9" height="5.8" rx="1.2" stroke-width="2.2"/>
    <path d="M27.9 16.1h2.5c1.1 0 2.1.4 2.8 1.2l1.3 1.6c.6.7.9 1.6.9 2.6v5.3c0 1.5-1.2 2.7-2.7 2.7S30 28.3 30 26.8v-3.2" stroke-width="2.5"/>
    <path d="M32.1 19.2v2.7" stroke-width="2.1"/>
    <path d="M14 30.9h15.2" stroke-width="2.9"/>
  </g>
  <path d="M21.4 17.2c1.4 1.9 2.2 3.1 2.2 4.2a2.2 2.2 0 1 1-4.4 0c0-1 .7-2.2 2.2-4.2Z" fill="#F2B24E"/>
</svg>`;
        const iconStyle = new ol.style.Icon({
            src: `data:image/svg+xml;utf8,${encodeURIComponent(gasIconSvg)}`,
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: 0.42,
            opacity: 0.95,
            displacement: [0, 0]
        });
        const textStyle = new ol.style.Text({
            text: '',
            font: '600 12px "Segoe UI", Arial, sans-serif',
            offsetY: -18,
            padding: [4, 7, 4, 7],
            fill: new ol.style.Fill({ color: '#7A1226' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }),
            backgroundFill: new ol.style.Fill({ color: 'rgba(255,255,255,0.96)' }),
            backgroundStroke: new ol.style.Stroke({ color: 'rgba(198,40,40,0.18)', width: 1.1 })
        });

        cache = {
            outerCircle,
            coreCircle,
            innerCircle,
            iconStyle,
            textStyle,
            styles: [
                new ol.style.Style({ image: outerCircle }),
                new ol.style.Style({ image: coreCircle }),
                new ol.style.Style({ image: innerCircle }),
                new ol.style.Style({ image: iconStyle }),
                new ol.style.Style({ text: textStyle })
            ]
        };
        feature?.set?.('_gasStyleCache', cache, true);
    }

    const phase = (gasolinerasAnimationPhase + featurePhaseOffset) % (Math.PI * 2);
    const pulse = (Math.sin(phase) + 1) / 2;
    const outerRadius = (zoom >= 18 ? 13.8 : zoom >= 17 ? 12.4 : zoom >= 16 ? 11.2 : zoom >= 15 ? 10.5 : 9.6) + (pulse * 2.8);
    const outerOpacity = 0.095 * (1 - pulse);
    const coreRadius = (zoom >= 18 ? 9.5 : zoom >= 17 ? 8.9 : zoom >= 16 ? 8.3 : zoom >= 15 ? 7.9 : 7.35) + (pulse * 0.18);
    const iconScale = (zoom >= 19 ? 1.30 : zoom >= 18 ? 1.15 : zoom >= 17 ? 1.00 : zoom >= 16 ? 0.82 : zoom >= 15 ? 0.68 : zoom >= 14 ? 0.56 : zoom >= 13 ? 0.46 : 0.38) + (pulse * 0.0085);

    cache.outerCircle.setRadius(outerRadius);
    cache.outerCircle.getFill().setColor(`rgba(214, 101, 91, ${outerOpacity.toFixed(3)})`);
    cache.outerCircle.getStroke().setColor(`rgba(214, 101, 91, ${(outerOpacity * 1.22).toFixed(3)})`);
    cache.coreCircle.setRadius(coreRadius);
    cache.iconStyle.setScale(iconScale);
    cache.textStyle.setText(label || '');

    return label ? cache.styles : cache.styles.slice(0, 4);
}

function ensureGasolinerasStyledData() {
    if (!gasolinerasStyledSource || gasolinerasStyledLoaded || gasolinerasStyledLoading) {
        return Promise.resolve(gasolinerasStyledLoaded);
    }

    gasolinerasStyledLoading = true;
    const candidates = getGasolinerasWfsCandidates();

    return (async () => {
        for (const url of candidates) {
            try {
                const response = await fetch(url);
                if (!response.ok) continue;
                const data = await response.json();
                const features = new ol.format.GeoJSON().readFeatures(data, {
                    featureProjection: map.getView().getProjection()
                });
                if (!features.length) continue;
                gasolinerasStyledSource.clear(true);
                gasolinerasStyledSource.addFeatures(features);
                gasolinerasStyledLoaded = true;
                return true;
            } catch (error) {
                console.warn('No fue posible cargar la geometría estilizada de Gasolineras:', error);
            }
        }
        return false;
    })().finally(() => {
        gasolinerasStyledLoading = false;
    });
}

function stopGasolinerasAnimation() {
    if (gasolinerasAnimationFrame) {
        cancelAnimationFrame(gasolinerasAnimationFrame);
        gasolinerasAnimationFrame = null;
    }
    gasolinerasAnimationLastTick = 0;
}

function startGasolinerasAnimation() {
    if (!gasolinerasStyledLayer?.getVisible?.() || gasolinerasAnimationFrame) return;

    gasolinerasAnimationLastTick = 0;

    const animate = (timestamp = 0) => {
        if (!gasolinerasStyledLayer?.getVisible?.()) {
            gasolinerasAnimationFrame = null;
            return;
        }

        if (!gasolinerasAnimationLastTick || (timestamp - gasolinerasAnimationLastTick) >= GASOLINERAS_ANIMATION_INTERVAL) {
            gasolinerasAnimationLastTick = timestamp;
            gasolinerasAnimationPhase = (gasolinerasAnimationPhase + 0.065) % (Math.PI * 2);
            gasolinerasStyledLayer.changed();
        }

        gasolinerasAnimationFrame = requestAnimationFrame(animate);
    };

    gasolinerasAnimationFrame = requestAnimationFrame(animate);
}

function syncGasolinerasStyledVisibility() {
    const gasLayer = wmsLayers['Gasolineras_celaya'];
    if (!gasLayer || !gasolinerasStyledLayer) return;

    const visible = !!gasLayer.getVisible();
    gasolinerasStyledLayer.setVisible(visible);
    gasolinerasStyledLayer.setOpacity(gasLayer.getOpacity());

    if (!visible) {
        stopGasolinerasAnimation();
        return;
    }

    ensureGasolinerasStyledData().finally(() => {
        if (gasolinerasStyledLayer?.getVisible?.()) {
            gasolinerasStyledLayer.changed();
            startGasolinerasAnimation();
        }
    });
}

function createGasolinerasStyledLayer() {
    if (!map || gasolinerasStyledLayer) return;

    gasolinerasStyledSource = new ol.source.Vector();
    gasolinerasStyledLayer = new ol.layer.Vector({
        source: gasolinerasStyledSource,
        visible: false,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        renderBuffer: 60,
        declutter: false,
        zIndex: 430,
        style: (feature, resolution) => createGasolinerasStyles(feature, resolution)
    });

    map.addLayer(gasolinerasStyledLayer);

    const gasLayer = wmsLayers['Gasolineras_celaya'];
    if (gasLayer) {
        gasLayer.on('change:visible', syncGasolinerasStyledVisibility);
        gasLayer.on('change:opacity', syncGasolinerasStyledVisibility);
        syncGasolinerasStyledVisibility();
    }
}

/**
 * animateCollapseToggle — Bug 4 fix
 * Anima el colapso/expansión midiendo el scrollHeight real del contenido.
 * Evita el problema de max-height:10000px donde la transición transcurre
 * en el rango invisible y el colapso parece instantáneo.
 */
function animateCollapseToggle(header, content) {
    const willCollapse = !header.classList.contains('collapsed');
    if (willCollapse) {
        // Fijar la altura actual antes de colapsar
        content.style.height = content.scrollHeight + 'px';
        content.offsetHeight; // forzar reflow
        header.classList.add('collapsed');
        content.classList.add('collapsed');
        content.style.height = '0px';
        content.addEventListener('transitionend', () => {
            content.style.height = '';
        }, { once: true });
    } else {
        // Expandir: quitar collapsed, animar de 0 a scrollHeight
        header.classList.remove('collapsed');
        content.classList.remove('collapsed');
        const target = content.scrollHeight;
        content.style.height = '0px';
        content.offsetHeight; // forzar reflow
        content.style.height = target + 'px';
        content.addEventListener('transitionend', () => {
            content.style.height = ''; // dejar que el contenido respire
        }, { once: true });
    }
}

function buildLayerTree() {
    const container = document.getElementById('layer-tree');
    container.innerHTML = '';

    const basemapGroup = LAYER_GROUPS.find(group => group.isBasemapGroup);
    LAYER_GROUPS.forEach(group => {
        if (group.isBasemapGroup) return;
        container.appendChild(createGroupElement(group));
        if (group.id === 'temas' && basemapGroup) {
            container.appendChild(createBasemapGroupElement(basemapGroup));
        }
    });

    refreshLayerTreeActiveState();
    ensureMunicipalLayerGuard();
}

function createGroupElement(group) {
    const div = document.createElement('div');
    div.className = 'layer-group';
    if (group.id) {
        div.id = `${group.id}-group`;
    }
    
    const header = document.createElement('div');
    header.className = `layer-group-header ${group.expanded ? '' : 'collapsed'}`;
    const showClearLayersBtn = group.id === 'temas';
    const currentGroupIcon = group.expanded
        ? (group.iconExpanded || group.icon || 'fa-folder-open')
        : (group.iconCollapsed || group.icon || 'fa-folder');
    header.innerHTML = `
        <i class="fas fa-chevron-down toggle"></i>
        <i class="fas ${currentGroupIcon} icon"></i>
        <span class="group-title">${group.name}</span>
        ${showClearLayersBtn ? '<button type="button" class="layer-clear-btn" title="Apagar capas activas y conservar Límite Municipal" aria-label="Limpiar capas activas"><i class="fas fa-times"></i></button>' : ''}
        <span class="layer-active-badge" aria-label="Capas activas">0</span>
    `;
    
    const content = document.createElement('div');
    content.className = `layer-group-content basemap-group-content ${group.expanded ? '' : 'collapsed'}`;
    
    // Add children groups
    if (group.children) {
        group.children.forEach(child => {
            content.appendChild(createChildGroupElement(child));
        });
    }
    
    // Add direct layers
    if (group.layers) {
        group.layers.forEach(layer => {
            content.appendChild(createLayerElement(layer));
        });
    }
    
    // Add subgroups
    if (group.subgroups) {
        group.subgroups.forEach(subgroup => {
            content.appendChild(createSubgroupElement(subgroup));
        });
    }
    
    const clearBtn = header.querySelector('.layer-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearVisibleOperationalLayers();
        });
    }

    const headerIcon = header.querySelector('.icon');

    header.addEventListener('click', () => {
        animateCollapseToggle(header, content);
        if (headerIcon && (group.iconExpanded || group.iconCollapsed)) {
            const isCollapsed = header.classList.contains('collapsed');
            const nextIcon = isCollapsed
                ? (group.iconCollapsed || group.icon || 'fa-folder')
                : (group.iconExpanded || group.icon || 'fa-folder-open');
            headerIcon.className = `fas ${nextIcon} icon`;
        }
    });
    
    div.appendChild(header);
    div.appendChild(content);
    return div;
}

function createChildGroupElement(group) {
    const div = document.createElement('div');
    div.className = 'layer-subgroup';
    
    const header = document.createElement('div');
    header.className = `layer-subgroup-header layer-category-header ${group.expanded ? '' : 'collapsed'}`;
    if (group.id) {
        header.dataset.groupId = group.id;
    }
    header.innerHTML = `
        <i class="fas fa-chevron-down toggle"></i>
        <i class="fas ${group.icon || 'fa-layer-group'}" style="margin-right: 8px; color: var(--accent);"></i>
        <span class="group-title">${group.name}</span>
        <span class="layer-active-badge" aria-label="Capas activas">0</span>
    `;
    
    const content = document.createElement('div');
    content.className = `layer-subgroup-content ${group.expanded ? '' : 'collapsed'}`;
    
    // Add layers
    if (group.layers) {
        group.layers.forEach(layer => {
            content.appendChild(createLayerElement(layer));
        });
    }
    
    // Add subgroups
    if (group.subgroups) {
        group.subgroups.forEach(subgroup => {
            content.appendChild(createSubgroupElement(subgroup));
        });
    }
    
    header.addEventListener('click', () => {
        animateCollapseToggle(header, content);
    });
    
    div.appendChild(header);
    div.appendChild(content);
    return div;
}

function createSubgroupElement(subgroup) {
    const div = document.createElement('div');
    div.className = 'layer-subgroup';
    
    const header = document.createElement('div');
    header.className = 'layer-subgroup-header collapsed';
    header.innerHTML = `
        <i class="fas fa-chevron-down toggle"></i>
        <span class="group-title">${subgroup.name}</span>
        <span class="layer-active-badge" aria-label="Capas activas">0</span>
    `;
    if (subgroup.tooltip) {
        header.title = subgroup.tooltip;
    }
    
    const content = document.createElement('div');
    content.className = 'layer-subgroup-content collapsed';
    
    subgroup.layers.forEach(layer => {
        content.appendChild(createLayerElement(layer));
    });
    
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        animateCollapseToggle(header, content);
    });
    
    div.appendChild(header);
    div.appendChild(content);
    return div;
}


function createBasemapGroupElement(group) {
    const div = document.createElement('div');
    div.className = 'layer-group';
    if (group.id) {
        div.id = `${group.id}-group`;
    }

    const header = document.createElement('div');
    header.className = `layer-group-header ${group.expanded ? '' : 'collapsed'}`;
    header.innerHTML = `
        <i class="fas fa-chevron-down toggle"></i>
        <i class="fas ${group.icon || 'fa-map'} icon"></i>
        <span class="group-title">${group.name}</span>
    `;

    const content = document.createElement('div');
    content.className = `layer-group-content basemap-group-content ${group.expanded ? '' : 'collapsed'}`;

    const basemapTrafficControl = document.createElement('button');
    basemapTrafficControl.type = 'button';
    basemapTrafficControl.className = 'basemap-traffic-global';
    basemapTrafficControl.setAttribute('aria-pressed', 'false');
    basemapTrafficControl.title = 'Activar tráfico en tiempo real';
    basemapTrafficControl.innerHTML = `
        <span class="basemap-traffic-global-check" aria-hidden="true"></span>
        <span class="basemap-traffic-global-copy">
            <span class="basemap-traffic-global-title">Tráfico en tiempo real</span>
            <span class="basemap-traffic-global-subtitle">Se mantiene al cambiar mapa.</span>
            <span class="basemap-traffic-global-legend" aria-hidden="true">
                <span>Rápido</span>
                <span class="basemap-traffic-global-legend-bar"><i></i><i></i><i></i><i></i><i></i></span>
                <span>Lento</span>
            </span>
        </span>
    `;
    basemapTrafficControl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleTrafficOverlay();
    });

    const streetViewCoverageControl = document.createElement('button');
    streetViewCoverageControl.type = 'button';
    streetViewCoverageControl.className = 'streetview-coverage-toggle';
    streetViewCoverageControl.setAttribute('aria-pressed', 'true');
    streetViewCoverageControl.title = 'Ocultar cobertura de Street View';
    streetViewCoverageControl.innerHTML = `
        <span class="streetview-coverage-toggle-check" aria-hidden="true"></span>
        <span class="streetview-coverage-toggle-copy">
            <span class="streetview-coverage-toggle-title">Mostrar cobertura Street View</span>
            <span class="streetview-coverage-toggle-subtitle">Oculta o muestra la huella azul del recorrido.</span>
        </span>
    `;
    streetViewCoverageControl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleStreetViewCoverage();
    });

    const basemapTree = document.createElement('div');
    basemapTree.className = 'basemap-tree';

    basemapDefinitions.forEach(def => {
        const item = document.createElement('div');
        item.className = `basemap-radio-item ${def.id === currentBasemapId ? 'active' : ''}`;
        item.dataset.basemap = def.id;
        item.innerHTML = `
            <div class="basemap-thumb basemap-thumb--${def.previewClass || 'roadmap'}" aria-hidden="true">
                <span class="basemap-thumb-chip">${def.previewShort || def.name}</span>
            </div>
            <div class="basemap-radio-labels">
                <div class="basemap-radio-title">${def.name}</div>
                <div class="basemap-radio-subtitle">${def.subtitle}</div>
            </div>
            <span class="basemap-active-badge">Activa</span>
            <div class="basemap-radio"></div>
        `;
        item.addEventListener('click', () => {
            switchBasemap(def.id);
        });
        basemapTree.appendChild(item);
    });

    content.appendChild(basemapTrafficControl);
    content.appendChild(basemapTree);
    document.body.appendChild(streetViewCoverageControl);

    header.addEventListener('click', () => {
        animateCollapseToggle(header, content);
    });

    div.appendChild(header);
    div.appendChild(content);
    return div;
}

function createLayerElement(layerDef) {
    const div = document.createElement('div');
    const defaultOpacity = Math.round((wmsLayers[layerDef.layer]?.getOpacity?.() ?? 0.9) * 100);
    const isLayerVisible = wmsLayers[layerDef.layer]?.getVisible?.() ?? !!layerDef.visible;
    div.className = `layer-item ${isLayerVisible ? 'active' : ''}`;
    div.dataset.layer = layerDef.layer;
    div.innerHTML = `
        <div class="layer-checkbox"></div>
        <span class="layer-name">${layerDef.name}</span>
        <div class="layer-actions">
            <i class="fas fa-expand-arrows-alt layer-action-btn layer-zoom" title="Zoom a la capa"></i>
            <i class="fas fa-adjust layer-action-btn layer-opacity-toggle" title="Transparencia"></i>
            
        </div>
        <div class="layer-opacity-panel">
            <div class="layer-opacity-header">
                <span class="layer-opacity-title">Transparencia</span>
                <span class="layer-opacity-value">${defaultOpacity}%</span>
            </div>
            <input type="range" min="10" max="100" value="${defaultOpacity}" class="opacity-slider layer-opacity-slider" title="Ajustar transparencia">
        </div>
    `;

    let touchStartX = 0;
    let touchStartY = 0;
    let suppressTapToggle = false;

    const slider = div.querySelector('.layer-opacity-slider');
    const opacityValue = div.querySelector('.layer-opacity-value');
    slider.addEventListener('input', (e) => {
        e.stopPropagation();
        const value = parseInt(e.target.value, 10) || 100;
        opacityValue.textContent = `${value}%`;
        const layer = wmsLayers[layerDef.layer];
        if (layer) {
            layer.setOpacity(value / 100);
        }
    });
    slider.addEventListener('click', (e) => e.stopPropagation());
    slider.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    slider.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

    div.addEventListener('touchstart', (e) => {
        const touch = e.touches?.[0];
        if (!touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        suppressTapToggle = false;
    }, { passive: true });

    div.addEventListener('touchmove', (e) => {
        const touch = e.touches?.[0];
        if (!touch) return;
        const movedX = Math.abs(touch.clientX - touchStartX);
        const movedY = Math.abs(touch.clientY - touchStartY);
        if (movedX > 10 || movedY > 10) {
            suppressTapToggle = true;
        }
    }, { passive: true });

    div.addEventListener('click', (e) => {
        if (suppressTapToggle) {
            suppressTapToggle = false;
            return;
        }
        if (e.target.classList.contains('layer-zoom')) {
            e.stopPropagation();
            zoomToLayer(layerDef.layer, layerDef.name);
            return;
        }
        if (e.target.classList.contains('layer-opacity-toggle')) {
            e.stopPropagation();
            div.classList.toggle('show-opacity');
            return;
        }
        if (e.target.closest('.layer-opacity-panel')) {
            e.stopPropagation();
            return;
        }
        toggleLayer(layerDef.layer, div);
    });

    return div;
}

// ========================================
// LAYER CONTROLS
// ========================================
function refreshLayerTreeActiveState() {
    document.querySelectorAll('.layer-item[data-layer]').forEach(item => {
        const layerKey = item.dataset.layer;
        const isVisible = wmsLayers[layerKey]?.getVisible?.() ?? false;
        item.classList.toggle('active', isVisible);
    });
    ensureMunicipalLayerGuard();
    updateGroupActiveBadges();
}

function updateGroupActiveBadges() {
    document.querySelectorAll('.layer-group, .layer-subgroup').forEach(groupEl => {
        const contentEl = groupEl.querySelector(':scope > .layer-group-content, :scope > .layer-subgroup-content');
        const headerEl = groupEl.querySelector(':scope > .layer-group-header, :scope > .layer-subgroup-header');
        const badgeEl = headerEl?.querySelector('.layer-active-badge');
        if (!contentEl || !badgeEl) return;

        const activeCount = contentEl.querySelectorAll('.layer-item.active').length;
        badgeEl.innerHTML = `<i class="fas fa-layer-group" aria-hidden="true"></i><span class="layer-active-badge-num">${activeCount}</span>`;
        badgeEl.classList.toggle('is-hidden', activeCount === 0);
    });
    updateToolbarActiveBadge();
}

function updateToolbarActiveBadge() {
    const badge = document.getElementById('toolbar-active-badge');
    if (!badge) return;
    const count = document.querySelectorAll('.layer-item.active').length;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.toggle('is-hidden', count === 0);
}

function syncActiveLayersGlobal() {
    window.activeLayers = Array.isArray(activeLayers) ? activeLayers.slice() : [];
}

function rebuildActiveLayersFromVisibleWms() {
    activeLayers = Object.entries(wmsLayers)
        .filter(([, layer]) => layer?.getVisible?.())
        .map(([layerKey]) => layerKey);
    syncActiveLayersGlobal();
}

function isCesium3DModeActive() {
    const shell = document.getElementById('atlas-cesium-shell');
    return !!(shell && !shell.hidden && document.body.classList.contains('atlas-cesium-active'));
}

function captureCesium2DLayerSnapshot() {
    if (!cesium2DLayerSnapshot) {
        cesium2DLayerSnapshot = Object.fromEntries(
            Object.entries(wmsLayers).map(([layerKey, layer]) => [layerKey, !!layer?.getVisible?.()])
        );
    }

    // Al entrar a Cesium 3D, la vista debe iniciar únicamente con
    // Límite Municipal. Las capas activas del 2D se conservan en el
    // snapshot para restaurarlas intactas al volver a 2D.
    Object.entries(wmsLayers).forEach(([layerKey, layer]) => {
        if (!layer || typeof layer.setVisible !== 'function') return;
        layer.setVisible(isProtectedMunicipalLayer(layerKey, layer));
    });

    rebuildActiveLayersFromVisibleWms();
    refreshLayerTreeActiveState();
    updateLegend();
}

function restoreCesium2DLayerSnapshot() {
    if (!cesium2DLayerSnapshot) return;

    Object.entries(cesium2DLayerSnapshot).forEach(([layerKey, visible]) => {
        const layer = wmsLayers[layerKey];
        if (!layer || typeof layer.setVisible !== 'function') return;
        layer.setVisible(!!visible);
    });

    cesium2DLayerSnapshot = null;
    rebuildActiveLayersFromVisibleWms();
    refreshLayerTreeActiveState();
    updateLegend();
}

function isProtectedMunicipalLayer(layerKey, layer) {
    if (layerKey === 'Mpio') return true;
    const rawName = layer?.get?.('name') || layer?.get?.('title') || '';
    const normalizedName = String(rawName)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase();
    return normalizedName === 'limite municipal';
}

function ensureMunicipalLayerGuard() {
    const municipalLayer = wmsLayers['Mpio'];
    if (municipalLayer) {
        municipalLayer.setZIndex(1200);
    }
    const municipalItem = document.querySelector('.layer-item[data-layer="Mpio"]');
    if (municipalItem) {
        const activeSearch = document.getElementById('layer-search')?.value?.trim?.() || '';
        if (!activeSearch) {
            municipalItem.style.display = 'flex';
        }
        municipalItem.classList.toggle('active', municipalLayer?.getVisible?.() ?? false);
    }
}

function clearVisibleOperationalLayers() {
    let hiddenCount = 0;

    Object.entries(wmsLayers).forEach(([layerKey, layer]) => {
        if (!layer || !layer.getVisible?.()) return;
        if (isProtectedMunicipalLayer(layerKey, layer)) return;
        layer.setVisible(false);
        hiddenCount += 1;
    });

    const hiddenTempCount = window.AtlasTempLayers?.hideAll?.() || 0;
    hiddenCount += hiddenTempCount;

    activeLayers = Object.entries(wmsLayers)
        .filter(([layerKey, layer]) => layer?.getVisible?.() && isProtectedMunicipalLayer(layerKey, layer))
        .map(([layerKey]) => layerKey);
    syncActiveLayersGlobal();

    document.querySelectorAll('.layer-item.show-opacity').forEach(item => {
        item.classList.remove('show-opacity');
    });

    refreshLayerTreeActiveState();
    updateLegend();

    if (hiddenCount > 0) {
        showToast('Capas activas limpiadas. Límite Municipal se conservó.', 'success');
    } else {
        const hasProtected = Object.entries(wmsLayers).some(([k, l]) => l?.getVisible?.() && isProtectedMunicipalLayer(k, l));
        if (hasProtected) {
            showToast('Límite Municipal es una capa base y no se puede limpiar.', 'info');
        } else {
            showToast('No había capas activas para limpiar.', 'info');
        }
    }
}

function toggleLayer(layerKey, element) {
    const layer = wmsLayers[layerKey];
    if (!layer) return;

    const isVisible = layer.getVisible();
    const useCesiumSingleLayerRule = !isVisible && isCesium3DModeActive() && !isProtectedMunicipalLayer(layerKey, layer);

    // En Cesium 3D la regla es dejar solo una capa temática activa a la vez,
    // pero sin contaminar la lógica normal del 2D.
    if (useCesiumSingleLayerRule) {
        const apagadas = [];
        Object.entries(wmsLayers).forEach(([k, l]) => {
            if (!l || k === layerKey) return;
            if (isProtectedMunicipalLayer(k, l)) return;
            if (l.getVisible && l.getVisible()) {
                l.setVisible(false);
                apagadas.push(k);
                document.querySelectorAll(`.layer-item[data-layer="${k}"]`)
                    .forEach(el => el.classList.remove('active'));
            }
        });
        activeLayers = activeLayers.filter(k => isProtectedMunicipalLayer(k, wmsLayers[k]));
        syncActiveLayersGlobal();

        if (apagadas.length > 0 && window.showToast) {
            showToast('En Cesium 3D se dejó solo la capa temática más reciente.', 'info');
        }
    }

    layer.setVisible(!isVisible);
    element.classList.toggle('active');

    if (!isVisible) {
        if (!activeLayers.includes(layerKey)) {
            activeLayers.push(layerKey);
        }
        const lp1 = document.getElementById('legend-panel');
        lp1?.classList.add('visible');
        lp1?.classList.remove('collapsed');
    } else {
        activeLayers = activeLayers.filter(l => l !== layerKey);
    }

    syncActiveLayersGlobal();
    refreshLayerTreeActiveState();
    updateLegend();
    document.dispatchEvent(new CustomEvent('atlas:layers:changed'));
}

async function ensureWMSLayerExtents() {
    if (Object.keys(wmsLayerExtents).length) return wmsLayerExtents;
    if (wmsCapabilitiesPromise) return wmsCapabilitiesPromise;

    const registerExtent = (layerName, info) => {
        if (!layerName || !info || !Array.isArray(info.extent) || info.extent.length !== 4) return;
        const extent = info.extent.map(Number);
        if (!extent.every(Number.isFinite)) return;
        const normalizedInfo = {
            crs: (info.crs || 'EPSG:4326') === 'CRS:84' ? 'EPSG:4326' : (info.crs || 'EPSG:4326'),
            extent
        };
        wmsLayerExtents[layerName] = normalizedInfo;
        const suffix = layerName.includes(':') ? layerName.split(':').pop() : layerName;
        if (suffix) {
            wmsLayerExtents[suffix] = normalizedInfo;
        }
    };

    const normalizeExtentInfo = (layerNode) => {
        if (Array.isArray(layerNode?.EX_GeographicBoundingBox) && layerNode.EX_GeographicBoundingBox.length === 4) {
            const ex = layerNode.EX_GeographicBoundingBox.map(Number);
            if (ex.every(Number.isFinite)) {
                return { crs: 'EPSG:4326', extent: ex };
            }
        }

        const boxes = Array.isArray(layerNode?.BoundingBox) ? layerNode.BoundingBox : [];
        const preferredBox = boxes.find(box => (box.crs || box.CRS || box.srs || box.SRS) === 'EPSG:3857')
            || boxes.find(box => ['EPSG:4326', 'CRS:84'].includes(box.crs || box.CRS || box.srs || box.SRS))
            || boxes[0];

        if (preferredBox?.extent && Array.isArray(preferredBox.extent) && preferredBox.extent.length === 4) {
            const crs = preferredBox.crs || preferredBox.CRS || preferredBox.srs || preferredBox.SRS || 'EPSG:4326';
            const extent = preferredBox.extent.map(Number);
            if (extent.every(Number.isFinite)) {
                return { crs, extent };
            }
        }

        return null;
    };

    const parseCapabilitiesRawXml = (xmlText) => {
        const xml = new DOMParser().parseFromString(xmlText, 'text/xml');
        const parserError = xml.querySelector('parsererror');
        if (parserError) return;

        const numericAttrs = (node, names) => names.map(name => Number(node.getAttribute(name))).filter(Number.isFinite);
        const readTextNumber = (parent, tagNames) => {
            for (const tagName of tagNames) {
                const found = Array.from(parent.children || []).find(child => child.localName === tagName);
                if (found) {
                    const value = Number(found.textContent);
                    if (Number.isFinite(value)) return value;
                }
            }
            return null;
        };

        const readExtentFromLayerElement = (layerEl) => {
            const exGeo = Array.from(layerEl.children || []).find(child => child.localName === 'EX_GeographicBoundingBox');
            if (exGeo) {
                const west = readTextNumber(exGeo, ['westBoundLongitude']);
                const east = readTextNumber(exGeo, ['eastBoundLongitude']);
                const south = readTextNumber(exGeo, ['southBoundLatitude']);
                const north = readTextNumber(exGeo, ['northBoundLatitude']);
                if ([west, south, east, north].every(Number.isFinite)) {
                    return { crs: 'EPSG:4326', extent: [west, south, east, north] };
                }
            }

            const boxes = Array.from(layerEl.children || []).filter(child => child.localName === 'BoundingBox' || child.localName === 'LatLonBoundingBox');
            if (!boxes.length) return null;

            const preferred = boxes.find(box => ['EPSG:3857', 'EPSG:4326', 'CRS:84'].includes(box.getAttribute('CRS') || box.getAttribute('SRS') || box.getAttribute('crs') || box.getAttribute('srs')))
                || boxes[0];
            const crs = preferred.localName === 'LatLonBoundingBox'
                ? 'EPSG:4326'
                : (preferred.getAttribute('CRS') || preferred.getAttribute('SRS') || preferred.getAttribute('crs') || preferred.getAttribute('srs') || 'EPSG:4326');
            const vals = numericAttrs(preferred, ['minx', 'miny', 'maxx', 'maxy']);
            if (vals.length === 4) {
                return { crs, extent: vals };
            }
            return null;
        };

        const walkLayerElements = (layerEl) => {
            if (!layerEl) return;
            const nameEl = Array.from(layerEl.children || []).find(child => child.localName === 'Name');
            const layerName = nameEl?.textContent?.trim();
            const extentInfo = readExtentFromLayerElement(layerEl);
            if (layerName && extentInfo) {
                registerExtent(layerName, extentInfo);
            }
            Array.from(layerEl.children || [])
                .filter(child => child.localName === 'Layer')
                .forEach(walkLayerElements);
        };

        const capabilityLayer = Array.from(xml.getElementsByTagNameNS('*', 'Capability'))[0]
            ?.getElementsByTagNameNS('*', 'Layer')?.[0]
            || Array.from(xml.getElementsByTagName('Capability'))[0]?.getElementsByTagName('Layer')?.[0]
            || Array.from(xml.getElementsByTagNameNS('*', 'Layer'))[0]
            || Array.from(xml.getElementsByTagName('Layer'))[0];

        if (capabilityLayer) {
            walkLayerElements(capabilityLayer);
        }
    };

    const capabilitiesUrls = [
        `${CONFIG.geoserverUrl}/${CONFIG.workspace}/wms?service=WMS&request=GetCapabilities`,
        `${CONFIG.geoserverUrl}/wms?service=WMS&request=GetCapabilities`
    ];

    wmsCapabilitiesPromise = (async () => {
        for (const capabilitiesUrl of capabilitiesUrls) {
            try {
                const response = await fetch(capabilitiesUrl);
                if (!response.ok) continue;
                const xmlText = await response.text();

                try {
                    const parser = new ol.format.WMSCapabilities();
                    const parsed = parser.read(xmlText);
                    const rootLayer = parsed?.Capability?.Layer;
                    const walkLayers = (layerNode) => {
                        if (!layerNode) return;
                        const name = layerNode.Name;
                        const extentInfo = normalizeExtentInfo(layerNode);
                        if (name && extentInfo) {
                            registerExtent(name, extentInfo);
                        }
                        const childLayers = Array.isArray(layerNode.Layer) ? layerNode.Layer : [];
                        childLayers.forEach(walkLayers);
                    };
                    if (rootLayer) {
                        walkLayers(rootLayer);
                    }
                } catch (parseError) {
                    console.warn('Fallo parseo OL GetCapabilities, se intentará lectura XML directa:', parseError);
                }

                parseCapabilitiesRawXml(xmlText);

                if (Object.keys(wmsLayerExtents).length) {
                    return wmsLayerExtents;
                }
            } catch (error) {
                console.warn(`No fue posible consultar ${capabilitiesUrl}:`, error);
            }
        }

        return wmsLayerExtents;
    })().catch(error => {
        console.error('No fue posible obtener las extensiones de capas WMS:', error);
        return wmsLayerExtents;
    });

    return wmsCapabilitiesPromise;
}

async function fetchLayerExtentFromWFS(layerKey) {
    const typeNames = [`${CONFIG.workspace}:${layerKey}`, layerKey];
    for (const typeName of typeNames) {
        const wfsUrl = `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${encodeURIComponent(typeName)}&outputFormat=application/json&srsName=EPSG:3857`;
        try {
            const response = await fetch(wfsUrl);
            if (!response.ok) continue;
            const data = await response.json();
            const features = new ol.format.GeoJSON().readFeatures(data, {
                featureProjection: map.getView().getProjection()
            });
            if (!features.length) continue;
            const extent = ol.extent.createEmpty();
            features.forEach(feature => {
                const geometry = feature.getGeometry();
                if (geometry) {
                    ol.extent.extend(extent, geometry.getExtent());
                }
            });
            if (ol.extent.isEmpty(extent)) continue;
            return extent;
        } catch (error) {
            console.warn(`No fue posible consultar WFS para ${typeName}:`, error);
        }
    }
    return null;
}

function getSidebarFitPadding() {
    const sidebarCollapsed = document.getElementById('sidebar-shell')?.classList.contains('collapsed');
    return [60, 60, 60, sidebarCollapsed ? 60 : 360];
}

async function zoomToLayer(layerKey, layerName = layerKey) {
    // 1. Primero buscar en LAYER_EXTENTS (ya en EPSG:3857)
    if (LAYER_EXTENTS[layerKey]) {
        const extent = LAYER_EXTENTS[layerKey].slice();
        map.getView().fit(extent, {
            duration: 900,
            padding: getSidebarFitPadding(),
            maxZoom: 18,
            nearest: true
        });
        return;
    }

    // 2. Si no está en LAYER_EXTENTS, intentar con WMS Capabilities
    await ensureWMSLayerExtents();

    const extentInfo = wmsLayerExtents[layerKey] || wmsLayerExtents[`${CONFIG.workspace}:${layerKey}`] || null;
    let targetExtent = null;

    if (extentInfo?.extent) {
        targetExtent = extentInfo.extent.slice();
        if ((extentInfo.crs || 'EPSG:4326') !== 'EPSG:3857') {
            targetExtent = ol.proj.transformExtent(targetExtent, extentInfo.crs || 'EPSG:4326', map.getView().getProjection());
        }
    } else {
        targetExtent = await fetchLayerExtentFromWFS(layerKey);
    }

    if (!targetExtent || targetExtent.some(value => !Number.isFinite(value))) {
        console.warn(`No se encontró extensión para la capa ${layerKey}`);
        showToast(`No fue posible hacer zoom a la capa ${layerName}`, 'error');
        return;
    }

    if (ol.extent.getWidth(targetExtent) === 0 || ol.extent.getHeight(targetExtent) === 0) {
        targetExtent = ol.extent.buffer(targetExtent, 120);
    }

    map.getView().fit(targetExtent, {
        duration: 900,
        padding: getSidebarFitPadding(),
        maxZoom: 18,
        nearest: true
    });
}

// Determina si la leyenda de una capa es "Single symbol" (sin reglas con nombre real).
// Devuelve la URL de imagen con forceLabels:off (single symbol) o forceLabels:on (multi-regla).
async function getLegendUrl(legendBaseUrl, legendLayerName) {
    const base = `${legendBaseUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&TRANSPARENT=true&LAYER=${encodeURIComponent(legendLayerName)}&LEGEND_OPTIONS=fontAntiAliasing:true;fontSize:10;dpi:90`;
    try {
        const jsonUrl = `${legendBaseUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=application/json&LAYER=${encodeURIComponent(legendLayerName)}`;
        const resp = await fetch(jsonUrl);
        const data = await resp.json();
        const rules = data?.Legend?.[0]?.rules || [];
        const isSingleSymbol = rules.length <= 1 &&
            (!rules[0]?.name || rules[0]?.name === 'Single symbol' || rules[0]?.title === 'Single symbol');
        return base + (isSingleSymbol ? ';forceLabels:off' : ';forceLabels:on');
    } catch (e) {
        return base + ';forceLabels:on';
    }
}

async function showLayerLegend(layerDef) {
    const legendBaseUrl = layerDef.wmsUrl || `${CONFIG.geoserverUrl}/${CONFIG.workspace}/wms`;
    const legendLayerName = layerDef.wmsLayer || layerDef.layer;
    const legendUrl = await getLegendUrl(legendBaseUrl, legendLayerName);

    const content = document.getElementById('legend-content');
    content.innerHTML = `
        <div class="legend-item">
            <div class="legend-item-title">${layerDef.name}</div>
            <img src="${legendUrl}" alt="Leyenda" onerror="this.parentElement.innerHTML='<p style=\\'color:var(--text-secondary)\\'>No hay leyenda disponible</p>'">
        </div>
    `;

    const lp2 = document.getElementById('legend-panel');
    lp2.classList.add('visible');
    lp2.classList.remove('collapsed');
}

async function updateLegend() {
    const content = document.getElementById('legend-content');

    if (activeLayers.length === 0) {
        content.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Active capas para ver su leyenda</p>';
        document.getElementById('legend-panel')?.classList.add('collapsed');
        return;
    }

    const items = await Promise.all(activeLayers.map(async layerKey => {
        const layer = wmsLayers[layerKey];
        if (!layer) return '';
        const name = layer.get('name');
        const source = layer.getSource();
        const legendBaseUrl = source?.getUrl?.() || `${CONFIG.geoserverUrl}/${CONFIG.workspace}/wms`;
        const legendLayerName = source?.getParams?.()?.LAYERS || layerKey;
        const legendUrl = await getLegendUrl(legendBaseUrl, legendLayerName);
        return `
                <div class="legend-item">
                    <div class="legend-item-title">${name}</div>
                    <img src="${legendUrl}" alt="Leyenda" onerror="this.style.display='none'">
                </div>
            `;
    }));

    content.innerHTML = items.join('');
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Sidebar toggle
    const sidebarShell = document.getElementById('sidebar-shell');
    const sidebarHandle = document.getElementById('btn-sidebar-handle');
    const headerSidebarHandle = document.getElementById('btn-sidebar-reopen');
    const reloadButton = document.getElementById('btn-page-reload');

    // Tip de bienvenida — se cierra al hacer clic en X o al expandir cualquier grupo
    const sidebarTipClose = document.getElementById('btn-sidebar-tip-close');
    const sidebarTip = document.getElementById('sidebar-tip');
    if (sidebarTipClose && sidebarTip) {
        sidebarTipClose.addEventListener('click', () => {
            sidebarTip.classList.add('hidden');
        });
        // También se cierra automáticamente al activar la primera capa
        document.getElementById('layer-tree')?.addEventListener('click', () => {
            setTimeout(() => sidebarTip.classList.add('hidden'), 1200);
        }, { once: true });
    }

    function updateSidebarHandleState() {
        const collapsed = sidebarShell.classList.contains('collapsed');
        document.body.classList.toggle('sidebar-collapsed', collapsed);
        sidebarHandle.title = collapsed ? 'Mostrar panel' : 'Ocultar panel';
        sidebarHandle.setAttribute('aria-label', collapsed ? 'Mostrar panel' : 'Ocultar panel');
        sidebarHandle.innerHTML = collapsed
            ? '<i class="fas fa-chevron-right"></i>'
            : '<i class="fas fa-chevron-left"></i>';
    }

    function toggleSidebar(forceExpand = false) {
        if (forceExpand) {
            sidebarShell.classList.remove('collapsed');
        } else {
            sidebarShell.classList.toggle('collapsed');
        }
        updateSidebarHandleState();
        setTimeout(() => {
            map.updateSize();
            window.AtlasStreetView?.resize?.();
        }, 320);
    }

    sidebarHandle.addEventListener('click', () => {
        toggleSidebar(false);
    });

    headerSidebarHandle?.addEventListener('click', () => {
        toggleSidebar(true);
    });

    reloadButton?.addEventListener('click', () => {
        window.location.reload();
    });

    updateSidebarHandleState();

    // Responsive: collapse or expand sidebar based on viewport width.
    // On small screens (<= 768px) the sidebar is collapsed by default to give
    // more room for the map.  On larger screens it is expanded.  This
    // handler runs once on initialization and also on window resize to
    // dynamically adjust the layout without user intervention.
    function handleResponsiveSidebar() {
        const width = window.innerWidth || document.documentElement.clientWidth;
        if (width <= 900) {
            if (!sidebarShell.classList.contains('collapsed')) {
                sidebarShell.classList.add('collapsed');
                updateSidebarHandleState();
            }
        } else {
            if (sidebarShell.classList.contains('collapsed')) {
                sidebarShell.classList.remove('collapsed');
                updateSidebarHandleState();
            }
        }
    }
    // Call immediately to set initial state
    handleResponsiveSidebar();
    // Listen for window resize events
    window.addEventListener('resize', handleResponsiveSidebar);
    
    // Layer search
    const layerSearchInput = document.getElementById('layer-search');
    const layerSearchBox = document.getElementById('layer-search-box');
    const layerSearchClear = document.getElementById('layer-search-clear');

    /**
     * Apply a text filter to the layer tree based on the user's input.  When the
     * search box is empty the full tree is rebuilt to restore any previous
     * collapsed/expanded state.  When there is a search term the tree is
     * searched in a case- and accent-insensitive manner.  Only layer items
     * whose names match the query remain visible.  Groups and subgroups
     * containing a matching layer are automatically expanded and shown; groups
     * with no matches are hidden.  Diacritic marks are stripped from both
     * the query and layer names so that a user typing "limite" will match
     * a layer named "Límite Municipal".  Leading/trailing whitespace is
     * ignored.
     */
    function applyLayerSearchFilter() {
        // Normalize a string by removing diacritic marks (accents) and
        // converting to lower-case.  See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
        const normalizeString = (str) =>
            (str || '')
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();

        const rawQuery = layerSearchInput?.value || '';
        const query = normalizeString(rawQuery.trim());
        // Toggle the clear (X) button based on whether the user typed anything
        layerSearchBox?.classList.toggle('has-value', query.length > 0);

        // Ocultar el botón "apagar capas" (X del header TEMAS) mientras el
        // buscador tiene texto — evita confusión con la X del input de búsqueda.
        // Cuando el buscador se vacía, buildLayerTree() lo reconstruye normal.
        document.querySelectorAll('.layer-clear-btn').forEach(btn => {
            btn.style.display = query.length > 0 ? 'none' : '';
        });

        // If nothing to search for, rebuild the layer tree to reset any
        // temporary show/hide state created during a search.  The buildLayerTree
        // call will recreate the DOM elements and restore default collapsed
        // states defined in LAYER_GROUPS.
        if (!query) {
            // Limpiar marcas de búsqueda antes de reconstruir el árbol
            document.querySelectorAll('.layer-item.search-match').forEach(el => {
                el.classList.remove('search-match');
            });
            buildLayerTree();
            if (window.AtlasTempLayers && typeof window.AtlasTempLayers.refreshList === 'function') {
                window.AtlasTempLayers.refreshList();
            }
            if (window.AtlasClimaWidget && typeof window.AtlasClimaWidget.remount === 'function') {
                window.AtlasClimaWidget.remount();
            }
            return;
        }

        // Iterate over all layer items and set their display property based
        // on whether the normalized name contains the normalized query.
        // EXCLUIR ítems dentro de capas temporales y capas base: nunca
        // deben ocultarse por la búsqueda de temas.
        document.querySelectorAll('.layer-item').forEach((item) => {
            if (item.closest('#temp-layers-group, #capas-base-group')) return;
            const nameEl = item.querySelector('.layer-name');
            const nameText = nameEl ? nameEl.textContent : '';
            const normalizedName = normalizeString(nameText);
            const matches = normalizedName.includes(query);
            item.style.display = matches ? 'flex' : 'none';
            // Marcar con clase para que la detección de grupos sea robusta
            // y no dependa de normalización del atributo style entre navegadores
            item.classList.toggle('search-match', matches);
        });

        // Walk every group and subgroup in the tree to determine if it contains
        // at least one visible layer item.  If a group has a match it is
        // expanded and shown; otherwise it is hidden completely.  This
        // prevents empty groups from cluttering the search results.  When a
        // subgroup is hidden its parent group may still be visible if it
        // contains another matching subgroup or layer item.
        // EXCLUIR capas temporales y capas base: siempre permanecen visibles.
        document.querySelectorAll('.layer-group, .layer-subgroup').forEach((groupEl) => {
            if (groupEl.id === 'temp-layers-group' || groupEl.id === 'capas-base-group') return;
            // Each group/subgroup contains a content div with either the class
            // .layer-group-content or .layer-subgroup-content.  If none is found
            // we skip further processing.
            const contentEl = groupEl.querySelector(
                '.layer-group-content, .layer-subgroup-content'
            );
            if (!contentEl) return;
            // Determine if any descendant layer-item is visible.
            // Solo se considera visible un item que fue explícitamente marcado
            // con display:flex por el filtro de búsqueda. El selector :not([style])
            // causaba falsos positivos mostrando grupos que no tenían matches.
            const hasVisibleItem = !!contentEl.querySelector('.layer-item.search-match');
            const headerEl = groupEl.querySelector(
                '.layer-group-header, .layer-subgroup-header'
            );
            if (hasVisibleItem) {
                // Show group and expand it
                groupEl.style.display = '';
                headerEl?.classList.remove('collapsed');
                contentEl.classList.remove('collapsed');
            } else {
                // Hide group and leave its header collapsed for consistency
                groupEl.style.display = 'none';
            }
        });
    }

    let _lastQueryWasEmpty = true;
    layerSearchInput?.addEventListener('input', () => {
        const isEmpty = (layerSearchInput.value.trim() === '');
        // buildLayerTree es costoso — solo llamarlo cuando pasamos de
        // "con texto" a "vacío", no en cada tecla mientras ya está vacío
        if (!isEmpty || !_lastQueryWasEmpty) {
            applyLayerSearchFilter();
        }
        _lastQueryWasEmpty = isEmpty;
    });

    layerSearchClear?.addEventListener('click', () => {
        if (!layerSearchInput) return;
        layerSearchInput.value = '';
        applyLayerSearchFilter();
        layerSearchInput.focus();
    });

    // Buscador de dirección con Google Places
    const geocoderLaunch = document.getElementById('btn-geocoder-launch');
    const geocoderClose = document.getElementById('btn-geocoder-close');
    const geocoderContainer = document.getElementById('geocoder-container');
    const geocoderHeader = geocoderContainer.querySelector('.geocoder-header');
    const geocoderField = document.getElementById('geocoder-field');
    const geocoderInput = document.getElementById('geocoder-input');
    const geocoderClear = document.getElementById('geocoder-clear');
    const geocoderResults = document.getElementById('geocoder-results');
    const mapContainer = document.querySelector('.map-container');
    let geocoderTimeout;
    let geocoderDragging = false;
    let geocoderDragOffsetX = 0;
    let geocoderDragOffsetY = 0;
    let googleAutocompleteService = null;
    let googleGeocoderService = null;
    let geocoderSessionToken = null;
    let geocoderSelectionOverlay = null;
    let geocoderSelectionMarkerOverlay = null;

    geocoderContainer.classList.add('visible');
    geocoderLaunch.classList.add('active');
    geocoderContainer.dataset.positioned = 'true';
    geocoderContainer.style.left = '8px';
    geocoderContainer.style.top = '8px';

    function clampGeocoderPosition(left, top) {
        const maxLeft = Math.max(0, mapContainer.clientWidth - geocoderContainer.offsetWidth - 8);
        const maxTop = Math.max(0, mapContainer.clientHeight - geocoderContainer.offsetHeight - 8);
        return {
            left: Math.min(Math.max(8, left), maxLeft),
            top: Math.min(Math.max(8, top), maxTop)
        };
    }

    function setGeocoderPosition(left, top) {
        const pos = clampGeocoderPosition(left, top);
        geocoderContainer.style.left = `${pos.left}px`;
        geocoderContainer.style.top = `${pos.top}px`;
    }

    function ensureGeocoderDefaultPosition() {
        if (!geocoderContainer.dataset.positioned) {
            setGeocoderPosition(18, 18);
            geocoderContainer.dataset.positioned = 'true';
        }
    }

    async function ensureGoogleGeocoder() {
        await loadGooglePlacesApi();
        if (!window.google?.maps?.places) {
            throw new Error('Google Places no disponible');
        }
        if (!googleAutocompleteService) {
            googleAutocompleteService = new google.maps.places.AutocompleteService();
        }
        if (!googleGeocoderService) {
            googleGeocoderService = new google.maps.Geocoder();
        }
        if (!geocoderSessionToken) {
            geocoderSessionToken = new google.maps.places.AutocompleteSessionToken();
        }
    }

    function resetGeocoderSessionToken() {
        if (window.google?.maps?.places?.AutocompleteSessionToken) {
            geocoderSessionToken = new google.maps.places.AutocompleteSessionToken();
        } else {
            geocoderSessionToken = null;
        }
    }

    function syncGeocoderClearButton() {
        geocoderField?.classList.toggle('has-value', !!geocoderInput?.value?.trim());
    }

    function renderGeocoderResults(predictions = []) {
        if (!Array.isArray(predictions) || !predictions.length) {
            geocoderResults.innerHTML = '';
            geocoderResults.classList.remove('visible');
            return;
        }
        geocoderResults.innerHTML = predictions.map(item => `
            <div class="geocoder-result" data-place-id="${item.place_id}" data-main="${(item.structured_formatting?.main_text || item.description).replace(/"/g, '&quot;')}">
                ${item.description}
            </div>
        `).join('');
        geocoderResults.classList.add('visible');
    }

    function escapeHtml(value = '') {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatAddressForPopup(address = '') {
        const parts = String(address).split(',').map(s => s.trim()).filter(Boolean);
        if (!parts.length) return '';
        if (parts.length === 1) return escapeHtml(parts[0]);
        if (parts.length === 2) return `${escapeHtml(parts[0])}<br>${escapeHtml(parts[1])}`;
        if (parts.length === 3) return `${escapeHtml(parts[0])}<br>${escapeHtml(parts[1])}<br>${escapeHtml(parts[2])}`;
        return `${escapeHtml(parts[0])}<br>${escapeHtml(parts.slice(1, 3).join(', '))}<br>${escapeHtml(parts.slice(3).join(', '))}`;
    }

    function ensureGeocoderSelectionOverlays() {
        if (geocoderSelectionOverlay && geocoderSelectionMarkerOverlay) return;

        const popupEl = document.createElement('div');
        popupEl.className = 'geocoder-selection-popup';
        popupEl.innerHTML = `
            <button type="button" class="geocoder-selection-close" title="Cerrar">×</button>
            <div class="geocoder-selection-text"></div>
        `;
        popupEl.querySelector('.geocoder-selection-close').addEventListener('click', () => {
            geocoderSelectionOverlay?.setPosition(undefined);
            geocoderSelectionMarkerOverlay?.setPosition(undefined);
        });

        const markerEl = document.createElement('div');
        markerEl.className = 'geocoder-selection-marker';
        markerEl.innerHTML = '<i class="fas fa-map-marker-alt"></i>';

        geocoderSelectionOverlay = new ol.Overlay({
            element: popupEl,
            positioning: 'bottom-center',
            stopEvent: true,
            offset: [-18, -32]
        });

        geocoderSelectionMarkerOverlay = new ol.Overlay({
            element: markerEl,
            positioning: 'bottom-center',
            stopEvent: false,
            offset: [0, -6]
        });

        map.addOverlay(geocoderSelectionOverlay);
        map.addOverlay(geocoderSelectionMarkerOverlay);
    }

    function showSelectedAddressPopup(coord3857, addressText) {
        ensureGeocoderSelectionOverlays();
        const popupText = geocoderSelectionOverlay.getElement().querySelector('.geocoder-selection-text');
        popupText.innerHTML = formatAddressForPopup(addressText);
        geocoderSelectionOverlay.setPosition(coord3857);
        geocoderSelectionMarkerOverlay.setPosition(coord3857);
    }

    function openGeocoder() {
        ensureGeocoderDefaultPosition();
        geocoderContainer.classList.add('visible');
        geocoderLaunch.classList.add('active');
        setTimeout(() => geocoderInput.focus(), 30);
    }

    function closeGeocoder(clearInput = false) {
        geocoderContainer.classList.remove('visible');
        geocoderLaunch.classList.remove('active');
        geocoderResults.classList.remove('visible');
        if (clearInput) {
            geocoderInput.value = '';
            geocoderResults.innerHTML = '';
            resetGeocoderSessionToken();
        }
        syncGeocoderClearButton();
    }

    function onGeocoderDragMove(clientX, clientY) {
        if (!geocoderDragging) return;
        const rect = mapContainer.getBoundingClientRect();
        setGeocoderPosition(clientX - rect.left - geocoderDragOffsetX, clientY - rect.top - geocoderDragOffsetY);
    }

    function stopGeocoderDrag() {
        geocoderDragging = false;
        geocoderContainer.classList.remove('dragging');
        document.body.style.userSelect = '';
    }

    async function searchGooglePredictions(query) {
        try {
            await ensureGoogleGeocoder();
            const request = {
                input: `${query}, Celaya, Guanajuato, México`,
                componentRestrictions: { country: 'mx' },
                language: 'es',
                sessionToken: geocoderSessionToken,
                locationBias: {
                    center: CELAYA_BIAS,
                    radius: CELAYA_BIAS_RADIUS
                }
            };
            googleAutocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
                    renderGeocoderResults(predictions);
                } else {
                    renderGeocoderResults([]);
                }
            });
        } catch (error) {
            console.error(error);
            renderGeocoderResults([]);
            showToast('No se pudo consultar Google para buscar la dirección', 'error');
        }
    }

    async function goToGooglePlace(placeId) {
        try {
            await ensureGoogleGeocoder();
            googleGeocoderService.geocode({ placeId }, (results, status) => {
                if (status === 'OK' && results?.[0]?.geometry?.location) {
                    const loc = results[0].geometry.location;
                    const lon = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
                    const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
                    const coord3857 = ol.proj.fromLonLat([lon, lat]);
                    map.getView().animate({
                        center: coord3857,
                        zoom: 18,
                        duration: 1000
                    });
                    geocoderInput.value = results[0].formatted_address || geocoderInput.value;
                    geocoderResults.classList.remove('visible');
                    showSelectedAddressPopup(coord3857, results[0].formatted_address || geocoderInput.value);
                    resetGeocoderSessionToken();
                } else {
                    showToast('No se encontró la dirección seleccionada', 'error');
                }
            });
        } catch (error) {
            console.error(error);
            showToast('No se pudo abrir la dirección seleccionada', 'error');
        }
    }

    geocoderLaunch.addEventListener('click', () => {
        if (geocoderContainer.classList.contains('visible')) {
            closeGeocoder(false);
        } else {
            openGeocoder();
        }
    });

    function ensureCurrentLocationMarker() {
        if (!currentLocationSource) {
            currentLocationSource = new ol.source.Vector();
            currentLocationLayer = new ol.layer.Vector({
                source: currentLocationSource,
                style: function (feature) {
                    const kind = feature.get('kind');
                    if (kind === 'accuracy') {
                        return new ol.style.Style({
                            fill: new ol.style.Fill({ color: 'rgba(255, 196, 0, 0.20)' }),
                            stroke: new ol.style.Stroke({ color: 'rgba(255, 140, 0, 0.88)', width: 3 })
                        });
                    }

                    return new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 8.5,
                            fill: new ol.style.Fill({ color: '#931D3D' }),
                            stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 })
                        })
                    });
                }
            });
            currentLocationLayer.setZIndex(9999);
            map.addLayer(currentLocationLayer);
        }

        if (!currentLocationOverlay) {
            const popupEl = document.createElement('div');
            popupEl.className = 'current-location-popup';
            popupEl.innerHTML = '<div class="current-location-popup-text">Usted está<br>aquí</div>';

            currentLocationOverlay = new ol.Overlay({
                element: popupEl,
                positioning: 'bottom-center',
                stopEvent: false,
                offset: [0, -24]
            });
            map.addOverlay(currentLocationOverlay);
        }
    }

    function clearCurrentLocationMarker() {
        if (currentLocationHideTimer) {
            clearTimeout(currentLocationHideTimer);
            currentLocationHideTimer = null;
        }

        if (currentLocationSource) currentLocationSource.clear(true);
        if (currentLocationLayer) {
            currentLocationLayer.setVisible(false);
            currentLocationLayer.changed();
        }
        if (currentLocationOverlay) {
            currentLocationOverlay.setPosition(undefined);
            const overlayEl = currentLocationOverlay.getElement();
            if (overlayEl) overlayEl.classList.add('is-hidden');
        }
        map.render();
    }

    function scheduleCurrentLocationHide(delayMs = 3000) {
        if (currentLocationHideTimer) clearTimeout(currentLocationHideTimer);
        currentLocationHideTimer = setTimeout(() => {
            clearCurrentLocationMarker();
        }, delayMs);
    }

    function showCurrentLocationMarker(coord3857, accuracyMeters) {
        ensureCurrentLocationMarker();

        const accuracy = Math.max(35, Math.min(Number(accuracyMeters) || 80, 220));
        currentLocationSource.clear(true);
        if (currentLocationLayer) currentLocationLayer.setVisible(true);

        const accuracyFeature = new ol.Feature({
            geometry: new ol.geom.Circle(coord3857, accuracy),
            kind: 'accuracy'
        });
        const pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(coord3857),
            kind: 'point'
        });

        currentLocationSource.addFeatures([accuracyFeature, pointFeature]);
        const overlayEl = currentLocationOverlay && typeof currentLocationOverlay.getElement === 'function' ? currentLocationOverlay.getElement() : null;
        if (overlayEl) overlayEl.classList.remove('is-hidden');
        currentLocationOverlay.setPosition(coord3857);
        scheduleCurrentLocationHide(3000);

        return accuracyFeature.getGeometry().getExtent();
    }

    function setCurrentLocationButtonLoading(isLoading) {
        const buttons = [
            document.getElementById('btn-location'),
            document.getElementById('btn-geocoder-close')
        ].filter(Boolean);

        if (!buttons.length) return;

        if (isLoading) {
            currentLocationLoadingStartedAt = Date.now();
        }

        buttons.forEach(btn => {
            btn.classList.toggle('locating', !!isLoading);
            btn.classList.toggle('active', !!isLoading);
            btn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        });
    }

    function finishCurrentLocationLoading(callback) {
        const minVisibleMs = 700;
        const elapsed = currentLocationLoadingStartedAt ? (Date.now() - currentLocationLoadingStartedAt) : minVisibleMs;
        const remaining = Math.max(0, minVisibleMs - elapsed);

        window.setTimeout(() => {
            currentLocationBusy = false;
            setCurrentLocationButtonLoading(false);
            currentLocationLoadingStartedAt = 0;
            if (typeof callback === 'function') callback();
        }, remaining);
    }

    function goToCurrentLocation() {
        if (currentLocationBusy) return;

        if (!navigator.geolocation) {
            showToast('La geolocalización no está disponible', 'error');
            return;
        }

        currentLocationBusy = true;
        setCurrentLocationButtonLoading(true);

        navigator.geolocation.getCurrentPosition(pos => {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            const coord3857 = ol.proj.fromLonLat(coords);
            const targetExtent = showCurrentLocationMarker(coord3857, pos.coords.accuracy);

            map.getView().fit(targetExtent, {
                padding: [120, 90, 80, 90],
                maxZoom: 19.8,
                duration: 1000,
                nearest: true
            });

            finishCurrentLocationLoading(() => {
                showToast('Ubicación encontrada', 'success');
            });
        }, () => {
            finishCurrentLocationLoading(() => {
                showToast('No se pudo obtener la ubicación', 'error');
            });
        }, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0
        });
    }

    geocoderClose.addEventListener('click', goToCurrentLocation);

    geocoderHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.geocoder-close')) return;
        return;
        geocoderDragging = true;
        const rect = geocoderContainer.getBoundingClientRect();
        geocoderDragOffsetX = e.clientX - rect.left;
        geocoderDragOffsetY = e.clientY - rect.top;
        geocoderContainer.classList.add('dragging');
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => onGeocoderDragMove(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopGeocoderDrag);
    geocoderHeader.addEventListener('touchstart', (e) => {
        if (e.target.closest('.geocoder-close')) return;
        return;
        const touch = e.touches[0];
        if (!touch) return;
        geocoderDragging = true;
        const rect = geocoderContainer.getBoundingClientRect();
        geocoderDragOffsetX = touch.clientX - rect.left;
        geocoderDragOffsetY = touch.clientY - rect.top;
        geocoderContainer.classList.add('dragging');
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (!touch) return;
        onGeocoderDragMove(touch.clientX, touch.clientY);
    }, { passive: true });
    document.addEventListener('touchend', stopGeocoderDrag);
    window.addEventListener('resize', () => {
        if (geocoderContainer.dataset.positioned) {
            setGeocoderPosition(parseInt(geocoderContainer.style.left || '18', 10), parseInt(geocoderContainer.style.top || '18', 10));
        }
    });

    geocoderInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGeocoder(false);
            return;
        }
        if (e.key === 'Enter') {
            const first = geocoderResults.querySelector('.geocoder-result');
            if (first) {
                first.click();
                e.preventDefault();
            }
        }
    });

    geocoderInput.addEventListener('input', (e) => {
        clearTimeout(geocoderTimeout);
        const query = e.target.value.trim();
        syncGeocoderClearButton();

        if (query.length < 3) {
            geocoderResults.classList.remove('visible');
            geocoderResults.innerHTML = '';
            return;
        }

        geocoderTimeout = setTimeout(() => {
            searchGooglePredictions(query);
        }, 220);
    });

    geocoderClear?.addEventListener('click', () => {
        clearTimeout(geocoderTimeout);
        geocoderInput.value = '';
        geocoderResults.classList.remove('visible');
        geocoderResults.innerHTML = '';
        resetGeocoderSessionToken();
        syncGeocoderClearButton();
        geocoderInput.focus();
    });

    geocoderResults.addEventListener('click', (e) => {
        const result = e.target.closest('.geocoder-result');
        if (result?.dataset.placeId) {
            goToGooglePlace(result.dataset.placeId);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.geocoder-container') && !e.target.closest('#btn-geocoder-launch')) {
            geocoderResults.classList.remove('visible');
        }
    });
    
    // Measure distance
    document.getElementById('btn-measure-distance').addEventListener('click', () => {
        toggleMeasure('distance');
    });
    
    // Measure area
    document.getElementById('btn-measure-area').addEventListener('click', () => {
        toggleMeasure('area');
    });

    // Object stats
    document.getElementById('btn-object-stats').addEventListener('click', toggleObjectAnalysisMode);
    document.getElementById('btn-elevation-profile').addEventListener('click', toggleElevationProfileMode);
    document.getElementById('btn-terrain-3d').addEventListener('click', toggleTerrain3DMode);
    
    // Location
    document.getElementById('btn-location').addEventListener('click', goToCurrentLocation);

    // Print
    document.getElementById('btn-print').addEventListener('click', () => {
        if (window.AtlasPrint?.open) {
            window.AtlasPrint.open();
        } else {
            showToast('La impresora aún no está lista', 'error');
        }
    });
    
    const zoomDisplay = document.getElementById('zoom-display');
    function updateZoomDisplay() {
        if (!zoomDisplay || !map) return;
        const zoom = map.getView().getZoom();
        zoomDisplay.textContent = `Nivel de zoom: ${Math.round(Number(zoom || 0))}`;
    }
    map.getView().on('change:resolution', updateZoomDisplay);
    updateZoomDisplay();
    const initialCoords = map.getView().getCenter() || ol.proj.fromLonLat(CONFIG.center);
    document.getElementById('coords-display').textContent = `Lat: ${initialCoords[1].toFixed(6)} | Lon: ${initialCoords[0].toFixed(6)}`;

    
    // Legend
    updateLegend();

    const legendPanel = document.getElementById('legend-panel');
    const legendToggleBtn = document.getElementById('btn-legend');
    const legendCollapseBtn = document.getElementById('close-legend');

    function syncLegendCollapseIcon() {
        const collapsed = legendPanel.classList.contains('collapsed');
        legendCollapseBtn.innerHTML = collapsed
            ? '<i class="fas fa-plus"></i>'
            : '<i class="fas fa-minus"></i>';
        legendCollapseBtn.title = collapsed ? 'Expandir leyenda' : 'Colapsar leyenda';
        legendCollapseBtn.setAttribute('aria-label', collapsed ? 'Expandir leyenda' : 'Colapsar leyenda');
    }

    legendToggleBtn.addEventListener('click', () => {
        const isVisible = legendPanel.classList.contains('visible');
        const isCollapsed = legendPanel.classList.contains('collapsed');

        if (!isVisible || isCollapsed) {
            legendPanel.classList.add('visible');
            legendPanel.classList.remove('collapsed');
        } else {
            legendPanel.classList.remove('visible');
        }

        syncLegendCollapseIcon();
    });
    
    legendCollapseBtn.addEventListener('click', () => {
        legendPanel.classList.toggle('collapsed');
        syncLegendCollapseIcon();
    });

    syncLegendCollapseIcon();

    document.addEventListener('atlas:cesium:open', captureCesium2DLayerSnapshot);
    document.addEventListener('atlas:cesium:close', restoreCesium2DLayerSnapshot);
    
    // Fullscreen
    const fullscreenBtn = document.getElementById('btn-fullscreen');

    function syncFullscreenTooltip() {
        fullscreenBtn.title = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
    }

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setTimeout(() => {
            map.updateSize();
            window.AtlasStreetView?.resize?.();
            syncFullscreenTooltip();
        }, 350);
    });

    document.addEventListener('fullscreenchange', () => {
        syncFullscreenTooltip();
    });

    syncFullscreenTooltip();
    
    // Info
    document.getElementById('btn-info').addEventListener('click', () => {
        setFeatureModalWide(false);
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-file-lines"></i> Atlas de Peligros y Riesgos';
        document.getElementById('modal-body').innerHTML = `
            <div style="text-align: center; margin-bottom: 16px;"><img src="assets/images/branding/PC.jpg" alt="Dirección de Protección Civil y Bomberos Celaya" style="max-width: 180px; width: 100%; height: auto; display: inline-block;"></div>
            <p style="margin-bottom: 16px;">Sistema de información geográfica para la consulta del Atlas Municipal de Peligros y Riesgos de Celaya, Guanajuato.</p>
            <p style="margin-bottom: 16px; color: var(--text-secondary);">Desarrollado con OpenLayers 10.x</p>
            <h4 style="margin: 16px 0 8px;">Recursos:</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="margin: 8px 0;"><a href="/pdf/ATLAS_CELAYA.pdf" target="_blank" style="color: var(--accent);">📄 Atlas de Peligros y Riesgos (PDF)</a></li>
                <li style="margin: 8px 0;"><a href="https://servicios-ssp.guanajuato.gob.mx/atlas/municipio/celaya/generalidades/menuini.html" target="_blank" style="color: var(--accent);">🔗 Programas Especiales de PC Celaya</a></li>
                <li style="margin: 8px 0;"><a href="https://seguridad.guanajuato.gob.mx/proteccion-civil/estado-del-tiempo-guanajuato/" target="_blank" style="color: var(--accent);">🌤 Estado del Tiempo Guanajuato</a></li>
            </ul>
            <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.10);">
                <div style="background: linear-gradient(180deg, rgba(139, 0, 48, 0.05), rgba(139, 0, 48, 0.02)); border: 1px solid rgba(139, 0, 48, 0.10); border-radius: 14px; padding: 14px 16px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(139, 0, 48, 0.10); display: flex; align-items: center; justify-content: center; color: var(--accent); flex: 0 0 34px;"><i class="fas fa-building-shield"></i></div>
                        <div>
                            <h4 style="margin: 0; color: var(--text-primary);">Contacto</h4>
                            <p style="margin: 2px 0 0; font-size: 13px; color: var(--text-secondary);">Dirección de Protección Civil y Bomberos de Celaya</p>
                        </div>
                    </div>
                    <div style="display: grid; gap: 10px;">
                        <a href="tel:+524616150911" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.72); color: inherit; text-decoration: none; border: 1px solid rgba(0,0,0,0.05);">
                            <i class="fas fa-phone" style="color: var(--accent); width: 16px; flex: 0 0 16px;"></i>
                            <span style="color: var(--text-secondary);"><strong style="color: var(--text-primary);">Teléfono:</strong> (461) 615-0911</span>
                        </a>
                        <a href="https://www.google.com/maps/search/?api=1&query=Orquídeas+123,+Col.+Rosalinda+I,+Celaya,+Gto." target="_blank" rel="noopener noreferrer" style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,0.72); color: inherit; text-decoration: none; border: 1px solid rgba(0,0,0,0.05);">
                            <i class="fas fa-map-marker-alt" style="color: var(--accent); width: 16px; flex: 0 0 16px; margin-top: 3px;"></i>
                            <span style="color: var(--text-secondary);"><strong style="color: var(--text-primary);">Dirección:</strong> Orquídeas #123, Col. Rosalinda I, C.P. 38060, Celaya, Gto.</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('feature-modal').classList.add('visible');
    });
    
    // Modal close
    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('feature-modal').classList.remove('visible');
    });
    
    document.getElementById('feature-modal').addEventListener('click', (e) => {
        if (e.target.id === 'feature-modal') {
            document.getElementById('feature-modal').classList.remove('visible');
        }
    });

    // ============================================================
    // MOBILE RESPONSIVE BEHAVIOR  (BB6-MOVIL Q1)
    // ============================================================
    const isMobileViewport = () => (window.innerWidth || document.documentElement.clientWidth) <= 900;

    // --- Hamburger: toggle toolbar dropdown ---
    const hamburgerBtn = document.getElementById('btn-hamburger');
    const headerToolsEl = document.getElementById('header-tools');

    function setToolbarOpen(open) {
        if (!headerToolsEl || !hamburgerBtn) return;
        headerToolsEl.classList.toggle('mobile-open', open);
        hamburgerBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('toolbar-open', open);
    }

    hamburgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        setToolbarOpen(!headerToolsEl.classList.contains('mobile-open'));
    });

    // Close toolbar when any tool button is clicked (mobile)
    headerToolsEl?.addEventListener('click', (e) => {
        if (isMobileViewport() && e.target.closest('.tb-btn')) setToolbarOpen(false);
    });

    // --- Helper: close sidebar on mobile ---
    function closeSidebarMobile() {
        if (!sidebarShell || sidebarShell.classList.contains('collapsed')) return;
        sidebarShell.classList.add('collapsed');
        updateSidebarHandleState();
        setTimeout(() => { map.updateSize(); window.AtlasStreetView?.resize?.(); }, 320);
    }

    // --- Tap ANYWHERE outside sidebar → close sidebar + toolbar ---
    document.addEventListener('pointerdown', (e) => {
        if (!isMobileViewport()) return;
        // Close toolbar if tapping outside it and outside hamburger
        if (headerToolsEl?.classList.contains('mobile-open')) {
            if (!e.target.closest('.header-tools') && !e.target.closest('.header-hamburger')) {
                setToolbarOpen(false);
            }
        }
        // Close sidebar if tapping outside it and outside the reopen btn
        if (sidebarShell && !sidebarShell.classList.contains('collapsed')) {
            if (!e.target.closest('.sidebar-shell') && !e.target.closest('.header-sidebar-toggle')) {
                closeSidebarMobile();
            }
        }
    }, { passive: true });

    // --- Auto-close sidebar after layer toggle on mobile ---
    document.getElementById('layer-tree')?.addEventListener('click', (e) => {
        if (!isMobileViewport()) return;
        if (!e.target.closest('.layer-item')) return;
        setTimeout(closeSidebarMobile, 280);
    });

    // --- Swipe-left to close sidebar on mobile ---
    let _swX = 0, _swY = 0, _swTrack = false;
    sidebarShell?.addEventListener('touchstart', (e) => {
        if (!isMobileViewport() || sidebarShell.classList.contains('collapsed')) return;
        const t = e.touches?.[0]; if (!t) return;
        _swX = t.clientX; _swY = t.clientY; _swTrack = true;
    }, { passive: true });
    sidebarShell?.addEventListener('touchend', (e) => {
        if (!_swTrack) return; _swTrack = false;
        const t = e.changedTouches?.[0]; if (!t) return;
        if (t.clientX - _swX < -60 && Math.abs(t.clientY - _swY) < 80) closeSidebarMobile();
    }, { passive: true });
    
}

// ========================================
// BASEMAP SWITCH
// ========================================
function getBasemapDefinition(basemapId) {
    return basemapDefinitions.find(def => def.id === basemapId) || null;
}

function setBasemapSource(def, useTraffic) {
    if (!def?.layer) return;
    const nextUrl = useTraffic ? (def.trafficUrl || def.baseUrl) : def.baseUrl;
    const currentSource = def.layer.getSource?.();
    const currentUrl = currentSource && typeof currentSource.getUrls === 'function'
        ? currentSource.getUrls?.()?.[0]
        : currentSource?.getUrl?.();
    if (currentUrl === nextUrl) return;
    def.layer.setSource(createGoogleXyzSource(nextUrl));
}

function syncBasemapTrafficSources() {
    basemapDefinitions.forEach(def => {
        const isCurrent = def.id === currentBasemapId;
        setBasemapSource(def, isCurrent && trafficModeEnabled);
    });
}

function updateStreetViewCoverageToggleUi() {
    const coverageToggle = document.querySelector('.streetview-coverage-toggle');
    const streetViewActive = !!document?.body?.classList.contains('ol-street-view--activated');
    if (!coverageToggle) return;

    coverageToggle.classList.toggle('is-visible', streetViewActive);
    coverageToggle.classList.toggle('active', streetViewCoverageEnabled);
    coverageToggle.setAttribute('aria-pressed', streetViewCoverageEnabled ? 'true' : 'false');
    coverageToggle.title = streetViewCoverageEnabled
        ? 'Ocultar cobertura de Street View'
        : 'Mostrar cobertura de Street View';
}

function setupStreetViewCoverageObserver() {
    if (window.__atlasStreetViewCoverageObserver || typeof MutationObserver === 'undefined' || !document?.body) return;

    const observer = new MutationObserver(() => {
        syncStreetViewCoverageAppearance();
        updateStreetViewCoverageToggleUi();
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.__atlasStreetViewCoverageObserver = observer;
}

function syncStreetViewCoverageAppearance() {
    const streetViewLayer = window.__atlasStreetViewCoverageLayer
        || window.__atlasStreetViewControl?.getStreetViewLayer?.()
        || null;
    if (!streetViewLayer) return;

    const streetViewActive = !!document?.body?.classList.contains('ol-street-view--activated');
    const shouldShowCoverage = !streetViewActive || streetViewCoverageEnabled;
    const softenCoverage = streetViewActive && streetViewCoverageEnabled && trafficModeEnabled;

    if (typeof streetViewLayer.setVisible === 'function') {
        streetViewLayer.setVisible(shouldShowCoverage);
    }

    if (typeof streetViewLayer.setOpacity === 'function') {
        const nextOpacity = shouldShowCoverage ? (softenCoverage ? 0.42 : 1) : 0;
        streetViewLayer.setOpacity(nextOpacity);
    }

    if (typeof streetViewLayer.changed === 'function') {
        streetViewLayer.changed();
    }
}

function updateTrafficOverlayUi() {
    document.querySelectorAll('.basemap-radio-item[data-basemap]').forEach(item => {
        const isCurrentBasemap = item.dataset.basemap === currentBasemapId;
        const trafficActiveHere = isCurrentBasemap && trafficModeEnabled;
        item.classList.toggle('traffic-enabled', trafficActiveHere);
    });

    const globalTrafficToggle = document.querySelector('.basemap-traffic-global');
    const currentBasemapName = getBasemapDefinition(currentBasemapId)?.name || 'mapa base actual';
    if (globalTrafficToggle) {
        globalTrafficToggle.classList.toggle('active', trafficModeEnabled);
        globalTrafficToggle.setAttribute('aria-pressed', trafficModeEnabled ? 'true' : 'false');
        globalTrafficToggle.title = trafficModeEnabled
            ? `Quitar tráfico de ${currentBasemapName}`
            : `Activar tráfico sobre ${currentBasemapName}`;
    }

    if (document?.body) {
        document.body.classList.toggle('traffic-overlay-active', trafficModeEnabled);
    }

    syncStreetViewCoverageAppearance();
    updateStreetViewCoverageToggleUi();
}

function toggleTrafficOverlay(forceState) {
    trafficModeEnabled = typeof forceState === 'boolean' ? forceState : !trafficModeEnabled;
    syncBasemapTrafficSources();
    updateTrafficOverlayUi();
    ensureMunicipalLayerGuard();
}

function toggleStreetViewCoverage(forceState) {
    streetViewCoverageEnabled = typeof forceState === 'boolean' ? forceState : !streetViewCoverageEnabled;
    syncStreetViewCoverageAppearance();
    updateStreetViewCoverageToggleUi();
}

function switchBasemap(basemapId) {
    if (!basemaps[basemapId]) return;
    currentBasemapId = basemapId;
    Object.keys(basemaps).forEach(key => {
        basemaps[key].setVisible(key === basemapId);
    });
    document.querySelectorAll('.basemap-radio-item[data-basemap]').forEach(item => {
        item.classList.toggle('active', item.dataset.basemap === basemapId);
    });
    syncBasemapTrafficSources();
    updateTrafficOverlayUi();
    ensureMunicipalLayerGuard();
}


// ========================================
// COORDINATES
// ========================================
function updateCoordinates(e) {
    const coords = e.coordinate;
    document.getElementById('coords-display').textContent = 
        `Lat: ${coords[1].toFixed(6)} | Lon: ${coords[0].toFixed(6)}`;
}

// ========================================
// FEATURE INFO
// ========================================
// =====================================================================
// CONSULTA DE CAPAS — sistema mejorado v2
// • Panel en document.body position:fixed → NO se arrastra con el mapa
// • stopPropagation en mousedown del header → DragPan no interfiere
// • Tabs estilo Heron cuando hay varias capas solapadas
// • Paginación ◀ N/M ▶ por pestaña
// • Resaltado magenta de geometría seleccionada
// =====================================================================

// --- Capa de resaltado ---
var _q9SelectionLayer = null;
function _ensureSelectionLayer() {
    if (_q9SelectionLayer) return _q9SelectionLayer;
    _q9SelectionLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#ff00cc', width: 3.5 }),
            fill:   new ol.style.Fill({ color: 'rgba(0,0,0,0)' })  // sin relleno
        }),
        zIndex: 9000
    });
    map.addLayer(_q9SelectionLayer);
    return _q9SelectionLayer;
}
function _clearSelection() {
    try { _ensureSelectionLayer().getSource().clear(); } catch(_e) {}
}
function _highlightGeoJson(geojsonFeature, srcProj) {
    try {
        var sel = _ensureSelectionLayer();
        sel.getSource().clear();
        if (!geojsonFeature || !geojsonFeature.geometry) return;

        // Proyección: usar la que viene del caller (collectionCrs),
        // luego intentar CRS del propio feature, y finalmente default 4326
        if (!srcProj) {
            srcProj = 'EPSG:4326';
            try {
                var crsName = (geojsonFeature.crs && geojsonFeature.crs.properties && geojsonFeature.crs.properties.name)
                    ? geojsonFeature.crs.properties.name : null;
                if (crsName) {
                    var m = crsName.match(/EPSG::?(\d+)/);
                    srcProj = m ? ('EPSG:' + m[1]) : crsName;
                }
            } catch(_ce) {}
        }

        var fmt  = new ol.format.GeoJSON();
        var feat = fmt.readFeature(geojsonFeature, {
            dataProjection:    srcProj,
            featureProjection: 'EPSG:3857'
        });
        sel.getSource().addFeature(feat);
        sel.setZIndex(9999);
        sel.setVisible(true);
    } catch(_e) {}
}

// --- Estado del panel ---
var _q9Hits    = [];   // array de grupos: [{layerTitle, features:[]}]
var _q9TabIdx  = 0;    // tab activa
var _q9FeatIdx = 0;    // feature dentro de la tab activa

// --- Panel: crear una sola vez en document.body ---
function _ensureInfoPanel() {
    if (document.getElementById('q9-info-panel')) return document.getElementById('q9-info-panel');

    var panel = document.createElement('div');
    panel.id = 'q9-info-panel';
    panel.innerHTML = `
      <div id="q9-info-head">
        <button id="q9-layer-prev" class="q9-layer-nav" title="Capa anterior">&#8249;</button>
        <div id="q9-head-center">
          <span id="q9-info-title">Información</span>
          <span id="q9-layer-badge" class="hidden"></span>
        </div>
        <button id="q9-layer-next" class="q9-layer-nav" title="Capa siguiente">&#8250;</button>
        <button id="q9-info-close" title="Cerrar">✕</button>
      </div>
      <div id="q9-info-body">
        <div class="q9-info-grid" id="q9-info-grid"></div>
      </div>
      <div id="q9-info-footer">
        <button id="q9-btn-zoom" title="Ir al elemento">
          <i class="fas fa-search"></i>
        </button>
        <div id="q9-info-nav" class="hidden">
          <button class="q9-nav-btn" id="q9-nav-prev" title="Anterior">&#8249;</button>
          <span id="q9-info-count"></span>
          <button class="q9-nav-btn" id="q9-nav-next" title="Siguiente">&#8250;</button>
        </div>
      </div>`;
    document.body.appendChild(panel);

    // Clicks dentro del panel no alcanzan el listener "cerrar fuera"
    panel.addEventListener('click',    function(e) { e.stopPropagation(); });
    panel.addEventListener('touchend', function(e) { e.stopPropagation(); });

    // Cerrar
    panel.querySelector('#q9-info-close').addEventListener('click', function() {
        panel.classList.remove('visible');
        panel.classList.remove('q9-expanded');
        _clearSelection();
    });

    // Móvil: tap en zona central del header → toggle peek/expand
    panel.querySelector('#q9-head-center').addEventListener('click', function(e) {
        if (window.innerWidth > 600) return;
        e.stopPropagation();
        panel.classList.toggle('q9-expanded');
    });

    // Cerrar al clicar fuera
    document.addEventListener('click', function(e) {
        if (!panel.classList.contains('visible')) return;
        if (panel.contains(e.target)) return;
        panel.classList.remove('visible');
        panel.classList.remove('q9-expanded');
        _clearSelection();
    }, { passive: true });

    // Navegación entre capas (◀ ▶ en header)
    panel.querySelector('#q9-layer-prev').addEventListener('click', function(e) {
        e.stopPropagation();
        if (_q9TabIdx > 0) { _q9TabIdx--; _q9FeatIdx = 0; _updateLayerNav(); _renderPanel(); }
    });
    panel.querySelector('#q9-layer-next').addEventListener('click', function(e) {
        e.stopPropagation();
        if (_q9TabIdx < _q9Hits.length - 1) { _q9TabIdx++; _q9FeatIdx = 0; _updateLayerNav(); _renderPanel(); }
    });

    // Paginación de features
    panel.querySelector('#q9-nav-prev').addEventListener('click', function() {
        if (_q9FeatIdx > 0) { _q9FeatIdx--; _renderPanel(); }
    });
    panel.querySelector('#q9-nav-next').addEventListener('click', function() {
        var feats = (_q9Hits[_q9TabIdx] || {}).features || [];
        if (_q9FeatIdx < feats.length - 1) { _q9FeatIdx++; _renderPanel(); }
    });

    // Zoom al elemento
    panel.querySelector('#q9-btn-zoom').addEventListener('click', function() {
        try {
            var sel = _ensureSelectionLayer();
            var features = sel.getSource().getFeatures();
            if (!features.length) { showToast('Sin geometría'); return; }
            var extent = ol.extent.createEmpty();
            features.forEach(function(f) { var g = f.getGeometry(); if (g) ol.extent.extend(extent, g.getExtent()); });
            if (!ol.extent.isEmpty(extent)) map.getView().fit(extent, { duration: 600, padding: [80,80,80,80], maxZoom: 18 });
        } catch(_e) { showToast('No se pudo hacer zoom'); }
    });

    // Drag (desktop y tablet, no en móvil)
    (function() {
        var head = panel.querySelector('#q9-head-center');
        var dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
        function isMob() { return window.innerWidth <= 600; }
        function startDrag(cx, cy) {
            if (isMob()) return;
            dragging = true; sx = cx; sy = cy;
            sl = parseInt(panel.style.left) || panel.getBoundingClientRect().left;
            st = parseInt(panel.style.top)  || panel.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
        }
        function moveDrag(cx, cy) {
            if (!dragging || isMob()) return;
            var left = Math.max(0, Math.min(window.innerWidth  - panel.offsetWidth,  sl + cx - sx));
            var top  = Math.max(0, Math.min(window.innerHeight - 40,                 st + cy - sy));
            panel.style.left = left + 'px';
            panel.style.top  = top  + 'px';
        }
        function endDrag() { dragging = false; document.body.style.userSelect = ''; }
        head.addEventListener('mousedown', function(e) {
            if (e.button !== 0 || isMob()) return;
            e.stopPropagation(); e.preventDefault(); startDrag(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', function(e) { moveDrag(e.clientX, e.clientY); });
        window.addEventListener('mouseup', endDrag);
        head.addEventListener('touchstart', function(e) {
            if (isMob()) return;
            e.stopPropagation(); startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        window.addEventListener('touchmove', function(e) {
            if (!dragging) return; moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        window.addEventListener('touchend', endDrag);
    })();

    return panel;
}

// Actualizar badge y botones ◀ ▶ de capas en el header
function _updateLayerNav() {
    var prevBtn = document.getElementById('q9-layer-prev');
    var nextBtn = document.getElementById('q9-layer-next');
    var badge   = document.getElementById('q9-layer-badge');
    if (!prevBtn) return;
    var n = _q9Hits.length;
    if (n <= 1) {
        prevBtn.style.display = nextBtn.style.display = 'none';
        if (badge) badge.classList.add('hidden');
    } else {
        prevBtn.style.display = nextBtn.style.display = 'flex';
        prevBtn.disabled = (_q9TabIdx === 0);
        nextBtn.disabled = (_q9TabIdx >= n - 1);
        prevBtn.style.opacity = (_q9TabIdx === 0)    ? '0.35' : '1';
        nextBtn.style.opacity = (_q9TabIdx >= n - 1) ? '0.35' : '1';
        if (badge) { badge.textContent = (_q9TabIdx + 1) + '/' + n; badge.classList.remove('hidden'); }
    }
}

// _buildTabs ahora delega a _updateLayerNav
function _buildTabs() { _updateLayerNav(); }


function _renderPanel() {
    var hit   = _q9Hits[_q9TabIdx] || {};
    var feats = hit.features || [];
    var feat  = feats[_q9FeatIdx] || {};
    var props = feat.properties || {};

    // Título: si hay tabs, muestra el de la tab activa; si no, el nombre de capa
    var titleEl = document.getElementById('q9-info-title');
    if (titleEl) titleEl.textContent = hit.layerTitle || 'Información';

    // Grid de atributos
    var grid = document.getElementById('q9-info-grid');
    if (grid) {
        grid.innerHTML = '';
        var hasData = false;

        // Extrae todas las URLs de imagen de un valor que puede ser HTML o URL directa
        function _extractImgUrls(str) {
            var urls = [];
            var s = String(str || '').trim();
            // Extraer src de tags <img ...>
            var re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            var m;
            while ((m = re.exec(s)) !== null) { if (m[1]) urls.push(m[1].trim()); }
            // Si no hay tags img, probar si es URL directa de imagen
            if (!urls.length && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(s)) {
                urls.push(s);
            }
            return urls;
        }

        Object.entries(props).forEach(function([k, v]) {
            if (v === null || v === undefined || String(v).trim() === '') return;

            var strV = String(v).trim();
            var imgUrls = _extractImgUrls(strV);

            // Si el campo contiene imágenes, renderizar carrusel (solo si hay URLs válidas)
            if (imgUrls.length > 0) {
                hasData = true;
                var labelTxt = k.replace(/_/g, ' ').replace(/^./, function(ch){ return ch.toUpperCase(); });

                var row = document.createElement('div');
                row.className = 'q9-row q9-row-img';

                var l = document.createElement('div');
                l.className = 'q9-info-label';
                l.textContent = labelTxt;

                var d = document.createElement('div');
                d.className = 'q9-info-value q9-img-carousel-wrap';

                if (imgUrls.length === 1) {
                    // Imagen única
                    var img = document.createElement('img');
                    img.src = imgUrls[0];
                    img.alt = labelTxt;
                    img.className = 'q9-carousel-img';
                    img.style.cssText = 'max-width:100%;max-height:200px;border-radius:6px;display:block;margin:4px auto;cursor:zoom-in;object-fit:contain;user-select:none;-webkit-user-drag:none;pointer-events:auto;';
                    img.setAttribute('draggable', 'false');
                    img.addEventListener('click', function(ev){ ev.stopPropagation(); _atlasLightboxOpen(imgUrls[0], labelTxt); });
                    d.appendChild(img);
                } else {
                    // Carrusel multi-imagen
                    var ci = 0;
                    var carDiv = document.createElement('div');
                    carDiv.style.cssText = 'position:relative;text-align:center;';

                    var imgEl = document.createElement('img');
                    imgEl.src = imgUrls[0];
                    imgEl.alt = labelTxt;
                    imgEl.className = 'q9-carousel-img';
                    imgEl.style.cssText = 'max-width:100%;max-height:200px;border-radius:6px;display:block;margin:0 auto 4px;cursor:zoom-in;object-fit:contain;user-select:none;-webkit-user-drag:none;pointer-events:auto;';
                    imgEl.setAttribute('draggable', 'false');
                    imgEl.addEventListener('click', function(ev){ ev.stopPropagation(); _atlasLightboxOpen(imgEl.src, labelTxt); });

                    var counter = document.createElement('div');
                    counter.style.cssText = 'font-size:11px;color:var(--text-secondary);margin-bottom:4px;';
                    counter.textContent = '1 / ' + imgUrls.length;

                    var btnWrap = document.createElement('div');
                    btnWrap.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:2px;';

                    var btnPrev = document.createElement('button');
                    btnPrev.textContent = '‹';
                    btnPrev.style.cssText = 'background:var(--primary,#931D3D);color:#fff;border:none;border-radius:4px;width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;';
                    btnPrev.disabled = true;

                    var btnNext = document.createElement('button');
                    btnNext.textContent = '›';
                    btnNext.style.cssText = 'background:var(--primary,#931D3D);color:#fff;border:none;border-radius:4px;width:28px;height:28px;cursor:pointer;font-size:16px;line-height:1;';

                    function goTo(idx) {
                        ci = idx;
                        imgEl.src = imgUrls[ci];
                        counter.textContent = (ci + 1) + ' / ' + imgUrls.length;
                        btnPrev.disabled = ci === 0;
                        btnNext.disabled = ci === imgUrls.length - 1;
                    }

                    btnPrev.addEventListener('click', function(ev){ ev.stopPropagation(); if (ci > 0) goTo(ci - 1); });
                    btnNext.addEventListener('click', function(ev){ ev.stopPropagation(); if (ci < imgUrls.length - 1) goTo(ci + 1); });

                    btnWrap.appendChild(btnPrev);
                    btnWrap.appendChild(btnNext);
                    carDiv.appendChild(imgEl);
                    carDiv.appendChild(counter);
                    carDiv.appendChild(btnWrap);
                    d.appendChild(carDiv);
                }

                row.appendChild(l);
                row.appendChild(d);
                grid.appendChild(row);
                return;
            }

            // Campo normal (texto)
            if (strV === '') return;
            hasData = true;

            // Limpiar nombre de campo
            var labelTxt = k.replace(/_/g, ' ').replace(/^./, function(ch){ return ch.toUpperCase(); });

            // Wrapper de fila
            var row = document.createElement('div');
            row.className = 'q9-row';

            var l = document.createElement('div');
            l.className = 'q9-info-label';
            l.textContent = labelTxt;

            var d = document.createElement('div');
            d.className = 'q9-info-value';

            // Valor: texto principal
            var span = document.createElement('span');
            span.textContent = strV;
            d.appendChild(span);

            row.appendChild(l);
            row.appendChild(d);

            // Click → seleccionar fila
            row.addEventListener('click', function(e) {
                e.stopPropagation();
                var was = row.classList.contains('q9-selected');
                grid.querySelectorAll('.q9-row.q9-selected').forEach(function(r){ r.classList.remove('q9-selected'); });
                if (!was) row.classList.add('q9-selected');
            });

            grid.appendChild(row);
        });

        if (!hasData) {
            var msg = document.createElement('div');
            msg.style.cssText = 'color:#bbb;font-style:italic;padding:16px;text-align:center;font-size:12px';
            msg.textContent = 'Sin atributos disponibles';
            grid.appendChild(msg);
        }
    }

    // Paginación
    var nav   = document.getElementById('q9-info-nav');
    var count = document.getElementById('q9-info-count');
    if (nav) {
        if (feats.length > 1) {
            nav.classList.remove('hidden');
            if (count) count.textContent = 'Resultado ' + (_q9FeatIdx + 1) + ' de ' + feats.length;
            var prev = document.getElementById('q9-nav-prev');
            var next = document.getElementById('q9-nav-next');
            if (prev) prev.disabled = (_q9FeatIdx === 0);
            if (next) next.disabled = (_q9FeatIdx >= feats.length - 1);
        } else {
            nav.classList.add('hidden');
        }
    }

    // Resaltado
    _highlightGeoJson(feat, (_q9Hits[_q9TabIdx] || {}).collectionCrs);
}

// --- Abrir/reposicionar el panel ---
// ── Lightbox interno para imágenes del panel de consulta ──────────────
function _atlasLightboxOpen(src, caption) {
    var lb  = document.getElementById('atlas-lightbox');
    var img = document.getElementById('atlas-lightbox-img');
    var cap = document.getElementById('atlas-lightbox-caption');
    if (!lb || !img) return;
    img.src = src;
    img.alt = caption || '';
    if (cap) cap.textContent = caption || '';
    lb.style.display = 'flex';
    document.addEventListener('keydown', _atlasLightboxKey);
}
function _atlasLightboxClose() {
    var lb = document.getElementById('atlas-lightbox');
    if (lb) lb.style.display = 'none';
    document.removeEventListener('keydown', _atlasLightboxKey);
}
function _atlasLightboxKey(e) { if (e.key === 'Escape') _atlasLightboxClose(); }
// ──────────────────────────────────────────────────────────────────────

function _openInfoPanel(hits, screenPixel) {
    var panel = _ensureInfoPanel();
    _q9Hits    = hits || [];
    _q9TabIdx  = 0;
    _q9FeatIdx = 0;

    // En móvil (≤480px): el CSS maneja la posición como sheet inferior
    // En desktop/tablet: posicionar junto al click, clampado dentro de la ventana
    if (screenPixel && window.innerWidth > 600) {
        var pw = 360, ph = 220;
        var left = Math.min(screenPixel[0] + 14, window.innerWidth  - pw - 12);
        var top  = Math.min(screenPixel[1] + 14, window.innerHeight - ph - 12);
        if (left < 8) left = 8;
        if (top  < 8) top  = 8;
        panel.style.left = left + 'px';
        panel.style.top  = top  + 'px';
    } else if (window.innerWidth <= 600) {
        panel.style.left = '';
        panel.style.top  = '';
    }

    panel.classList.add('visible');
    if (window.innerWidth <= 600) {
        panel.classList.remove('q9-expanded');
    }
    _buildTabs();
    _renderPanel();
}

// --- Probar una capa WMS → devuelve {layerTitle, features} o null ---
function _probeLayer(evt, layerKey) {
    return new Promise(function(resolve) {
        try {
            var layer = wmsLayers[layerKey];
            if (!layer || !layer.getVisible()) return resolve(null);
            var src = layer.getSource();
            if (!src || typeof src.getFeatureInfoUrl !== 'function') return resolve(null);
            var view = map.getView();
            var url  = src.getFeatureInfoUrl(
                evt.coordinate, view.getResolution(), view.getProjection(),
                { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': '5' }
            );
            if (!url) return resolve(null);
            fetch(url)
                .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
                .then(function(data) {
                    if (data && data.features && data.features.length) {
                        // Extraer CRS declarado en la FeatureCollection
                        // GeoServer lo pone aquí: data.crs.properties.name
                        var collCrs = 'EPSG:4326';
                        try {
                            var crsNode = data.crs && data.crs.properties && data.crs.properties.name;
                            if (crsNode) {
                                // urn:ogc:def:crs:EPSG::3857  →  EPSG:3857
                                var m = crsNode.match(/EPSG::?(\d+)/);
                                collCrs = m ? ('EPSG:' + m[1]) : crsNode;
                            }
                        } catch(_ce) {}
                        resolve({
                            layerTitle:   layer.get('title') || layer.get('name') || layerKey,
                            features:     data.features,
                            collectionCrs: collCrs
                        });
                    } else resolve(null);
                })
                .catch(function() { resolve(null); });
        } catch(_e) { resolve(null); }
    });
}

// --- Convertir pixel de mapa → coordenada de pantalla (para position:fixed) ---
function _mapPixelToScreen(mapPixel) {
    try {
        var vp   = map.getViewport();
        var rect = vp.getBoundingClientRect();
        return [rect.left + mapPixel[0], rect.top + mapPixel[1]];
    } catch(_e) { return mapPixel; }
}

async function handleMapClick(e) {
    if (document.body.classList.contains('atlas-print-open')) return;
    if (measureDraw || objectAnalysisDraw || objectAnalysisActive || profileAnalysisDraw || profileAnalysisActive || terrain3DDraw || terrain3DActive) return;
    if (window.AtlasRouteTool?.handleMapClick?.(e)) return;

    // Bloqueo de consulta mientras Street View del plugin ol-street-view esté activo.
    // El plugin marca el body con esta clase al abrir y la retira al cerrar.
    // Así evitamos que el clic de consulta choque con el pegman o con la navegación de Street View.
    if (document.body.classList.contains('ol-street-view--activated')) return;

    if (window.AtlasStreetView?.handleMapClick?.(e)) return;
    if (window.AtlasTempLayers?.handleMapClick?.(e)) return;
    if (window.AtlasClimaWidget?.handleMapClick?.(e)) return;

    var visibleKeys = activeLayers.filter(function(k) { return wmsLayers[k]?.getVisible(); });
    if (!visibleKeys.length) return;

    var results = await Promise.all(visibleKeys.map(function(k) { return _probeLayer(e, k); }));
    var hits    = results.filter(Boolean);
    if (!hits.length) return;

    // Ordenar hits por área del primer feature (ascendente):
    // el feature más pequeño = más específico = el que realmente clickeó el usuario → va primero.
    // Límite Municipal (enorme) queda al final; Lotes Baldíos (pequeño) queda primero.
    if (hits.length > 1) {
        hits.sort(function(a, b) {
            function featArea(hit) {
                try {
                    var f = hit.features && hit.features[0];
                    if (!f || !f.geometry || !f.geometry.coordinates) return Infinity;
                    var geom = f.geometry;
                    // Calcular bbox del primer ring de coordenadas
                    var coords = geom.type === 'Polygon'   ? geom.coordinates[0]
                               : geom.type === 'MultiPolygon' ? geom.coordinates[0][0]
                               : geom.coordinates;
                    if (!coords || !coords.length) return Infinity;
                    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    coords.forEach(function(c) {
                        if (c[0] < minX) minX = c[0]; if (c[0] > maxX) maxX = c[0];
                        if (c[1] < minY) minY = c[1]; if (c[1] > maxY) maxY = c[1];
                    });
                    return (maxX - minX) * (maxY - minY);
                } catch(_e) { return Infinity; }
            }
            return featArea(a) - featArea(b);
        });
    }

    // Convertir pixel de mapa a coordenada de pantalla (panel es position:fixed)
    var screenPx = _mapPixelToScreen(e.pixel);
    _openInfoPanel(hits, screenPx);
}

// showFeatureInfo: conservada para compatibilidad con módulos externos
function showFeatureInfo(feature, layerName) {
    _openInfoPanel([{ layerTitle: layerName, features: [feature] }], null);
}

function setFeatureModalWide(active) {
    const modal = document.querySelector('#feature-modal .modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;
    modal.classList.toggle('modal-wide', !!active);
    modalBody.classList.toggle('modal-body-wide', !!active);
}
// =====================================================================
// FIN — CONSULTA DE CAPAS v2
function stopMeasureLineAnimation() {
    if (measureAnimationFrame) {
        cancelAnimationFrame(measureAnimationFrame);
        measureAnimationFrame = null;
    }
    measureDirectionalFlowActive = false;
    measureMotionPhase = 0;
    measureDashOffset = 0;
    if (measureLayer) measureLayer.changed();
}

function startMeasureLineAnimation() {
    if (measureAnimationFrame) return;
    const animate = () => {
        measureDashOffset = (measureDashOffset - (measureDirectionalFlowActive ? 0.42 : 0.16)) % 24;
        measureMotionPhase = (measureMotionPhase + (measureDirectionalFlowActive ? 0.0045 : 0.0012)) % 1;
        if (measureLayer) measureLayer.changed();
        if (map) map.render();
        measureAnimationFrame = requestAnimationFrame(animate);
    };
    measureAnimationFrame = requestAnimationFrame(animate);
}

function formatMeasureDistance(length) {
    if (!Number.isFinite(length)) return '0 m';
    return length >= 1000
        ? `${(length / 1000).toFixed(2)} km`
        : `${length.toFixed(2)} m`;
}

function formatMeasureArea(area) {
    if (!Number.isFinite(area)) return '0 m²';
    if (area >= 1000000) return `${(area / 1000000).toFixed(2)} km²`;
    if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
    return `${area.toFixed(2)} m²`;
}

function getMeasureSegmentAngle(start, end) {
    if (!start || !end) return 0;
    return Math.atan2(end[1] - start[1], end[0] - start[0]);
}

function getMeasureDistanceStyles(feature) {
    const geometry = feature?.getGeometry ? feature.getGeometry() : null;
    const styles = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'rgba(147, 29, 61, 0.18)', width: 7, lineCap: 'round', lineJoin: 'round' })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.8, lineCap: 'round', lineJoin: 'round' }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,0.92)',
                width: 1.7,
                lineDash: [14, 10],
                lineDashOffset: measureDashOffset,
                lineCap: 'round',
                lineJoin: 'round'
            })
        })
    ];

    if (!geometry || geometry.getType() !== 'LineString') {
        return styles;
    }

    const coords = geometry.getCoordinates();
    if (!Array.isArray(coords) || coords.length < 2) {
        return styles;
    }

    let totalLength = 0;

    for (let i = 0; i < coords.length - 1; i += 1) {
        const start = coords[i];
        const end = coords[i + 1];
        const segment = new ol.geom.LineString([start, end]);
        const segmentLength = ol.sphere.getLength(segment);
        totalLength += segmentLength;
        const midpoint = [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2
        ];
        const angle = getMeasureSegmentAngle(start, end);
        const arrowFraction = (measureMotionPhase + (i * 0.17)) % 1;
        const arrowCoordinate = [
            start[0] + ((end[0] - start[0]) * arrowFraction),
            start[1] + ((end[1] - start[1]) * arrowFraction)
        ];

        // No mostrar etiqueta si el segmento es < 1m (segmento fantasma cursor)
        if (segmentLength >= 1) {
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(midpoint),
                text: new ol.style.Text({
                    text: formatMeasureDistance(segmentLength),
                    font: '700 12px Arial, sans-serif',
                    fill: new ol.style.Fill({ color: '#931D3D' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 3.5 }),
                    backgroundFill: new ol.style.Fill({ color: 'rgba(255,255,255,0.96)' }),
                    backgroundStroke: new ol.style.Stroke({ color: 'rgba(147,29,61,0.18)', width: 1.2 }),
                    padding: [4, 7, 4, 7],
                    offsetY: -14,
                    overflow: true
                })
            }));
        }

        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(arrowCoordinate),
            image: new ol.style.RegularShape({
                points: 3,
                radius: 9,
                rotation: angle + (Math.PI / 2),
                fill: new ol.style.Fill({ color: 'rgba(35, 192, 132, 0.95)' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.7 })
            })
        }));
    }

    const lastCoord = coords[coords.length - 1];
    if (lastCoord) {
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(lastCoord),
            text: new ol.style.Text({
                text: `Total: ${formatMeasureDistance(totalLength)}`,
                font: '700 12px Arial, sans-serif',
                fill: new ol.style.Fill({ color: '#ffffff' }),
                stroke: new ol.style.Stroke({ color: 'rgba(147,29,61,0.28)', width: 1.4 }),
                backgroundFill: new ol.style.Fill({ color: 'rgba(147,29,61,0.96)' }),
                backgroundStroke: new ol.style.Stroke({ color: '#ffffff', width: 1.1 }),
                padding: [5, 8, 5, 8],
                offsetY: -38,
                overflow: true,
                textAlign: 'center',
                textBaseline: 'bottom'
            })
        }));
    }

    return styles;
}

function getMeasurePolygonStyles(feature) {
    const geometry = feature?.getGeometry ? feature.getGeometry() : null;
    const styles = [
        new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.18)' }),
            stroke: new ol.style.Stroke({ color: 'rgba(147, 29, 61, 0.16)', width: 6.5, lineCap: 'round', lineJoin: 'round' })
        }),
        new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.18)' }),
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.6, lineCap: 'round', lineJoin: 'round' }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,0.92)',
                width: 1.7,
                lineDash: [14, 10],
                lineDashOffset: measureDashOffset,
                lineCap: 'round',
                lineJoin: 'round'
            })
        })
    ];

    if (!geometry || !geometry.getType || geometry.getType() !== 'Polygon') {
        return styles;
    }

    const rings = geometry.getCoordinates();
    const ring = Array.isArray(rings) && Array.isArray(rings[0]) ? rings[0] : null;
    if (!Array.isArray(ring) || ring.length < 2) {
        return styles;
    }

    let perimeter = 0;
    const segmentCount = ring.length - 1;
    for (let i = 0; i < segmentCount; i += 1) {
        const start = ring[i];
        const end = ring[i + 1];
        if (!start || !end) continue;
        const segment = new ol.geom.LineString([start, end]);
        const segmentLength = ol.sphere.getLength(segment);
        perimeter += segmentLength;
        const midpoint = [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2
        ];
        const angle = getMeasureSegmentAngle(start, end);
        const arrowFraction = (measureMotionPhase + (i * 0.15)) % 1;
        const arrowCoordinate = [
            start[0] + ((end[0] - start[0]) * arrowFraction),
            start[1] + ((end[1] - start[1]) * arrowFraction)
        ];

        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(midpoint),
            text: new ol.style.Text({
                text: formatMeasureDistance(segmentLength),
                font: '700 12px Arial, sans-serif',
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 3.5 }),
                backgroundFill: new ol.style.Fill({ color: 'rgba(255,255,255,0.96)' }),
                backgroundStroke: new ol.style.Stroke({ color: 'rgba(147,29,61,0.18)', width: 1.2 }),
                padding: [4, 7, 4, 7],
                offsetY: -12,
                overflow: true
            })
        }));

        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(arrowCoordinate),
            image: new ol.style.RegularShape({
                points: 3,
                radius: 8,
                rotation: angle + (Math.PI / 2),
                fill: new ol.style.Fill({ color: 'rgba(35, 192, 132, 0.95)' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.6 })
            })
        }));
    }

    const area = ol.sphere.getArea(geometry);
    // Etiqueta fuera del polígono, anclada al vértice superior, para no tapar el dibujo.
    const ringCoordinates = geometry.getCoordinates?.()?.[0] || [];
    const topVertex = ringCoordinates.reduce((best, coord) => {
        if (!Array.isArray(coord) || coord.length < 2) return best;
        if (!best) return coord;
        if (coord[1] > best[1]) return coord;
        if (coord[1] === best[1] && coord[0] > best[0]) return coord;
        return best;
    }, null);
    if (topVertex) {
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(topVertex),
            text: new ol.style.Text({
                text: `Área: ${formatMeasureArea(area)}
Perímetro: ${formatMeasureDistance(perimeter)}`,
                font: '700 12px Arial, sans-serif',
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 3.2 }),
                backgroundFill: new ol.style.Fill({ color: 'rgba(255,255,255,0.97)' }),
                backgroundStroke: new ol.style.Stroke({ color: 'rgba(147,29,61,0.22)', width: 1.2 }),
                padding: [6, 9, 6, 9],
                overflow: true,
                textAlign: 'left',
                textBaseline: 'bottom',
                offsetX: 16,
                offsetY: -10
            })
        }));
    }

    return styles;
}

function getMeasureElevationCoordinateKey(coordinate) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) return null;
    const lonLat = ol.proj.toLonLat(coordinate);
    const lon = Number(lonLat[0]);
    const lat = Number(lonLat[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
    return `${lon.toFixed(4)},${lat.toFixed(4)}`;
}

function updateMeasureAreaElevation(feature, immediate = false) {
    if (!feature?.getGeometry || typeof getElevationText !== 'function') return;
    const geometry = feature.getGeometry();
    if (!geometry || geometry.getType?.() !== 'Polygon') return;

    const centerCoordinate = getAnalysisPolygonCenter(geometry);
    const coordinateKey = getMeasureElevationCoordinateKey(centerCoordinate);
    if (!coordinateKey) return;

    feature.set('measureElevationText', feature.get('measureElevationText') || 'Calculando...', true);
    if (measureLayer) measureLayer.changed();

    if (!immediate && feature.get('measureElevationCoordinateKey') === coordinateKey && feature.get('measureElevationResolved')) {
        return;
    }

    if (measureElevationDebounce) {
        clearTimeout(measureElevationDebounce);
        measureElevationDebounce = null;
    }

    const currentRequest = ++measureElevationRequestSeq;
    const run = async () => {
        try {
            const elevationText = await getElevationText(centerCoordinate);
            if (currentRequest !== measureElevationRequestSeq) return;
            feature.set('measureElevationText', elevationText || 'No disponible', true);
            feature.set('measureElevationCoordinateKey', coordinateKey, true);
            feature.set('measureElevationResolved', true, true);
            if (measureLayer) measureLayer.changed();
        } catch (err) {
            if (currentRequest !== measureElevationRequestSeq) return;
            feature.set('measureElevationText', 'No disponible', true);
            feature.set('measureElevationCoordinateKey', coordinateKey, true);
            feature.set('measureElevationResolved', true, true);
            if (measureLayer) measureLayer.changed();
        }
    };

    if (immediate) {
        run();
    } else {
        measureElevationDebounce = setTimeout(run, 380);
    }
}

function resetMeasureButtonsState() {
    ['btn-measure-distance', 'btn-measure-area'].forEach(id => {
        const btn = document.getElementById(id);
        btn?.classList.remove('active');
        btn?.classList.remove('was-active');
    });
}

function ensureMeasureLayer() {
    if (!measureSource) {
        measureSource = new ol.source.Vector();
    }
    if (!measureLayer) {
        measureLayer = new ol.layer.Vector({
            source: measureSource,
            style: (feature) => {
                const measureType = feature?.get ? feature.get('measureType') : null;
                if (measureType === 'distance') {
                    return getMeasureDistanceStyles(feature);
                }
                return getMeasurePolygonStyles(feature);
            }
        });
        map.addLayer(measureLayer);
    }
}

function buildMeasureDrawInteraction(type) {
    const drawType = type === 'distance' ? 'LineString' : 'Polygon';
    const draw = new ol.interaction.Draw({
        source: measureSource,
        type: drawType,
        style: (feature) => {
            if (type === 'distance') {
                return getMeasureDistanceStyles(feature);
            }
            return getMeasurePolygonStyles(feature);
        }
    });

    draw.on('drawstart', (e) => {
        stopMeasureLineAnimation();
        if (measureSource) {
            measureSource.clear();
        }
        if (measureElevationDebounce) {
            clearTimeout(measureElevationDebounce);
            measureElevationDebounce = null;
        }
        measureElevationRequestSeq += 1;
        measureMotionPhase = 0;
        measureDirectionalFlowActive = true;
        startMeasureLineAnimation();
    });

    draw.on('drawend', (e) => {
        const geom = e.feature.getGeometry();
        let output;

        e.feature.set('measureType', type);

        if (type === 'distance') {
            const length = ol.sphere.getLength(geom);
            output = formatMeasureDistance(length);
            measureMotionPhase = 0;
            measureDirectionalFlowActive = true;
            startMeasureLineAnimation();
        } else {
            const area = ol.sphere.getArea(geom);
            output = formatMeasureArea(area);
            measureMotionPhase = 0;
            measureDirectionalFlowActive = true;
            startMeasureLineAnimation();
        }

        if (measureLayer) measureLayer.changed();
        showToast(`${type === 'distance' ? 'Distancia total' : 'Área'}: ${output}`, 'success');
    });

    return draw;
}

function setMeasureButtonsActive(type) {
    resetMeasureButtonsState();
    const btn = document.getElementById(type === 'distance' ? 'btn-measure-distance' : 'btn-measure-area');
    btn?.classList.add('active');
    btn?.classList.add('was-active');
}

function suspendMeasureInteractionForPrint() {
    measureModeBeforePrint = currentMeasureMode;
    if (measureDraw) {
        map.removeInteraction(measureDraw);
        measureDraw = null;
    }
    if (measureElevationDebounce) {
        clearTimeout(measureElevationDebounce);
        measureElevationDebounce = null;
    }
    measureElevationRequestSeq += 1;
    stopMeasureLineAnimation();
    if (measureLayer) measureLayer.changed();
    resetMeasureButtonsState();
}

function restoreMeasureInteractionAfterPrint() {
    if (!measureModeBeforePrint) return;
    ensureMeasureLayer();
    if (measureDraw) {
        map.removeInteraction(measureDraw);
        measureDraw = null;
    }
    measureDraw = buildMeasureDrawInteraction(measureModeBeforePrint);
    map.addInteraction(measureDraw);
    currentMeasureMode = measureModeBeforePrint;
    setMeasureButtonsActive(measureModeBeforePrint);
    measureModeBeforePrint = null;
}

function clearMeasureInteraction() {
    measureModeBeforePrint = null;
    suspendMeasureInteractionForPrint();
    currentMeasureMode = null;
    if (measureSource) {
        measureSource.clear();
    }
}

window.AtlasMeasure = Object.assign(window.AtlasMeasure || {}, {
    suspendForPrint: suspendMeasureInteractionForPrint,
    restoreAfterPrint: restoreMeasureInteractionAfterPrint
});

// ========================================
// OBJECT ANALYSIS
// ========================================
function ensureObjectAnalysisLayer() {
    if (objectAnalysisLayer) return;

    objectAnalysisSource = new ol.source.Vector();
    objectAnalysisLayer = new ol.layer.Vector({
        source: objectAnalysisSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.18)' }),
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.5 }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        })
    });
    map.addLayer(objectAnalysisLayer);
}

function stopObjectAnalysisDrawing() {
    if (objectAnalysisDraw) {
        map.removeInteraction(objectAnalysisDraw);
        objectAnalysisDraw = null;
    }
}

function clearObjectAnalysisGeometry() {
    if (objectAnalysisSource) {
        objectAnalysisSource.clear();
    }
}

function setObjectAnalysisMode(active) {
    objectAnalysisActive = !!active;
    document.getElementById('btn-object-stats').classList.toggle('active', objectAnalysisActive);

    if (!objectAnalysisActive) {
        stopObjectAnalysisDrawing();
        clearObjectAnalysisGeometry();
    }
}

function getAnalysisPolygonCenter(geometry) {
    if (!geometry) return null;
    if (geometry.getType && geometry.getType() === 'Polygon') {
        return geometry.getInteriorPoint().getCoordinates();
    }
    const extent = geometry.getExtent ? geometry.getExtent() : null;
    return extent ? ol.extent.getCenter(extent) : null;
}

function formatObjectArea(area) {
    if (!Number.isFinite(area)) return 'No disponible';
    if (area >= 1000000) return `${(area / 1000000).toFixed(2)} km²`;
    if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
    return `${area.toFixed(2)} m²`;
}

function formatObjectDistance(distance) {
    if (!Number.isFinite(distance)) return 'No disponible';
    if (distance >= 1000) return `${(distance / 1000).toFixed(2)} km`;
    return `${distance.toFixed(2)} m`;
}

async function fetchElevationFromUrl(url, timeoutMs = 9000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

async function getElevationText(coordinate) {
    try {
        const lonLat = ol.proj.toLonLat(coordinate);
        const lat = Number(lonLat[1]);
        const lon = Number(lonLat[0]);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return 'No disponible';
        }

        const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(6)}&longitude=${lon.toFixed(6)}`;
        const data = await fetchElevationFromUrl(url, 8000);
        const elevation = Number(Array.isArray(data?.elevation) ? data.elevation[0] : data?.elevation);
        if (Number.isFinite(elevation)) {
            return `${elevation.toFixed(0)} msnm`;
        }
    } catch (err) {
        console.warn('No fue posible obtener elevación', err);
    }
    return 'No disponible';
}

function showObjectAnalysisResult(area, perimeter, elevationText) {
    setFeatureModalWide(false);
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-vector-square"></i> Análisis sobre el mapa';
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 12px; color: var(--text-secondary);">Medición realizada directamente sobre la cartografía visible.</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Área</div>
                <div style="font-weight:700; color:var(--primary);">${formatObjectArea(area)}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Perímetro</div>
                <div style="font-weight:700; color:var(--primary);">${formatObjectDistance(perimeter)}</div>
            </div>
        </div>
        <div style="margin-top: 12px; background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Elevación aprox.</div>
            <div style="font-weight:700; color:var(--primary);">${elevationText}</div>
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary);">La elevación se calcula en el centro del polígono dibujado.</div>
        <button id="btn-object-analysis-new" type="button" style="margin-top:16px; width:100%; border:none; border-radius:10px; padding:12px 14px; background:var(--primary); color:#fff; font-weight:700; cursor:pointer;">Nueva medición</button>
    `;
    document.getElementById('feature-modal').classList.add('visible');

    const newBtn = document.getElementById('btn-object-analysis-new');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            document.getElementById('feature-modal').classList.remove('visible');
            startObjectAnalysisDraw();
        });
    }
}

function startObjectAnalysisDraw() {
    clearMeasureInteraction();
    setProfileMode(false);
    setTerrain3DMode(false);

    ensureObjectAnalysisLayer();
    clearObjectAnalysisGeometry();
    stopObjectAnalysisDrawing();
    setObjectAnalysisMode(true);

    objectAnalysisDraw = new ol.interaction.Draw({
        source: objectAnalysisSource,
        type: 'Polygon',
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.18)' }),
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.5, lineDash: [10, 8] }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        })
    });

    map.addInteraction(objectAnalysisDraw);
    showToast('Dibuja un polígono sobre el mapa para obtener área, perímetro y elevación', 'success');

    objectAnalysisDraw.once('drawend', async (e) => {
        stopObjectAnalysisDrawing();

        const geometry = e.feature.getGeometry();
        const area = ol.sphere.getArea(geometry);
        const perimeter = ol.sphere.getLength(geometry);
        const centerCoordinate = getAnalysisPolygonCenter(geometry);
        let elevationText = 'No disponible';

        if (centerCoordinate) {
            try {
                elevationText = await getElevationText(centerCoordinate);
            } catch (err) {
                console.warn('No fue posible resolver la elevación', err);
            }
        }

        showObjectAnalysisResult(area, perimeter, elevationText);
    });
}

function toggleObjectAnalysisMode() {
    if (objectAnalysisActive) {
        setObjectAnalysisMode(false);
        showToast('Análisis sobre mapa desactivado', 'success');
        return;
    }

    startObjectAnalysisDraw();
}


function parseElevationArray(data) {
    // Open-Meteo format: { elevation: [v1, v2, ...] }
    if (Array.isArray(data?.elevation)) {
        return data.elevation.map(v => {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        });
    }
    // Fallback: opentopodata / open-elevation format
    const rows = Array.isArray(data?.results) ? data.results : (Array.isArray(data?.data) ? data.data : []);
    return rows.map(item => {
        const rawValue = item?.elevation ?? item?.elevation_m ?? item?.value;
        const numericValue = Number(rawValue);
        return Number.isFinite(numericValue) ? numericValue : null;
    });
}

async function fetchElevationSeries(lonLatList, chunkSize = 90) {
    if (!Array.isArray(lonLatList) || !lonLatList.length) return [];

    const results = new Array(lonLatList.length).fill(null);
    for (let start = 0; start < lonLatList.length; start += chunkSize) {
        const chunk = lonLatList.slice(start, start + chunkSize);
        const lats = chunk.map(p => Number(p[1]).toFixed(6)).join(',');
        const lons = chunk.map(p => Number(p[0]).toFixed(6)).join(',');
        const url = `https://api.open-meteo.com/v1/elevation?latitude=${encodeURIComponent(lats)}&longitude=${encodeURIComponent(lons)}`;

        try {
            const data = await fetchElevationFromUrl(url, 10000);
            const parsed = parseElevationArray(data);
            for (let i = 0; i < chunk.length; i++) {
                results[start + i] = parsed[i] ?? null;
            }
        } catch (err) {
            console.warn('Serie de elevación no disponible desde Open-Meteo', err);
        }
    }
    return results;
}

function formatElevationValue(value) {
    if (!Number.isFinite(value)) return 'No disponible';
    return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} msnm`;
}

function sampleLineForProfile(geometry) {
    const totalLengthMeters = ol.sphere.getLength(geometry);
    const segments = Math.max(12, Math.min(90, Math.ceil(totalLengthMeters / 120)));
    const coords3857 = [];
    const distancesKm = [];
    const lonLat = [];

    for (let i = 0; i <= segments; i += 1) {
        const fraction = i / segments;
        const coord3857 = geometry.getCoordinateAt(fraction);
        coords3857.push(coord3857);
        distancesKm.push((totalLengthMeters * fraction) / 1000);
        lonLat.push(ol.proj.toLonLat(coord3857));
    }

    return { totalLengthMeters, coords3857, distancesKm, lonLat };
}

function getLineSummaryStats(elevations) {
    const clean = elevations.filter(Number.isFinite);
    if (!clean.length) {
        return { min: null, max: null, gain: null, loss: null };
    }
    let gain = 0;
    let loss = 0;
    for (let i = 1; i < elevations.length; i += 1) {
        const prev = elevations[i - 1];
        const next = elevations[i];
        if (!Number.isFinite(prev) || !Number.isFinite(next)) continue;
        const delta = next - prev;
        if (delta > 0) gain += delta;
        if (delta < 0) loss += Math.abs(delta);
    }
    return {
        min: Math.min(...clean),
        max: Math.max(...clean),
        gain,
        loss
    };
}

function getProfileDirectionAngle(geometry, fraction) {
    const prevFraction = Math.max(0, fraction - 0.012);
    const nextFraction = Math.min(1, fraction + 0.012);
    const start = geometry.getCoordinateAt(prevFraction);
    const end = geometry.getCoordinateAt(nextFraction);
    if (!start || !end) return 0;
    return Math.atan2(end[1] - start[1], end[0] - start[0]);
}

function getProfileDrawSketchStyle() {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.5, lineDash: [10, 8], lineCap: 'round', lineJoin: 'round' }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({ color: '#931D3D' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
        })
    });
}

function getProfileAnimatedStyles(feature) {
    const styles = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({ color: 'rgba(147, 29, 61, 0.18)', width: 7, lineCap: 'round', lineJoin: 'round' })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.8, lineCap: 'round', lineJoin: 'round' }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,0.90)',
                width: 1.8,
                lineDash: [14, 10],
                lineDashOffset: profileDashOffset,
                lineCap: 'round',
                lineJoin: 'round'
            })
        })
    ];

    const geometry = feature?.getGeometry ? feature.getGeometry() : null;
    if (!geometry || geometry.getType() !== 'LineString') {
        return styles;
    }

    const coords = geometry.getCoordinates();
    if (!Array.isArray(coords) || coords.length < 2) {
        return styles;
    }

    const length = geometry.getLength ? geometry.getLength() : 0;
    if (!Number.isFinite(length) || length <= 0) {
        return styles;
    }

    if (!profileDirectionalFlowActive) {
        return styles;
    }

    const markerFractions = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
    markerFractions.forEach((offset, index) => {
        const fraction = (profileMotionPhase + offset) % 1;
        const coordinate = geometry.getCoordinateAt(fraction);
        if (!coordinate) return;
        const angle = getProfileDirectionAngle(geometry, fraction);

        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(coordinate),
            image: new ol.style.RegularShape({
                points: 3,
                radius: Math.max(6, 9 - index * 0.5),
                rotation: angle + (Math.PI / 2),
                angle: 0,
                fill: new ol.style.Fill({ color: index === 0 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.72)' }),
                stroke: new ol.style.Stroke({ color: '#931D3D', width: index === 0 ? 2.3 : 1.4 })
            })
        }));
    });

    const pulseFractions = [0, 0.08, 0.16];
    pulseFractions.forEach((offset, index) => {
        const fraction = (profileMotionPhase + offset) % 1;
        const coordinate = geometry.getCoordinateAt(fraction);
        if (!coordinate) return;
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(coordinate),
            image: new ol.style.Circle({
                radius: Math.max(4, 7 - index),
                fill: new ol.style.Fill({ color: index === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(147,29,61,0.18)' }),
                stroke: new ol.style.Stroke({ color: 'rgba(147,29,61,0.28)', width: 1 })
            })
        }));
    });

    return styles;
}

function startProfileLineAnimation() {
    if (profileAnimationFrame) return;
    const animate = () => {
        profileDashOffset = (profileDashOffset - (profileDirectionalFlowActive ? 0.45 : 0.16)) % 24;
        profileMotionPhase = (profileMotionPhase + (profileDirectionalFlowActive ? 0.0035 : 0.0012)) % 1;
        if (profileAnalysisLayer) profileAnalysisLayer.changed();
        if (map) map.render();
        profileAnimationFrame = requestAnimationFrame(animate);
    };
    profileAnimationFrame = requestAnimationFrame(animate);
}

function stopProfileLineAnimation() {
    if (profileAnimationFrame) {
        cancelAnimationFrame(profileAnimationFrame);
        profileAnimationFrame = null;
    }
}

function ensureProfileLayer() {
    if (profileAnalysisLayer) return;
    profileAnalysisSource = new ol.source.Vector();
    profileAnalysisLayer = new ol.layer.Vector({
        source: profileAnalysisSource,
        style: (feature) => getProfileAnimatedStyles(feature)
    });
    map.addLayer(profileAnalysisLayer);
}

function stopProfileDrawing() {
    if (profileAnalysisDraw) {
        map.removeInteraction(profileAnalysisDraw);
        profileAnalysisDraw = null;
    }
}

function clearProfileGeometry() {
    profileDirectionalFlowActive = false;
    profileMotionPhase = 0;
    if (profileAnalysisSource) {
        profileAnalysisSource.clear();
    }
}

function setProfileMode(active) {
    profileAnalysisActive = !!active;
    document.getElementById('btn-elevation-profile').classList.toggle('active', profileAnalysisActive);
    if (profileAnalysisActive) {
        startProfileLineAnimation();
    } else {
        profileDirectionalFlowActive = false;
        stopProfileLineAnimation();
        stopProfileDrawing();
        clearProfileGeometry();
    }
}

function showElevationProfileResult(distancesKm, elevations) {
    const stats = getLineSummaryStats(elevations);
    lastElevationProfileData = {
        distancesKm: Array.isArray(distancesKm) ? distancesKm.slice() : [],
        elevations: Array.isArray(elevations) ? elevations.slice() : [],
        stats
    };
    setFeatureModalWide(true);
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-chart-line"></i> Perfil de elevación';
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 12px; color: var(--text-secondary);">Perfil calculado a partir de puntos muestreados sobre la línea dibujada.</div>
        <div style="display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;">
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Elevación mínima</div>
                <div style="font-weight:700; color:var(--primary);">${formatElevationValue(stats.min)}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Elevación máxima</div>
                <div style="font-weight:700; color:var(--primary);">${formatElevationValue(stats.max)}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Subida acumulada</div>
                <div style="font-weight:700; color:var(--primary);">${stats.gain == null ? 'No disponible' : `${stats.gain.toFixed(0)} m`}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Bajada acumulada</div>
                <div style="font-weight:700; color:var(--primary);">${stats.loss == null ? 'No disponible' : `${stats.loss.toFixed(0)} m`}</div>
            </div>
        </div>
        <div id="elevation-profile-chart" style="height:360px; width:100%;"></div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary);">Las subidas y bajadas se estiman con los puntos de muestreo de la línea dibujada.</div>
        <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top:16px;">
            <button id="btn-profile-export" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:#1D6F42; color:#fff; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fas fa-file-excel"></i> Exportar Excel</button>
            <button id="btn-profile-clear" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:#6c757d; color:#fff; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fas fa-eraser"></i> Limpiar</button>
            <button id="btn-profile-new" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:var(--primary); color:#fff; font-weight:700; cursor:pointer;">Nueva línea</button>
        </div>
    `;
    document.getElementById('feature-modal').classList.add('visible');

    if (window.Plotly) {
        requestAnimationFrame(() => {
            Plotly.newPlot('elevation-profile-chart', [{
                x: distancesKm,
                y: elevations,
                mode: 'lines',
                connectgaps: true,
                hovertemplate: 'Distancia: %{x:.2f} km<br>Elevación: %{y:.0f} msnm<extra></extra>'
            }], {
                margin: { l: 50, r: 20, t: 10, b: 45 },
                xaxis: { title: 'Distancia (km)' },
                yaxis: { title: 'Elevación (msnm)' },
                paper_bgcolor: '#ffffff',
                plot_bgcolor: '#ffffff'
            }, {
                responsive: true,
                displayModeBar: false
            });
        });
    } else {
        const holder = document.getElementById('elevation-profile-chart');
        if (holder) holder.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary);">No se pudo cargar la gráfica.</div>';
    }

    document.getElementById('btn-profile-export')?.addEventListener('click', exportElevationProfileToExcel);
    document.getElementById('btn-profile-clear')?.addEventListener('click', clearElevationProfileResult);
    document.getElementById('btn-profile-new')?.addEventListener('click', () => {
        document.getElementById('feature-modal').classList.remove('visible');
        startElevationProfileDraw();
    });
}

function escapeXmlForExcel(value) {
    return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function excelColumnName(index) {
    let result = '';
    let current = index;
    while (current > 0) {
        const remainder = (current - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        current = Math.floor((current - 1) / 26);
    }
    return result;
}

function buildExcelCell(ref, value, styleId = null) {
    const styleAttr = styleId == null ? '' : ` s="${styleId}"`;
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${ref}"${styleAttr}><v>${value}</v></c>`;
    }
    return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXmlForExcel(value)}</t></is></c>`;
}

function buildExcelRow(rowIndex, values, styleMap = {}) {
    const cells = values.map((value, idx) => buildExcelCell(`${excelColumnName(idx + 1)}${rowIndex}`, value, styleMap[idx] ?? null)).join('');
    return `<row r="${rowIndex}">${cells}</row>`;
}

function getProfileExcelSheetXml(rows, includeDrawing) {
    const drawingTag = includeDrawing ? '<drawing r:id="rId1"/>' : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:D${rows.length + 35}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="20" customWidth="1"/>
    <col min="2" max="2" width="18" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="4" width="18" customWidth="1"/>
  </cols>
  <sheetData>
    ${rows.join('')}
  </sheetData>
  ${drawingTag}
</worksheet>`;
}

function getProfileExcelStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF931D3D"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function getProfileExcelDrawingXml(imageWidthPx = 1200, imageHeightPx = 500) {
    const emuPerPixel = 9525;
    const widthEmu = Math.round(imageWidthPx * emuPerPixel);
    const heightEmu = Math.round(imageHeightPx * emuPerPixel);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>9</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>8</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>28</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:pic>
      <xdr:nvPicPr>
<xdr:cNvPr id="2" name="GraficaPerfilElevacion"/>
<xdr:cNvPicPr/>
      </xdr:nvPicPr>
      <xdr:blipFill>
<a:blip r:embed="rId1"/>
<a:stretch><a:fillRect/></a:stretch>
      </xdr:blipFill>
      <xdr:spPr>
<a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:twoCellAnchor>
</xdr:wsDr>`;
}

async function exportElevationProfileToExcel() {
    if (!lastElevationProfileData || !lastElevationProfileData.distancesKm?.length || !lastElevationProfileData.elevations?.length) {
        showToast('No hay información del perfil para exportar', 'error');
        return;
    }

    if (!window.JSZip) {
        showToast('No se pudo cargar el exportador de Excel', 'error');
        return;
    }

    const stats = lastElevationProfileData.stats || getLineSummaryStats(lastElevationProfileData.elevations);
    const rows = lastElevationProfileData.distancesKm.map((distance, index) => ({
        punto: index + 1,
        distanciaKm: Number(distance),
        elevacionMsnm: Number(lastElevationProfileData.elevations[index])
    }));

    const chartHolder = document.getElementById('elevation-profile-chart');
    let chartDataUrl = null;
    if (window.Plotly && chartHolder) {
        try {
            chartDataUrl = await Plotly.toImage(chartHolder, { format: 'png', width: 1200, height: 500, scale: 1 });
        } catch (error) {
            console.warn('No se pudo exportar la gráfica del perfil', error);
        }
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `Atlas_Celaya_Perfil_de_Elevacion_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.xlsx`;

    const excelRows = [
        buildExcelRow(1, ['Perfil de elevación'], { 0: 1 }),
        buildExcelRow(2, ['Exportación del análisis generado en el visor.']),
        buildExcelRow(4, ['Resumen', 'Valor'], { 0: 1, 1: 1 }),
        buildExcelRow(5, ['Elevación mínima', formatElevationValue(stats.min)], { 0: 2, 1: 2 }),
        buildExcelRow(6, ['Elevación máxima', formatElevationValue(stats.max)], { 0: 2, 1: 2 }),
        buildExcelRow(7, ['Subida acumulada', stats.gain == null ? 'No disponible' : `${stats.gain.toFixed(0)} m`], { 0: 2, 1: 2 }),
        buildExcelRow(8, ['Bajada acumulada', stats.loss == null ? 'No disponible' : `${stats.loss.toFixed(0)} m`], { 0: 2, 1: 2 }),
        buildExcelRow(30, ['Gráfica del perfil'], { 0: 1 }),
        buildExcelRow(32, ['Muestras del perfil'], { 0: 1 }),
        buildExcelRow(33, ['Punto', 'Distancia (km)', 'Elevación (msnm)'], { 0: 1, 1: 1, 2: 1 })
    ];

    rows.forEach((row, idx) => {
        excelRows.push(buildExcelRow(34 + idx, [row.punto, row.distanciaKm, row.elevacionMsnm], { 0: 2, 1: 2, 2: 2 }));
    });

    const zip = new JSZip();
    const contentTypes = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '  <Default Extension="xml" ContentType="application/xml"/>',
        '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
        '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
    ];
    if (chartDataUrl) {
        contentTypes.push('  <Default Extension="png" ContentType="image/png"/>');
        contentTypes.push('  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>');
    }
    contentTypes.push('</Types>');
    zip.file('[Content_Types].xml', contentTypes.join('\n'));

    zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`);
    zip.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Perfil de elevación</dc:title>
  <dc:creator>Atlas Municipal</dc:creator>
  <cp:lastModifiedBy>Atlas Municipal</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now.toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now.toISOString()}</dcterms:modified>
</cp:coreProperties>`);
    zip.folder('docProps').file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Atlas Municipal</Application>
</Properties>`);

    const xl = zip.folder('xl');
    xl.file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Perfil" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);
    xl.folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
    xl.file('styles.xml', getProfileExcelStylesXml());
    xl.folder('worksheets').file('sheet1.xml', getProfileExcelSheetXml(excelRows, !!chartDataUrl));

    if (chartDataUrl) {
        const imageBase64 = chartDataUrl.split(',')[1];
        xl.folder('worksheets').folder('_rels').file('sheet1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`);
        xl.folder('drawings').file('drawing1.xml', getProfileExcelDrawingXml());
        xl.folder('drawings').folder('_rels').file('drawing1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/profile_chart.png"/>
</Relationships>`);
        xl.folder('media').file('profile_chart.png', imageBase64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(chartDataUrl ? 'Excel exportado con gráfica' : 'Excel exportado sin gráfica', chartDataUrl ? 'success' : 'warning');
}

function clearElevationProfileResult() {
    document.getElementById('feature-modal').classList.remove('visible');
    stopProfileDrawing();
    clearProfileGeometry();
    lastElevationProfileData = null;
    setProfileMode(false);
    showToast('Perfil limpiado', 'success');
}

function attachElevationProfileDrawInteraction() {
    stopProfileDrawing();

    profileAnalysisDraw = new ol.interaction.Draw({
        source: profileAnalysisSource,
        type: 'LineString',
        style: getProfileDrawSketchStyle()
    });

    map.addInteraction(profileAnalysisDraw);

    profileAnalysisDraw.once('drawend', async (e) => {
        stopProfileDrawing();
        profileMotionPhase = 0;
        profileDirectionalFlowActive = true;
        if (profileAnalysisLayer) profileAnalysisLayer.changed();
        if (map) map.render();

        const geometry = e.feature.getGeometry();
        const sample = sampleLineForProfile(geometry);
        showToast('Calculando perfil de elevación...', 'success');
        const elevations = await fetchElevationSeries(sample.lonLat);
        showElevationProfileResult(sample.distancesKm, elevations);
    });
}

async function startElevationProfileDraw() {
    clearMeasureInteraction();
    setObjectAnalysisMode(false);
    setTerrain3DMode(false);

    ensureProfileLayer();
    clearProfileGeometry();
    stopProfileDrawing();
    profileDirectionalFlowActive = false;
    profileMotionPhase = 0;
    setProfileMode(true);

    attachElevationProfileDrawInteraction();
    showToast('Traza una línea en el mapa para ver cómo cambia la altura del terreno a lo largo del recorrido.', 'success');
}

function toggleElevationProfileMode() {
    if (profileAnalysisActive) {
        setProfileMode(false);
        showToast('Perfil de elevación desactivado', 'success');
        return;
    }
    startElevationProfileDraw();
}

function suspendElevationProfileForPrint() {
    profileModeBeforePrint = !!profileAnalysisActive;
    profileHadDrawBeforePrint = !!profileAnalysisDraw;
    stopProfileDrawing();
    profileAnalysisActive = false;
    document.getElementById('btn-elevation-profile')?.classList.remove('active');
}

function restoreElevationProfileAfterPrint() {
    if (!profileModeBeforePrint) return;
    profileModeBeforePrint = false;
    profileAnalysisActive = true;
    document.getElementById('btn-elevation-profile')?.classList.add('active');
    if (profileHadDrawBeforePrint) {
        profileHadDrawBeforePrint = false;
        attachElevationProfileDrawInteraction();
        showToast('Perfil de elevación reactivado', 'success');
        return;
    }
    profileHadDrawBeforePrint = false;
}

window.AtlasElevationProfile = Object.assign(window.AtlasElevationProfile || {}, {
    suspendForPrint: suspendElevationProfileForPrint,
    restoreAfterPrint: restoreElevationProfileAfterPrint
});

function ensureTerrain3DLayer() {
    if (terrain3DLayer) return;
    terrain3DSource = new ol.source.Vector();
    terrain3DLayer = new ol.layer.Vector({
        source: terrain3DSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.12)' }),
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.5, lineDash: [8, 6] }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        })
    });
    map.addLayer(terrain3DLayer);
}

function stopTerrain3DDrawing() {
    if (terrain3DDraw) {
        map.removeInteraction(terrain3DDraw);
        terrain3DDraw = null;
    }
}

function clearTerrain3DGeometry() {
    if (terrain3DSource) {
        terrain3DSource.clear();
    }
}

function setTerrain3DMode(active) {
    terrain3DActive = !!active;
    document.getElementById('btn-terrain-3d').classList.toggle('active', terrain3DActive);
    if (!terrain3DActive) {
        stopTerrain3DDrawing();
        clearTerrain3DGeometry();
    }
}

function buildTerrainGridFromPolygon(geometry) {
    const extent = geometry.getExtent();
    const width = extent[2] - extent[0];
    const height = extent[3] - extent[1];
    const cols = Math.max(10, Math.min(18, Math.round(width / 180)));
    const rows = Math.max(10, Math.min(18, Math.round(height / 180)));
    const xValues = [];
    const yValues = [];
    const zValues = [];
    const samplePoints = [];
    const sampleMap = [];

    for (let col = 0; col < cols; col += 1) {
        const fracX = cols === 1 ? 0 : col / (cols - 1);
        xValues.push((width * fracX) / 1000);
    }

    for (let row = 0; row < rows; row += 1) {
        const fracY = rows === 1 ? 0 : row / (rows - 1);
        yValues.push((height * fracY) / 1000);
    }

    for (let row = 0; row < rows; row += 1) {
        const currentRow = [];
        const fracY = rows === 1 ? 0 : row / (rows - 1);
        const y = extent[3] - (height * fracY);
        for (let col = 0; col < cols; col += 1) {
            const fracX = cols === 1 ? 0 : col / (cols - 1);
            const x = extent[0] + (width * fracX);
            const coord = [x, y];
            if (geometry.intersectsCoordinate(coord)) {
                const lonLat = ol.proj.toLonLat(coord);
                samplePoints.push(lonLat);
                sampleMap.push({ row, col });
                currentRow.push(null);
            } else {
                currentRow.push(null);
            }
        }
        zValues.push(currentRow);
    }

    return { xValues, yValues, zValues, samplePoints, sampleMap };
}

function showTerrain3DResult(grid) {
    const flatValues = grid.zValues.flat().filter(Number.isFinite);
    const minValue = flatValues.length ? Math.min(...flatValues) : null;
    const maxValue = flatValues.length ? Math.max(...flatValues) : null;
    const rangeValue = flatValues.length ? maxValue - minValue : null;

    lastTerrain3DData = {
        ...grid,
        minValue,
        maxValue,
        rangeValue
    };

    setFeatureModalWide(true);
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-cube"></i> Vista 3D básica del terreno';
    document.getElementById('modal-body').innerHTML = `
        <div style="margin-bottom: 12px; color: var(--text-secondary);">Superficie 3D aproximada construida con puntos de elevación muestreados dentro del polígono dibujado.</div>
        <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;">
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Elevación mínima</div>
                <div style="font-weight:700; color:var(--primary);">${formatElevationValue(minValue)}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Elevación máxima</div>
                <div style="font-weight:700; color:var(--primary);">${formatElevationValue(maxValue)}</div>
            </div>
            <div style="background:#f8f5f6; border:1px solid rgba(147,29,61,0.12); border-radius:10px; padding:12px;">
                <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Rango altimétrico</div>
                <div style="font-weight:700; color:var(--primary);">${rangeValue == null ? 'No disponible' : `${rangeValue.toFixed(0)} m`}</div>
            </div>
        </div>
        <div id="terrain-3d-chart" style="height:360px; width:100%;"></div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary);">Es una vista 3D básica del relieve, no un motor 3D completo.</div>
        <div style="position:sticky; bottom:-20px; background:linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,1) 18%); padding-top:14px; padding-bottom:2px; margin-top:16px;">
            <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px;">
                <button id="btn-terrain-export" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:#1D6F42; color:#fff; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fas fa-file-excel"></i> Exportar Excel</button>
                <button id="btn-terrain-clear" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:#6c757d; color:#fff; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><i class="fas fa-eraser"></i> Limpiar</button>
                <button id="btn-terrain-new" type="button" style="border:none; border-radius:10px; padding:12px 14px; background:var(--primary); color:#fff; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">Nuevo polígono</button>
            </div>
        </div>
    `;
    document.getElementById('feature-modal').classList.add('visible');

    if (window.Plotly) {
        requestAnimationFrame(() => {
            Plotly.newPlot('terrain-3d-chart', [{
                type: 'surface',
                x: grid.xValues,
                y: grid.yValues,
                z: grid.zValues,
                hovertemplate: 'X: %{x:.2f} km<br>Y: %{y:.2f} km<br>Elevación: %{z:.0f} msnm<extra></extra>'
            }], {
                margin: { l: 0, r: 0, t: 10, b: 0 },
                scene: {
                    xaxis: { title: 'Este-Oeste (km)' },
                    yaxis: { title: 'Norte-Sur (km)' },
                    zaxis: { title: 'Elevación (msnm)' },
                    camera: { eye: { x: 1.4, y: 1.2, z: 0.85 } }
                },
                paper_bgcolor: '#ffffff'
            }, {
                responsive: true,
                displayModeBar: false
            });
        });
    } else {
        const holder = document.getElementById('terrain-3d-chart');
        if (holder) holder.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-secondary);">No se pudo cargar la vista 3D.</div>';
    }

    document.getElementById('btn-terrain-export')?.addEventListener('click', exportTerrain3DToExcel);
    document.getElementById('btn-terrain-clear')?.addEventListener('click', clearTerrain3DResult);
    document.getElementById('btn-terrain-new')?.addEventListener('click', () => {
        document.getElementById('feature-modal').classList.remove('visible');
        startTerrain3DDraw();
    });
}


async function exportTerrain3DToExcel() {
    if (!lastTerrain3DData || !lastTerrain3DData.samplePoints?.length) {
        showToast('No hay información de la vista 3D para exportar', 'error');
        return;
    }

    if (!window.JSZip) {
        showToast('No se pudo cargar el exportador de Excel', 'error');
        return;
    }

    const chartHolder = document.getElementById('terrain-3d-chart');
    let chartDataUrl = null;
    if (window.Plotly && chartHolder) {
        try {
            chartDataUrl = await Plotly.toImage(chartHolder, { format: 'png', width: 1200, height: 700, scale: 1 });
        } catch (error) {
            console.warn('No se pudo exportar la gráfica 3D', error);
        }
    }

    const sampleRows = lastTerrain3DData.sampleMap.map((cell, index) => ({
        punto: index + 1,
        longitud: Number(lastTerrain3DData.samplePoints[index]?.[0]),
        latitud: Number(lastTerrain3DData.samplePoints[index]?.[1]),
        elevacionMsnm: Number(lastTerrain3DData.zValues[cell.row]?.[cell.col])
    })).filter((row) => Number.isFinite(row.elevacionMsnm));

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `Atlas_Celaya_Vista_3D_del_Terreno_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.xlsx`;

    const excelRows = [
        buildExcelRow(1, ['Vista 3D básica del terreno'], { 0: 1 }),
        buildExcelRow(2, ['Exportación del análisis generado en el visor.']),
        buildExcelRow(4, ['Resumen', 'Valor'], { 0: 1, 1: 1 }),
        buildExcelRow(5, ['Elevación mínima', formatElevationValue(lastTerrain3DData.minValue)], { 0: 2, 1: 2 }),
        buildExcelRow(6, ['Elevación máxima', formatElevationValue(lastTerrain3DData.maxValue)], { 0: 2, 1: 2 }),
        buildExcelRow(7, ['Rango altimétrico', lastTerrain3DData.rangeValue == null ? 'No disponible' : `${lastTerrain3DData.rangeValue.toFixed(0)} m`], { 0: 2, 1: 2 }),
        buildExcelRow(30, ['Gráfica 3D del terreno'], { 0: 1 }),
        buildExcelRow(32, ['Puntos muestreados'], { 0: 1 }),
        buildExcelRow(33, ['Punto', 'Longitud', 'Latitud', 'Elevación (msnm)'], { 0: 1, 1: 1, 2: 1, 3: 1 })
    ];

    sampleRows.forEach((row, idx) => {
        excelRows.push(buildExcelRow(34 + idx, [row.punto, row.longitud, row.latitud, row.elevacionMsnm], { 0: 2, 1: 2, 2: 2, 3: 2 }));
    });

    const zip = new JSZip();
    const contentTypes = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '  <Default Extension="xml" ContentType="application/xml"/>',
        '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
        '  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
        '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
    ];
    if (chartDataUrl) {
        contentTypes.push('  <Default Extension="png" ContentType="image/png"/>');
        contentTypes.push('  <Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>');
    }
    contentTypes.push('</Types>');

    zip.file('[Content_Types].xml', contentTypes.join('\n'));
    zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`);

    zip.folder('docProps').file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Aerogott Tech®</Application>
</Properties>`);
    zip.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Aerogott Tech®</dc:creator>
  <cp:lastModifiedBy>Aerogott Tech®</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`);

    const xl = zip.folder('xl');
    xl.file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Vista 3D" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);
    xl.folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);
    xl.file('styles.xml', getProfileExcelStylesXml());
    xl.folder('worksheets').file('sheet1.xml', getProfileExcelSheetXml(excelRows, !!chartDataUrl));

    if (chartDataUrl) {
        xl.folder('worksheets').folder('_rels').file('sheet1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`);
        xl.folder('drawings').file('drawing1.xml', getProfileExcelDrawingXml(1200, 700));
        xl.folder('drawings').folder('_rels').file('drawing1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/terrain3d.png"/>
</Relationships>`);
        xl.folder('media').file('terrain3d.png', chartDataUrl.split(',')[1], { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(chartDataUrl ? 'Excel 3D exportado con gráfica' : 'Excel 3D exportado sin gráfica', chartDataUrl ? 'success' : 'warning');
}

function clearTerrain3DResult() {
    document.getElementById('feature-modal').classList.remove('visible');
    stopTerrain3DDrawing();
    clearTerrain3DGeometry();
    lastTerrain3DData = null;
    setTerrain3DMode(false);
    showToast('Vista 3D limpiada', 'success');
}

async function startTerrain3DDraw() {
    clearMeasureInteraction();
    setObjectAnalysisMode(false);
    setProfileMode(false);

    ensureTerrain3DLayer();
    clearTerrain3DGeometry();
    stopTerrain3DDrawing();
    lastTerrain3DData = null;
    setTerrain3DMode(true);

    terrain3DDraw = new ol.interaction.Draw({
        source: terrain3DSource,
        type: 'Polygon',
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: 'rgba(147, 29, 61, 0.12)' }),
            stroke: new ol.style.Stroke({ color: '#931D3D', width: 2.5, lineDash: [10, 8] }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({ color: '#931D3D' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 1.5 })
            })
        })
    });

    map.addInteraction(terrain3DDraw);
    showToast('Dibuja un polígono para generar una vista 3D básica del relieve', 'success');

    terrain3DDraw.once('drawend', async (e) => {
        stopTerrain3DDrawing();
        const geometry = e.feature.getGeometry();
        const grid = buildTerrainGridFromPolygon(geometry);
        if (!grid.samplePoints.length) {
            showToast('No se pudieron obtener puntos válidos para la vista 3D', 'error');
            return;
        }

        showToast('Calculando superficie 3D...', 'success');
        const elevations = await fetchElevationSeries(grid.samplePoints, 35);
        grid.sampleMap.forEach((cell, idx) => {
            grid.zValues[cell.row][cell.col] = elevations[idx];
        });
        showTerrain3DResult(grid);
    });
}

function toggleTerrain3DMode() {
    if (terrain3DActive) {
        setTerrain3DMode(false);
        showToast('Vista 3D básica desactivada', 'success');
        return;
    }
    startTerrain3DDraw();
}

// ========================================
// MEASURE TOOLS
// ========================================
function toggleMeasure(type) {
    setObjectAnalysisMode(false);
    setProfileMode(false);
    setTerrain3DMode(false);

    const btn = document.getElementById(type === 'distance' ? 'btn-measure-distance' : 'btn-measure-area');
    const isTogglingOff = btn?.classList.contains('was-active');

    if (measureDraw) {
        map.removeInteraction(measureDraw);
        measureDraw = null;
    }

    stopMeasureLineAnimation();
    resetMeasureButtonsState();

    if (isTogglingOff) {
        currentMeasureMode = null;
        measureModeBeforePrint = null;
        if (measureSource) {
            measureSource.clear();
        }
        return;
    }

    ensureMeasureLayer();

    if (measureSource) {
        measureSource.clear();
    }

    measureDraw = buildMeasureDrawInteraction(type);
    map.addInteraction(measureDraw);
    currentMeasureMode = type;
    measureModeBeforePrint = null;
    setMeasureButtonsActive(type);

    if (type === 'distance') {
        showToast('Clic para medir · doble clic para terminar · clic en la regla para salir', 'success');
    } else {
        showToast('Clic para dibujar · doble clic para terminar · clic en área y perímetro para salir', 'success');
    }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} visible`;
    
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', initMap);
