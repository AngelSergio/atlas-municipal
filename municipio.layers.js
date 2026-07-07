/**
 * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.
 * No editar a mano: usar https://<host>/atlas-apaseo-gde/admin/
 * Fuente: admin/data/catalog.json   |   Regenerado: 2026-07-07T20:58:43+00:00
 */
window.MUNICIPIO_LAYERS = {
    "extents": {
        "limite_municipal": [
            -11217092.9685,
            2328133.4185,
            -11185615.2763,
            2358316.6365
        ],
        "guanajuato": [
            -11365389.64496024,
            2262697.847432676,
            -11095358.654396243,
            2492256.177443656
        ],
        "localidades": [
            -11216862.295533799,
            2329684.029902734,
            -11185851.393960528,
            2356601.0394009617
        ],
        "colonias_apaseo": [
            -11210298.372325286,
            2329693.4362538564,
            -11193679.395487286,
            2344504.4344541943
        ],
        "agebs_rurales": [
            -11217092.968529863,
            2328133.4185421593,
            -11185615.276285773,
            2358316.636473352
        ],
        "agebs_urbanos": [
            -11210359.374547314,
            2329684.029902734,
            -11185851.393960528,
            2344508.2888988256
        ],
        "calles_apaseo": [
            -11216862.295641294,
            2329684.0297227846,
            -11185851.39406919,
            2356601.039219044
        ],
        "red_vial_apaseo": [
            -11217092.339603703,
            2328149.475276915,
            -11185615.549284955,
            2356341.091403779
        ],
        "red_hidrografica": [
            -11215432.120010009,
            2305482.183210761,
            -11140517.945087604,
            2383724.635410001
        ],
        "limites_colonias": [
            -11216862.295533799,
            2329326.1058907732,
            -11185851.393960528,
            2356601.0394009617
        ],
        "zonas_inundacion_pluvial_apaseo": [
            -11208366.218482355,
            2338183.156891668,
            -11199781.698328704,
            2352814.5194257703
        ],
        "zonas_inundacion_fluvial_apaseo": [
            -11211811.55166267,
            2336214.1683035195,
            -11189026.655465532,
            2352807.359573696
        ],
        "puntos_de_riesgo_de_inundacion_cepc_cmpc_2026": [
            -11356480.49228996,
            2270235.3924478125,
            -11100556.982910873,
            2473208.394414112
        ],
        "caminos": [
            -11218905.908091355,
            2325792.3370610727,
            -11186057.22364267,
            2359949.6096555707
        ],
        "escuelas": [
            -11216943.182850456,
            2328195.1217681197,
            -11186803.987063395,
            2358193.0449959487
        ],
        "sierra_de_los_agustino": [
            -11215437.205247167,
            2326157.8525215313,
            -11185652.672412163,
            2358301.2894429476
        ],
        "carreteras": [
            -11220478.8915934,
            2317408.6832784135,
            -11179054.422228802,
            2362093.6020532576
        ],
        "manzanas_geoestadisticas": [
            -11207620.373327425,
            2338882.813919044,
            -11187666.528680714,
            2339479.057543071
        ]
    },
    "groups": [
        {
            "id": "temas",
            "name": "TEMAS",
            "icon": "fa-folder-open",
            "iconExpanded": "fa-folder-open",
            "iconCollapsed": "fa-folder",
            "expanded": true,
            "children": [
                {
                    "id": "medio-sociodemografico",
                    "name": "Base Territorial",
                    "icon": "fa-earth-americas",
                    "expanded": true,
                    "layers": [
                        {
                            "name": "Hidrografía",
                            "layer": "red_hidrografica",
                            "visible": false,
                            "styleType": "line",
                            "color": "#1fbfbf",
                            "width": 2
                        },
                        {
                            "name": "AGEBS Rurales",
                            "layer": "agebs_rurales",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#008080",
                            "width": 2
                        },
                        {
                            "name": "AGEBS Urbanos",
                            "layer": "agebs_urbanos",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#2020c0",
                            "width": 2
                        },
                        {
                            "name": "Calles y Avenidas",
                            "layer": "calles_apaseo",
                            "visible": false,
                            "styleType": "line",
                            "color": "#bf0000",
                            "width": 2
                        },
                        {
                            "name": "Red Vial",
                            "layer": "red_vial_apaseo",
                            "visible": false,
                            "styleType": "line",
                            "color": "#bf00bf",
                            "width": 2
                        },
                        {
                            "name": "Localidades",
                            "layer": "localidades",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#007f00",
                            "width": 2
                        },
                        {
                            "name": "Colonias",
                            "layer": "colonias_apaseo",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#800080",
                            "width": 2
                        },
                        {
                            "name": "Colonias y Localidades",
                            "layer": "limites_colonias",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#bfbf00",
                            "width": 2
                        },
                        {
                            "name": "Límite Municipal",
                            "layer": "limite_municipal",
                            "visible": true,
                            "styleType": "poly-outline",
                            "color": "#1e73be",
                            "width": 3
                        },
                        {
                            "name": "Límite Estatal",
                            "layer": "guanajuato",
                            "visible": true,
                            "styleType": "poly-outline",
                            "color": "#000000",
                            "width": 3
                        },
                        {
                            "name": "Manzanas",
                            "layer": "manzanas_geoestadisticas",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#000000",
                            "width": 2
                        }
                    ]
                },
                {
                    "id": "fenomenos-geologicos",
                    "name": "Fenómenos Geológicos",
                    "icon": "fa-hill-rockslide",
                    "expanded": false,
                    "layers": [
                        {
                            "name": "Inestabilidad en Laderas (Sierra de los Agustinos)",
                            "layer": "sierra_de_los_agustino",
                            "visible": false,
                            "styleType": "classified",
                            "color": "#1e73be",
                            "width": 2
                        }
                    ]
                },
                {
                    "id": "fenomenos-hidrometeorologicos",
                    "name": "Fenómenos Hidrometeorológicos",
                    "icon": "fa-cloud-showers-heavy",
                    "expanded": false,
                    "layers": [
                        {
                            "name": "Zonas Inundación Pluvial",
                            "layer": "zonas_inundacion_pluvial_apaseo",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#00c0c0",
                            "width": 2
                        },
                        {
                            "name": "Zonas Inundación Fluvial",
                            "layer": "zonas_inundacion_fluvial_apaseo",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#a0a000",
                            "width": 2
                        },
                        {
                            "name": "Puntos de Riesgo de Inundación",
                            "layer": "puntos_de_riesgo_de_inundacion_cepc_cmpc_2026",
                            "visible": false,
                            "styleType": "point",
                            "color": "#1e73be",
                            "width": 2
                        }
                    ]
                },
                {
                    "id": "fenomenos-quimico-tecnologicos",
                    "name": "Fenómenos Químico-Tecnológicos",
                    "icon": "fa-industry",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "fenomenos-sanitario-ecologicos",
                    "name": "Fenómenos Sanitario-Ecológicos",
                    "icon": "fa-biohazard",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "fenomenos-socio-organizativos",
                    "name": "Fenómenos Socio-Organizativos",
                    "icon": "fa-people-group",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "bienes-expuestos",
                    "name": "Bienes Expuestos",
                    "icon": "fa-building-shield",
                    "expanded": false,
                    "layers": [
                        {
                            "name": "Caminos",
                            "layer": "caminos",
                            "visible": false,
                            "styleType": "classified",
                            "color": "#1e73be",
                            "width": 2
                        },
                        {
                            "name": "Escuelas",
                            "layer": "escuelas",
                            "visible": false,
                            "styleType": "classified",
                            "color": "#1e73be",
                            "width": 2
                        },
                        {
                            "name": "Carreteras",
                            "layer": "carreteras",
                            "visible": false,
                            "styleType": "classified",
                            "color": "#1e73be",
                            "width": 2
                        }
                    ]
                },
                {
                    "id": "vulnerabilidad",
                    "name": "Vulnerabilidad",
                    "icon": "fa-house-crack",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "riesgos",
                    "name": "Riesgos / Escenarios",
                    "icon": "fa-exclamation-circle",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "obras",
                    "name": "Obras de Mitigación",
                    "icon": "fa-helmet-safety",
                    "expanded": false,
                    "layers": []
                }
            ]
        },
        {
            "id": "capas-base",
            "name": "Capas Base",
            "icon": "fa-map",
            "expanded": false,
            "isBasemapGroup": true
        }
    ],
    "analisis": {
        "colonia": [
            {
                "layer": "colonias_apaseo",
                "name": "Colonias",
                "field": "nombre",
                "geom": "MULTIPOLYGON"
            }
        ],
        "poblacion": [
            {
                "layer": "manzanas_geoestadisticas",
                "name": "Manzanas",
                "field": "pobtot",
                "geom": "MULTIPOLYGON"
            }
        ],
        "peligro": [
            {
                "layer": "red_hidrografica",
                "name": "Hidrografía",
                "field": "",
                "geom": "MULTILINESTRING"
            },
            {
                "layer": "zonas_inundacion_pluvial_apaseo",
                "name": "Zonas Inundación Pluvial",
                "field": "peligro",
                "geom": "MULTIPOLYGON"
            },
            {
                "layer": "zonas_inundacion_fluvial_apaseo",
                "name": "Zonas Inundación Fluvial",
                "field": "peligro",
                "geom": "MULTIPOLYGON"
            },
            {
                "layer": "puntos_de_riesgo_de_inundacion_cepc_cmpc_2026",
                "name": "Puntos de Riesgo de Inundación",
                "field": "peligro",
                "geom": "MULTIPOINT"
            },
            {
                "layer": "sierra_de_los_agustino",
                "name": "Inestabilidad en Laderas (Sierra de los Agustinos)",
                "field": "intensidad",
                "geom": "MULTIPOLYGON"
            }
        ],
        "equipamiento": [
            {
                "layer": "escuelas",
                "name": "Escuelas",
                "field": "nombre_ct",
                "geom": "MULTIPOINT"
            }
        ]
    }
};
