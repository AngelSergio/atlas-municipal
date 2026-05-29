(function () {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function parseCoordValue(value) {
    let text = String(value || '').trim();
    if (!text) return NaN;
    text = text.replace(/\s+/g, '');
    if (text.includes(',') && text.includes('.')) {
      text = text.replace(/,/g, '');
    } else if (text.includes(',')) {
      text = text.replace(',', '.');
    }
    return parseFloat(text);
  }

  window.setupAtlasCoordsTool = function setupAtlasCoordsTool({ map, ol, showToast }) {
    const container = document.getElementById('coords-container');
    const header = document.getElementById('coords-header');
    const closeBtn = document.getElementById('btn-coords-close');
    const toggleBtn = document.getElementById('btn-coords-toggle');
    const launchBtn = document.getElementById('btn-coords-launch');
    const systemSelect = document.getElementById('coords-system');
    const inputA = document.getElementById('coords-input-a');
    const inputB = document.getElementById('coords-input-b');
    const labelA = document.getElementById('coords-label-a');
    const labelB = document.getElementById('coords-label-b');
    const help = document.getElementById('coords-help');
    const goBtn = document.getElementById('btn-coords-go');
    const clearBtn = document.getElementById('btn-coords-clear');
    const body = container?.querySelector('.coords-body');
    const mapContainer = document.querySelector('.map-container');

    if (!container || !header || !launchBtn || !systemSelect || !inputA || !inputB || !goBtn || !clearBtn || !body) return;

    if (window.proj4 && ol?.proj?.proj4?.register) {
      window.proj4.defs('EPSG:32614', '+proj=utm +zone=14 +datum=WGS84 +units=m +no_defs +type=crs');
      ol.proj.proj4.register(window.proj4);
    }

    const markerSource = new ol.source.Vector();
    const pinSvg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">',
      '  <defs>',
      '    <filter id="coords-pin-shadow" x="-50%" y="-50%" width="200%" height="200%">',
      '      <feDropShadow dx="0" dy="2.4" stdDeviation="2.2" flood-color="rgba(0,0,0,.28)"/>',
      '    </filter>',
      '  </defs>',
      '  <g filter="url(#coords-pin-shadow)">',
      '    <path d="M18 2C10.27 2 4 8.27 4 16c0 10.62 11.08 20.96 13.45 23.04a.9.9 0 0 0 1.1 0C20.92 36.96 32 26.62 32 16 32 8.27 25.73 2 18 2Z" fill="#b0183f" stroke="#ffffff" stroke-width="2"/>',
      '    <circle cx="18" cy="16" r="5.3" fill="#ffffff" opacity=".97"/>',
      '    <circle cx="18" cy="16" r="2.1" fill="#b0183f" opacity=".92"/>',
      '  </g>',
      '</svg>'
    ].join('');
    const pinIcon = new ol.style.Icon({
      src: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      imgSize: [36, 48],
      scale: 1
    });
    const markerLayer = new ol.layer.Vector({
      source: markerSource,
      zIndex: 10000,
      style: new ol.style.Style({
        image: pinIcon
      })
    });
    map.addLayer(markerLayer);

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function syncToggleButton() {
      if (!toggleBtn) return;
      const collapsed = container.classList.contains('collapsed');
      toggleBtn.innerHTML = collapsed
        ? '<i class="fas fa-expand"></i>'
        : '<i class="fas fa-minus"></i>';
      toggleBtn.title = collapsed ? 'Expandir panel' : 'Contraer panel';
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expandir panel' : 'Contraer panel');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    }

    function toggleWindowCollapse(forceExpanded = null) {
      const shouldExpand = forceExpanded === null
        ? container.classList.contains('collapsed')
        : Boolean(forceExpanded);
      container.classList.toggle('collapsed', !shouldExpand);
      syncToggleButton();
      if (container.dataset.positioned) {
        setWindowPosition(parseInt(container.style.left || '364', 10), parseInt(container.style.top || '18', 10));
      }
      if (shouldExpand && container.classList.contains('visible')) {
        inputA.focus();
      }
    }

    function setWindowPosition(left, top) {
      const bounds = (mapContainer || document.body).getBoundingClientRect();
      const maxLeft = Math.max(0, bounds.width - container.offsetWidth - 8);
      const maxTop = Math.max(0, bounds.height - container.offsetHeight - 8);
      container.style.left = clamp(left, 8, maxLeft) + 'px';
      container.style.top = clamp(top, 8, maxTop) + 'px';
      container.dataset.positioned = '1';
    }

    function openWindow() {
      container.classList.add('visible');
      launchBtn.classList.add('active');
      if (container.classList.contains('collapsed')) {
        toggleWindowCollapse(true);
      }
      if (!container.dataset.positioned) {
        setWindowPosition(364, 18);
      }
      inputA.focus();
    }

    function closeWindow(clearResults = false) {
      container.classList.remove('visible');
      launchBtn.classList.remove('active');
      if (clearResults) {
        inputA.value = '';
        inputB.value = '';
      }
    }

    function stopDrag() {
      dragging = false;
      container.classList.remove('dragging');
      document.body.style.userSelect = '';
    }

    function handleDragMove(clientX, clientY) {
      if (!dragging) return;
      const bounds = (mapContainer || document.body).getBoundingClientRect();
      setWindowPosition(clientX - bounds.left - offsetX, clientY - bounds.top - offsetY);
    }

    function updateMode() {
      if (systemSelect.value === 'EPSG:32614') {
        labelA.textContent = 'Este (X)';
        labelB.textContent = 'Norte (Y)';
        inputA.placeholder = '680000';
        inputB.placeholder = '2270000';
        help.textContent = 'Captura coordenadas UTM del sistema EPSG:32614 (WGS84 / UTM zona 14N).';
      } else {
        labelA.textContent = 'Latitud';
        labelB.textContent = 'Longitud';
        inputA.placeholder = '20.523456';
        inputB.placeholder = '-100.812345';
        help.textContent = 'Captura latitud y longitud en WGS84. Ejemplo: 20.523456 y -100.812345.';
      }
    }

    function goToCoordinates() {
      const system = systemSelect.value;
      const valueA = parseCoordValue(inputA.value);
      const valueB = parseCoordValue(inputB.value);

      if (!Number.isFinite(valueA) || !Number.isFinite(valueB)) {
        showToast?.('Captura coordenadas válidas', 'error');
        return;
      }

      let point3857;

      try {
        if (system === 'EPSG:32614') {
          point3857 = ol.proj.transform([valueA, valueB], 'EPSG:32614', 'EPSG:3857');
        } else {
          const lat = valueA;
          const lon = valueB;
          if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            showToast?.('Las coordenadas WGS84 están fuera de rango', 'error');
            return;
          }
          point3857 = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        }
      } catch (error) {
        showToast?.('No se pudo transformar el punto', 'error');
        return;
      }

      if (!Array.isArray(point3857) || point3857.some(v => !Number.isFinite(v))) {
        showToast?.('No se pudo ubicar el punto', 'error');
        return;
      }

      markerSource.clear();
      const feature = new ol.Feature({ geometry: new ol.geom.Point(point3857) });
      markerSource.addFeature(feature);

      map.getView().animate({
        center: point3857,
        zoom: Math.max(17, Math.round(map.getView().getZoom() || 17)),
        duration: 800
      });

      showToast?.('Punto ubicado', 'success');
    }

    function clearCoordinates(keepFocus = true) {
      inputA.value = '';
      inputB.value = '';
      markerSource.clear();
      if (keepFocus && container.classList.contains('visible')) {
        inputA.focus();
      }
    }

    launchBtn.addEventListener('click', () => {
      if (container.classList.contains('visible')) {
        closeWindow(false);
      } else {
        openWindow();
      }
    });

    closeBtn?.addEventListener('click', () => {
      clearCoordinates(false);
      closeWindow(false);
    });
    toggleBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleWindowCollapse();
    });
    systemSelect.addEventListener('change', updateMode);
    goBtn.addEventListener('click', goToCoordinates);
    clearBtn.addEventListener('click', () => clearCoordinates(true));

    [inputA, inputB].forEach((input) => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          goToCoordinates();
        } else if (event.key === 'Escape') {
          closeWindow(false);
        }
      });
    });

    header.addEventListener('mousedown', (event) => {
      if (event.target.closest('.coords-close') || event.target.closest('.coords-toggle')) return;
      dragging = true;
      const rect = container.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      container.classList.add('dragging');
      document.body.style.userSelect = 'none';
      event.preventDefault();
    });

    document.addEventListener('mousemove', (event) => handleDragMove(event.clientX, event.clientY));
    document.addEventListener('mouseup', stopDrag);

    header.addEventListener('touchstart', (event) => {
      if (event.target.closest('.coords-close') || event.target.closest('.coords-toggle')) return;
      const touch = event.touches[0];
      if (!touch) return;
      dragging = true;
      const rect = container.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      container.classList.add('dragging');
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      handleDragMove(touch.clientX, touch.clientY);
    }, { passive: true });
    document.addEventListener('touchend', stopDrag);

    window.addEventListener('resize', () => {
      if (container.dataset.positioned) {
        setWindowPosition(parseInt(container.style.left || '364', 10), parseInt(container.style.top || '18', 10));
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.coords-container') && !event.target.closest('#btn-coords-launch')) {
        // no-op: allow window to stay open until user closes it
      }
    });

    updateMode();
    syncToggleButton();
  };
})();
