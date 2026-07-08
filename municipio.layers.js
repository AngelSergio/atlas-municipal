/**
 * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.
 * No editar a mano: usar el panel admin en <host>/<app>/admin/
 * Fuente: admin/data/catalog.json   |   Regenerado: 2026-07-08T08:25:24+00:00
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
                    "layers": []
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
                            "color": "#9c3f86",
                            "width": 3
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
        "colonia": [],
        "poblacion": [],
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
            }
        ],
        "equipamiento": [],
        "apoyo": []
    }
};
