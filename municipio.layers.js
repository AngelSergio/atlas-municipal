/**
 * Catálogo de capas del municipio — GENERADO automáticamente por el panel admin.
 * No editar a mano: usar https://<host>/atlas-apaseo-gde/admin/
 * Fuente: admin/data/catalog.json   |   Regenerado: 2026-06-13T20:33:52+00:00
 */
window.MUNICIPIO_LAYERS = {
    "extents": {
        "limite_municipal": [
            -11217092.9685,
            2328133.4185,
            -11185615.2763,
            2358316.6365
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
                    "id": "medio-fisico",
                    "name": "Medio físico",
                    "icon": "fa-mountain",
                    "expanded": false,
                    "layers": []
                },
                {
                    "id": "medio-sociodemografico",
                    "name": "Medio sociodemográfico",
                    "icon": "fa-users",
                    "expanded": true,
                    "layers": [
                        {
                            "name": "Límite Municipal",
                            "layer": "limite_municipal",
                            "visible": true
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
        }
    ]
};
