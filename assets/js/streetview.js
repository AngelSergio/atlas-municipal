(function () {
    const GOOGLE_API_KEY = 'AIzaSyBuC0CL7cegUQk4ietLseI6LxePNOw2ld8';
    const MARKER_ICON = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
            <path d="M18 2c7.18 0 13 5.82 13 13 0 8.98-13 31-13 31S5 23.98 5 15C5 7.82 10.82 2 18 2Z" fill="#f4b400" stroke="#6b7280" stroke-width="1.5"/>
            <circle cx="18" cy="14" r="6.2" fill="#ffe082" stroke="#d97706" stroke-width="1"/>
            <path d="M18 21.2c-4.9 0-8.8 3.9-8.8 8.8 0 1.8.53 3.47 1.46 4.88l7.34 11.12 7.34-11.12A8.75 8.75 0 0 0 26.8 30c0-4.9-3.9-8.8-8.8-8.8Z" fill="#f4b400" stroke="#d97706" stroke-width="1"/>
        </svg>
    `);

    function loadGoogleMapsApi() {
        if (window.google && window.google.maps && window.google.maps.StreetViewPanorama) {
            return Promise.resolve(window.google);
        }

        if (window.__atlasGoogleMapsPromise) {
            return window.__atlasGoogleMapsPromise;
        }

        window.__atlasGoogleMapsPromise = new Promise((resolve, reject) => {
            window.__atlasGoogleMapsReady = function () {
                resolve(window.google);
            };

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&loading=async&callback=__atlasGoogleMapsReady`;
            script.async = true;
            script.defer = true;
            script.dataset.googleMapsAtlas = '1';
            script.onerror = () => reject(new Error('No se pudo cargar Google Maps JavaScript API'));
            document.head.appendChild(script);
        });

        return window.__atlasGoogleMapsPromise;
    }

    function createAtlasStreetView(context) {
        if (window.AtlasStreetView) return window.AtlasStreetView;

        const map = context && context.map;
        const ol = context && context.ol;
        const showToast = context && typeof context.showToast === 'function' ? context.showToast : function () {};
        const container = document.querySelector('.map-container');
        const headerButton = document.getElementById('btn-streetview');
        const mapButton = document.getElementById('btn-streetview-map');
        const exitButton = document.getElementById('streetview-exit');
        const shell = document.getElementById('streetview-shell');
        const panoramaElement = document.getElementById('streetview-panorama');
        const divider = document.getElementById('streetview-divider');
        const helpElement = document.getElementById('streetview-help');
        const statusElement = document.getElementById('streetview-status');
        const googleLink = document.getElementById('streetview-google-link');
        const buttons = [headerButton, mapButton].filter(Boolean);

        if (!map || !ol || !container || !panoramaElement) {
            return null;
        }

        let active = false;
        let splitPercent = 60;
        let panorama = null;
        let streetViewService = null;
        let markerLayer = null;
        let markerFeature = null;
        let draggingDivider = false;
        let resizeTimer = null;

        function resizeMapSoon() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                map.updateSize();
                if (window.google && panorama) {
                    window.google.maps.event.trigger(panorama, 'resize');
                }
            }, 80);
        }

        function setStatus(text) {
            if (statusElement) statusElement.textContent = text || '';
        }

        function setButtonsState(isActive) {
            buttons.forEach(btn => btn.classList.toggle('active', isActive));
        }

        function setHelp(text) {
            if (!helpElement) return;
            helpElement.innerHTML = `<i class="fas fa-street-view"></i><span>${text}</span>`;
            helpElement.classList.add('visible');
        }

        function hideHelp() {
            if (helpElement) helpElement.classList.remove('visible');
        }

        function ensureMarkerLayer() {
            if (markerLayer) return;

            markerFeature = new ol.Feature();
            markerFeature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: MARKER_ICON,
                    anchor: [0.5, 1],
                    scale: 0.95,
                    crossOrigin: 'anonymous'
                })
            }));

            markerLayer = new ol.layer.Vector({
                source: new ol.source.Vector({ features: [markerFeature] }),
                zIndex: 9999
            });
            markerLayer.setVisible(false);
            map.addLayer(markerLayer);
        }

        function updateMarker(lonlat) {
            ensureMarkerLayer();
            markerFeature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(lonlat)));
            markerLayer.setVisible(true);
        }

        function hideMarker() {
            if (markerLayer) markerLayer.setVisible(false);
        }

        function updateGoogleLink(lonlat) {
            if (!googleLink) return;
            if (!lonlat) {
                googleLink.style.display = 'none';
                googleLink.removeAttribute('href');
                return;
            }
            const [lon, lat] = lonlat;
            googleLink.href = `https://www.google.com/maps?q&layer=c&cbll=${lat},${lon}`;
            googleLink.style.display = 'inline-flex';
        }

        function setSplit(percent) {
            splitPercent = Math.max(42, Math.min(78, percent));
            container.style.setProperty('--streetview-split', `${splitPercent}%`);
            resizeMapSoon();
        }

        function ensurePanorama() {
            if (panorama || !(window.google && window.google.maps)) return;

            panorama = new window.google.maps.StreetViewPanorama(panoramaElement, {
                addressControl: true,
                linksControl: true,
                panControl: true,
                enableCloseButton: false,
                fullscreenControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                showRoadLabels: true,
                zoomControl: true,
                clickToGo: true,
                visible: false,
                pov: { heading: 0, pitch: 0 }
            });

            streetViewService = new window.google.maps.StreetViewService();

            panorama.addListener('position_changed', () => {
                const position = panorama.getPosition();
                if (!position) return;
                const lonlat = [position.lng(), position.lat()];
                updateMarker(lonlat);
                updateGoogleLink(lonlat);
            });

            panorama.addListener('visible_changed', () => {
                if (panorama.getVisible()) hideHelp();
            });
        }

        function activate() {
            if (active) return;
            active = true;
            container.classList.add('streetview-active');
            if (shell) shell.hidden = false;
            setButtonsState(true);
            setSplit(splitPercent);
            setHelp('Haz clic en el mapa para abrir Street View');
            setStatus('Street View listo');
            loadGoogleMapsApi().catch(error => {
                console.error(error);
                setStatus('Error al cargar Google Street View');
                setHelp('No se pudo cargar Google Street View');
                showToast('No se pudo cargar Google Street View', 'error');
            });
            resizeMapSoon();
        }

        function deactivate() {
            if (!active) return;
            active = false;
            container.classList.remove('streetview-active');
            if (shell) shell.hidden = true;
            setButtonsState(false);
            hideHelp();
            setStatus('');
            if (panorama) {
                panorama.setVisible(false);
            }
            hideMarker();
            updateGoogleLink(null);
            resizeMapSoon();
        }

        function toggle() {
            if (active) deactivate();
            else activate();
        }

        async function openAtCoordinate(coordinate) {
            activate();

            try {
                await loadGoogleMapsApi();
                ensurePanorama();

                if (!streetViewService) {
                    throw new Error('StreetViewService no disponible');
                }

                const lonlat = ol.proj.toLonLat(coordinate);
                const location = { lat: lonlat[1], lng: lonlat[0] };
                setStatus('Buscando Street View...');
                setHelp('Buscando Street View cercano...');

                streetViewService.getPanorama({
                    location,
                    radius: 80,
                    source: window.google.maps.StreetViewSource.OUTDOOR
                }, (data, status) => {
                    if (status === window.google.maps.StreetViewStatus.OK && data && data.location && data.location.latLng) {
                        const found = data.location.latLng;
                        panorama.setPosition(found);
                        panorama.setPov({ heading: 0, pitch: 0 });
                        panorama.setVisible(true);
                        hideHelp();
                        setStatus('Street View activo');

                        const foundLonLat = [found.lng(), found.lat()];
                        updateMarker(foundLonLat);
                        updateGoogleLink(foundLonLat);
                        map.getView().animate({
                            center: ol.proj.fromLonLat(foundLonLat),
                            duration: 350
                        });
                        resizeMapSoon();
                        showToast('Street View cargado', 'success');
                    } else {
                        if (panorama) panorama.setVisible(false);
                        hideMarker();
                        updateGoogleLink(null);
                        setStatus('Sin cobertura Street View');
                        setHelp('No hay Street View cercano en ese punto');
                        showToast('No hay Street View cercano en ese punto', 'error');
                    }
                });
            } catch (error) {
                console.error(error);
                setStatus('Error al cargar Street View');
                setHelp('No se pudo cargar Google Street View');
                showToast('No se pudo cargar Google Street View', 'error');
            }
        }

        function handleMapClick(event) {
            if (!active) return false;
            openAtCoordinate(event.coordinate);
            return true;
        }

        function bindDivider() {
            if (!divider) return;

            const onMove = (event) => {
                if (!draggingDivider || !active) return;
                const pointY = event.touches ? event.touches[0].clientY : event.clientY;
                const rect = container.getBoundingClientRect();
                const percent = ((pointY - rect.top) / rect.height) * 100;
                setSplit(percent);
                event.preventDefault();
            };

            const stopDragging = () => {
                if (!draggingDivider) return;
                draggingDivider = false;
                document.body.classList.remove('streetview-resizing');
            };

            const startDragging = (event) => {
                if (!active) return;
                draggingDivider = true;
                document.body.classList.add('streetview-resizing');
                event.preventDefault();
            };

            divider.addEventListener('mousedown', startDragging);
            divider.addEventListener('touchstart', startDragging, { passive: false });
            document.addEventListener('mousemove', onMove);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('touchend', stopDragging);
        }

        buttons.forEach(btn => btn.addEventListener('click', toggle));
        if (exitButton) exitButton.addEventListener('click', deactivate);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && active) deactivate();
        });
        window.addEventListener('resize', resizeMapSoon);
        bindDivider();

        window.AtlasStreetView = {
            activate,
            deactivate,
            toggle,
            handleMapClick,
            resize: resizeMapSoon,
            openAtCoordinate
        };

        return window.AtlasStreetView;
    }

    window.setupAtlasStreetView = createAtlasStreetView;
})();
