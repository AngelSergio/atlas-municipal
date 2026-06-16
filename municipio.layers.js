/**
 * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.
 * No editar a mano: usar https://<host>/atlas-apaseo-gde/admin/
 * Fuente: admin/data/catalog.json   |   Regenerado: 2026-06-16T00:22:37+00:00
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
                        }
                    ]
                },
                {
                    "id": "peligros",
                    "name": "Peligros",
                    "icon": "fa-exclamation-triangle",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "riesgos",
                    "name": "Riesgos",
                    "icon": "fa-exclamation-circle",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "obras",
                    "name": "Obras",
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
    ]
};
