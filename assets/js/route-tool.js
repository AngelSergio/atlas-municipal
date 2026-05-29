
(function () {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatCoordText(lonLat) {
    if (!Array.isArray(lonLat) || lonLat.length < 2) return 'Aún no definido.';
    return `Ubicación seleccionada · ${lonLat[1].toFixed(5)}, ${lonLat[0].toFixed(5)}`;
  }

  function formatDistance(meters) {
    if (!Number.isFinite(meters)) return 'No disponible';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return 'No disponible';
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  function formatDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'No disponible';
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function classifyTraffic(baseSeconds, trafficSeconds) {
    if (!Number.isFinite(baseSeconds) || !Number.isFinite(trafficSeconds) || baseSeconds <= 0) {
      return 'Sin dato en tiempo real';
    }
    const ratio = trafficSeconds / baseSeconds;
    if (ratio <= 1.10) return 'Bajo';
    if (ratio <= 1.30) return 'Medio';
    return 'Alto';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripHtml(text) {
    const tmp = document.createElement('div');
    tmp.innerHTML = text || '';
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function buildCitizenTips(report) {
    const tips = [];
    const traffic = report.trafficLabel || 'Sin dato en tiempo real';
    if (traffic === 'Alto') tips.push('Considera salir con tiempo extra y revisar el tráfico antes de iniciar.');
    else if (traffic === 'Medio') tips.push('Toma precauciones y anticipa demoras moderadas durante el trayecto.');
    else if (traffic === 'Bajo') tips.push('El trayecto muestra condiciones favorables de circulación al momento de la consulta.');
    else tips.push('La ruta fue calculada, pero no hay dato confiable de tráfico en tiempo real para este trayecto.');

    tips.push('Sigue la señalización vial y ajusta tu recorrido si observas cierres o incidentes.');
    return tips;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) { reject(new Error('Imagen no disponible')); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }


  function readElementOpacity(element) {
    const raw = element?.style?.opacity || element?.parentElement?.style?.opacity || '';
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 1;
  }

  function readElementTransform(element) {
    const raw = element?.style?.transform || element?.parentElement?.style?.transform || '';
    if (!raw || raw === 'none') return [1, 0, 0, 1, 0, 0];
    try {
      if (typeof DOMMatrix === 'function') {
        const m = new DOMMatrix(raw);
        return [m.a, m.b, m.c, m.d, m.e, m.f];
      }
    } catch (_) {}

    const match = raw.match(/matrix\(([^)]+)\)/i);
    if (!match) return [1, 0, 0, 1, 0, 0];
    const parts = match[1].split(',').map((value) => Number.parseFloat(value.trim()));
    if (parts.length !== 6 || parts.some((value) => !Number.isFinite(value))) return [1, 0, 0, 1, 0, 0];
    return parts;
  }

  function composeVisibleMapToDataUrl(map) {
    const mapElement = map?.getTargetElement?.() || document.getElementById('map');
    const size = map?.getSize?.() || [mapElement?.clientWidth || 0, mapElement?.clientHeight || 0];
    const width = Math.max(1, Number(size[0]) || 0);
    const height = Math.max(1, Number(size[1]) || 0);
    if (!mapElement || width < 2 || height < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    const drawableElements = mapElement.querySelectorAll('.ol-layer canvas, .ol-layer img');
    drawableElements.forEach((element) => {
      const isCanvas = element instanceof HTMLCanvasElement;
      const isImage = element instanceof HTMLImageElement;
      if (!isCanvas && !isImage) return;

      const sourceWidth = isCanvas ? (element.width || element.clientWidth || 0) : (element.naturalWidth || element.width || element.clientWidth || 0);
      const sourceHeight = isCanvas ? (element.height || element.clientHeight || 0) : (element.naturalHeight || element.height || element.clientHeight || 0);
      if (sourceWidth < 2 || sourceHeight < 2) return;

      const opacity = readElementOpacity(element);
      if (opacity <= 0) return;

      const [a, b, c, d, e, f] = readElementTransform(element);
      context.save();
      context.globalAlpha = opacity;
      context.setTransform(a, b, c, d, e, f);
      try {
        context.drawImage(element, 0, 0);
      } catch (_) {
        // Si una imagen externa no puede dibujarse por CORS, se omite sin romper el PDF.
      }
      context.restore();
    });

    return canvas.toDataURL('image/png');
  }

  async function captureMapImageForReport() {
    const map = window.__atlasMap;
    if (!map) return null;

    return new Promise((resolve) => {
      const finish = () => {
        try {
          resolve(composeVisibleMapToDataUrl(map));
        } catch (_) {
          resolve(null);
        }
      };

      try {
        map.once('rendercomplete', () => requestAnimationFrame(finish));
        map.renderSync();
      } catch (_) {
        requestAnimationFrame(finish);
      }
    });
  }

  async function downloadCitizenRoutePdf(report) {
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) throw new Error('El generador de PDF no está disponible');

    let mapImage = null;
    try { mapImage = await captureMapImageForReport(); } catch (_) { mapImage = null; }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter', compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 38;
    const contentW = pageW - margin * 2;
    const footerY = pageH - 24;
    const bottomLimit = pageH - 52;
    let y = margin;

    const addFooter = () => {
      pdf.setTextColor(112, 104, 115);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9.5);
      pdf.text('Documento generado desde el visor ciudadano del Atlas de Riesgos.', margin, footerY);
    };

    const newPage = () => {
      addFooter();
      pdf.addPage();
      y = margin;
    };

    const ensureSpace = (needed) => {
      if (y + needed <= bottomLimit) return;
      newPage();
    };

    const drawTextBlock = (lines, x, startY, lineHeight) => {
      const safeLines = Array.isArray(lines) ? lines : [String(lines ?? '')];
      let cursorY = startY;
      safeLines.forEach((line, index) => {
        pdf.text(String(line ?? ''), x, cursorY);
        if (index < safeLines.length - 1) cursorY += lineHeight;
      });
      return cursorY;
    };

    const drawHeader = () => {
      pdf.setFillColor(143, 23, 58);
      pdf.roundedRect(margin, y, contentW, 58, 14, 14, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('Ruta sugerida al destino', margin + 18, y + 24);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      pdf.text('Ficha ciudadana simple, clara y útil para consulta rápida.', margin + 18, y + 42);
      y += 76;

      pdf.setTextColor(83, 74, 86);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10.5);
      pdf.text(`Fecha de consulta: ${report.generatedAtLabel}`, margin, y);
      y += 18;
    };

    const drawSummary = () => {
      pdf.setFillColor(247, 243, 245);
      pdf.setDrawColor(225, 213, 219);
      pdf.roundedRect(margin, y, contentW, 78, 14, 14, 'FD');

      const cardW = (contentW - 24) / 3;
      const summaryItems = [
        ['Distancia', report.distanceLabel],
        ['Tiempo estimado', report.durationLabel],
        ['Tráfico', report.trafficLabel]
      ];
      summaryItems.forEach((item, index) => {
        const x = margin + 12 + index * cardW;
        pdf.setTextColor(110, 101, 112);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(item[0], x, y + 22);
        pdf.setTextColor(75, 65, 76);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text(item[1], x, y + 48);
      });
      y += 96;
    };

    const drawInfoCard = (rows) => {
      const innerWidth = contentW - 28;
      const rowMetrics = rows.map((row) => {
        const value = String(row.value || 'No disponible').trim();
        const lines = pdf.splitTextToSize(value, innerWidth);
        const height = 16 + 12 + Math.max(lines.length, 1) * 12 + 12;
        return { label: row.label, value, lines, height };
      });
      const cardHeight = 12 + rowMetrics.reduce((sum, row, index) => sum + row.height + (index < rowMetrics.length - 1 ? 10 : 0), 0);
      ensureSpace(cardHeight + 8);

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(231, 223, 227);
      pdf.roundedRect(margin, y, contentW, cardHeight, 14, 14, 'FD');

      let cursorY = y + 20;
      rowMetrics.forEach((row, index) => {
        pdf.setTextColor(90, 22, 48);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12.5);
        pdf.text(row.label, margin + 14, cursorY);
        cursorY += 16;

        pdf.setTextColor(74, 69, 77);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10.5);
        cursorY = drawTextBlock(row.lines, margin + 14, cursorY, 12) + 12;

        if (index < rowMetrics.length - 1) {
          pdf.setDrawColor(236, 229, 232);
          pdf.line(margin + 14, cursorY - 5, pageW - margin - 14, cursorY - 5);
          cursorY += 8;
        }
      });
      y += cardHeight + 14;
    };

    const drawTipsCard = (tips) => {
      const bulletX = margin + 14;
      const textX = bulletX + 14;
      const textWidth = contentW - 42;
      const lineHeight = 17;
      const itemGap = 15;
      const tipLines = tips.map((tip) => pdf.splitTextToSize(String(tip ?? ''), textWidth));
      const bodyHeight = tipLines.reduce((sum, lines) => sum + Math.max(lines.length, 1) * lineHeight + itemGap, 0);
      const cardHeight = 24 + 18 + bodyHeight + 6;
      ensureSpace(cardHeight + 8);

      pdf.setFillColor(250, 247, 248);
      pdf.setDrawColor(231, 223, 227);
      pdf.roundedRect(margin, y, contentW, cardHeight, 14, 14, 'FD');

      let cursorY = y + 20;
      pdf.setTextColor(90, 22, 48);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12.5);
      pdf.text('Avisos útiles', margin + 14, cursorY);
      cursorY += 24;

      pdf.setTextColor(74, 69, 77);
      pdf.setFontSize(11);
      tipLines.forEach((lines) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text('•', bulletX, cursorY);
        pdf.setFont('helvetica', 'normal');
        cursorY = drawTextBlock(lines, textX, cursorY, lineHeight) + itemGap;
      });
      y += cardHeight + 16;
    };

    const drawMapSection = async () => {
      if (!mapImage) return;
      try {
        const map = await loadImage(mapImage);
        const maxW = contentW;
        const maxH = 248;
        const ratio = Math.min(maxW / map.width, maxH / map.height);
        const drawW = Math.max(1, map.width * ratio);
        const drawH = Math.max(1, map.height * ratio);
        ensureSpace(30 + drawH + 16);

        pdf.setTextColor(90, 22, 48);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12.5);
        pdf.text('Mapa del trayecto', margin, y);
        y += 12;
        pdf.setDrawColor(220, 210, 215);
        pdf.roundedRect(margin, y, drawW, drawH, 12, 12, 'S');
        pdf.addImage(mapImage, 'PNG', margin, y, drawW, drawH);
        y += drawH + 18;
      } catch (_) {}
    };

    drawHeader();
    drawSummary();
    drawInfoCard([
      { label: 'Origen', value: report.originLabel },
      { label: 'Destino', value: report.destinationLabel },
      ...(report.mainRoadLabel ? [{ label: 'Vía principal', value: report.mainRoadLabel }] : [])
    ]);
    drawTipsCard(buildCitizenTips(report));
    await drawMapSection();
    addFooter();

    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    pdf.save(`Ruta_Ciudadana_${stamp}.pdf`);
  }

  function createPinSvg(fillColor, textColor, label) {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="54" viewBox="0 0 42 54">',
      '  <defs>',
      '    <filter id="route-pin-shadow" x="-50%" y="-50%" width="200%" height="200%">',
      '      <feDropShadow dx="0" dy="2.4" stdDeviation="2.4" flood-color="rgba(0,0,0,.26)"/>',
      '    </filter>',
      '  </defs>',
      '  <g filter="url(#route-pin-shadow)">',
      `    <path d="M21 3C12.16 3 5 10.16 5 19c0 11.88 12.72 23.64 15.43 26.01a1.06 1.06 0 0 0 1.14 0C24.28 42.64 37 30.88 37 19 37 10.16 29.84 3 21 3Z" fill="${fillColor}" stroke="#ffffff" stroke-width="2.2"/>`,
      '    <circle cx="21" cy="19" r="8.2" fill="#ffffff" opacity=".98"/>',
      `    <text x="21" y="22.7" text-anchor="middle" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="${textColor}">${label}</text>`,
      '  </g>',
      '</svg>'
    ].join('');
  }

  function requestGoogleRoute(origin, destination) {
    return new Promise((resolve, reject) => {
      if (typeof loadGooglePlacesApi !== 'function') {
        reject(new Error('Google Maps no está disponible'));
        return;
      }
      loadGooglePlacesApi()
        .then(() => {
          if (!window.google?.maps?.DirectionsService) {
            reject(new Error('Google Directions no está disponible'));
            return;
          }
          const service = new window.google.maps.DirectionsService();
          service.route({
            origin: { lat: origin[1], lng: origin[0] },
            destination: { lat: destination[1], lng: destination[0] },
            travelMode: window.google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: window.google.maps.TrafficModel.BEST_GUESS
            }
          }, (result, status) => {
            if (status !== 'OK' || !result?.routes?.length) {
              reject(new Error(status || 'No se encontró ruta'));
              return;
            }
            const route = result.routes[0];
            const leg = route.legs?.[0];
            const coordinates = (route.overview_path || []).map((point) => [point.lng(), point.lat()]);
            if (!coordinates.length) {
              reject(new Error('La ruta no devolvió geometría'));
              return;
            }
            resolve({
              coordinates,
              distanceMeters: Number(leg?.distance?.value),
              durationSeconds: Number(leg?.duration?.value),
              durationInTrafficSeconds: Number(leg?.duration_in_traffic?.value),
              source: 'google',
              mainRoad: route.summary || '',
              startAddress: leg?.start_address || '',
              endAddress: leg?.end_address || '',
              steps: Array.isArray(leg?.steps) ? leg.steps.slice(0, 4).map((step) => stripHtml(step.instructions || '')).filter(Boolean) : []
            });
          });
        })
        .catch(reject);
    });
  }

  function requestOsrmRoute(origin, destination) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson&steps=false`;
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo consultar la ruta');
        return response.json();
      })
      .then((data) => {
        const route = data?.routes?.[0];
        if (!route?.geometry?.coordinates?.length) throw new Error('No se encontró ruta');
        return {
          coordinates: route.geometry.coordinates,
          distanceMeters: Number(route.distance),
          durationSeconds: Number(route.duration),
          durationInTrafficSeconds: NaN,
          source: 'osrm',
          mainRoad: '',
          startAddress: '',
          endAddress: '',
          steps: []
        };
      });
  }

  window.setupAtlasRouteTool = function setupAtlasRouteTool({ map, ol, showToast }) {
    const container = document.getElementById('route-container');
    const header = document.getElementById('route-header');
    const launchBtn = document.getElementById('btn-route-launch');
    const closeBtn = document.getElementById('btn-route-close');
    const toggleBtn = document.getElementById('btn-route-toggle');
    const originValue = document.getElementById('route-origin-value');
    const destinationValue = document.getElementById('route-destination-value');
    const originGroup = document.getElementById('route-origin-group');
    const destinationGroup = document.getElementById('route-destination-group');
    const originStatus = document.getElementById('route-origin-status');
    const destinationStatus = document.getElementById('route-destination-status');
    const originLocationBtn = document.getElementById('btn-route-origin-location');
    const originMapBtn = document.getElementById('btn-route-origin-map');
    const destinationMapBtn = document.getElementById('btn-route-destination-map');
    const swapBtn = document.getElementById('btn-route-swap');
    const calcBtn = document.getElementById('btn-route-calc');
    const clearBtn = document.getElementById('btn-route-clear');
    const reportBtn = document.getElementById('btn-route-report');
    const reportWrap = document.getElementById('route-report-wrap');
    const reportNote = document.getElementById('route-report-note');
    const summary = document.getElementById('route-summary');
    const pickHint = document.getElementById('route-pick-hint');
    const pickHintText = document.getElementById('route-pick-hint-text');
    const mapContainer = document.querySelector('.map-container');

    if (!container || !header || !launchBtn || !originValue || !destinationValue || !calcBtn || !clearBtn || !summary) return;

    const routeSource = new ol.source.Vector();
    const routeLayer = new ol.layer.Vector({
      source: routeSource,
      zIndex: 10020,
      style: function (feature) {
        const kind = feature.get('kind');
        if (kind === 'route') {
          return [
            new ol.style.Style({
              stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,0.92)', width: 7, lineCap: 'round', lineJoin: 'round' })
            }),
            new ol.style.Style({
              stroke: new ol.style.Stroke({ color: '#931D3D', width: 4.2, lineCap: 'round', lineJoin: 'round' })
            })
          ];
        }
        if (kind === 'origin') {
          return new ol.style.Style({
            image: new ol.style.Icon({
              src: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createPinSvg('#1f9d55', '#1f9d55', 'A')),
              anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction',
              imgSize: [42, 54],
              scale: 1
            })
          });
        }
        return new ol.style.Style({
          image: new ol.style.Icon({
            src: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createPinSvg('#a11e44', '#a11e44', 'B')),
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            imgSize: [42, 54],
            scale: 1
          })
        });
      }
    });
    map.addLayer(routeLayer);

    let originLonLat = null;
    let destinationLonLat = null;
    let latestRouteReport = null;
    let pickMode = null;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function syncToggleButton() {
      const collapsed = container.classList.contains('collapsed');
      toggleBtn.innerHTML = collapsed ? '<i class="fas fa-expand"></i>' : '<i class="fas fa-minus"></i>';
      toggleBtn.title = collapsed ? 'Expandir panel' : 'Contraer panel';
      toggleBtn.setAttribute('aria-label', collapsed ? 'Expandir panel' : 'Contraer panel');
      toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    }

    function setWindowPosition(left, top) {
      const bounds = (mapContainer || document.body).getBoundingClientRect();
      const maxLeft = Math.max(8, bounds.width - container.offsetWidth - 8);
      const maxTop = Math.max(8, bounds.height - container.offsetHeight - 8);
      container.style.left = clamp(left, 8, maxLeft) + 'px';
      container.style.top = clamp(top, 8, maxTop) + 'px';
      container.dataset.positioned = '1';
    }

    function openWindow() {
      container.classList.add('visible');
      launchBtn.classList.add('active');
      if (container.classList.contains('collapsed')) {
        container.classList.remove('collapsed');
        syncToggleButton();
      }
      if (!container.dataset.positioned) {
        setWindowPosition(364, 94);
      }
    }

    function closeWindow() {
      cancelPickMode();
      container.classList.remove('visible');
      launchBtn.classList.remove('active');
    }

    function toggleCollapse(forceExpanded = null) {
      const shouldExpand = forceExpanded === null ? container.classList.contains('collapsed') : Boolean(forceExpanded);
      container.classList.toggle('collapsed', !shouldExpand);
      syncToggleButton();
      if (container.dataset.positioned) {
        setWindowPosition(parseInt(container.style.left || '364', 10), parseInt(container.style.top || '94', 10));
      }
    }

    function setSummaryHtml(html, compact = false) {
      summary.innerHTML = html;
      summary.classList.toggle('is-compact', !!compact);
    }

    function updateCalcButtonState() {
      calcBtn.disabled = !(originLonLat && destinationLonLat);
      if (!calcBtn.disabled && calcBtn.textContent !== 'Calculando...') {
        calcBtn.textContent = 'Calcular ruta';
      }
    }

    function updateFieldUi() {
      if (originValue) {
        originValue.textContent = originLonLat ? formatCoordText(originLonLat) : 'Aún no definido.';
        originValue.classList.toggle('is-empty', !originLonLat);
      }
      if (destinationValue) {
        destinationValue.textContent = destinationLonLat ? formatCoordText(destinationLonLat) : 'Aún no definido.';
        destinationValue.classList.toggle('is-empty', !destinationLonLat);
      }

      const originPicking = pickMode === 'origin';
      const destinationPicking = pickMode === 'destination';

      originGroup?.classList.toggle('is-ready', !!originLonLat);
      destinationGroup?.classList.toggle('is-ready', !!destinationLonLat);
      originGroup?.classList.toggle('is-picking', originPicking);
      destinationGroup?.classList.toggle('is-picking', destinationPicking);

      if (originStatus) {
        originStatus.textContent = originPicking ? 'Marcando' : (originLonLat ? 'Listo' : 'Pendiente');
        originStatus.classList.toggle('is-ready', !!originLonLat && !originPicking);
        originStatus.classList.toggle('is-picking', originPicking);
      }
      if (destinationStatus) {
        destinationStatus.textContent = destinationPicking ? 'Marcando' : (destinationLonLat ? 'Listo' : 'Pendiente');
        destinationStatus.classList.toggle('is-ready', !!destinationLonLat && !destinationPicking);
        destinationStatus.classList.toggle('is-picking', destinationPicking);
      }

      updateCalcButtonState();
    }

    function renderSummaryState(state, payload = {}) {
      if (state === 'loading') {
        setSummaryHtml(`
          <div class="route-summary-kicker"><i class="fas fa-spinner fa-spin"></i> Consultando trayecto</div>
          <p class="route-summary-text">Buscando la mejor ruta disponible. Esto tarda solo unos segundos.</p>
        `, true);
        return;
      }

      if (state === 'result') {
        const mainRoadHtml = payload.mainRoadLabel
          ? `<div class="route-summary-route"><strong>Vía principal:</strong> ${escapeHtml(payload.mainRoadLabel)}</div>`
          : '';
        setSummaryHtml(`
          <div class="route-summary-kicker"><i class="fas fa-check-circle"></i> Ruta lista</div>
          <div class="route-summary-grid">
            <div class="route-summary-card">
              <span class="route-summary-card-label">Distancia</span>
              <span class="route-summary-card-value">${escapeHtml(payload.distanceLabel || 'No disponible')}</span>
            </div>
            <div class="route-summary-card">
              <span class="route-summary-card-label">Tiempo</span>
              <span class="route-summary-card-value">${escapeHtml(payload.durationLabel || 'No disponible')}</span>
            </div>
            <div class="route-summary-card">
              <span class="route-summary-card-label">Tráfico</span>
              <span class="route-summary-card-value">${escapeHtml(payload.trafficLabel || 'Sin dato')}</span>
            </div>
          </div>
          <div class="route-summary-note compact-hidden">
            <strong>Ruta lista.</strong>
          </div>
          ${mainRoadHtml}
        `);
        return;
      }

      if (state === 'error') {
        setSummaryHtml(`
          <div class="route-summary-kicker"><i class="fas fa-triangle-exclamation"></i> No disponible</div>
          <p class="route-summary-text">No fue posible calcular la ruta. Prueba con otro origen o destino.</p>
        `, true);
        return;
      }

      if (state === 'ready') {
        setSummaryHtml(`
          <div class="route-summary-ready"><i class="fas fa-check-circle"></i> Todo listo</div>
          <p class="route-summary-text" style="margin-top:4px;">Presiona <strong>Calcular ruta</strong>.</p>
        `, true);
        return;
      }

      if (state === 'origin-only') {
        setSummaryHtml(`
          <div class="route-summary-kicker"><i class="fas fa-check-circle"></i> Origen listo</div>
          <p class="route-summary-text">Ahora selecciona el destino.</p>
        `, true);
        return;
      }

      if (state === 'destination-only') {
        setSummaryHtml(`
          <div class="route-summary-kicker"><i class="fas fa-check-circle"></i> Destino listo</div>
          <p class="route-summary-text">Ahora define el origen.</p>
        `, true);
        return;
      }

      setSummaryHtml(`
        <div class="route-summary-kicker"><i class="fas fa-circle-info"></i> Inicio rápido</div>
        <p class="route-summary-text">Marca origen y destino.</p>
      `, true);
    }

    function refreshSummaryByState() {
      if (latestRouteReport) {
        renderSummaryState('result', latestRouteReport);
        return;
      }
      if (originLonLat && destinationLonLat) {
        renderSummaryState('ready');
        return;
      }
      if (originLonLat) {
        renderSummaryState('origin-only');
        return;
      }
      if (destinationLonLat) {
        renderSummaryState('destination-only');
        return;
      }
      renderSummaryState('empty');
    }

    function updateValueLabels() {
      updateFieldUi();
    }

    function syncReportButton() {
      if (!reportBtn) return;
      const ready = !!latestRouteReport;
      reportBtn.disabled = !ready;
      reportWrap?.classList.toggle('is-disabled', !ready);
      reportWrap?.classList.toggle('is-ready', ready);
      if (reportNote) {
        reportNote.textContent = ready
          ? 'Incluye distancia, tiempo estimado y el mapa del trayecto para compartir o imprimir.'
          : 'La ficha PDF se habilita después de calcular la ruta.';
      }
    }

    function refreshVectorLayer() {
      routeSource.clear();
      if (originLonLat) {
        routeSource.addFeature(new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(originLonLat)),
          kind: 'origin'
        }));
      }
      if (destinationLonLat) {
        routeSource.addFeature(new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat(destinationLonLat)),
          kind: 'destination'
        }));
      }
      const routeGeometry = window.__atlasRouteGeometry;
      if (routeGeometry) {
        routeSource.addFeature(new ol.Feature({ geometry: routeGeometry, kind: 'route' }));
      }
    }

    function clearRouteGeometry() {
      window.__atlasRouteGeometry = null;
      refreshVectorLayer();
    }

    function updatePickUi() {
      const picking = pickMode === 'origin' || pickMode === 'destination';
      document.body.classList.toggle('route-pick-mode', picking);
      pickHint.classList.toggle('is-hidden', !picking);
      if (picking) {
        pickHintText.textContent = pickMode === 'origin'
          ? 'Haz clic en el mapa para definir el origen.'
          : 'Haz clic en el mapa para definir el destino.';
      }
      originMapBtn.classList.toggle('is-picking', pickMode === 'origin');
      destinationMapBtn.classList.toggle('is-picking', pickMode === 'destination');
      updateFieldUi();
    }

    function cancelPickMode() {
      pickMode = null;
      updatePickUi();
    }

    function startPickMode(kind) {
      openWindow();
      pickMode = kind;
      updatePickUi();
      showToast?.(kind === 'origin' ? 'Haz clic en el mapa para definir el origen' : 'Haz clic en el mapa para definir el destino', 'success');
    }

    function fitRouteExtent() {
      const features = routeSource.getFeatures();
      if (!features.length) return;
      const extent = routeSource.getExtent();
      if (!extent || !extent.every(Number.isFinite)) return;
      map.getView().fit(extent, {
        padding: [80, 80, 80, 80],
        duration: 700,
        maxZoom: 17
      });
    }

    function applyPickedPoint(lonLat) {
      if (!Array.isArray(lonLat) || lonLat.length < 2 || !pickMode) return false;
      if (pickMode === 'origin') {
        originLonLat = lonLat;
        latestRouteReport = null;
        clearRouteGeometry();
        syncReportButton();
      } else {
        destinationLonLat = lonLat;
        latestRouteReport = null;
        clearRouteGeometry();
        syncReportButton();
      }
      updateValueLabels();
      refreshVectorLayer();
      cancelPickMode();
      refreshSummaryByState();
      return true;
    }

    function resetAll() {
      originLonLat = null;
      destinationLonLat = null;
      cancelPickMode();
      clearRouteGeometry();
      latestRouteReport = null;
      updateValueLabels();
      syncReportButton();
      refreshSummaryByState();
      showToast?.('Ruta limpiada', 'success');
    }

    function getCurrentLocation() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('La geolocalización no está disponible'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => resolve([position.coords.longitude, position.coords.latitude]),
          () => reject(new Error('No se pudo obtener la ubicación')),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }

    async function calculateRoute() {
      if (!originLonLat || !destinationLonLat) {
        showToast?.('Define origen y destino', 'error');
        return;
      }
      if (originLonLat[0] === destinationLonLat[0] && originLonLat[1] === destinationLonLat[1]) {
        showToast?.('El origen y el destino no pueden ser el mismo punto', 'error');
        return;
      }

      calcBtn.disabled = true;
      calcBtn.textContent = 'Calculando...';
      renderSummaryState('loading');

      try {
        let result;
        try {
          result = await requestGoogleRoute(originLonLat, destinationLonLat);
        } catch (googleError) {
          result = await requestOsrmRoute(originLonLat, destinationLonLat);
        }

        const route3857 = result.coordinates.map((coord) => ol.proj.fromLonLat(coord));
        window.__atlasRouteGeometry = new ol.geom.LineString(route3857);
        refreshVectorLayer();
        fitRouteExtent();

        const trafficDuration = Number.isFinite(result.durationInTrafficSeconds)
          ? `<br><strong>Con tráfico:</strong> ${formatDuration(result.durationInTrafficSeconds)}`
          : '';
        const sourceLabel = result.source === 'google' ? 'Google' : 'OSRM';
        const trafficLabel = classifyTraffic(result.durationSeconds, result.durationInTrafficSeconds);
        latestRouteReport = {
          generatedAt: new Date(),
          generatedAtLabel: formatDateTime(new Date()),
          originCoords: originLonLat ? originLonLat.slice() : null,
          destinationCoords: destinationLonLat ? destinationLonLat.slice() : null,
          originLabel: result.startAddress || `Origen: ${formatCoordText(originLonLat)}`,
          destinationLabel: result.endAddress || `Destino: ${formatCoordText(destinationLonLat)}`,
          distanceMeters: result.distanceMeters,
          durationSeconds: result.durationSeconds,
          durationInTrafficSeconds: result.durationInTrafficSeconds,
          distanceLabel: formatDistance(result.distanceMeters),
          durationLabel: formatDuration(result.durationInTrafficSeconds) !== 'No disponible' && Number.isFinite(result.durationInTrafficSeconds)
            ? formatDuration(result.durationInTrafficSeconds)
            : formatDuration(result.durationSeconds),
          trafficLabel,
          sourceLabel,
          mainRoadLabel: result.mainRoad || '',
          steps: Array.isArray(result.steps) ? result.steps.slice() : []
        };
        syncReportButton();
        refreshSummaryByState();
        showToast?.('Ruta trazada', 'success');
      } catch (error) {
        console.error('No se pudo calcular la ruta', error);
        clearRouteGeometry();
        latestRouteReport = null;
        syncReportButton();
        renderSummaryState('error');
        showToast?.('No se pudo calcular la ruta', 'error');
      } finally {
        calcBtn.disabled = false;
        calcBtn.textContent = 'Calcular ruta';
        updateCalcButtonState();
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

    launchBtn.addEventListener('click', () => {
      if (container.classList.contains('visible')) {
        closeWindow();
      } else {
        openWindow();
      }
    });

    closeBtn.addEventListener('click', closeWindow);
    toggleBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleCollapse();
    });

    originLocationBtn.addEventListener('click', async () => {
      try {
        const lonLat = await getCurrentLocation();
        originLonLat = lonLat;
        latestRouteReport = null;
        clearRouteGeometry();
        syncReportButton();
        updateValueLabels();
        refreshVectorLayer();
        map.getView().animate({ center: ol.proj.fromLonLat(lonLat), zoom: Math.max(16, Math.round(map.getView().getZoom() || 16)), duration: 700 });
        refreshSummaryByState();
        showToast?.('Origen definido con tu ubicación', 'success');
      } catch (error) {
        showToast?.(error.message || 'No se pudo obtener la ubicación', 'error');
      }
    });

    originMapBtn.addEventListener('click', () => startPickMode('origin'));
    destinationMapBtn.addEventListener('click', () => startPickMode('destination'));
    swapBtn?.addEventListener('click', () => {
      if (!originLonLat && !destinationLonLat) {
        showToast?.('Primero define origen o destino', 'error');
        return;
      }
      const prevOrigin = originLonLat ? originLonLat.slice() : null;
      originLonLat = destinationLonLat ? destinationLonLat.slice() : null;
      destinationLonLat = prevOrigin;
      latestRouteReport = null;
      clearRouteGeometry();
      syncReportButton();
      updateValueLabels();
      refreshVectorLayer();
      refreshSummaryByState();
      showToast?.('Origen y destino intercambiados', 'success');
    });
    calcBtn.addEventListener('click', calculateRoute);
    clearBtn.addEventListener('click', resetAll);
    reportBtn?.addEventListener('click', async () => {
      if (!latestRouteReport) {
        showToast?.('Traza una ruta antes de generar la ficha', 'error');
        return;
      }
      reportBtn.disabled = true;
      const originalHtml = reportBtn.innerHTML;
      reportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Generando PDF...</span>';
      try {
        await downloadCitizenRoutePdf(latestRouteReport);
        showToast?.('Ficha ciudadana descargada', 'success');
      } catch (error) {
        console.error('Ficha ciudadana de ruta', error);
        showToast?.('No fue posible generar la ficha de ruta', 'error');
      } finally {
        reportBtn.innerHTML = originalHtml;
        syncReportButton();
      }
    });

    header.addEventListener('mousedown', (event) => {
      if (event.target.closest('.route-close') || event.target.closest('.route-toggle')) return;
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
    document.addEventListener('mouseleave', stopDrag);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && pickMode) {
        cancelPickMode();
        showToast?.('Selección de ruta cancelada', 'success');
      }
    });

    updateValueLabels();
    syncToggleButton();
    updatePickUi();
    syncReportButton();
    refreshSummaryByState();

    window.AtlasRouteTool = {
      handleMapClick(event) {
        if (!pickMode) return false;
        const lonLat = ol.proj.toLonLat(event.coordinate);
        const kind = pickMode;
        const handled = applyPickedPoint(lonLat);
        if (handled) {
          showToast?.(kind === 'origin' ? 'Origen definido' : 'Destino definido', 'success');
        }
        return handled;
      },
      clearRoute: resetAll,
      closeWindow,
      openWindow,
      getReport() { return latestRouteReport ? Object.assign({}, latestRouteReport) : null; },
      isPicking() { return !!pickMode; }
    };
  };
})();
