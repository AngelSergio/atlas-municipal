/**
 * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.
 * No editar a mano: usar el panel admin en <host>/<app>/admin/
 * Fuente: admin/data/catalog.json   |   Regenerado: 2026-07-08T09:59:23+00:00
 */
window.MUNICIPIO_LAYERS = {
    "extents": {
        "limite_municipal": [
            -11255723.340973705,
            2332125.1012683683,
            -11230638.422134956,
            2343253.848185778
        ],
        "inundacion_fluvial": [
            -11231401.876901446,
            2336531.9163003787,
            -11230648.119051186,
            2336811.2026478765
        ],
        "inundacion_pluvial": [
            -11251365.447422672,
            2334661.0413085693,
            -11250335.276387041,
            2335213.859856573
        ],
        "guanajuato": [
            -11365389.64496024,
            2262697.847432676,
            -11095358.654396243,
            2492256.177443656
        ],
        "escuelas": [
            -11251899.699009415,
            2333088.9531588573,
            -11233108.54483625,
            2340493.2191936844
        ],
        "unidades_salud": [
            -11251397.688180953,
            2333458.9325901293,
            -11234430.58846725,
            2340061.4619409125
        ],
        "hidrocarburos": [
            -11250211.652477415,
            2333365.302879251,
            -11233162.419017013,
            2335473.60580811
        ],
        "bomberos": [
            -11243003.443828993,
            2334922.332314105,
            -11243003.443828993,
            2334922.332314105
        ],
        "localidades": [
            -11252218.100514652,
            2332764.320815083,
            -11230640.70745555,
            2341246.3566977987
        ],
        "agebs_urbanas": [
            -11252218.100514652,
            2333346.778679353,
            -11234144.494005505,
            2340671.368300249
        ],
        "agebs_rurales": [
            -11255723.34097371,
            2332125.101268372,
            -11230638.422134958,
            2343253.848185773
        ],
        "manzanas": [
            -11252205.891078433,
            2332771.160414037,
            -11230641.621006478,
            2341242.874350007
        ],
        "vialidad": [
            -11252218.100514652,
            2332764.3207080597,
            -11230640.707456382,
            2341245.617298147
        ],
        "refugios": [
            -11243123.8547826,
            2334575.6090231473,
            -11242723.104615742,
            2335388.6310253986
        ],
        "instalaciones_pc": [
            -11243023.667240886,
            2334944.0794055583,
            -11243023.667240886,
            2334944.0794055583
        ],
        "comandancias": [
            -11243686.018211104,
            2333495.2017826824,
            -11243686.018211104,
            2333495.2017826824
        ],
        "carreteras": [
            -11254066.581306262,
            2333335.295311314,
            -11231404.817876862,
            2341946.160319278
        ],
        "caminos": [
            -11254850.925605336,
            2332455.374952833,
            -11230638.588384576,
            2342066.8660399336
        ],
        "subcuencas": [
            -11255723.340973705,
            2332125.1012683683,
            -11230638.422134956,
            2343253.848185778
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
                    "id": "fenomenos-geologicos",
                    "name": "Fenómenos Geológicos",
                    "icon": "fa-hill-rockslide",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "fenomenos-hidrometeorologicos",
                    "name": "Fenómenos Hidrometeorológicos",
                    "icon": "fa-cloud-showers-heavy",
                    "expanded": false,
                    "layers": [
                        {
                            "name": "Inundación fluvial (CENAPRED)",
                            "layer": "inundacion_fluvial",
                            "visible": false,
                            "styleType": "poly-fill",
                            "color": "#1f6fb2",
                            "width": 1
                        },
                        {
                            "name": "Inundación pluvial (CENAPRED)",
                            "layer": "inundacion_pluvial",
                            "visible": false,
                            "styleType": "poly-fill",
                            "color": "#1f6fb2",
                            "width": 1
                        }
                    ]
                },
                {
                    "id": "fenomenos-quimico-tecnologicos",
                    "name": "Fenómenos Químico-Tecnológicos",
                    "icon": "fa-industry",
                    "expanded": false,
                    "layers": [
                        {
                            "name": "Hidrocarburos: gasolineras y gas L.P. (DENUE)",
                            "layer": "hidrocarburos",
                            "visible": false,
                            "styleType": "point",
                            "color": "#e53935",
                            "width": 1
                        }
                    ]
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
                            "name": "Escuelas (DENUE)",
                            "layer": "escuelas",
                            "visible": false,
                            "styleType": "point",
                            "color": "#2e7d32",
                            "width": 1
                        },
                        {
                            "name": "Unidades y servicios de salud (DENUE)",
                            "layer": "unidades_salud",
                            "visible": false,
                            "styleType": "point",
                            "color": "#1565c0",
                            "width": 1
                        },
                        {
                            "name": "Bomberos (DENUE)",
                            "layer": "bomberos",
                            "visible": false,
                            "styleType": "point",
                            "color": "#ef6c00",
                            "width": 1
                        },
                        {
                            "name": "Albergues y Refugios (INEGI)",
                            "layer": "refugios",
                            "visible": false,
                            "styleType": "point",
                            "color": "#c0392b",
                            "width": 1
                        },
                        {
                            "name": "Instalaciones de Protección Civil (INEGI)",
                            "layer": "instalaciones_pc",
                            "visible": false,
                            "styleType": "point",
                            "color": "#e67e22",
                            "width": 1
                        },
                        {
                            "name": "Comandancias de Seguridad Pública (INEGI)",
                            "layer": "comandancias",
                            "visible": false,
                            "styleType": "point",
                            "color": "#34495e",
                            "width": 1
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
                },
                {
                    "id": "medio-sociodemografico",
                    "name": "Base Territorial",
                    "icon": "fa-earth-americas",
                    "expanded": true,
                    "layers": [
                        {
                            "name": "Límite Municipal",
                            "layer": "limite_municipal",
                            "visible": true,
                            "styleType": "poly-outline",
                            "color": "#941414",
                            "width": 3
                        },
                        {
                            "name": "Localidades",
                            "layer": "localidades",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#8e24aa",
                            "width": 1.5
                        },
                        {
                            "name": "AGEB urbanas",
                            "layer": "agebs_urbanas",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#00838f",
                            "width": 1
                        },
                        {
                            "name": "AGEB rurales",
                            "layer": "agebs_rurales",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#558b2f",
                            "width": 1
                        },
                        {
                            "name": "Manzanas (Censo 2020)",
                            "layer": "manzanas",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#607d8b",
                            "width": 0.8
                        },
                        {
                            "name": "Vialidad (ejes)",
                            "layer": "vialidad",
                            "visible": false,
                            "styleType": "line",
                            "color": "#795548",
                            "width": 0.8
                        },
                        {
                            "name": "Limite Estatal",
                            "layer": "guanajuato",
                            "visible": true,
                            "styleType": "poly-outline",
                            "color": "#be1e1e",
                            "width": 3
                        },
                        {
                            "name": "Carreteras (INEGI)",
                            "layer": "carreteras",
                            "visible": false,
                            "styleType": "line",
                            "color": "#4a4a4a",
                            "width": 1.4
                        },
                        {
                            "name": "Caminos (INEGI)",
                            "layer": "caminos",
                            "visible": false,
                            "styleType": "line",
                            "color": "#8d8d8d",
                            "width": 0.9
                        },
                        {
                            "name": "Subcuencas (INEGI)",
                            "layer": "subcuencas",
                            "visible": false,
                            "styleType": "poly-outline",
                            "color": "#2980b9",
                            "width": 1.2
                        }
                    ]
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
                "layer": "localidades",
                "name": "Localidades",
                "field": "nomgeo",
                "geom": "MULTIPOLYGON"
            }
        ],
        "poblacion": [
            {
                "layer": "manzanas",
                "name": "Manzanas (Censo 2020)",
                "field": "pobtot",
                "geom": "MULTIPOLYGON"
            }
        ],
        "peligro": [
            {
                "layer": "inundacion_fluvial",
                "name": "Inundación fluvial (CENAPRED)",
                "field": "peligro",
                "geom": "MULTIPOLYGON"
            },
            {
                "layer": "inundacion_pluvial",
                "name": "Inundación pluvial (CENAPRED)",
                "field": "peligro",
                "geom": "MULTIPOLYGON"
            },
            {
                "layer": "hidrocarburos",
                "name": "Hidrocarburos: gasolineras y gas L.P. (DENUE)",
                "field": "nom_estab",
                "geom": "MULTIPOINT"
            }
        ],
        "equipamiento": [
            {
                "layer": "escuelas",
                "name": "Escuelas (DENUE)",
                "field": "nom_estab",
                "geom": "MULTIPOINT"
            },
            {
                "layer": "unidades_salud",
                "name": "Unidades y servicios de salud (DENUE)",
                "field": "nom_estab",
                "geom": "MULTIPOINT"
            }
        ],
        "apoyo": [
            {
                "layer": "bomberos",
                "name": "Bomberos (DENUE)",
                "field": "nom_estab",
                "geom": "MULTIPOINT"
            },
            {
                "layer": "refugios",
                "name": "Albergues y Refugios (INEGI)",
                "field": "nombre",
                "geom": "MULTIPOINT"
            },
            {
                "layer": "instalaciones_pc",
                "name": "Instalaciones de Protección Civil (INEGI)",
                "field": "nombre",
                "geom": "MULTIPOINT"
            }
        ]
    }
};
