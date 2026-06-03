(function () {
    const CESIUM_VERSION = '1.139.1';
    const CESIUM_BASE_URL = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium/`;
    const CESIUM_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTJhNDMyYS1mNzdhLTQ2MzItOGJlOS1iMGZiYmQzYTU1MWYiLCJpZCI6NDM4MDkyLCJzdWIiOiJhbmdlbHNlcmdpbyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJhdGxhcy1tdW5pY2lwYWwtY2VzaXVtIiwiaWF0IjoxNzgwMDk3NTYyfQ.lk79bwoXbJKDWyQUVX3PE4MhEFH9ArcigrPB7KQ1m1k';

    const CELAYA_HOME = {
        west: -100.9146489266801,
        south: 20.354671763536427,
        east: -100.64890188823075,
        north: 20.69885438724301,
        centerLon: -100.8167,
        centerLat: 20.5289,
        height: 26000
    };

    const CELAYA_START_VIEW = {
        lon: -100.8167,
        lat: 20.5289,
        height: 42000,
        heading: 0,
        pitch: -55,
        roll: 0
    };

    const atlasGooglePlacesConfig = window.AtlasGooglePlacesConfig || {};
    const GOOGLE_PLACES_API_KEY = atlasGooglePlacesConfig.apiKey || 'AIzaSyBuC0CL7cegUQk4ietLseI6LxePNOw2ld8';
    const GOOGLE_CELAYA_BIAS = atlasGooglePlacesConfig.bias || { lat: 20.5235, lng: -100.8157 };
    const GOOGLE_CELAYA_BIAS_RADIUS = Number(atlasGooglePlacesConfig.radius) || 25000;

    const state = {
        viewer: null,
        enabled: false,
        loadingPromise: null,
        limiteMunicipalLayer: null,
        placeLabelsLayer: null,
        placeLabelsEnabled: false,
        placeLabelsToggleButton: null,
        placeLabelsLoadingPromise: null,
        customToolbarGroup: null,
        shadowsEnabled: false,
        shadowsToggleButton: null,
        verticalExaggeration: 1,
        verticalExaggerationSelect: null,
        coordsHud: null,
        coordsHandler: null,
        compassButton: null,
        compassNeedle: null,
        cameraListenersBound: false,
        googleMapsPromise: null,
        googleAutocompleteService: null,
        googleGeocoderService: null,
        googleSessionToken: null,
        cesiumGeocoderControl: null,
        cesiumGeocoderInput: null,
        cesiumGeocoderClear: null,
        cesiumGeocoderResults: null,
        cesiumGeocoderStatus: null,
        cesiumGeocoderPredictions: [],
        cesiumGeocoderDebounce: null,
        cesiumGeocoderOutsideBound: false,
        syncedCesiumLayers: [],   // Opción A: capas WMS activas proyectadas en 3D
        locationButton: null,     // Opción C: botón Mi Ubicación
        print3dButton: null,
        print3dBusy: false,
        print3dMenu: null,
        print3dMenuAction: null,
        print3dLegendCheckbox: null,
        print3dMenuActions: null,
        print3dIncludeLegend: false,
        print3dOutsideHandlerBound: false,
        print3dBackdrop: null,
        streetViewReturnState: null,
        streetViewRestorePending: false
    };

    function getButton() {
        return document.getElementById('btn-cesium-3d');
    }

    function getShell() {
        return document.getElementById('atlas-cesium-shell');
    }

    function wait(ms) {
        return new Promise(function (resolve) {
            window.setTimeout(resolve, ms);
        });
    }

    async function closeStreetViewBefore3D() {
        const streetViewApi = window.__atlasStreetViewApi;
        const streetViewControl = window.__atlasStreetViewControl;
        const isActive = typeof streetViewApi?.isActive === 'function'
            ? streetViewApi.isActive()
            : !!document?.body?.classList.contains('ol-street-view--activated');

        if (!isActive) return;

        try {
            if (typeof streetViewApi?.close === 'function') {
                streetViewApi.close();
            } else if (streetViewControl && typeof streetViewControl.hideStreetView === 'function') {
                streetViewControl.hideStreetView();
            } else {
                document.body.classList.remove('ol-street-view--activated');
            }
        } catch (error) {
            console.warn('No se pudo cerrar Street View antes de abrir Cesium 3D', error);
            document.body.classList.remove('ol-street-view--activated');
        }

        await wait(220);
        if (window.__atlasMap && typeof window.__atlasMap.updateSize === 'function') {
            window.__atlasMap.updateSize();
        }
    }

    function captureStreetViewReturnState() {
        const streetViewApi = window.__atlasStreetViewApi;
        const streetViewControl = window.__atlasStreetViewControl;
        const isActive = typeof streetViewApi?.isActive === 'function'
            ? streetViewApi.isActive()
            : !!document?.body?.classList.contains('ol-street-view--activated');

        if (!isActive || !streetViewControl) {
            state.streetViewReturnState = null;
            return;
        }

        const panorama = typeof streetViewControl.getStreetViewPanorama === 'function'
            ? streetViewControl.getStreetViewPanorama()
            : null;

        let mapCoords = null;
        const selectedCoords = streetViewControl._pegmanSelectedCoords;
        if (Array.isArray(selectedCoords) && selectedCoords.length >= 2) {
            mapCoords = [Number(selectedCoords[0]), Number(selectedCoords[1])];
        }

        let lat = null;
        let lon = null;
        let pov = null;
        let zoom = null;

        try {
            const position = panorama && typeof panorama.getPosition === 'function'
                ? panorama.getPosition()
                : null;
            if (position) {
                lat = typeof position.lat === 'function' ? position.lat() : position.lat;
                lon = typeof position.lng === 'function' ? position.lng() : position.lng;
            }
        } catch (error) {
            lat = null;
            lon = null;
        }

        try {
            const currentPov = panorama && typeof panorama.getPov === 'function'
                ? panorama.getPov()
                : null;
            if (currentPov) {
                pov = {
                    heading: Number(currentPov.heading) || 0,
                    pitch: Number(currentPov.pitch) || 0
                };
            }
        } catch (error) {
            pov = null;
        }

        try {
            zoom = panorama && typeof panorama.getZoom === 'function'
                ? Number(panorama.getZoom())
                : null;
        } catch (error) {
            zoom = null;
        }

        state.streetViewReturnState = {
            mapCoords,
            lat: Number.isFinite(lat) ? lat : null,
            lon: Number.isFinite(lon) ? lon : null,
            pov,
            zoom: Number.isFinite(zoom) ? zoom : null
        };
    }

    async function restoreStreetViewAfter3D() {
        const saved = state.streetViewReturnState;
        state.streetViewReturnState = null;

        if (!saved || state.streetViewRestorePending) return;

        const streetViewControl = window.__atlasStreetViewControl;
        const map = window.__atlasMap;
        if (!streetViewControl || typeof streetViewControl.showStreetView !== 'function' || !map) {
            return;
        }

        let coords = Array.isArray(saved.mapCoords) && saved.mapCoords.length >= 2
            ? [Number(saved.mapCoords[0]), Number(saved.mapCoords[1])]
            : null;

        if ((!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1]))
            && Number.isFinite(saved.lon) && Number.isFinite(saved.lat)
            && window.ol?.proj?.fromLonLat) {
            try {
                coords = window.ol.proj.fromLonLat([saved.lon, saved.lat], map.getView().getProjection());
            } catch (error) {
                coords = null;
            }
        }

        if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
            return;
        }

        state.streetViewRestorePending = true;

        try {
            await wait(40);
            if (typeof map.updateSize === 'function') {
                map.updateSize();
            }

            const panorama = streetViewControl.showStreetView(coords);

            await wait(260);

            if (panorama) {
                if (Number.isFinite(saved.lon) && Number.isFinite(saved.lat) && window.google?.maps?.LatLng) {
                    try {
                        panorama.setPosition(new google.maps.LatLng(saved.lat, saved.lon));
                    } catch (error) {
                        console.warn('No se pudo restaurar la posición exacta de Street View', error);
                    }
                }

                if (saved.pov && typeof panorama.setPov === 'function') {
                    try {
                        panorama.setPov(saved.pov);
                    } catch (error) {
                        console.warn('No se pudo restaurar la orientación de Street View', error);
                    }
                }

                if (Number.isFinite(saved.zoom) && typeof panorama.setZoom === 'function') {
                    try {
                        panorama.setZoom(saved.zoom);
                    } catch (error) {
                        console.warn('No se pudo restaurar el zoom de Street View', error);
                    }
                }

                if (typeof panorama.setVisible === 'function') {
                    panorama.setVisible(true);
                }
            }

            await wait(120);
            if (typeof map.updateSize === 'function') {
                map.updateSize();
            }
        } finally {
            state.streetViewRestorePending = false;
        }
    }


    function loadGoogleMapsPlacesApi() {
        if (window.google?.maps?.places) return Promise.resolve(window.google.maps);
        if (window.__atlasCesiumGooglePlacesPromise) {
            return window.__atlasCesiumGooglePlacesPromise.then(() => window.google?.maps);
        }
        if (state.googleMapsPromise) return state.googleMapsPromise;

        state.googleMapsPromise = new Promise((resolve, reject) => {
            const existing = document.getElementById('atlas-cesium-google-places-api');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.google?.maps), { once: true });
                existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Places para Cesium')), { once: true });
                return;
            }

            window.__atlasCesiumGooglePlacesReady = function () {
                resolve(window.google?.maps);
            };

            window.__atlasCesiumGooglePlacesPromise = state.googleMapsPromise;
            const script = document.createElement('script');
            script.id = 'atlas-cesium-google-places-api';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}&libraries=places&language=es&region=MX&callback=__atlasCesiumGooglePlacesReady`;
            script.async = true;
            script.defer = true;
            script.onerror = () => reject(new Error('No se pudo cargar Google Places para Cesium'));
            document.head.appendChild(script);
        });

        return state.googleMapsPromise;
    }

    function resetGoogleSessionToken() {
        if (window.google?.maps?.places?.AutocompleteSessionToken) {
            state.googleSessionToken = new google.maps.places.AutocompleteSessionToken();
        } else {
            state.googleSessionToken = null;
        }
    }

    async function ensureGoogleSearchServices() {
        await loadGoogleMapsPlacesApi();
        if (!window.google?.maps?.places) {
            throw new Error('Google Places no está disponible en la vista 3D');
        }
        if (!state.googleAutocompleteService) {
            state.googleAutocompleteService = new google.maps.places.AutocompleteService();
        }
        if (!state.googleGeocoderService) {
            state.googleGeocoderService = new google.maps.Geocoder();
        }
        if (!state.googleSessionToken) {
            resetGoogleSessionToken();
        }
    }

    function syncCesiumGeocoderClearButton() {
        const input = state.cesiumGeocoderInput;
        const clear = state.cesiumGeocoderClear;
        if (!input || !clear) return;
        clear.hidden = !(input.value || '').trim();
    }

    function setCesiumGeocoderStatus(message, kind) {
        const status = state.cesiumGeocoderStatus;
        if (!status) return;
        status.textContent = message || '';
        status.classList.remove('is-error', 'is-info');
        if (kind === 'error') {
            status.classList.add('is-error');
        } else if (kind) {
            status.classList.add('is-info');
        }
    }

    function clearCesiumGeocoderResults() {
        const results = state.cesiumGeocoderResults;
        if (!results) return;
        results.innerHTML = '';
        results.hidden = true;
        state.cesiumGeocoderPredictions = [];
        setCesiumGeocoderStatus('');
    }

    function renderCesiumGeocoderResults(predictions) {
        const results = state.cesiumGeocoderResults;
        if (!results) return;
        state.cesiumGeocoderPredictions = Array.isArray(predictions) ? predictions.slice() : [];
        if (!state.cesiumGeocoderPredictions.length) {
            results.innerHTML = '';
            results.hidden = true;
            setCesiumGeocoderStatus('No se encontraron coincidencias.', 'info');
            return;
        }

        setCesiumGeocoderStatus('');
        results.innerHTML = state.cesiumGeocoderPredictions.map((prediction, index) => {
            const text = String(prediction.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const main = String(prediction.structured_formatting?.main_text || prediction.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const secondary = String(prediction.structured_formatting?.secondary_text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            return `
                <button type="button" class="atlas-cesium-geocoder__result" data-index="${index}" title="${text}">
                    <span class="atlas-cesium-geocoder__result-main">${main}</span>
                    ${secondary ? `<span class="atlas-cesium-geocoder__result-secondary">${secondary}</span>` : ''}
                </button>
            `;
        }).join('');
        results.hidden = false;
    }

    function flyToGoogleGeometry(geometry, label) {
        const viewer = state.viewer;
        const Cesium = window.Cesium;
        if (!viewer || !Cesium || !geometry || !geometry.location) return;

        let lat = null;
        let lon = null;
        try {
            lat = typeof geometry.location.lat === 'function' ? geometry.location.lat() : geometry.location.lat;
            lon = typeof geometry.location.lng === 'function' ? geometry.location.lng() : geometry.location.lng;
        } catch (error) {
            lat = null;
            lon = null;
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        const currentPitch = Number(viewer.camera?.pitch);
        const pitch = Number.isFinite(currentPitch) ? currentPitch : Cesium.Math.toRadians(-50);
        const heading = Number(viewer.camera?.heading) || 0;

        let targetHeight = 3200;
        try {
            const viewport = geometry.viewport;
            if (viewport && typeof viewport.getNorthEast === 'function' && typeof viewport.getSouthWest === 'function') {
                const ne = viewport.getNorthEast();
                const sw = viewport.getSouthWest();
                const latSpan = Math.abs((typeof ne.lat === 'function' ? ne.lat() : ne.lat) - (typeof sw.lat === 'function' ? sw.lat() : sw.lat));
                const lngSpan = Math.abs((typeof ne.lng === 'function' ? ne.lng() : ne.lng) - (typeof sw.lng === 'function' ? sw.lng() : sw.lng));
                const span = Math.max(latSpan, lngSpan);
                targetHeight = Math.min(26000, Math.max(1800, span * 160000));
            }
        } catch (error) {
            targetHeight = 3200;
        }

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, targetHeight),
            orientation: {
                heading,
                pitch,
                roll: 0
            },
            duration: 1.7
        });

        if (state.cesiumGeocoderInput) {
            state.cesiumGeocoderInput.value = label || state.cesiumGeocoderInput.value;
        }
        syncCesiumGeocoderClearButton();
        clearCesiumGeocoderResults();
        requestSceneRender(viewer);
    }

    async function flyToPrediction(prediction) {
        if (!prediction?.place_id) return;
        await ensureGoogleSearchServices();

        return new Promise((resolve, reject) => {
            state.googleGeocoderService.geocode({ placeId: prediction.place_id }, (results, status) => {
                if (status === 'OK' && Array.isArray(results) && results[0]?.geometry) {
                    flyToGoogleGeometry(results[0].geometry, results[0].formatted_address || prediction.description || '');
                    resetGoogleSessionToken();
                    resolve(results[0]);
                    return;
                }
                reject(new Error('No se pudo ubicar el resultado seleccionado.'));
            });
        });
    }

    async function geocodeGoogleText(query) {
        const cleanQuery = String(query || '').trim();
        if (!cleanQuery) return;
        await ensureGoogleSearchServices();

        return new Promise((resolve, reject) => {
            state.googleGeocoderService.geocode({
                address: cleanQuery,
                componentRestrictions: { country: 'MX' },
                region: 'MX'
            }, (results, status) => {
                if (status === 'OK' && Array.isArray(results) && results[0]?.geometry) {
                    flyToGoogleGeometry(results[0].geometry, results[0].formatted_address || cleanQuery);
                    resetGoogleSessionToken();
                    resolve(results[0]);
                    return;
                }
                reject(new Error('No se encontraron ubicaciones con Google.'));
            });
        });
    }

    async function searchGooglePredictions(query) {
        const cleanQuery = String(query || '').trim();
        if (!cleanQuery) {
            clearCesiumGeocoderResults();
            return;
        }

        await ensureGoogleSearchServices();
        setCesiumGeocoderStatus('Buscando…', 'info');

        const request = {
            input: cleanQuery,
            language: 'es',
            componentRestrictions: { country: 'mx' },
            sessionToken: state.googleSessionToken,
            location: new google.maps.LatLng(GOOGLE_CELAYA_BIAS.lat, GOOGLE_CELAYA_BIAS.lng),
            radius: GOOGLE_CELAYA_BIAS_RADIUS
        };

        return new Promise((resolve) => {
            state.googleAutocompleteService.getPlacePredictions(request, (predictions, status) => {
                if ((status === google.maps.places.PlacesServiceStatus.OK || status === 'OK') && predictions?.length) {
                    renderCesiumGeocoderResults(predictions);
                    resolve(predictions);
                    return;
                }
                renderCesiumGeocoderResults([]);
                resolve([]);
            });
        });
    }

    function ensureCesiumGoogleGeocoder(viewer) {
        if (state.cesiumGeocoderControl && state.cesiumGeocoderControl.isConnected) {
            return state.cesiumGeocoderControl;
        }

        const toolbar = viewer && viewer.container ? viewer.container.querySelector('.cesium-viewer-toolbar') : null;
        if (!toolbar) return null;

        const control = document.createElement('div');
        control.className = 'atlas-cesium-geocoder';
        control.innerHTML = `
            <form class="atlas-cesium-geocoder__bar" autocomplete="off">
                <input type="search" class="atlas-cesium-geocoder__input" placeholder="Buscar lugar o dirección" aria-label="Buscar lugar o dirección en 3D">
                <button type="button" class="atlas-cesium-geocoder__clear" title="Borrar búsqueda" aria-label="Borrar búsqueda" hidden>
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
                <button type="submit" class="atlas-cesium-geocoder__submit" title="Buscar con Google" aria-label="Buscar con Google">
                    <i class="fas fa-search" aria-hidden="true"></i>
                </button>
            </form>
            <div class="atlas-cesium-geocoder__results" hidden></div>
            <div class="atlas-cesium-geocoder__status" aria-live="polite"></div>
        `;

        toolbar.insertBefore(control, toolbar.firstChild);

        state.cesiumGeocoderControl = control;
        state.cesiumGeocoderInput = control.querySelector('.atlas-cesium-geocoder__input');
        state.cesiumGeocoderClear = control.querySelector('.atlas-cesium-geocoder__clear');
        state.cesiumGeocoderResults = control.querySelector('.atlas-cesium-geocoder__results');
        state.cesiumGeocoderStatus = control.querySelector('.atlas-cesium-geocoder__status');

        const form = control.querySelector('.atlas-cesium-geocoder__bar');
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            const query = state.cesiumGeocoderInput?.value || '';
            const firstPrediction = state.cesiumGeocoderPredictions[0];
            try {
                if (firstPrediction) {
                    await flyToPrediction(firstPrediction);
                } else {
                    await geocodeGoogleText(query);
                }
            } catch (error) {
                setCesiumGeocoderStatus(error.message || 'No se pudo completar la búsqueda.', 'error');
                if (window.showToast) {
                    window.showToast(error.message || 'No se pudo completar la búsqueda.', 'error');
                }
            }
        });

        state.cesiumGeocoderInput.addEventListener('input', function () {
            clearTimeout(state.cesiumGeocoderDebounce);
            syncCesiumGeocoderClearButton();
            const query = state.cesiumGeocoderInput.value.trim();
            if (!query) {
                clearCesiumGeocoderResults();
                return;
            }
            state.cesiumGeocoderDebounce = setTimeout(() => {
                searchGooglePredictions(query).catch((error) => {
                    clearCesiumGeocoderResults();
                    setCesiumGeocoderStatus(error.message || 'No se pudo consultar Google.', 'error');
                });
            }, 220);
        });

        state.cesiumGeocoderInput.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                clearCesiumGeocoderResults();
            }
        });

        state.cesiumGeocoderClear.addEventListener('click', function () {
            if (!state.cesiumGeocoderInput) return;
            state.cesiumGeocoderInput.value = '';
            syncCesiumGeocoderClearButton();
            clearCesiumGeocoderResults();
            resetGoogleSessionToken();
            state.cesiumGeocoderInput.focus();
        });

        state.cesiumGeocoderResults.addEventListener('click', function (event) {
            const button = event.target.closest('.atlas-cesium-geocoder__result');
            if (!button) return;
            const index = Number(button.dataset.index);
            const prediction = state.cesiumGeocoderPredictions[index];
            if (!prediction) return;
            flyToPrediction(prediction).catch((error) => {
                setCesiumGeocoderStatus(error.message || 'No se pudo completar la búsqueda.', 'error');
                if (window.showToast) {
                    window.showToast(error.message || 'No se pudo completar la búsqueda.', 'error');
                }
            });
        });

        if (!state.cesiumGeocoderOutsideBound) {
            document.addEventListener('click', function (event) {
                if (!state.cesiumGeocoderControl) return;
                if (!event.target.closest('.atlas-cesium-geocoder')) {
                    clearCesiumGeocoderResults();
                }
            });
            state.cesiumGeocoderOutsideBound = true;
        }

        syncCesiumGeocoderClearButton();
        clearCesiumGeocoderResults();
        return control;
    }


    function requestSceneRender(viewer) {
        if (viewer && viewer.scene) {
            viewer.scene.requestRender();
        }
    }

    function ensureToolbarRow(layout, variant) {
        if (!layout) return null;

        let row = layout.querySelector(`.atlas-cesium-toolbar-row--${variant}`);
        if (!row) {
            row = document.createElement('div');
            row.className = `atlas-cesium-toolbar-row atlas-cesium-toolbar-row--${variant}`;
            layout.appendChild(row);
        }
        return row;
    }

    function ensureToolbarSearchSlot(row) {
        if (!row) return null;

        let slot = row.querySelector('.atlas-cesium-toolbar-slot--search');
        if (!slot) {
            slot = document.createElement('div');
            slot.className = 'atlas-cesium-toolbar-slot atlas-cesium-toolbar-slot--search';
            row.appendChild(slot);
        }
        return slot;
    }

    function ensureToolbarGroupElement(row, variant) {
        if (!row) return null;

        let group = row.querySelector(`.atlas-cesium-toolbar-group--${variant}`);
        if (!group) {
            group = document.createElement('div');
            group.className = `atlas-cesium-toolbar-group atlas-cesium-toolbar-group--${variant}`;
            row.appendChild(group);
        }
        return group;
    }

    function moveToolbarNode(target, node) {
        if (!target || !node) return;
        if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }

    function decorateNativeToolbarButton(button) {
        if (!button) return;
        button.classList.add('atlas-cesium-toolbar-btn', 'atlas-cesium-toolbar-btn--native');
    }

    function localizeHomeButton(button) {
        if (!button) return;
        button.setAttribute('title', 'Ir a la vista inicial');
        button.setAttribute('aria-label', 'Ir a la vista inicial');
        button.setAttribute('data-atlas-title', 'Ir a la vista inicial');
    }

    function arrangeToolbarForCitizen(viewer) {
        const toolbar = viewer && viewer.container
            ? viewer.container.querySelector('.cesium-viewer-toolbar')
            : null;

        if (!toolbar) return null;

        toolbar.classList.add('atlas-cesium-toolbar');

        let layout = toolbar.querySelector('.atlas-cesium-toolbar-layout');
        if (!layout) {
            layout = document.createElement('div');
            layout.className = 'atlas-cesium-toolbar-layout';
            while (toolbar.firstChild) {
                layout.appendChild(toolbar.firstChild);
            }
            toolbar.appendChild(layout);
        }

        const primaryRow = ensureToolbarRow(layout, 'primary');
        const searchSlot = ensureToolbarSearchSlot(primaryRow);
        const quickGroup = ensureToolbarGroupElement(primaryRow, 'quick');

        const geocoder = layout.querySelector('.atlas-cesium-geocoder');
        moveToolbarNode(searchSlot, geocoder);

        const homeButton = layout.querySelector('.cesium-home-button');
        const locationButton = layout.querySelector('#atlas-cesium-location-btn');
        const helpButton = layout.querySelector('.cesium-navigation-help-button');
        const fullscreenButton = layout.querySelector('.cesium-fullscreen-button');
        const placeLabelsButton = layout.querySelector('#atlas-cesium-place-labels-toggle');
        const print3dButton = layout.querySelector('#atlas-cesium-print3d-btn');
        const exaggerationWrap = layout.querySelector('.atlas-cesium-toolbar-select-wrap');

        decorateNativeToolbarButton(homeButton);
        localizeHomeButton(homeButton);

        moveToolbarNode(quickGroup, homeButton);
        moveToolbarNode(quickGroup, locationButton);
        moveToolbarNode(quickGroup, print3dButton);
        moveToolbarNode(quickGroup, placeLabelsButton);
        moveToolbarNode(quickGroup, exaggerationWrap);

        if (helpButton) {
            helpButton.remove();
        }
        if (fullscreenButton) {
            fullscreenButton.remove();
        }

        state.customToolbarGroup = quickGroup;

        layout.querySelectorAll('.atlas-cesium-toolbar-group').forEach(function (group) {
            if (!group.children.length) {
                group.remove();
            }
        });

        layout.querySelectorAll('.atlas-cesium-toolbar-slot').forEach(function (slot) {
            if (!slot.children.length) {
                slot.remove();
            }
        });

        layout.querySelectorAll('.atlas-cesium-toolbar-row').forEach(function (row) {
            if (!row.children.length) {
                row.remove();
            }
        });

        return toolbar;
    }

    function getCustomToolbarGroup(viewer) {
        if (state.customToolbarGroup && state.customToolbarGroup.isConnected) {
            return state.customToolbarGroup;
        }

        const toolbar = viewer && viewer.container
            ? viewer.container.querySelector('.cesium-viewer-toolbar')
            : null;

        if (!toolbar) return null;

        const group = document.createElement('div');
        group.className = 'atlas-cesium-toolbar-group';
        toolbar.appendChild(group);
        state.customToolbarGroup = group;
        return group;
    }

    function formatDegrees(value, positiveLabel, negativeLabel) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return '--';
        const hemisphere = numeric >= 0 ? positiveLabel : negativeLabel;
        return `${Math.abs(numeric).toFixed(6)}° ${hemisphere}`;
    }

    function formatMeters(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return '--';
        return `${Math.round(numeric).toLocaleString('es-MX')} m`;
    }



    function updatePrint3dUi() {
        const button = state.print3dButton;
        const menu = state.print3dMenu;
        const actionButtons = Array.isArray(state.print3dMenuActions) ? state.print3dMenuActions : [];
        const busy = !!state.print3dBusy;
        const menuOpen = !!(menu && menu.classList.contains('is-open'));

        if (button) {
            button.disabled = busy;
            button.classList.toggle('is-busy', busy);
            button.setAttribute('aria-busy', busy ? 'true' : 'false');
            button.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
            button.setAttribute('title', busy ? 'Generando ficha 3D…' : 'Exportar ficha 3D en PDF');
            button.setAttribute('aria-label', busy ? 'Generando ficha 3D' : 'Exportar ficha 3D en PDF');
            button.innerHTML = busy
                ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>'
                : '<i class="fas fa-file-pdf" aria-hidden="true"></i>';
        }

        if (menu) {
            menu.classList.toggle('is-busy', busy);
        }
        if (state.print3dBackdrop) {
            state.print3dBackdrop.classList.toggle('is-busy', busy);
            state.print3dBackdrop.classList.toggle('is-open', menuOpen);
        }
        actionButtons.forEach(function (actionButton) {
            if (actionButton) {
                actionButton.disabled = busy;
            }
        });
    }

    function closePrint3dMenu() {
        const menu = state.print3dMenu;
        if (!menu) return;
        menu.classList.remove('is-open');
        menu.hidden = true;
        if (state.print3dBackdrop) {
            state.print3dBackdrop.hidden = true;
        }
        updatePrint3dUi();
    }

    function togglePrint3dMenu(force) {
        const menu = state.print3dMenu;
        if (!menu || state.print3dBusy) return;

        const shouldOpen = typeof force === 'boolean'
            ? force
            : !menu.classList.contains('is-open');

        menu.classList.toggle('is-open', shouldOpen);
        if (state.print3dBackdrop) {
            state.print3dBackdrop.hidden = !shouldOpen;
        }
        menu.hidden = !shouldOpen;
        updatePrint3dUi();
    }

    function bindPrint3dMenuOutsideClose() {
        if (state.print3dOutsideHandlerBound) return;
        state.print3dOutsideHandlerBound = true;

        document.addEventListener('pointerdown', function (event) {
            const menu = state.print3dMenu;
            const button = state.print3dButton;
            if (!menu || !button || !menu.classList.contains('is-open')) return;
            const target = event.target;
            if (menu.contains(target) || button.contains(target)) return;
            closePrint3dMenu();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closePrint3dMenu();
            }
        });
    }

    function ensurePrint3dMenu(viewer, Cesium) {
        if (state.print3dMenu && state.print3dMenu.isConnected) {
            updatePrint3dUi();
            return state.print3dMenu;
        }

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const backdrop = document.createElement('div');
        backdrop.className = 'atlas-cesium-export-backdrop';
        backdrop.setAttribute('hidden', 'hidden');

        const menu = document.createElement('div');
        menu.className = 'atlas-cesium-export-menu atlas-cesium-export-menu--dialog';
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-modal', 'true');
        menu.setAttribute('aria-label', 'Exportar ficha 3D en PDF');
        menu.setAttribute('hidden', 'hidden');

        const header = document.createElement('div');
        header.className = 'atlas-cesium-export-menu__header';
        header.innerHTML = '<span>Exportar ficha 3D</span>';

        const actions = document.createElement('div');
        actions.className = 'atlas-cesium-export-menu__actions';

        function createExportOption(label, iconClass, includeLegend) {
            const action = document.createElement('button');
            action.type = 'button';
            action.className = 'atlas-cesium-export-menu__action';
            action.setAttribute('role', 'menuitem');
            action.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span>${label}</span>`;
            action.addEventListener('click', function () {
                state.print3dIncludeLegend = !!includeLegend;
                closePrint3dMenu();
                downloadCesiumViewPdf(state.viewer, Cesium || window.Cesium, {
                    includeLegend: !!includeLegend
                });
            });
            return action;
        }

        const cleanAction = createExportOption('PDF limpio', 'fas fa-file-pdf', false);
        const legendAction = createExportOption('PDF con leyenda', 'fas fa-list-ul', true);

        actions.appendChild(cleanAction);
        actions.appendChild(legendAction);

        menu.appendChild(header);
        menu.appendChild(actions);
        document.body.appendChild(backdrop);
        document.body.appendChild(menu);

        backdrop.addEventListener('click', function () {
            closePrint3dMenu();
        });
        menu.addEventListener('pointerdown', function (event) {
            event.stopPropagation();
        });
        menu.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        state.print3dBackdrop = backdrop;
        state.print3dMenu = menu;
        state.print3dMenuAction = null;
        state.print3dLegendCheckbox = null;
        state.print3dMenuActions = [cleanAction, legendAction];

        bindPrint3dMenuOutsideClose();
        updatePrint3dUi();
        return menu;
    }

    function ensurePrint3dButton(viewer, Cesium) {
        ensurePrint3dMenu(viewer, Cesium);

        if (state.print3dButton && state.print3dButton.isConnected) {
            updatePrint3dUi();
            return state.print3dButton;
        }

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'atlas-cesium-print3d-btn';
        button.className = 'cesium-button cesium-toolbar-button atlas-cesium-toolbar-btn atlas-cesium-toolbar-btn--pdf';
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            togglePrint3dMenu();
        });

        group.appendChild(button);
        state.print3dButton = button;
        updatePrint3dUi();
        return button;
    }

    function formatLatLonValue(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return '--';
        return numeric.toFixed(6);
    }

    function formatPdfDate(date) {
        const value = date instanceof Date ? date : new Date();
        try {
            return new Intl.DateTimeFormat('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(value);
        } catch (_) {
            return value.toLocaleString('es-MX');
        }
    }

    function buildCesiumPdfFilename(date) {
        const value = date instanceof Date ? date : new Date();
        const pad = function (num) { return String(num).padStart(2, '0'); };
        const stamp = [
            value.getFullYear(),
            pad(value.getMonth() + 1),
            pad(value.getDate()),
            '_',
            pad(value.getHours()),
            pad(value.getMinutes()),
            pad(value.getSeconds())
        ].join('');
        return `Vista_3D_Celaya_${stamp}.pdf`;
    }

    function getCesiumViewSummary(viewer, Cesium) {
        const summary = {
            centerLat: Number.NaN,
            centerLon: Number.NaN,
            terrainHeight: Number.NaN,
            cameraHeight: Number.NaN,
            exaggeration: Number(state.verticalExaggeration) || 1
        };

        if (!viewer || !Cesium || !viewer.scene || !viewer.camera) {
            return summary;
        }

        try {
            const cameraCartographic = viewer.camera.positionCartographic;
            if (cameraCartographic) {
                summary.cameraHeight = cameraCartographic.height;
            }
        } catch (_) {}

        try {
            const canvas = viewer.scene.canvas;
            const center = new Cesium.Cartesian2(
                Math.round((canvas.clientWidth || canvas.width || 0) / 2),
                Math.round((canvas.clientHeight || canvas.height || 0) / 2)
            );

            let cartesian = null;
            try {
                if (viewer.scene.pickPositionSupported) {
                    cartesian = viewer.scene.pickPosition(center);
                }
            } catch (_) {
                cartesian = null;
            }

            if (!cartesian) {
                try {
                    const ray = viewer.camera.getPickRay(center);
                    if (ray && viewer.scene.globe) {
                        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                    }
                } catch (_) {
                    cartesian = null;
                }
            }

            if (!cartesian) {
                try {
                    cartesian = viewer.camera.pickEllipsoid(center, viewer.scene.globe && viewer.scene.globe.ellipsoid ? viewer.scene.globe.ellipsoid : Cesium.Ellipsoid.WGS84);
                } catch (_) {
                    cartesian = null;
                }
            }

            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                summary.centerLat = Cesium.Math.toDegrees(cartographic.latitude);
                summary.centerLon = Cesium.Math.toDegrees(cartographic.longitude);
                let terrainHeight = Number.NaN;
                try {
                    if (viewer.scene.globe && typeof viewer.scene.globe.getHeight === 'function') {
                        terrainHeight = viewer.scene.globe.getHeight(cartographic);
                    }
                } catch (_) {
                    terrainHeight = Number.NaN;
                }
                summary.terrainHeight = Number.isFinite(terrainHeight) ? terrainHeight : cartographic.height;
            }
        } catch (_) {}

        return summary;
    }

    function waitForCesiumFrame(viewer, delay) {
        return new Promise(function (resolve) {
            const done = function () {
                window.setTimeout(resolve, Number(delay) || 0);
            };
            if (viewer && viewer.scene && typeof viewer.scene.requestRender === 'function') {
                try { viewer.scene.requestRender(); } catch (_) {}
            }
            if (typeof window.requestAnimationFrame === 'function') {
                window.requestAnimationFrame(function () {
                    window.requestAnimationFrame(done);
                });
            } else {
                done();
            }
        });
    }

    async function captureCesiumSceneDataUrl(viewer) {
        if (!viewer || !viewer.scene || !viewer.scene.canvas) {
            throw new Error('La vista 3D no está disponible para exportar.');
        }

        await waitForCesiumFrame(viewer, 220);
        const canvas = viewer.scene.canvas;
        try {
            return canvas.toDataURL('image/jpeg', 0.96);
        } catch (error) {
            throw new Error('No fue posible capturar la vista 3D. Revisa las capas visibles e inténtalo de nuevo.');
        }
    }

    function setCesiumExportMode(enabled, viewer) {
        document.body.classList.toggle('atlas-cesium-exporting', !!enabled);
        if (viewer && viewer.scene && typeof viewer.scene.requestRender === 'function') {
            try { viewer.scene.requestRender(); } catch (_) {}
        }
    }

    function createMunicipalLegendSwatchDataUrl() {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 44;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.strokeStyle = '#8b0f3b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(32, 33);
        ctx.lineTo(84, 11);
        ctx.stroke();

        return canvas.toDataURL('image/png');
    }

    function collectCesiumLegendItems() {
        const legendPanel = document.getElementById('legend-panel');
        const legendRoot = document.getElementById('legend-content');

        const canReadLegendDom = !!(
            legendPanel &&
            legendRoot &&
            legendPanel.classList.contains('visible') &&
            !legendPanel.classList.contains('collapsed')
        );

        const items = canReadLegendDom
            ? Array.from(legendRoot.querySelectorAll('.legend-item')).map(function (item) {
                const imgEl = item.querySelector('img');
                return {
                    title: item.querySelector('.legend-item-title')?.textContent?.trim() || '',
                    imgSrc: imgEl?.currentSrc || imgEl?.src || '',
                    imgEl: imgEl || null
                };
            }).filter(function (item) {
                return !!item.title;
            })
            : [];

        const normalizeLegendTitle = function (value) {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim();
        };

        const hasMunicipal = items.some(function (item) {
            return normalizeLegendTitle(item.title) === 'limite municipal';
        });

        if (!hasMunicipal && state.limiteMunicipalLayer && state.limiteMunicipalLayer.show !== false) {
            items.unshift({
                title: 'Límite Municipal',
                imgSrc: createMunicipalLegendSwatchDataUrl(),
                imgEl: null
            });
        }

        return items;
    }

    function isCesiumLegendReadyForPdf() {
        return collectCesiumLegendItems().length > 0;
    }

    function wrapLegendText(ctx, text, maxWidth) {
        const raw = String(text || '').trim();
        if (!raw) return [''];
        const words = raw.split(/\s+/).filter(Boolean);
        if (!words.length) return [raw];

        const lines = [];
        let current = '';
        words.forEach(function (word) {
            const probe = current ? `${current} ${word}` : word;
            if (ctx.measureText(probe).width <= maxWidth || !current) {
                current = probe;
            } else {
                lines.push(current);
                current = word;
            }
        });
        if (current) lines.push(current);
        return lines.length ? lines : [raw];
    }

    function loadLegendImage(src) {
        return new Promise(function (resolve) {
            if (!src) {
                resolve(null);
                return;
            }
            const img = new Image();
            img.decoding = 'async';
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            try {
                img.crossOrigin = 'anonymous';
            } catch (_) {}
            img.src = src;
            if (img.complete && img.naturalWidth > 0) {
                resolve(img);
            }
        });
    }

    async function buildCesiumLegendSnapshot() {
        if (!isCesiumLegendReadyForPdf()) return null;

        const rawItems = collectCesiumLegendItems();
        if (!rawItems.length) return null;

        const loadedImages = await Promise.all(rawItems.map(function (item) {
            const ready = item.imgEl && item.imgEl.complete && item.imgEl.naturalWidth > 0
                ? Promise.resolve(item.imgEl)
                : loadLegendImage(item.imgSrc);
            return ready.then(function (img) {
                return Object.assign({}, item, { loadedImage: img });
            });
        }));

        const scale = 2;
        const width = 440;
        const padding = 18;
        const headerHeight = 42;
        const titleFont = 18;
        const itemTitleFont = 14;
        const itemGap = 12;
        const rowGap = 14;
        const contentWidth = width - (padding * 2);

        const measureCanvas = document.createElement('canvas');
        measureCanvas.width = 8;
        measureCanvas.height = 8;
        const measureCtx = measureCanvas.getContext('2d');
        if (!measureCtx) return null;

        let totalHeight = padding + headerHeight;
        const preparedItems = loadedImages.map(function (item) {
            measureCtx.font = `bold ${itemTitleFont}px Arial, sans-serif`;
            const lines = wrapLegendText(measureCtx, item.title, contentWidth);
            const titleHeight = Math.max(itemTitleFont * 1.35, lines.length * itemTitleFont * 1.25);

            let drawWidth = 0;
            let drawHeight = 0;
            if (item.loadedImage && item.loadedImage.naturalWidth > 0 && item.loadedImage.naturalHeight > 0) {
                const maxImgWidth = contentWidth;
                const maxImgHeight = 150;
                const ratio = Math.min(maxImgWidth / item.loadedImage.naturalWidth, maxImgHeight / item.loadedImage.naturalHeight, 1);
                drawWidth = Math.round(item.loadedImage.naturalWidth * ratio);
                drawHeight = Math.round(item.loadedImage.naturalHeight * ratio);
            }

            const rowHeight = titleHeight + (drawHeight > 0 ? itemGap + drawHeight : 0) + rowGap;
            totalHeight += rowHeight;
            return Object.assign({}, item, {
                titleLines: lines,
                titleHeight: titleHeight,
                drawWidth: drawWidth,
                drawHeight: drawHeight,
                rowHeight: rowHeight
            });
        });
        totalHeight += padding - rowGap;

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(totalHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.scale(scale, scale);

        const radius = 14;
        const drawRoundedRect = function (x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
        };

        ctx.clearRect(0, 0, width, totalHeight);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.strokeStyle = 'rgba(165, 145, 154, 0.70)';
        ctx.lineWidth = 1.2;
        drawRoundedRect(0.8, 0.8, width - 1.6, totalHeight - 1.6, radius);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#8b0f3b';
        ctx.font = `bold ${titleFont}px Arial, sans-serif`;
        ctx.fillText('Leyenda', padding, padding + 20);

        ctx.strokeStyle = 'rgba(139, 15, 59, 0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding + headerHeight - 6);
        ctx.lineTo(width - padding, padding + headerHeight - 6);
        ctx.stroke();

        let cursorY = padding + headerHeight;
        preparedItems.forEach(function (item) {
            ctx.fillStyle = '#3d3340';
            ctx.font = `bold ${itemTitleFont}px Arial, sans-serif`;
            let textY = cursorY + itemTitleFont;
            item.titleLines.forEach(function (line) {
                ctx.fillText(line, padding, textY);
                textY += itemTitleFont * 1.25;
            });

            if (item.loadedImage && item.drawWidth > 0 && item.drawHeight > 0) {
                try {
                    ctx.drawImage(item.loadedImage, padding, cursorY + item.titleHeight + itemGap, item.drawWidth, item.drawHeight);
                } catch (_) {}
            }

            cursorY += item.rowHeight;
        });

        return {
            dataUrl: canvas.toDataURL('image/png'),
            width: width,
            height: totalHeight
        };
    }

    async function downloadCesiumViewPdf(viewer, Cesium, options) {
        if (state.print3dBusy) return;

        const jsPDF = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDF) {
            window.showToast && window.showToast('La librería de PDF no está disponible.', 'error');
            return;
        }
        if (!viewer || !Cesium) {
            window.showToast && window.showToast('La vista 3D aún no está lista.', 'error');
            return;
        }

        state.print3dBusy = true;
        updatePrint3dUi();

        try {
            setCesiumExportMode(true, viewer);
            const createdAt = new Date();
            const imageDataUrl = await captureCesiumSceneDataUrl(viewer);
            const summary = getCesiumViewSummary(viewer, Cesium);
            const includeLegend = !!(options && options.includeLegend);
            const legendSnapshot = includeLegend ? await buildCesiumLegendSnapshot() : null;
            const legendRequestedButUnavailable = includeLegend && !legendSnapshot;

            const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter', compress: true });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 28;
            const contentW = pageW - (margin * 2);

            pdf.setFillColor(130, 14, 53);
            pdf.roundedRect(margin, margin, contentW, 52, 16, 16, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.text('Ficha 3D del Atlas', margin + 18, margin + 22);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            pdf.text('Vista actual exportada directamente desde Cesium.', margin + 18, margin + 38);

            let y = margin + 74;
            pdf.setTextColor(82, 72, 85);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10.5);
            const infoRows = [
                `Fecha: ${formatPdfDate(createdAt)}`,
                `Centro: ${formatLatLonValue(summary.centerLat)}, ${formatLatLonValue(summary.centerLon)}`,
                `Altitud de cámara: ${Number.isFinite(summary.cameraHeight) ? Math.round(summary.cameraHeight).toLocaleString('es-MX') + ' m' : '--'}`,
                `Relieve: ${summary.exaggeration.toLocaleString('es-MX')}x`
            ];
            pdf.text(infoRows.join('   •   '), margin, y);
            y += 16;

            const imageTop = y + 2;
            const imageBoxH = pageH - imageTop - margin - 26;
            const legendGap = legendSnapshot ? 14 : 0;
            const legendColumnW = legendSnapshot ? Math.min(205, Math.max(170, contentW * 0.24)) : 0;
            const imageBoxW = contentW - legendColumnW - legendGap;
            const legendBoxX = margin + imageBoxW + legendGap;
            const legendBoxY = imageTop;
            const legendBoxH = imageBoxH;

            pdf.setDrawColor(220, 210, 215);
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin, imageTop, imageBoxW, imageBoxH, 16, 16, 'FD');

            const props = pdf.getImageProperties(imageDataUrl);
            const imgRatio = props.width / props.height;
            let drawW = imageBoxW - 10;
            let drawH = drawW / imgRatio;
            if (drawH > imageBoxH - 10) {
                drawH = imageBoxH - 10;
                drawW = drawH * imgRatio;
            }
            const drawX = margin + ((imageBoxW - drawW) / 2);
            const drawY = imageTop + ((imageBoxH - drawH) / 2);
            pdf.addImage(imageDataUrl, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST');

            if (legendSnapshot) {
                pdf.setDrawColor(220, 210, 215);
                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(legendBoxX, legendBoxY, legendColumnW, legendBoxH, 16, 16, 'FD');

                const legendRatio = legendSnapshot.width / legendSnapshot.height;
                let legendDrawW = legendColumnW - 10;
                let legendDrawH = legendDrawW / legendRatio;
                if (legendDrawH > legendBoxH - 10) {
                    legendDrawH = legendBoxH - 10;
                    legendDrawW = legendDrawH * legendRatio;
                }
                const legendDrawX = legendBoxX + ((legendColumnW - legendDrawW) / 2);
                const legendDrawY = legendBoxY + ((legendBoxH - legendDrawH) / 2);
                pdf.addImage(legendSnapshot.dataUrl, 'PNG', legendDrawX, legendDrawY, legendDrawW, legendDrawH, undefined, 'FAST');
            }

            pdf.setTextColor(110, 101, 112);
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9.5);
            const footerText = legendSnapshot
                ? 'Documento generado desde la vista 3D del Atlas Municipal de Peligros y Riesgos de Celaya, con la leyenda visible al momento de exportar.'
                : includeLegend
                    ? 'Documento generado desde la vista 3D del Atlas Municipal de Peligros y Riesgos de Celaya. La opción de leyenda estaba activada, pero no había una leyenda visible y expandida para incluir.'
                    : 'Documento generado desde la vista 3D del Atlas Municipal de Peligros y Riesgos de Celaya.';
            pdf.text(footerText, margin, pageH - 12);

            pdf.save(buildCesiumPdfFilename(createdAt));
            const successMessage = legendSnapshot
                ? 'Ficha 3D descargada en PDF con leyenda.'
                : legendRequestedButUnavailable
                    ? 'Ficha 3D descargada en PDF sin leyenda porque no estaba visible y expandida.'
                    : 'Ficha 3D descargada en PDF.';
            window.showToast && window.showToast(successMessage, 'success');
        } catch (error) {
            console.error('Ficha 3D Cesium', error);
            window.showToast && window.showToast(error.message || 'No fue posible generar la ficha 3D.', 'error');
        } finally {
            closePrint3dMenu();
            setCesiumExportMode(false, viewer);
            state.print3dBusy = false;
            updatePrint3dUi();
        }
    }

    function updatePlaceLabelsUi() {
        const button = state.placeLabelsToggleButton;
        if (!button) return;

        const enabled = !!state.placeLabelsEnabled;
        button.classList.toggle('active', enabled);
        button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        button.setAttribute('title', enabled ? 'Ocultar etiquetas' : 'Habilitar etiquetas');
        button.setAttribute('aria-label', enabled ? 'Ocultar etiquetas' : 'Habilitar etiquetas');
        button.innerHTML = '<i class="fas fa-tags" aria-hidden="true"></i>';
    }

    function syncPlaceLabelsVisibility(viewer) {
        if (state.placeLabelsLayer) {
            state.placeLabelsLayer.show = !!state.placeLabelsEnabled;
            if (state.placeLabelsEnabled && viewer && viewer.imageryLayers) {
                try {
                    viewer.imageryLayers.raiseToTop(state.placeLabelsLayer);
                } catch (error) {
                    console.warn('No se pudo elevar etiquetas de lugares en 3D', error);
                }
            }
        }

        if (viewer && viewer.scene) {
            viewer.scene.requestRender();
        }

        updatePlaceLabelsUi();
    }

    function removeExtraToolbarControls() {
        const shadowsButton = document.getElementById('atlas-cesium-shadows-toggle');
        if (shadowsButton) shadowsButton.remove();

        const exaggerationSelect = state.verticalExaggerationSelect;
        const exaggerationWrap = exaggerationSelect ? exaggerationSelect.closest('.atlas-cesium-toolbar-select-wrap') : document.querySelector('.atlas-cesium-toolbar-select-wrap');
        if (exaggerationWrap) exaggerationWrap.remove();

        state.shadowsToggleButton = null;
        state.verticalExaggerationSelect = null;
    }

    function ensurePlaceLabelsToggleButton(viewer) {
        if (state.placeLabelsToggleButton && state.placeLabelsToggleButton.isConnected) {
            updatePlaceLabelsUi();
            return state.placeLabelsToggleButton;
        }

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'atlas-cesium-place-labels-toggle';
        button.className = 'cesium-button cesium-toolbar-button atlas-cesium-toolbar-btn';
        button.addEventListener('click', function () {
            state.placeLabelsEnabled = !state.placeLabelsEnabled;
            syncPlaceLabelsVisibility(state.viewer);
        });

        group.appendChild(button);
        state.placeLabelsToggleButton = button;
        updatePlaceLabelsUi();
        return button;
    }

    function updateShadowsUi() {
        const button = state.shadowsToggleButton;
        if (!button) return;

        const enabled = !!state.shadowsEnabled;
        button.classList.toggle('active', enabled);
        button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        button.setAttribute('title', enabled ? 'Ocultar sombras del terreno' : 'Mostrar sombras del terreno');
        button.setAttribute('aria-label', enabled ? 'Ocultar sombras del terreno' : 'Mostrar sombras del terreno');
        button.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';
    }

    function syncShadows(viewer, Cesium) {
        if (!viewer || !viewer.scene) {
            updateShadowsUi();
            return;
        }

        const enabled = !!state.shadowsEnabled;
        try {
            viewer.shadows = enabled;
        } catch (error) {
            console.warn('No se pudo cambiar viewer.shadows', error);
        }

        try {
            if (viewer.shadowMap) {
                viewer.shadowMap.enabled = enabled;
            }
        } catch (error) {
            console.warn('No se pudo cambiar shadowMap.enabled', error);
        }

        try {
            if (viewer.scene.globe) {
                viewer.scene.globe.enableLighting = enabled;
            }
        } catch (error) {
            console.warn('No se pudo cambiar enableLighting del globo', error);
        }

        try {
            if (typeof viewer.scene.globe.dynamicAtmosphereLighting !== 'undefined') {
                viewer.scene.globe.dynamicAtmosphereLighting = enabled;
            }
        } catch (error) {
            console.warn('No se pudo cambiar iluminación dinámica atmosférica', error);
        }

        try {
            if (Cesium && typeof Cesium.ShadowMode !== 'undefined' && typeof viewer.terrainShadows !== 'undefined') {
                viewer.terrainShadows = enabled ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.DISABLED;
            }
        } catch (error) {
            console.warn('No se pudo cambiar terrainShadows', error);
        }

        requestSceneRender(viewer);
        updateShadowsUi();
    }

    function ensureShadowsToggleButton(viewer, Cesium) {
        if (state.shadowsToggleButton && state.shadowsToggleButton.isConnected) {
            updateShadowsUi();
            return state.shadowsToggleButton;
        }

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'atlas-cesium-shadows-toggle';
        button.className = 'cesium-button cesium-toolbar-button atlas-cesium-toolbar-btn';
        button.addEventListener('click', function () {
            state.shadowsEnabled = !state.shadowsEnabled;
            syncShadows(state.viewer, Cesium || window.Cesium);
        });

        group.appendChild(button);
        state.shadowsToggleButton = button;
        updateShadowsUi();
        return button;
    }

    function applyVerticalExaggeration(viewer) {
        if (!viewer || !viewer.scene) return;

        const value = Number(state.verticalExaggeration) || 1;
        try {
            if (typeof viewer.scene.verticalExaggeration !== 'undefined') {
                viewer.scene.verticalExaggeration = value;
            }
        } catch (error) {
            console.warn('No se pudo aplicar verticalExaggeration', error);
        }

        try {
            if (typeof viewer.scene.verticalExaggerationRelativeHeight !== 'undefined') {
                viewer.scene.verticalExaggerationRelativeHeight = 0;
            }
        } catch (error) {
            console.warn('No se pudo ajustar verticalExaggerationRelativeHeight', error);
        }

        requestSceneRender(viewer);
    }

    function getVerticalExaggerationLabel(value) {
        const numericValue = Number(value) || 1;
        if (numericValue >= 3) return 'Relieve muy marcado';
        if (numericValue >= 2) return 'Relieve marcado';
        if (numericValue >= 1.5) return 'Relieve moderado';
        return 'Relieve normal';
    }

    function updateVerticalExaggerationUi() {
        const select = state.verticalExaggerationSelect;
        if (!select) return;
        select.value = String(Number(state.verticalExaggeration) || 1);
        const currentLabel = getVerticalExaggerationLabel(select.value);
        select.setAttribute('title', `Nivel del terreno: ${currentLabel}`);
        select.setAttribute('aria-label', `Nivel del terreno: ${currentLabel}`);
    }

    function ensureVerticalExaggerationControl(viewer) {
        if (state.verticalExaggerationSelect && state.verticalExaggerationSelect.isConnected) {
            updateVerticalExaggerationUi();
            return state.verticalExaggerationSelect;
        }

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const wrap = document.createElement('label');
        wrap.className = 'atlas-cesium-toolbar-select-wrap';
        wrap.title = 'Nivel del relieve del terreno';
        wrap.setAttribute('aria-label', 'Nivel del relieve del terreno');
        wrap.innerHTML = '<i class="fas fa-mountain" aria-hidden="true"></i>';

        const select = document.createElement('select');
        select.className = 'atlas-cesium-toolbar-select';
        select.innerHTML = `
            <option value="1">Relieve normal</option>
            <option value="1.5">Relieve moderado</option>
            <option value="2">Relieve marcado</option>
            <option value="3">Relieve muy marcado</option>
        `;
        select.addEventListener('change', function () {
            state.verticalExaggeration = Number(select.value) || 1;
            applyVerticalExaggeration(state.viewer);
            updateVerticalExaggerationUi();
        });

        wrap.appendChild(select);
        group.appendChild(wrap);
        state.verticalExaggerationSelect = select;
        updateVerticalExaggerationUi();
        return select;
    }

    function updateCoordsHud(text) {
        const hud = state.coordsHud;
        if (!hud) return;
        hud.textContent = text || 'Lat: -- | Lon: -- | Elev.: --';
    }

    function ensureCoordsHud(viewer) {
        if (state.coordsHud && state.coordsHud.isConnected) {
            return state.coordsHud;
        }

        const container = viewer && viewer.container;
        if (!container) return null;

        const hud = document.createElement('div');
        hud.className = 'atlas-cesium-coords';
        hud.setAttribute('aria-live', 'polite');
        container.appendChild(hud);
        state.coordsHud = hud;
        updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
        return hud;
    }

    function updateCoordsFromPosition(viewer, Cesium, position) {
        if (!viewer || !Cesium || !position || !viewer.scene) {
            updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
            return;
        }

        const scene = viewer.scene;
        let cartesian = null;

        try {
            if (scene.pickPositionSupported) {
                cartesian = scene.pickPosition(position);
            }
        } catch (error) {
            cartesian = null;
        }

        if (!cartesian) {
            try {
                const ray = viewer.camera.getPickRay(position);
                if (ray) {
                    cartesian = scene.globe.pick(ray, scene);
                }
            } catch (error) {
                cartesian = null;
            }
        }

        if (!cartesian) {
            try {
                cartesian = viewer.camera.pickEllipsoid(position, scene.globe.ellipsoid);
            } catch (error) {
                cartesian = null;
            }
        }

        if (!cartesian) {
            updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
            return;
        }

        try {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            let elevation = Number.NaN;

            try {
                if (scene.globe && typeof scene.globe.getHeight === 'function') {
                    elevation = scene.globe.getHeight(cartographic);
                }
            } catch (error) {
                elevation = Number.NaN;
            }

            if (!Number.isFinite(elevation)) {
                elevation = cartographic.height;
            }

            updateCoordsHud(`Lat: ${formatDegrees(lat, 'N', 'S')} | Lon: ${formatDegrees(lon, 'E', 'O')} | Elev.: ${formatMeters(elevation)}`);
        } catch (error) {
            updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
        }
    }

    function ensureCoordsTracking(viewer, Cesium) {
        ensureCoordsHud(viewer);
        if (state.coordsHandler) return state.coordsHandler;

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (movement) {
            if (!movement || !movement.endPosition) return;
            updateCoordsFromPosition(viewer, Cesium, movement.endPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        viewer.scene.canvas.addEventListener('mouseleave', function () {
            updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
        });

        state.coordsHandler = handler;
        return handler;
    }

    function updateCompassUi(viewer) {
        if (!state.compassNeedle || !viewer || !window.Cesium) return;
        const heading = Number(viewer.camera && viewer.camera.heading) || 0;
        state.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${(-window.Cesium.Math.toDegrees(heading)).toFixed(2)}deg)`;
    }

    function resetCameraNorth(viewer, Cesium) {
        if (!viewer || !Cesium) return;

        const destination = viewer.camera.positionWC ? viewer.camera.positionWC.clone() : viewer.camera.position.clone();
        viewer.camera.flyTo({
            destination,
            orientation: {
                heading: 0,
                pitch: viewer.camera.pitch,
                roll: 0
            },
            duration: 0.9
        });
    }

    function ensureCompass(viewer, Cesium) {
        if (state.compassButton && state.compassButton.isConnected) {
            updateCompassUi(viewer);
            return state.compassButton;
        }

        const container = viewer && viewer.container;
        if (!container) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'atlas-cesium-compass';
        button.title = 'Brújula N / S / E / O · orientar al norte';
        button.setAttribute('aria-label', 'Brújula N / S / E / O · orientar al norte');
        button.innerHTML = '<span class="atlas-cesium-compass__ring"></span><span class="atlas-cesium-compass__needle"></span><span class="atlas-cesium-compass__label atlas-cesium-compass__label--n">N</span><span class="atlas-cesium-compass__label atlas-cesium-compass__label--s">S</span><span class="atlas-cesium-compass__label atlas-cesium-compass__label--e">E</span><span class="atlas-cesium-compass__label atlas-cesium-compass__label--o">O</span>';
        button.addEventListener('click', function () {
            resetCameraNorth(state.viewer, Cesium || window.Cesium);
        });

        container.appendChild(button);
        state.compassButton = button;
        state.compassNeedle = button.querySelector('.atlas-cesium-compass__needle');
        updateCompassUi(viewer);
        return button;
    }

    // OPCIÓN C — Botón "Mi ubicación" en la barra de Cesium
    function ensureLocationButton(viewer, Cesium) {
        if (state.locationButton && state.locationButton.isConnected) return state.locationButton;

        const group = getCustomToolbarGroup(viewer);
        if (!group) return null;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = 'atlas-cesium-location-btn';
        button.className = 'cesium-button cesium-toolbar-button atlas-cesium-toolbar-btn';
        button.title = 'Ir a mi ubicación actual';
        button.setAttribute('aria-label', 'Ir a mi ubicación actual');
        button.innerHTML = '<i class="fas fa-location-arrow" aria-hidden="true"></i>';

        button.addEventListener('click', function () {
            if (!navigator.geolocation) {
                if (window.showToast) window.showToast('Tu dispositivo no soporta geolocalización.', 'error');
                return;
            }
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-location-arrow" aria-hidden="true"></i>';
                    const lon = pos.coords.longitude;
                    const lat = pos.coords.latitude;
                    const v = state.viewer;
                    if (!v || !window.Cesium) return;
                    v.camera.flyTo({
                        destination: window.Cesium.Cartesian3.fromDegrees(lon, lat, 1800),
                        orientation: {
                            heading: 0,
                            pitch: window.Cesium.Math.toRadians(-45),
                            roll: 0
                        },
                        duration: 2.0
                    });
                    if (v.scene) v.scene.requestRender();
                    if (window.showToast) window.showToast('Vista 3D centrada en tu ubicación.', 'success');
                },
                function (err) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-location-arrow" aria-hidden="true"></i>';
                    const msg = err.code === 1
                        ? 'Permiso de ubicación denegado por el navegador.'
                        : 'No se pudo obtener tu ubicación.';
                    if (window.showToast) window.showToast(msg, 'error');
                },
                { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
            );
        });

        group.appendChild(button);
        state.locationButton = button;
        return button;
    }

    // OPCIÓN A — Proyectar capas WMS activas del 2D en Cesium 3D
    function syncActiveLayersToCesium(viewer, Cesium, showFeedback) {
        if (!viewer || !Cesium) return;

        // 1. Limpiar capas previamente sincronizadas
        state.syncedCesiumLayers.forEach(function (cl) {
            try { viewer.imageryLayers.remove(cl, false); } catch (e) {}
        });
        state.syncedCesiumLayers = [];

        // 2. Obtener capas WMS visibles (salvo Mpio, ya manejado por limiteMunicipalLayer)
        var wmsMap = window.wmsLayers || {};
        var visibleEntries = Object.entries(wmsMap).filter(function (entry) {
            var key = entry[0];
            var olLayer = entry[1];
            if (!olLayer || typeof olLayer.getVisible !== 'function') return false;
            if (!olLayer.getVisible()) return false;
            if (key === 'Mpio') return false;
            var source = typeof olLayer.getSource === 'function' ? olLayer.getSource() : null;
            if (!source) return false;
            var url = typeof source.getUrl === 'function' ? source.getUrl() : null;
            var params = typeof source.getParams === 'function' ? source.getParams() : null;
            return !!(url && params && params.LAYERS);
        });

        // Ordenar por zIndex para respetar el orden visual del 2D
        visibleEntries.sort(function (a, b) {
            var za = (typeof a[1].getZIndex === 'function' ? a[1].getZIndex() : 0) || 0;
            var zb = (typeof b[1].getZIndex === 'function' ? b[1].getZIndex() : 0) || 0;
            return za - zb;
        });

        visibleEntries.forEach(function (entry) {
            var key = entry[0];
            var olLayer = entry[1];
            try {
                var source = olLayer.getSource();
                var url = source.getUrl();
                var layerParam = source.getParams().LAYERS;
                var opacity = typeof olLayer.getOpacity === 'function' ? olLayer.getOpacity() : 1;

                var provider = new Cesium.WebMapServiceImageryProvider({
                    url: url,
                    layers: layerParam,
                    parameters: {
                        service: 'WMS',
                        request: 'GetMap',
                        transparent: true,
                        format: 'image/png',
                        version: '1.1.1'
                    },
                    enablePickFeatures: false,
                    credit: key
                });

                var cesiumLayer = viewer.imageryLayers.addImageryProvider(provider);
                cesiumLayer.alpha = Number.isFinite(opacity) ? opacity : 1;
                cesiumLayer.show = true;
                state.syncedCesiumLayers.push(cesiumLayer);
            } catch (e) {
                console.warn('No se pudo proyectar capa "' + key + '" en 3D:', e);
            }
        });

        // 3. Subir límite municipal y etiquetas al tope
        if (state.limiteMunicipalLayer) {
            try { viewer.imageryLayers.raiseToTop(state.limiteMunicipalLayer); } catch (e) {}
        }
        if (state.placeLabelsLayer && state.placeLabelsEnabled) {
            try { viewer.imageryLayers.raiseToTop(state.placeLabelsLayer); } catch (e) {}
        }

        requestSceneRender(viewer);

        // 4. Feedback al abrir 3D con capas activas
        if (showFeedback && visibleEntries.length > 0 && window.showToast) {
            var n = visibleEntries.length;
            window.showToast(
                n + ' capa' + (n > 1 ? 's' : '') + ' del Atlas proyectada' + (n > 1 ? 's' : '') + ' en 3D.',
                'info'
            );
        }
    }

    function bindCameraListeners(viewer, Cesium) {
        if (!viewer || !viewer.camera || state.cameraListenersBound) return;
        viewer.camera.changed.addEventListener(function () {
            updateCompassUi(viewer);
        });
        state.cameraListenersBound = true;
        updateCompassUi(viewer);
    }

    function showError(message) {
        console.error(message);
        if (window.showToast) {
            window.showToast(message, 'error');
            return;
        }
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = 'toast error visible';
            setTimeout(() => toast.classList.remove('visible'), 3200);
        }
    }

    function loadCssOnce(href, id) {
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    function loadScriptOnce(src, id) {
        return new Promise((resolve, reject) => {
            const existing = document.getElementById(id);
            if (existing) {
                if (existing.dataset.loaded === '1') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.async = true;
            script.onload = function () {
                script.dataset.loaded = '1';
                resolve();
            };
            script.onerror = function () {
                reject(new Error(`No se pudo cargar ${src}`));
            };
            document.head.appendChild(script);
        });
    }

    async function loadCesium() {
        if (window.Cesium) return window.Cesium;
        if (state.loadingPromise) return state.loadingPromise;

        window.CESIUM_BASE_URL = CESIUM_BASE_URL;
        loadCssOnce(`${CESIUM_BASE_URL}Widgets/widgets.css`, 'atlas-cesium-widgets-css');

        state.loadingPromise = loadScriptOnce(`${CESIUM_BASE_URL}Cesium.js`, 'atlas-cesium-script').then(() => {
            if (!window.Cesium) {
                throw new Error('Cesium no quedó disponible en window.Cesium');
            }
            if (window.Cesium.Ion && CESIUM_ION_TOKEN) {
                window.Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;
            }
            return window.Cesium;
        });

        return state.loadingPromise;
    }

    function getCurrentTarget() {
        if (!window.map || !window.ol) {
            return {
                lon: -100.8167,
                lat: 20.5289,
                height: 5200,
                heading: 0
            };
        }

        const view = window.map.getView();
        const center = view && view.getCenter ? view.getCenter() : null;
        if (!center) {
            return {
                lon: -100.8167,
                lat: 20.5289,
                height: 5200,
                heading: 0
            };
        }

        const lonLat = window.ol.proj.toLonLat(center);
        const zoom = Number(view.getZoom ? view.getZoom() : 12) || 12;
        const rotation = Number(view.getRotation ? view.getRotation() : 0) || 0;
        const height = Math.max(1800, Math.min(85000, 220000 / Math.pow(2, Math.max(0, zoom - 8))));

        return {
            lon: lonLat[0],
            lat: lonLat[1],
            height,
            heading: -rotation
        };
    }

    async function applyTerrain(scene, Cesium) {
        if (!scene || !Cesium) return;

        try {
            if (scene.setTerrain && Cesium.Terrain && typeof Cesium.Terrain.fromWorldTerrain === 'function') {
                scene.setTerrain(Cesium.Terrain.fromWorldTerrain());
                return;
            }
        } catch (error) {
            console.warn('No se pudo aplicar Terrain.fromWorldTerrain()', error);
        }

        try {
            if (scene.setTerrain && Cesium.Terrain && typeof Cesium.createWorldTerrainAsync === 'function') {
                scene.setTerrain(new Cesium.Terrain(Cesium.createWorldTerrainAsync()));
                return;
            }
        } catch (error) {
            console.warn('No se pudo aplicar createWorldTerrainAsync()', error);
        }

        try {
            if (scene.globe && typeof Cesium.createWorldTerrain === 'function') {
                scene.globe.terrainProvider = Cesium.createWorldTerrain();
            }
        } catch (error) {
            console.warn('No se pudo aplicar createWorldTerrain()', error);
        }
    }

    function configureDefaultHome(Cesium) {
        if (!Cesium || !Cesium.Camera || !Cesium.Rectangle || typeof Cesium.Rectangle.fromDegrees !== 'function') {
            return;
        }

        try {
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
                CELAYA_HOME.west,
                CELAYA_HOME.south,
                CELAYA_HOME.east,
                CELAYA_HOME.north
            );
            if (typeof Cesium.Camera.DEFAULT_VIEW_FACTOR !== 'undefined') {
                Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
            }
        } catch (error) {
            console.warn('No se pudo configurar Home directo a Celaya', error);
        }
    }

    function overrideHomeButtonToStartView(viewer, Cesium) {
        if (!viewer || !Cesium || !viewer.homeButton || !viewer.homeButton.viewModel || !viewer.homeButton.viewModel.command) {
            return;
        }

        const command = viewer.homeButton.viewModel.command;
        if (command.__atlasHomeOverrideBound) {
            return;
        }

        command.beforeExecute.addEventListener(function (event) {
            if (event) {
                event.cancel = true;
            }
            flyToCelayaStartView(viewer, Cesium);
        });

        command.__atlasHomeOverrideBound = true;
    }

    function flyToCelayaHome(viewer, Cesium) {
        if (!viewer || !Cesium) return;

        try {
            ensureLimiteMunicipalLayer(viewer, Cesium);
        } catch (error) {
            console.warn('No se pudo asegurar Límite Municipal antes de Home', error);
        }

        try {
            viewer.camera.flyTo({
                destination: Cesium.Rectangle.fromDegrees(
                    CELAYA_HOME.west,
                    CELAYA_HOME.south,
                    CELAYA_HOME.east,
                    CELAYA_HOME.north
                ),
                orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-35),
                    roll: 0
                },
                duration: 1.6
            });

            if (viewer.scene) {
                viewer.scene.requestRender();
            }
            return;
        } catch (error) {
            console.warn('No se pudo volar al rectángulo de Celaya, se usará centro', error);
        }

        try {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    CELAYA_HOME.centerLon,
                    CELAYA_HOME.centerLat,
                    CELAYA_HOME.height
                ),
                orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-42),
                    roll: 0
                },
                duration: 1.6
            });
            if (viewer.scene) {
                viewer.scene.requestRender();
            }
        } catch (error) {
            console.warn('No se pudo aplicar Home directo a Celaya', error);
        }
    }


    function flyToCelayaStartView(viewer, Cesium) {
        if (!viewer || !Cesium) return;

        try {
            ensureLimiteMunicipalLayer(viewer, Cesium);
        } catch (error) {
            console.warn('No se pudo asegurar Límite Municipal antes de la vista inicial', error);
        }

        try {
            const rectangle = Cesium.Rectangle.fromDegrees(
                CELAYA_HOME.west,
                CELAYA_HOME.south,
                CELAYA_HOME.east,
                CELAYA_HOME.north
            );
            const sphere = Cesium.BoundingSphere.fromRectangle3D(rectangle, Cesium.Ellipsoid.WGS84, 1200);
            const range = Math.max(52000, sphere.radius * 2.35);

            viewer.camera.flyToBoundingSphere(sphere, {
                offset: new Cesium.HeadingPitchRange(
                    Cesium.Math.toRadians(0),
                    Cesium.Math.toRadians(-42),
                    range
                ),
                duration: 1.8
            });

            if (viewer.scene) {
                viewer.scene.requestRender();
            }
        } catch (error) {
            console.warn('No se pudo aplicar la vista inicial 3D de Celaya', error);
            try {
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        CELAYA_START_VIEW.lon,
                        CELAYA_START_VIEW.lat,
                        36000
                    ),
                    orientation: {
                        heading: Cesium.Math.toRadians(0),
                        pitch: Cesium.Math.toRadians(-42),
                        roll: 0
                    },
                    duration: 1.8
                });
                if (viewer.scene) {
                    viewer.scene.requestRender();
                }
            } catch (fallbackError) {
                console.warn('Tampoco se pudo aplicar la vista inicial 3D de respaldo', fallbackError);
                flyToCelayaHome(viewer, Cesium);
            }
        }
    }

    function ensureLimiteMunicipalLayer(viewer, Cesium) {
        if (!viewer || !Cesium) return null;
        if (state.limiteMunicipalLayer) {
            state.limiteMunicipalLayer.show = true;
            try {
                viewer.imageryLayers.raiseToTop(state.limiteMunicipalLayer);
            } catch (error) {
                console.warn('No se pudo elevar Límite Municipal en 3D', error);
            }
            return state.limiteMunicipalLayer;
        }

        try {
            const provider = new Cesium.WebMapServiceImageryProvider({
                url: (window.MUNICIPIO_CONFIG && window.MUNICIPIO_CONFIG.geoserver && window.MUNICIPIO_CONFIG.geoserver.url ? `${window.MUNICIPIO_CONFIG.geoserver.url}/${window.MUNICIPIO_CONFIG.geoserver.workspace}/wms` : '/geoserver/pc/wms'),
                layers: 'Mpio',
                parameters: {
                    service: 'WMS',
                    request: 'GetMap',
                    transparent: true,
                    format: 'image/png',
                    version: '1.1.1'
                },
                enablePickFeatures: false,
                credit: 'Límite Municipal'
            });

            state.limiteMunicipalLayer = viewer.imageryLayers.addImageryProvider(provider);
            state.limiteMunicipalLayer.alpha = 1;
            state.limiteMunicipalLayer.show = true;
            try {
                viewer.imageryLayers.raiseToTop(state.limiteMunicipalLayer);
            } catch (error) {
                console.warn('No se pudo elevar Límite Municipal en 3D', error);
            }
            return state.limiteMunicipalLayer;
        } catch (error) {
            console.warn('No se pudo agregar Límite Municipal a la vista 3D', error);
            return null;
        }
    }


    function getGoogleExpandedLabelsStyle() {
        return [
            { elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.business', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] }
        ];
    }

    function createFallbackLabelsLayer(viewer, Cesium) {
        if (!viewer || !Cesium || typeof Cesium.UrlTemplateImageryProvider !== 'function') {
            return null;
        }

        const provider = new Cesium.UrlTemplateImageryProvider({
            url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
            credit: 'Etiquetas de lugares'
        });

        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layer.alpha = 1;
        layer.show = !!state.placeLabelsEnabled;
        return layer;
    }

    async function ensurePlaceLabelsLayer(viewer, Cesium) {
        if (!viewer || !Cesium) {
            return null;
        }

        if (state.placeLabelsLayer) {
            syncPlaceLabelsVisibility(viewer);
            return state.placeLabelsLayer;
        }

        if (state.placeLabelsLoadingPromise) {
            return state.placeLabelsLoadingPromise;
        }

        state.placeLabelsLoadingPromise = (async function () {
            let layer = null;

            try {
                if (
                    Cesium.Google2DImageryProvider &&
                    typeof Cesium.Google2DImageryProvider.fromIonAssetId === 'function'
                ) {
                    const provider = await Cesium.Google2DImageryProvider.fromIonAssetId({
                        assetId: 3830184,
                        overlayLayerType: 'layerRoadmap',
                        language: 'es-MX',
                        region: 'MX',
                        styles: getGoogleExpandedLabelsStyle()
                    });

                    layer = viewer.imageryLayers.addImageryProvider(provider);
                }
            } catch (googleError) {
                console.warn('No se pudo cargar la fuente ampliada de etiquetas de Google en 3D; se usará respaldo.', googleError);
            }

            if (!layer) {
                try {
                    layer = createFallbackLabelsLayer(viewer, Cesium);
                } catch (fallbackError) {
                    console.warn('No se pudo cargar el respaldo de etiquetas de lugares en 3D', fallbackError);
                }
            }

            state.placeLabelsLayer = layer || null;

            if (state.placeLabelsLayer) {
                state.placeLabelsLayer.alpha = 1;
                state.placeLabelsLayer.show = !!state.placeLabelsEnabled;
                syncPlaceLabelsVisibility(viewer);
            }

            return state.placeLabelsLayer;
        })().finally(function () {
            state.placeLabelsLoadingPromise = null;
        });

        return state.placeLabelsLoadingPromise;
    }

    async function ensureViewer() {
        if (state.viewer) return state.viewer;

        const Cesium = await loadCesium();
        const container = document.getElementById('atlas-cesium-view');
        if (!container) {
            throw new Error('No existe el contenedor de vista 3D');
        }

        const viewerOptions = {
            animation: false,
            timeline: false,
            geocoder: false,
            homeButton: true,
            sceneModePicker: false,
            navigationHelpButton: false,
            fullscreenButton: false,
            infoBox: false,
            selectionIndicator: false,
            baseLayerPicker: false,
            shouldAnimate: true,
            contextOptions: {
                webgl: {
                    alpha: false,
                    antialias: true,
                    preserveDrawingBuffer: true
                }
            }
        };

        try {
            if (typeof Cesium.createWorldImageryAsync === 'function') {
                viewerOptions.baseLayer = new Cesium.ImageryLayer(await Cesium.createWorldImageryAsync());
            } else if (typeof Cesium.IonImageryProvider === 'function') {
                viewerOptions.imageryProvider = await Cesium.IonImageryProvider.fromAssetId(2);
            } else if (typeof Cesium.OpenStreetMapImageryProvider === 'function') {
                viewerOptions.imageryProvider = new Cesium.OpenStreetMapImageryProvider({
                    url: 'https://tile.openstreetmap.org/'
                });
            }
        } catch (error) {
            console.warn('No se pudo preparar la imagen 3D inicial', error);
            if (typeof Cesium.OpenStreetMapImageryProvider === 'function') {
                viewerOptions.imageryProvider = new Cesium.OpenStreetMapImageryProvider({
                    url: 'https://tile.openstreetmap.org/'
                });
            }
        }

        try {
            if (Cesium.Terrain && typeof Cesium.Terrain.fromWorldTerrain === 'function') {
                viewerOptions.terrain = Cesium.Terrain.fromWorldTerrain();
            } else if (typeof Cesium.createWorldTerrainAsync === 'function') {
                viewerOptions.terrainProvider = await Cesium.createWorldTerrainAsync();
            } else if (typeof Cesium.createWorldTerrain === 'function') {
                viewerOptions.terrainProvider = Cesium.createWorldTerrain();
            }
        } catch (error) {
            console.warn('No se pudo preparar el terreno 3D inicial', error);
        }

        configureDefaultHome(Cesium);
        const viewer = new Cesium.Viewer(container, viewerOptions);
        overrideHomeButtonToStartView(viewer, Cesium);
        await applyTerrain(viewer.scene, Cesium);

        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.requestRenderMode = true;
        viewer.scene.fxaa = true;
        viewer.scene.screenSpaceCameraController.minimumZoomDistance = 120;
        viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
        viewer.camera.percentageChanged = 0.0001;
        viewer.resolutionScale = 1;

        try {
            if (typeof Cesium.createOsmBuildingsAsync === 'function') {
                const buildings = await Cesium.createOsmBuildingsAsync();
                viewer.scene.primitives.add(buildings);
            }
        } catch (error) {
            console.warn('No se pudieron cargar edificios OSM 3D', error);
        }

        ensureCesiumGoogleGeocoder(viewer);
        ensureLimiteMunicipalLayer(viewer, Cesium);
        await ensurePlaceLabelsLayer(viewer, Cesium);
        ensurePlaceLabelsToggleButton(viewer);
        ensureVerticalExaggerationControl(viewer);         // Opción B: exageración vertical
        ensureLocationButton(viewer, Cesium);              // Opción C: Mi ubicación
        ensurePrint3dButton(viewer, Cesium);
        ensureCoordsHud(viewer);
        ensureCoordsTracking(viewer, Cesium);
        ensureCompass(viewer, Cesium);
        bindCameraListeners(viewer, Cesium);
        syncPlaceLabelsVisibility(viewer);
        syncShadows(viewer, Cesium);
        applyVerticalExaggeration(viewer);
        updateCompassUi(viewer);
        arrangeToolbarForCitizen(viewer);

        state.viewer = viewer;
        return viewer;
    }

    function flyToCurrentView(viewer) {
        const target = getCurrentTarget();
        if (!viewer || !target || !window.Cesium) return;

        viewer.camera.flyTo({
            destination: window.Cesium.Cartesian3.fromDegrees(target.lon, target.lat, target.height),
            orientation: {
                heading: target.heading,
                pitch: window.Cesium.Math.toRadians(-48),
                roll: 0
            },
            duration: 1.8
        });
    }

    function syncButtonState() {
        const button = getButton();
        if (button) {
            button.classList.toggle('active', state.enabled);
        }
    }


    const HIDDEN_HEADER_BUTTON_IDS = [
        'btn-measure-distance',
        'btn-measure-area',
        'btn-object-stats',
        'btn-elevation-profile',
        'btn-terrain-3d',
        'btn-analisis-demografico',
        'btn-location',
        'btn-view-prev',
        'btn-view-next',
        'btn-upload-layer',
        'btn-print',
        'btn-geocoder-launch',
        'btn-coords-launch',
        'btn-route-launch',
        'btn-guia',
        'btn-info'
    ];

    function syncHeaderToolbarForCesium(enabled) {
        const body = document.body;
        if (body) {
            body.classList.toggle('atlas-cesium-active', !!enabled);
        }

        HIDDEN_HEADER_BUTTON_IDS.forEach(function (id) {
            const button = document.getElementById(id);
            if (!button) return;
            button.classList.toggle('cesium-hidden-tool', !!enabled);
            button.setAttribute('aria-hidden', enabled ? 'true' : 'false');
            if (enabled) {
                button.setAttribute('tabindex', '-1');
            } else {
                button.removeAttribute('tabindex');
            }
        });

        document.querySelectorAll('.header-tools .tb-group, .header-tools .toolbar-group').forEach(function (group) {
            const visibleButtons = Array.from(group.querySelectorAll('.tb-btn, .header-btn')).filter(function (button) {
                return !button.classList.contains('cesium-hidden-tool');
            });
            group.classList.toggle('atlas-cesium-empty-group', !!enabled && visibleButtons.length === 0);
        });
    }

    function updateLegendLayoutFor3D() {
        const body = document.body;
        const legendPanel = document.getElementById('legend-panel');
        const shell = getShell();

        if (!body || !legendPanel) return;

        if (!state.enabled || !shell || shell.hidden) {
            syncHeaderToolbarForCesium(false);
            body.style.removeProperty('--atlas-cesium-legend-top');
            body.style.removeProperty('--atlas-cesium-legend-max-height');
            return;
        }

        syncHeaderToolbarForCesium(true);

        const viewerContainer = state.viewer && state.viewer.container ? state.viewer.container : shell;
        const toolbar = viewerContainer ? viewerContainer.querySelector('.cesium-viewer-toolbar') : null;
        const shellRect = shell.getBoundingClientRect();
        const toolbarRect = toolbar ? toolbar.getBoundingClientRect() : null;

        let top = 92;
        if (toolbarRect) {
            top = Math.ceil(toolbarRect.bottom + 10);
        } else if (shellRect) {
            top = Math.ceil(shellRect.top + 18);
        }

        const minTop = shellRect ? Math.ceil(shellRect.top + 8) : 80;
        const maxTop = Math.max(minTop, window.innerHeight - 180);
        top = Math.max(minTop, Math.min(top, maxTop));

        const maxHeight = Math.max(140, window.innerHeight - top - 14);
        body.style.setProperty('--atlas-cesium-legend-top', `${top}px`);
        body.style.setProperty('--atlas-cesium-legend-max-height', `${maxHeight}px`);
    }

    function close3D() {
        const mustRestoreStreetView = !!state.streetViewReturnState;
        const shell = getShell();
        if (shell) shell.hidden = true;
        syncHeaderToolbarForCesium(false);
        state.enabled = false;
        document.dispatchEvent(new CustomEvent('atlas:cesium:close'));
        updateLegendLayoutFor3D();
        syncButtonState();

        // Restaurar leyenda si fue ocultada por el 3D
        const legendPanel = document.getElementById('legend-panel');
        if (legendPanel && legendPanel.dataset.hiddenBy3d === '1') {
            delete legendPanel.dataset.hiddenBy3d;
            legendPanel.classList.add('visible');
        }

        if (state.limiteMunicipalLayer) {
            state.limiteMunicipalLayer.show = false;
        }
        if (state.placeLabelsLayer) {
            state.placeLabelsLayer.show = false;
        }
        // Opción A: limpiar capas WMS sincronizadas al volver al 2D
        if (state.syncedCesiumLayers.length > 0 && state.viewer) {
            state.syncedCesiumLayers.forEach(function (cl) {
                try { state.viewer.imageryLayers.remove(cl, false); } catch (e) {}
            });
            state.syncedCesiumLayers = [];
        }
        updateCoordsHud('Lat: -- | Lon: -- | Elev.: --');
        updatePlaceLabelsUi();
        updateShadowsUi();
        updateVerticalExaggerationUi();
        updateCompassUi(state.viewer);
        if (state.viewer && state.viewer.scene) {
            state.viewer.scene.requestRender();
        }
        if (mustRestoreStreetView) {
            restoreStreetViewAfter3D();
        }
    }

    async function open3D() {
        const shell = getShell();
        if (!shell) {
            throw new Error('No existe el contenedor 3D');
        }

        captureStreetViewReturnState();
        await closeStreetViewBefore3D();
        shell.hidden = false;
        syncHeaderToolbarForCesium(true);
        document.dispatchEvent(new CustomEvent('atlas:cesium:open'));

        // Ocultar leyenda en 3D solo si no hay capas activas
        const legendPanel = document.getElementById('legend-panel');
        const hasActiveLayers = Array.isArray(window.activeLayers) && window.activeLayers.length > 0;
        if (legendPanel && !hasActiveLayers) {
            legendPanel.dataset.hiddenBy3d = '1';
            legendPanel.classList.remove('visible');
        }

        state.placeLabelsEnabled = false;
        state.shadowsEnabled = false;
        state.verticalExaggeration = 1;
        const viewer = await ensureViewer();
        if (window.Cesium) {
            ensureCesiumGoogleGeocoder(viewer);
            ensureLimiteMunicipalLayer(viewer, window.Cesium);
            await ensurePlaceLabelsLayer(viewer, window.Cesium);
            ensurePlaceLabelsToggleButton(viewer);
            ensureVerticalExaggerationControl(viewer);                // Opción B
            ensureLocationButton(viewer, window.Cesium);              // Opción C
            ensureCoordsHud(viewer);
            ensureCoordsTracking(viewer, window.Cesium);
            ensureCompass(viewer, window.Cesium);
            bindCameraListeners(viewer, window.Cesium);
            syncShadows(viewer, window.Cesium);
            applyVerticalExaggeration(viewer);
            syncActiveLayersToCesium(viewer, window.Cesium, true);   // Opción A
        }
        syncPlaceLabelsVisibility(viewer);
        updateVerticalExaggerationUi();
        updateCompassUi(viewer);
        arrangeToolbarForCitizen(viewer);
        state.enabled = true;
        syncButtonState();
        updateLegendLayoutFor3D();

        setTimeout(() => {
            if (viewer && typeof viewer.resize === 'function') viewer.resize();
            updateLegendLayoutFor3D();
            if (window.Cesium) {
                flyToCelayaStartView(viewer, window.Cesium);
            } else {
                flyToCurrentView(viewer);
            }
            if (viewer && viewer.scene) viewer.scene.requestRender();
        }, 80);
    }

    async function toggle3D() {
        if (state.enabled) {
            close3D();
            return;
        }

        try {
            await open3D();
        } catch (error) {
            restoreStreetViewAfter3D();
            console.error(error);
            close3D();
            showError('No se pudo abrir la vista 3D');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const button = getButton();
        if (!button) return;

        button.addEventListener('click', toggle3D);

        window.addEventListener('resize', function () {
            if (state.viewer && typeof state.viewer.resize === 'function') {
                state.viewer.resize();
            }
            updateLegendLayoutFor3D();
        });

        // Opción A: escuchar cambios de capas desde app.js para sincronizar el 3D
        document.addEventListener('atlas:layers:changed', function () {
            if (state.enabled && state.viewer && window.Cesium) {
                syncActiveLayersToCesium(state.viewer, window.Cesium, false);
                updateLegendLayoutFor3D();
            }
        });

        document.addEventListener('atlas:streetview:open', function () {
            if (state.enabled) {
                close3D();
            }
        });
    });
})();
