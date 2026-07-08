/**
 * Módulo: Consulta ciudadana de riesgo
 * Archivo conservado como analisis-demografico.js para no mover rutas del visor.
 */
(function () {
  'use strict';

  // Nombre del municipio tomado del tema (window.MUNICIPIO_CONFIG).
  const MUNI = (window.MUNICIPIO_CONFIG && window.MUNICIPIO_CONFIG.municipio) || 'el municipio';

  const GEOM_CANDIDATES = ['geom', 'the_geom', 'geometry', 'GEOMETRY', 'GEOM'];
  // ---- Configuración del análisis por PAPELES, asignada desde el panel admin ----
  // (window.MUNICIPIO_LAYERS.analisis). Cada municipio marca qué capa cumple cada
  // papel y con qué campo. Si no hay config, se usan los valores heredados (Celaya).
  const AN = (window.MUNICIPIO_LAYERS && window.MUNICIPIO_LAYERS.analisis) || {};
  const anRole = (k) => (Array.isArray(AN[k]) ? AN[k] : []);
  const anHasConfig = ['colonia', 'poblacion', 'peligro', 'equipamiento'].some(k => anRole(k).length);

  const CONTEXT_LAYERS = anHasConfig ? anRole('poblacion').map(x => x.layer)
                                     : ['Manzanas_INEGI_2020', 'manzanas_densidad_poblacion'];
  const COLONIA_LAYERS = anHasConfig ? anRole('colonia').map(x => x.layer) : ['COLONIAS_CYA'];
  // Campos elegidos en el panel (población a sumar / nombre de colonia).
  const POBLACION_FIELDS = anRole('poblacion').map(x => x.field).filter(Boolean);
  const COLONIA_FIELDS   = anRole('colonia').map(x => x.field).filter(Boolean);

  const PROXIMITY_LAYERS_DEFAULT = [
    { key: 'Gasolineras_celaya', queryKeys: ['Gasolineras_celaya'], title: 'Gasolineras', kind: 'risk', icon: 'fa-gas-pump' },
    { key: 'Gaseras_celaya', queryKeys: ['Gaseras_celaya', 'Gaseras', 'GASERAS', 'gaseras_celaya'], title: 'Gaseras', kind: 'risk', icon: 'fa-industry' },
    { key: 'Fallas_Celaya_2020', queryKeys: ['Fallas_Celaya_2020', 'FALLAS_CELAYA_2020', 'Fallas Celaya 2020'], title: 'Fallas Celaya 2020', kind: 'risk', icon: 'fa-wave-square' },
    { key: 'Encharcamientos', queryKeys: ['Encharcamientos', 'ENCHARCAMIENTOS', 'encharcamientos'], title: 'Encharcamientos', kind: 'risk', icon: 'fa-tint' },
    { key: 'Rio_Laja', queryKeys: ['Rio_Laja'], title: 'Río Laja', kind: 'risk', icon: 'fa-water', countTowardsTotals: true, showCount: false,
      detailFormatter: (matches) => matches.selectionMode === 'polygon'
        ? 'Se localiza dentro del polígono dibujado.'
        : `Se localiza dentro del radio. El punto más cercano está a ${formatDistance(matches.nearest.distance)}.` },
    { key: 'refugios_temporales_celaya', queryKeys: ['refugios_temporales_celaya'], title: 'Refugios temporales', kind: 'support', icon: 'fa-house' }
  ];

  const ICON_BY_ROLE = { peligro: 'fa-triangle-exclamation', equipamiento: 'fa-building-shield' };
  const PROXIMITY_LAYERS = anHasConfig
    ? [].concat(
        anRole('peligro').map(x => ({ key: x.layer, queryKeys: [x.layer], title: x.name, kind: 'risk', icon: ICON_BY_ROLE.peligro, field: x.field, geom: x.geom })),
        anRole('equipamiento').map(x => ({ key: x.layer, queryKeys: [x.layer], title: x.name, kind: 'support', icon: ICON_BY_ROLE.equipamiento, field: x.field, geom: x.geom }))
      )
    : PROXIMITY_LAYERS_DEFAULT;

  // Texto de la lista de peligros (para mensajes), derivado de la config.
  const RISK_TITLES = PROXIMITY_LAYERS.filter(d => d.kind === 'risk').map(d => d.title);
  const riskListText = RISK_TITLES.length ? RISK_TITLES.join(', ') : 'las capas de peligro del Atlas';

  let map;
  let ol;
  let analysisLayer = null;
  let clickKey = null;
  let drawInteraction = null;
  let clickModeActive = false;
  let selectedPoint = null;
  let selectedGeometry = null;
  let selectionMode = 'point';
  let radiusMeters = 100;
  let currentReport = null;
  let supportRegistryCache = null;
  let supportRegistryPromise = null;
  const ANALISIS_ICON_SVG = '<span class="analisis-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10.5 13.4C8.8 11.4 8 10.4 8 9.2a2.5 2.5 0 0 1 5 0c0 1.2-.8 2.2-2.5 4.2Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/><circle cx="10.5" cy="9.2" r=".72" fill="currentColor"/></svg></span>';
  const PICK_POINT_ICON_SVG = '<i class="fas fa-location-crosshairs analisis-btn-icon-fa" aria-hidden="true"></i>';
  const GEOLOCATION_ICON_SVG = '<i class="fas fa-location-arrow analisis-btn-icon-fa" aria-hidden="true"></i>';
  let supportLayerAutoEnabled = false;
  let supportLayerProgrammaticChange = false;
  let supportLayerBound = false;
  let dragging = null;
  let previousObjectAnalysisState = false;
  let bufferAnimationFrame = null;
  let bufferAnimationPhase = 0;
  let bufferAnimationLastTick = 0;
  const BUFFER_ANIMATION_INTERVAL = 1000 / 24;

  function waitForMap() {
    if (window.__atlasMap && window.__atlasOl) {
      map = window.__atlasMap;
      ol = window.__atlasOl;
      init();
    } else {
      setTimeout(waitForMap, 150);
    }
  }

  function init() {
    ensureLayer();
    injectUI();
    bindEvents();
    makePanelDraggable();
    bindStreetViewPanelSync();
    bindBasemapRefresh();
    bindSupportLayerVisibility();
  }

  function getVisibleGoogleBasemapKind() {
    if (!map?.getLayers) return 'roadmap';
    const layers = map.getLayers().getArray ? map.getLayers().getArray() : [];
    for (const layer of layers) {
      if (!layer?.getVisible?.()) continue;
      const source = layer.getSource?.();
      const url = source?.getUrls?.()?.[0] || source?.getUrl?.() || '';
      if (!url || !/mt1\.google\.com\/vt/i.test(url)) continue;
      if (/lyrs=y/i.test(url)) return 'hybrid';
      if (/lyrs=s/i.test(url)) return 'satellite';
      if (/lyrs=p/i.test(url)) return 'terrain';
      if (/lyrs=m/i.test(url)) return 'roadmap';
    }
    return 'roadmap';
  }

  function getBufferFillColor() {
    const basemapKind = getVisibleGoogleBasemapKind();
    if (basemapKind === 'roadmap') return 'rgba(147,29,61,0.18)';
    if (basemapKind === 'hybrid') return 'rgba(147,29,61,0.16)';
    if (basemapKind === 'satellite') return 'rgba(147,29,61,0.16)';
    if (basemapKind === 'terrain') return 'rgba(147,29,61,0.17)';
    return 'rgba(147,29,61,0.17)';
  }

  function bindBasemapRefresh() {
    if (!map?.getLayers) return;
    const layers = map.getLayers().getArray ? map.getLayers().getArray() : [];
    layers.forEach(layer => {
      const source = layer?.getSource?.();
      const url = source?.getUrls?.()?.[0] || source?.getUrl?.() || '';
      if (!url || !/mt1\.google\.com\/vt/i.test(url) || layer.__consultaCiudadanaBound) return;
      layer.__consultaCiudadanaBound = true;
      layer.on?.('change:visible', () => analysisLayer?.changed?.());
    });
  }

  function ensureLayer() {
    if (analysisLayer) return;
    analysisLayer = new ol.layer.Vector({
      source: new ol.source.Vector(),
      style: function (feature) {
        const kind = feature.get('kind');
        if (kind === 'buffer') {
          const styles = [new ol.style.Style({
            fill: new ol.style.Fill({ color: getBufferFillColor() }),
            stroke: new ol.style.Stroke({
              color: '#1e73be',
              width: 2.5,
              lineDash: [10, 8],
              lineDashOffset: bufferAnimationPhase,
              lineCap: 'round',
              lineJoin: 'round'
            })
          })];
          const labelText = feature.get('labelText');
          if (labelText) {
            styles.push(new ol.style.Style({
              geometry: function (bufferFeature) {
                return new ol.geom.Point(getBufferLabelCoordinate(bufferFeature));
              },
              text: new ol.style.Text({
                text: labelText,
                font: '700 12px Arial, Helvetica, sans-serif',
                textAlign: 'center',
                textBaseline: 'bottom',
                offsetY: -2,
                fill: new ol.style.Fill({ color: '#1e73be' }),
                stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,0.98)', width: 3.5 })
              })
            }));
          }
          return styles;
        }
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: '#1e73be' }),
            stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
          })
        });
      },
      zIndex: 1001
    });
    map.addLayer(analysisLayer);
  }

  function bindFloatingHeaderTooltip(btn) {
    if (!btn || btn.dataset.headerTooltipBound === '1') return;
    btn.dataset.headerTooltipBound = '1';
    btn.setAttribute('data-tip', 'Análisis de riesgo por ubicación');
    btn.removeAttribute('title');

    const tip = document.getElementById('header-tooltip');
    if (!tip) return;

    let hideTimer = null;

    function showTip() {
      const label = btn.dataset.tip;
      if (!label) return;
      clearTimeout(hideTimer);
      tip.textContent = label;
      tip.classList.remove('visible');

      const r = btn.getBoundingClientRect();
      const vw = window.innerWidth;
      const tipW = tip.offsetWidth || 120;

      let left = r.left + r.width / 2 - tipW / 2;
      if (left + tipW + 8 > vw) left = vw - tipW - 8;
      if (left < 8) left = 8;

      const arrowLeft = (r.left + r.width / 2) - left;
      tip.style.setProperty('--arrow-left', arrowLeft + 'px');
      tip.style.left = left + 'px';
      tip.style.top = (r.bottom + 8) + 'px';
      tip.classList.add('visible');
    }

    function hideTip() {
      hideTimer = setTimeout(() => tip.classList.remove('visible'), 80);
    }

    btn.addEventListener('mouseenter', showTip);
    btn.addEventListener('mouseleave', hideTip);
    btn.addEventListener('click', hideTip);
  }

  function injectUI() {
    const analysisGroup = document.querySelector('.tb-group[aria-label="Análisis"], .toolbar-group[data-group-label="Análisis"]');
    if (analysisGroup && !document.getElementById('btn-analisis-demografico')) {
      const btn = document.createElement('button');
      btn.className = 'tb-btn';
      btn.id = 'btn-analisis-demografico';
      btn.setAttribute('data-tip', 'Análisis de riesgo por ubicación');
      btn.setAttribute('aria-label', 'Análisis de riesgo por ubicación');
      btn.innerHTML = ANALISIS_ICON_SVG;
      analysisGroup.appendChild(btn);
      bindFloatingHeaderTooltip(btn);
    } else {
      bindFloatingHeaderTooltip(document.getElementById('btn-analisis-demografico'));
    }

    if (document.getElementById('analisis-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'analisis-panel';
    panel.className = 'analisis-panel analisis-hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Análisis de riesgo por ubicación');
    panel.innerHTML = `
      <div class="analisis-header" id="analisis-drag-handle">
        <div class="analisis-title">
          <span class="analisis-title-icon analisis-icon-svg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M10.5 13.4C8.8 11.4 8 10.4 8 9.2a2.5 2.5 0 0 1 5 0c0 1.2-.8 2.2-2.5 4.2Z" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/><circle cx="10.5" cy="9.2" r=".72" fill="currentColor"/></svg></span>
          <span>Análisis de riesgo por ubicación</span>
        </div>
        <div class="analisis-header-actions">
          <button class="analisis-icon-btn" id="btn-analisis-min" title="Minimizar" aria-label="Minimizar">
            <i class="fas fa-minus"></i>
          </button>
          <button class="analisis-close" id="analisis-close" title="Cerrar y limpiar análisis" aria-label="Cerrar y limpiar análisis">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="analisis-body" id="analisis-body">
        <div class="analisis-intro">
          Para comenzar, da clic en <strong>Seleccionar un punto</strong> o en <strong>Mi ubicación</strong> para revisar riesgos cercanos por peligros del Atlas. Usa la <strong>X</strong> para cerrar y limpiar el análisis.
        </div>

        <div class="analisis-section-card">
          <div class="analisis-section-title"><i class="fas fa-location-dot"></i> Selección</div>
          <div class="analisis-actions-grid">
            <button class="analisis-action-btn" id="btn-analisis-pick">${PICK_POINT_ICON_SVG}<span>Seleccionar un punto</span></button>
            <button class="analisis-action-btn analisis-secondary" id="btn-analisis-geolocate">${GEOLOCATION_ICON_SVG}<span>Mi ubicación</span></button>
          </div>
          <div class="analisis-status" id="analisis-selection-status">Sin punto seleccionado.</div>
        </div>

        <div class="analisis-section-card">
          <div class="analisis-section-title"><i class="fas fa-circle-notch"></i> Radio de consulta</div>
          <div class="analisis-radius-chips" id="analisis-radius-chips">
            <button type="button" class="analisis-radius-chip analisis-radius-chip-active" data-radius="100">100 m</button>
            <button type="button" class="analisis-radius-chip" data-radius="250">250 m</button>
            <button type="button" class="analisis-radius-chip" data-radius="500">500 m</button>
          </div>
          <div class="analisis-radius-note">Se usa para revisar elementos cercanos al punto elegido.</div>
        </div>

        <div class="analisis-loading analisis-hidden" id="analisis-loading" aria-live="polite">
          <div class="analisis-spinner" role="status"></div>
          <span>Consultando capas del Atlas…</span>
        </div>

        <div class="analisis-error analisis-hidden" id="analisis-error">
          <i class="fas fa-triangle-exclamation"></i>
          <p id="analisis-error-msg">No fue posible generar la consulta.</p>
        </div>

        <div class="analisis-results analisis-hidden" id="analisis-results">
          <div class="analisis-summary-card" id="analisis-summary-card">
            <div class="analisis-summary-kicker">Nivel de atención</div>
            <div class="analisis-summary-level" id="analisis-summary-level">—</div>
            <p class="analisis-summary-text" id="analisis-summary-text"></p>
          </div>

          <div class="analisis-kpi-grid" id="analisis-kpi-grid"></div>

          <div class="analisis-section-card">
            <div class="analisis-section-title"><i class="fas fa-location-dot"></i> Ubicación consultada</div>
            <div class="analisis-list" id="analisis-context-list"></div>
          </div>

          <div class="analisis-section-card">
            <div class="analisis-section-title"><i class="fas fa-triangle-exclamation"></i> Infraestructura de riesgo cercana</div>
            <div class="analisis-list" id="analisis-risk-nearby-list"></div>
          </div>

          <div class="analisis-section-card">
            <div class="analisis-section-title"><i class="fas fa-house"></i> Refugios temporales de ${MUNI}</div>
            <div class="analisis-section-intro analisis-support-intro" id="analisis-support-intro"></div>
            <div class="analisis-list" id="analisis-support-nearby-list"></div>
          </div>

          <div class="analisis-section-card">
            <div class="analisis-section-title"><i class="fas fa-circle-info"></i> Recomendaciones</div>
            <div class="analisis-list" id="analisis-recommendations-list"></div>
          </div>

          <div class="analisis-footer-actions">
            <button class="analisis-action-btn analisis-secondary" id="btn-analisis-center"><i class="fas fa-expand"></i> Centrar resultado</button>
            <button class="analisis-action-btn" id="btn-analisis-download"><i class="fas fa-file-pdf"></i> Descargar ficha PDF</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    updateRadiusUI();
  }

  function bindEvents() {
    document.getElementById('btn-analisis-demografico')?.addEventListener('click', togglePanel);
    document.getElementById('analisis-close')?.addEventListener('click', closePanel);
    document.getElementById('btn-analisis-min')?.addEventListener('click', toggleMinimize);
    document.getElementById('btn-analisis-pick')?.addEventListener('click', activateMapPick);
    document.getElementById('btn-analisis-geolocate')?.addEventListener('click', useGeolocation);
    document.getElementById('btn-analisis-center')?.addEventListener('click', centerResult);
    document.getElementById('btn-analisis-download')?.addEventListener('click', downloadReport);
    document.getElementById('analisis-support-nearby-list')?.addEventListener('click', (event) => {
      const btn = event.target?.closest?.('.analisis-link-btn[data-support-index]');
      if (!btn) return;
      const index = Number(btn.dataset.supportIndex);
      if (!Number.isFinite(index)) return;
      focusSupportByIndex(index);
    });

    document.querySelectorAll('.analisis-radius-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        radiusMeters = Number(btn.dataset.radius) || 100;
        updateRadiusUI();
        if (selectedPoint) {
          renderSelection(selectedPoint);
          runAnalysis(selectedPoint);
        }
      });
    });
  }

  function togglePanel() {
    const panel = document.getElementById('analisis-panel');
    const btn = document.getElementById('btn-analisis-demografico');
    if (!panel) return;

    const willOpen = panel.classList.contains('analisis-hidden');
    panel.classList.toggle('analisis-hidden', !willOpen);
    btn?.classList.toggle('active', willOpen);

    if (willOpen) {
      panel.classList.remove('analisis-minimized');
      closeConflictingPanels();
      syncPanelWithStreetView(true);
    } else {
      cancelInteractions();
    }
  }

  function closePanel() {
    clearAnalysis();
    document.getElementById('analisis-panel')?.classList.add('analisis-hidden');
    document.getElementById('btn-analisis-demografico')?.classList.remove('active');
  }

  function toggleMinimize() {
    const panel = document.getElementById('analisis-panel');
    panel?.classList.toggle('analisis-minimized');
  }

  function isLegacyStreetViewActive() {
    return !!document.querySelector('.map-container.streetview-active');
  }

  function isPluginStreetViewActive() {
    return document.body.classList.contains('ol-street-view--activated');
  }

  function getStreetViewSafeTop() {
    if (isPluginStreetViewActive() && !document.body.classList.contains('ol-street-view--compact')) {
      const panorama = document.getElementById('ol-street-view--panorama');
      const panoRect = panorama?.getBoundingClientRect?.();
      if (panoRect && panoRect.height > 80) {
        return Math.max(76, Math.round(panoRect.bottom + 12));
      }
    }

    const container = document.querySelector('.map-container.streetview-active');
    if (!container) return 76;

    const rect = container.getBoundingClientRect();
    const splitRaw = (getComputedStyle(container).getPropertyValue('--streetview-split') || '60%').trim();
    let splitPx = rect.height * 0.6;

    if (splitRaw.endsWith('%')) {
      const percent = parseFloat(splitRaw);
      if (Number.isFinite(percent)) splitPx = rect.height * (percent / 100);
    } else if (splitRaw.endsWith('px')) {
      const px = parseFloat(splitRaw);
      if (Number.isFinite(px)) splitPx = px;
    }

    return Math.max(76, Math.round(rect.top + splitPx + 12));
  }

  function syncPanelWithStreetView(forceMove = false) {
    const panel = document.getElementById('analisis-panel');
    if (!panel) return;

    const streetViewActive = isPluginStreetViewActive() || isLegacyStreetViewActive();

    if (!streetViewActive) {
      if (panel.dataset.streetviewAdjusted === '1') {
        panel.style.top = panel.dataset.prevTop || '';
        panel.style.maxHeight = panel.dataset.prevMaxHeight || '';
        panel.style.left = panel.dataset.prevLeft || '';
        panel.style.right = panel.dataset.prevRight || '';
        delete panel.dataset.streetviewAdjusted;
        delete panel.dataset.prevTop;
        delete panel.dataset.prevMaxHeight;
        delete panel.dataset.prevLeft;
        delete panel.dataset.prevRight;
      }
      return;
    }

    const nextTop = getStreetViewSafeTop();
    const rect = panel.getBoundingClientRect();

    if (panel.dataset.streetviewAdjusted !== '1') {
      panel.dataset.streetviewAdjusted = '1';
      panel.dataset.prevTop = panel.style.top || '';
      panel.dataset.prevMaxHeight = panel.style.maxHeight || '';
      panel.dataset.prevLeft = panel.style.left || '';
      panel.dataset.prevRight = panel.style.right || '';
    }

    if (forceMove || rect.top < nextTop - 2 || (isPluginStreetViewActive() && !document.body.classList.contains('ol-street-view--compact'))) {
      panel.style.top = `${nextTop}px`;
      if (!panel.style.left) panel.style.left = '';
      if (!panel.style.right) panel.style.right = '14px';
    }

    panel.style.maxHeight = `calc(100vh - ${nextTop + 12}px)`;
  }

  function bindStreetViewPanelSync() {
    const container = document.querySelector('.map-container');
    if (!container) return;

    const observer = new MutationObserver(() => syncPanelWithStreetView());
    observer.observe(container, { attributes: true, attributeFilter: ['class', 'style'] });

    const bodyObserver = new MutationObserver(() => syncPanelWithStreetView(true));
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('resize', () => syncPanelWithStreetView());
    syncPanelWithStreetView();
  }

  function makePanelDraggable() {
    const panel = document.getElementById('analisis-panel');
    const handle = document.getElementById('analisis-drag-handle');
    if (!panel || !handle) return;

    const start = (clientX, clientY) => {
      if (window.innerWidth <= 820) return;
      const rect = panel.getBoundingClientRect();
      dragging = {
        x: clientX,
        y: clientY,
        left: rect.left,
        top: rect.top
      };
      panel.classList.add('analisis-dragging');
      document.body.style.userSelect = 'none';
    };

    const move = (clientX, clientY) => {
      if (!dragging || window.innerWidth <= 820) return;
      const nextLeft = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, dragging.left + (clientX - dragging.x)));
      const safeTop = getStreetViewSafeTop();
      const nextTop = Math.max(safeTop, Math.min(window.innerHeight - 44, dragging.top + (clientY - dragging.y)));
      panel.style.left = `${nextLeft}px`;
      panel.style.top = `${nextTop}px`;
      panel.style.right = 'auto';
    };

    const stop = () => {
      dragging = null;
      panel.classList.remove('analisis-dragging');
      document.body.style.userSelect = '';
    };

    handle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      start(e.clientX, e.clientY);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    window.addEventListener('mouseup', stop);

    handle.addEventListener('touchstart', (e) => {
      if (!e.touches?.length) return;
      start(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!dragging || !e.touches?.length) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', stop);
  }

  function updateRadiusUI() {
    document.querySelectorAll('.analisis-radius-chip').forEach(btn => {
      btn.classList.toggle('analisis-radius-chip-active', Number(btn.dataset.radius) === radiusMeters);
    });
  }

  function closeConflictingPanels() {
    document.getElementById('feature-modal')?.classList.remove('visible');
    const q9 = document.getElementById('q9-info-panel');
    q9?.classList.remove('visible', 'q9-expanded');
  }

  function suspendInfoClick() {
    try {
      previousObjectAnalysisState = typeof objectAnalysisActive !== 'undefined' ? !!objectAnalysisActive : false;
      if (typeof objectAnalysisActive !== 'undefined') objectAnalysisActive = true;
    } catch (_e) {}
  }

  function resumeInfoClick() {
    try {
      if (typeof objectAnalysisActive !== 'undefined') objectAnalysisActive = previousObjectAnalysisState;
    } catch (_e) {}
  }

  function activateMapPick() {
    if (!map || !ol) return;
    cancelInteractions();
    resetStateView(true);
    selectionMode = 'point';
    selectedGeometry = null;
    clickModeActive = true;
    suspendInfoClick();
    closeConflictingPanels();
    map.getTargetElement().style.cursor = 'crosshair';
    setSelectionStatus('Haz clic en el mapa para generar la consulta ciudadana.', 'is-pending');

    clickKey = map.on('singleclick', (evt) => {
      finishPickMode();
      selectedPoint = evt.coordinate;
      renderSelection(selectedPoint);
      runAnalysis(selectedPoint);
    });
  }

  function activatePolygonDraw() {
    if (!map || !ol || !analysisLayer) return;
    cancelInteractions();
    resetStateView(true);
    selectionMode = 'polygon';
    selectedPoint = null;
    selectedGeometry = null;
    suspendInfoClick();
    closeConflictingPanels();
    map.getTargetElement().style.cursor = 'crosshair';
    setSelectionStatus('Dibuja el polígono del área a consultar. Haz clic para agregar vértices y doble clic para terminar.', 'is-pending');
    analysisLayer.getSource().clear();
    stopBufferAnimation();

    drawInteraction = new ol.interaction.Draw({
      source: analysisLayer.getSource(),
      type: 'Polygon',
    });

    drawInteraction.on('drawstart', () => {
      analysisLayer.getSource().clear();
      stopBufferAnimation();
    });

    drawInteraction.on('drawend', (evt) => {
      const geom = evt.feature?.getGeometry?.()?.clone?.();
      finishDrawMode();
      if (!geom) return;
      renderPolygonSelection(geom);
      runAnalysis(getReferencePoint(geom));
    });

    map.addInteraction(drawInteraction);
  }

  function finishPickMode() {
    if (clickKey) {
      ol.Observable.unByKey(clickKey);
      clickKey = null;
    }
    clickModeActive = false;
    resumeInfoClick();
    if (map) map.getTargetElement().style.cursor = '';
  }

  function finishDrawMode() {
    if (drawInteraction && map) {
      map.removeInteraction(drawInteraction);
      drawInteraction = null;
    }
    resumeInfoClick();
    if (map) map.getTargetElement().style.cursor = '';
  }

  function cancelInteractions() {
    finishPickMode();
    finishDrawMode();
  }

  function setSelectionStatus(text, stateClass) {
    const el = document.getElementById('analisis-selection-status');
    if (!el) return;
    el.className = 'analisis-status';
    if (stateClass) el.classList.add(stateClass);
    el.textContent = text;
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      showError('Tu navegador no permite acceder a la ubicación.');
      return;
    }
    cancelInteractions();
    selectionMode = 'point';
    selectedGeometry = null;
    closeConflictingPanels();
    setSelectionStatus('Buscando tu ubicación…', 'is-pending');
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]);
      selectedPoint = coords;
      renderSelection(coords);
      runAnalysis(coords);
      try {
        map.getView().animate({ center: coords, duration: 600, zoom: Math.max(map.getView().getZoom() || 12, 16) });
      } catch (_e) {}
    }, (err) => {
      showError('No fue posible obtener tu ubicación. Revisa permisos del navegador.');
      setSelectionStatus(err?.message || 'No fue posible obtener tu ubicación.', 'is-error');
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }

  function renderSelection(coordinate) {
    if (!analysisLayer || !coordinate) return;
    selectionMode = 'point';
    const source = analysisLayer.getSource();
    source.clear();

    const pointFeature = new ol.Feature({ geometry: new ol.geom.Point(coordinate), kind: 'point' });
    const circle = buildCirclePolygon(coordinate, radiusMeters, 72);
    selectedGeometry = circle.clone();
    const bufferFeature = new ol.Feature({
      geometry: circle,
      kind: 'buffer',
      labelText: `${radiusMeters} m`,
      radiusMeters,
      centerCoordinate: coordinate.slice()
    });

    source.addFeature(bufferFeature);
    source.addFeature(pointFeature);
    startBufferAnimation();

    const lonLat = ol.proj.toLonLat(coordinate);
    setSelectionStatus(`Punto seleccionado: ${lonLat[1].toFixed(5)}, ${lonLat[0].toFixed(5)} · radio ${radiusMeters} m`, 'is-ok');
  }

  function renderPolygonSelection(geometry) {
    if (!analysisLayer || !geometry) return;
    selectionMode = 'polygon';
    selectedGeometry = geometry.clone();
    const source = analysisLayer.getSource();
    source.clear();
    source.addFeature(new ol.Feature({ geometry: geometry.clone(), kind: 'buffer' }));
    startBufferAnimation();
    const ref = getReferencePoint(geometry);
    const lonLat = ol.proj.toLonLat(ref);
    setSelectionStatus(`Polígono dibujado · área ${formatAreaM2(calculateGeometryArea(geometry))} · referencia ${lonLat[1].toFixed(5)}, ${lonLat[0].toFixed(5)}`, 'is-ok');
  }

  function getReferencePoint(geometry) {
    if (!geometry) return selectedPoint || null;
    try {
      if (geometry.getType && geometry.getType() === 'Polygon' && typeof geometry.getInteriorPoint === 'function') {
        return geometry.getInteriorPoint().getCoordinates();
      }
      if (typeof geometry.getClosestPoint === 'function') {
        return geometry.getClosestPoint(ol.extent.getCenter(geometry.getExtent()));
      }
      return ol.extent.getCenter(geometry.getExtent());
    } catch (_e) {
      return ol.extent.getCenter(geometry.getExtent());
    }
  }

  function getBufferLabelCoordinate(feature) {
    const geometry = feature?.getGeometry?.();
    const center = feature?.get('centerCoordinate');
    const radius = Number(feature?.get('radiusMeters')) || radiusMeters || 0;
    if (Array.isArray(center) && center.length >= 2) {
      return [center[0], center[1] + Math.max(radius, 0)];
    }
    try {
      const extent = geometry?.getExtent?.();
      if (extent) {
        return [((extent[0] + extent[2]) / 2), extent[3]];
      }
    } catch (_e) {}
    return selectedPoint || [0, 0];
  }

  function buildCirclePolygon(center, radiusM, segments) {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const angle = (2 * Math.PI * i) / segments;
      points.push([
        center[0] + radiusM * Math.cos(angle),
        center[1] + radiusM * Math.sin(angle)
      ]);
    }
    return new ol.geom.Polygon([points]);
  }

  function buildGeometryWkt(geometry3857, epsgCode) {
    if (!geometry3857) return '';
    const target = String(epsgCode || 'EPSG:4326').toUpperCase();
    const clone = geometry3857.clone();
    if (target !== 'EPSG:3857') {
      clone.transform('EPSG:3857', target);
    }
    if (clone.getType() === 'Polygon') {
      const ring = clone.getCoordinates()[0].map(coord => `${Number(coord[0]).toFixed(6)} ${Number(coord[1]).toFixed(6)}`).join(',');
      return `POLYGON((${ring}))`;
    }
    return '';
  }

  function calculateGeometryArea(geometry) {
    try {
      return Math.abs(Number(geometry?.getArea?.()) || 0);
    } catch (_e) {
      return 0;
    }
  }

  function startBufferAnimation() {
    if (bufferAnimationFrame || !analysisLayer) return;

    const animate = (timestamp) => {
      const source = analysisLayer?.getSource?.();
      const hasBuffer = source?.getFeatures?.().some(feature => feature.get('kind') === 'buffer');

      if (!hasBuffer) {
        bufferAnimationFrame = null;
        return;
      }

      if (!bufferAnimationLastTick || (timestamp - bufferAnimationLastTick) >= BUFFER_ANIMATION_INTERVAL) {
        bufferAnimationLastTick = timestamp;
        bufferAnimationPhase = (bufferAnimationPhase - 1.1) % 36;
        analysisLayer.changed();
      }

      bufferAnimationFrame = requestAnimationFrame(animate);
    };

    bufferAnimationLastTick = 0;
    bufferAnimationFrame = requestAnimationFrame(animate);
  }

  function stopBufferAnimation() {
    if (bufferAnimationFrame) {
      cancelAnimationFrame(bufferAnimationFrame);
      bufferAnimationFrame = null;
    }
    bufferAnimationLastTick = 0;
    bufferAnimationPhase = 0;
    analysisLayer?.changed?.();
  }

  function buildPointWkt4326(coordinate3857) {
    const lonLat = ol.proj.toLonLat(coordinate3857);
    return `POINT(${lonLat[0].toFixed(6)} ${lonLat[1].toFixed(6)})`;
  }

  function bboxFromPoint(coord, radius) {
    return [coord[0] - radius, coord[1] - radius, coord[0] + radius, coord[1] + radius];
  }

  async function runAnalysis(coordinate) {
    const referencePoint = coordinate || getReferencePoint(selectedGeometry);
    const geometry = selectedGeometry || (referencePoint ? buildCirclePolygon(referencePoint, radiusMeters, 72) : null);
    if (!referencePoint || !geometry) return;
    showState('loading');
    closeConflictingPanels();

    const bbox = geometry.getExtent();

    try {
      const [contextFeatures, coloniaFeatures, nearbyRes, supportRegistryFeatures] = await Promise.all([
        queryBestContextFeatures(CONTEXT_LAYERS, referencePoint, radiusMeters, geometry, selectionMode),
        queryGeometryLayer(COLONIA_LAYERS, geometry, 300),
        Promise.all(
          PROXIMITY_LAYERS.map(def => querySelectionLayer(def.queryKeys || def.key, geometry, bbox, selectionMode).then(features => ({ def, features })))
        ),
        fetchSupportRegistryFeatures()
      ]);

      const context = buildContext(contextFeatures, referencePoint, coloniaFeatures);
      const risks = [];
      const nearby = buildNearbyHits(nearbyRes, referencePoint, radiusMeters, geometry, selectionMode);
      const supportRegistry = buildSupportRegistryItems(supportRegistryFeatures, referencePoint, radiusMeters, geometry, selectionMode);
      const summary = buildSummary(context, risks, nearby, radiusMeters, selectionMode, geometry, supportRegistry);
      const recommendations = buildRecommendations(summary, risks, nearby, selectionMode, supportRegistry, context);

      currentReport = {
        generatedAt: new Date(),
        radiusMeters,
        selectionMode,
        selectionAreaM2: calculateGeometryArea(geometry),
        context,
        risks,
        nearby,
        supportRegistry,
        summary,
        recommendations,
        coordinate: ol.proj.toLonLat(referencePoint)
      };

      renderResults(currentReport);
      showState('results');
    } catch (err) {
      console.error('Consulta ciudadana de riesgo', err);
      showError('No fue posible consultar las capas de la consulta ciudadana para este punto o polígono.');
    }
  }

  async function queryPointLayer(typeName, pointWkt, maxFeatures) {
    const names = Array.isArray(typeName) ? typeName : [typeName];
    let lastError = null;

    for (const name of names) {
      for (const geomField of GEOM_CANDIDATES) {
        try {
          const cql = `INTERSECTS(${geomField},${pointWkt})`;
          const url = buildWfsUrl({
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: `${CONFIG.workspace}:${name}`,
            outputFormat: 'application/json',
            srsName: 'EPSG:4326',
            maxFeatures: String(maxFeatures || 1),
            CQL_FILTER: cql
          });
          const json = await fetchJson(url);
          if (Array.isArray(json?.features) && json.features.length) return json.features[0];
          lastError = new Error('Sin coincidencia');
        } catch (err) {
          lastError = err;
        }
      }
    }

    if (lastError) {
      console.warn(`No fue posible consultar ${names.join(', ')}`, lastError);
    }
    return null;
  }



  async function queryGeometryLayer(typeName, geometry3857, maxFeatures) {
    const names = Array.isArray(typeName) ? typeName : [typeName];
    const wkt3857 = buildGeometryWkt(geometry3857, 'EPSG:3857');
    const wkt4326 = buildGeometryWkt(geometry3857, 'EPSG:4326');
    const attempts = [
      { srsName: 'EPSG:3857', dataProjection: 'EPSG:3857', cqlFor: (field) => `INTERSECTS(${field},SRID=3857;${wkt3857})` },
      { srsName: 'EPSG:4326', dataProjection: 'EPSG:4326', cqlFor: (field) => `INTERSECTS(${field},SRID=4326;${wkt4326})` },
      { srsName: 'EPSG:4326', dataProjection: 'EPSG:4326', cqlFor: (field) => `INTERSECTS(${field},${wkt4326})` }
    ].filter(item => item.cqlFor && ((item.srsName === 'EPSG:3857' && wkt3857) || (item.srsName === 'EPSG:4326' && wkt4326)));
    let lastError = null;

    for (const name of names) {
      for (const geomField of GEOM_CANDIDATES) {
        for (const attempt of attempts) {
          try {
            const url = buildWfsUrl({
              service: 'WFS',
              version: '1.0.0',
              request: 'GetFeature',
              typeName: `${CONFIG.workspace}:${name}`,
              outputFormat: 'application/json',
              srsName: attempt.srsName,
              maxFeatures: String(maxFeatures || 300),
              CQL_FILTER: attempt.cqlFor(geomField)
            });
            const json = await fetchJson(url);
            const features = new ol.format.GeoJSON().readFeatures(json, {
              dataProjection: attempt.dataProjection,
              featureProjection: 'EPSG:3857'
            });
            const exact = getFeaturesWithinGeometry(features, geometry3857, true);
            if (Array.isArray(exact.features) && exact.features.length) return exact.features;
          } catch (err) {
            lastError = err;
          }
        }
      }
    }

    if (geometry3857) {
      const fallback = await queryBboxLayer(typeName, geometry3857.getExtent(), Math.max(Number(maxFeatures || 300), 300));
      const filtered = getFeaturesWithinGeometry(fallback, geometry3857, true);
      if (filtered.present) return filtered.features;
    }

    if (lastError) {
      console.warn(`No fue posible consultar por geometría en ${names.join(', ')}`, lastError);
    }
    return [];
  }

  async function querySelectionLayer(typeName, geometry, bbox3857, mode) {
    if (mode === 'polygon' && geometry) {
      return queryGeometryLayer(typeName, geometry, 300);
    }
    return queryBboxLayer(typeName, bbox3857, 120);
  }

  async function queryBestContextFeatures(typeNames, coordinate3857, radius, geometry, mode) {
    if (mode === 'polygon' && geometry) {
      const names = Array.isArray(typeNames) ? typeNames : [typeNames];
      let best = [];
      let bestScore = -Infinity;
      for (const name of names) {
        const features = await queryGeometryLayer(name, geometry, 1200);
        if (!features.length) continue;
        const layerScore = features.reduce((sum, feature) => sum + scoreContextFeature({ properties: feature.getProperties?.() || {} }), 0);
        if (layerScore > bestScore) {
          bestScore = layerScore;
          best = features;
        }
      }
      return best;
    }
    const names = Array.isArray(typeNames) ? typeNames : [typeNames];
    let best = [];
    let bestScore = -Infinity;

    for (const name of names) {
      const features = await queryBboxLayer(name, bboxFromPoint(coordinate3857, radius), 500);
      if (!features.length) continue;
      const selected = selectFeaturesWithinRadius(features, coordinate3857, radius);
      if (!selected.length) continue;
      const layerScore = selected.reduce((sum, feature) => sum + scoreContextFeature({ properties: feature.getProperties?.() || {} }), 0);
      if (layerScore > bestScore) {
        bestScore = layerScore;
        best = selected;
      }
    }

    return best;
  }

  function selectFeaturesWithinRadius(features, point, radius) {
    return (features || []).filter(feature => {
      try {
        const geometry = feature?.getGeometry?.();
        if (!geometry) return false;
        const closest = geometry.getClosestPoint(point);
        const dx = closest[0] - point[0];
        const dy = closest[1] - point[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= radius;
      } catch (_e) {
        return false;
      }
    });
  }

  async function queryBestContextFeature(typeNames, pointWkt, coordinate3857) {
    const names = Array.isArray(typeNames) ? typeNames : [typeNames];
    const found = [];

    for (const name of names) {
      const feature = await queryPointLayer(name, pointWkt, 1);
      if (feature) found.push(feature);
    }

    if (!found.length && coordinate3857) {
      const fallbackFeatures = await queryContextBySmallBbox(names, coordinate3857);
      if (fallbackFeatures.length) found.push(...fallbackFeatures);
    }

    if (!found.length) return null;

    found.sort((a, b) => scoreContextFeature(b) - scoreContextFeature(a));
    return found[0];
  }

  async function queryContextBySmallBbox(typeNames, coordinate3857) {
    const names = Array.isArray(typeNames) ? typeNames : [typeNames];
    const collected = [];
    for (const name of names) {
      const features = await queryBboxLayer(name, bboxFromPoint(coordinate3857, 15), 25);
      if (!features.length) continue;
      const exact = selectBestFeatureForCoordinate(features, coordinate3857);
      if (!exact) continue;
      const geojson = new ol.format.GeoJSON().writeFeatureObject(exact, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857'
      });
      if (geojson?.properties) collected.push(geojson);
    }
    return collected;
  }

  function selectBestFeatureForCoordinate(features, coordinate3857) {
    if (!Array.isArray(features) || !features.length) return null;
    let inside = null;
    let nearest = null;
    let nearestDistance = Infinity;

    features.forEach(feature => {
      const geometry = feature?.getGeometry?.();
      if (!geometry) return;
      try {
        if (typeof geometry.intersectsCoordinate === 'function' && geometry.intersectsCoordinate(coordinate3857)) {
          const props = feature.getProperties?.() || {};
          if (!inside || scoreContextFeature({ properties: props }) > scoreContextFeature({ properties: inside.getProperties?.() || {} })) {
            inside = feature;
          }
          return;
        }
        const closest = geometry.getClosestPoint(coordinate3857);
        const dx = closest[0] - coordinate3857[0];
        const dy = closest[1] - coordinate3857[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearest = feature;
        }
      } catch (_e) {}
    });

    return inside || nearest || null;
  }

  function scoreContextFeature(feature) {
    const props = feature?.properties || feature?.getProperties?.() || {};
    let score = 0;

    const weightedGroups = [
      ['POBTOT', 'pobtot', 'poblacion_total', 'pob_total', 'tot_pob', 'p_total'],
      ['POBFEM', 'pobfem', 'p_fem', 'pob_fem', 'poblacion_femenina', 'mujeres'],
      ['POBMAS', 'pobmas', 'p_mas', 'pob_mas', 'poblacion_masculina', 'hombres'],
      ['P_60YMAS', 'P 60YMAS', 'P-60YMAS', 'P_60Y_MAS', 'P60YMAS', 'p_60ymas', 'p 60ymas', 'pob_60ymas', 'pob_mayor_60', 'poblacion_mayor_60', 'mayores_60', 'edad_60_mas'],
      ['PCONDISC', 'PCON_DISC', 'P_CON_DISC', 'pcon_lim', 'pob_disc', 'poblacion_discapacidad', 'discapacidad', 'con_discapacidad', 'p_disc'],
      ['VPH_HAB', 'TVIVHAB', 'VIVPAR_HAB', 'vivpar_hab', 'tvivhab', 'viviendas_habitadas', 'total_viviendas_habitadas', 'viv_hab']
    ];

    weightedGroups.forEach((candidates, index) => {
      const value = firstValue(props, candidates);
      if (value !== '') {
        score += 100 - index * 10;
        const num = Number(String(value).replace(/[\s,]/g, ''));
        if (Number.isFinite(num) && num > 0) score += 25;
      }
    });

    if (firstValue(props, ['manzana', 'mza', 'cve_mza', 'idmanzana', 'id_manzana'])) score += 5;
    if (firstValue(props, ['colonia', 'nom_col', 'nombre_col', 'asentamiento'])) score += 5;

    return score;
  }

  async function queryBboxLayer(typeName, bbox3857, maxFeatures) {
    const names = Array.isArray(typeName) ? typeName : [typeName];
    let lastError = null;

    for (const name of names) {
      try {
        const url = buildWfsUrl({
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: `${CONFIG.workspace}:${name}`,
          outputFormat: 'application/json',
          srsName: 'EPSG:3857',
          bbox: `${bbox3857.join(',')},EPSG:3857`,
          maxFeatures: String(maxFeatures || 30)
        });
        const json = await fetchJson(url);
        return new ol.format.GeoJSON().readFeatures(json, {
          dataProjection: 'EPSG:3857',
          featureProjection: 'EPSG:3857'
        });
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) {
      console.warn(`No fue posible consultar proximidad en ${names.join(', ')}`, lastError);
    }
    return [];
  }

  function buildWfsUrl(params) {
    return `${CONFIG.geoserverUrl}/${CONFIG.workspace}/ows?${new URLSearchParams(params).toString()}`;
  }

  async function fetchJson(url, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function buildContext(manzanaFeatures, coordinate3857, coloniaFeatures) {
    const lonLat = ol.proj.toLonLat(coordinate3857);
    const features = Array.isArray(manzanaFeatures) ? manzanaFeatures : (manzanaFeatures ? [manzanaFeatures] : []);
    const propsList = features.map(feature => feature?.properties || feature?.getProperties?.() || {});
    const primary = propsList[0] || {};
    const coloniaProps = (Array.isArray(coloniaFeatures) ? coloniaFeatures : (coloniaFeatures ? [coloniaFeatures] : []))
      .map(feature => feature?.properties || feature?.getProperties?.() || {});

    const sumByCandidates = (candidates, exact) => propsList.reduce((sum, props) => {
      if (exact && Object.prototype.hasOwnProperty.call(props, exact)) {
        const raw = props[exact];
        const num = Number(String(raw ?? '').replace(/[\s,]/g, ''));
        return sum + (Number.isFinite(num) ? num : 0);
      }
      return sum + numberValue(props, candidates);
    }, 0);

    const coloniaNames = Array.from(new Set(
      coloniaProps
        .map(props => firstValue(props, [...COLONIA_FIELDS, 'NOMBRE', 'NOM_COL', 'NOMBRE_COL', 'COLONIA', 'nombre', 'nom_col', 'nombre_col', 'colonia', 'asentamiento']))
        .map(value => String(value || '').trim())
        .filter(Boolean)
    ));
    const coloniaFallback = firstValue(primary, ['colonia', 'nom_col', 'nombre_col', 'asentamiento']) || 'Sin dato';
    const hasCoverage = features.length > 0;
    const poblacionTotal = sumByCandidates([...POBLACION_FIELDS, 'POBTOT', 'pobtot', 'poblacion_total', 'pob_total', 'tot_pob', 'p_total'], POBLACION_FIELDS[0] || 'POBTOT');
    const poblacionFemenina = sumByCandidates(['POBFEM', 'pobfem', 'p_fem', 'pob_fem', 'poblacion_femenina', 'mujeres']);
    const poblacionMasculina = sumByCandidates(['POBMAS', 'pobmas', 'p_mas', 'pob_mas', 'poblacion_masculina', 'hombres']);
    const poblacionMayor60 = sumByCandidates(['P_60YMAS', 'P 60YMAS', 'P-60YMAS', 'P_60Y_MAS', 'P60YMAS', 'p_60ymas', 'p 60ymas', 'pob_60ymas', 'pob_mayor_60', 'poblacion_mayor_60', 'mayores_60', 'edad_60_mas'], 'P_60YMAS');
    const poblacionDiscapacidad = sumByCandidates(['PCONDISC', 'PCON_DISC', 'P_CON_DISC', 'pcon_lim', 'pob_disc', 'poblacion_discapacidad', 'discapacidad', 'con_discapacidad', 'p_disc']);
    const viviendasHabitadas = sumByCandidates(['VPH_HAB', 'TVIVHAB', 'VIVPAR_HAB', 'vivpar_hab', 'tvivhab', 'viviendas_habitadas', 'total_viviendas_habitadas', 'viv_hab']);
    const demographicMetrics = [poblacionTotal, poblacionFemenina, poblacionMasculina, poblacionMayor60, poblacionDiscapacidad, viviendasHabitadas]
      .map(value => Number(value) || 0);
    const allDemographicMetricsZero = hasCoverage && demographicMetrics.every(value => value === 0);
    const sourceDetail = hasCoverage
      ? (allDemographicMetricsZero
        ? 'Manzanas INEGI 2020 Censo de Población y Vivienda. La manzana consultada puede corresponder a uso no habitacional o no registrar población y vivienda habitada en esta fuente.'
        : 'Manzanas INEGI 2020 Censo de Población y Vivienda.')
      : 'Manzanas INEGI 2020 Censo de Población y Vivienda. Cobertura en localidades urbanas; esta ubicación no intersecta manzanas con información disponible en esta fuente.';

    return {
      colonia: coloniaNames[0] || coloniaFallback,
      colonias: coloniaNames,
      coloniasTexto: coloniaNames.length ? coloniaNames.join(', ') : coloniaFallback,
      coloniasIncluidas: coloniaNames.length || (coloniaFallback !== 'Sin dato' ? 1 : 0),
      manzana: features.length === 1 ? (firstValue(primary, ['manzana', 'mza', 'cve_mza', 'idmanzana', 'id_manzana']) || 'Sin dato') : `${features.length} manzanas`,
      poblacionTotal,
      poblacionFemenina,
      poblacionMasculina,
      poblacionMayor60,
      poblacionDiscapacidad,
      viviendasHabitadas,
      lat: lonLat[1],
      lon: lonLat[0],
      manzanasIncluidas: features.length,
      hasCoverage,
      allDemographicMetricsZero,
      sourceDetail
    };
  }

  function buildRiskHits(results) {
    return results
      .filter(item => Array.isArray(item.features) && item.features.length)
      .map(item => ({
        key: item.def.key,
        title: item.def.title,
        severity: item.def.severity,
        icon: item.def.icon,
        detail: riskDetailText(item.def)
      }));
  }

  // Valor legible de un campo del rasgo (para nombrar el más cercano en el reporte).
  function featureFieldValue(feature, field) {
    if (!feature || !field) return '';
    const props = feature.properties || (feature.getProperties ? feature.getProperties() : {}) || {};
    const v = props[field];
    return (v === null || v === undefined) ? '' : String(v).trim();
  }

  function buildNearbyHits(results, coordinate, radius, geometry, mode) {
    const point = coordinate;
    return results.map(item => {
      const matches = mode === 'polygon'
        ? getFeaturesWithinGeometry(item.features, geometry)
        : getFeaturesWithinRadius(item.features, point, radius);
      if (!matches.present) return null;
      matches.selectionMode = mode;
      const showCount = item.def.showCount !== false;
      const countValue = showCount ? matches.count : null;
      // Nombre del rasgo más cercano según el campo elegido en el panel (papel de análisis).
      const nearestName = featureFieldValue(matches.nearest && matches.nearest.feature, item.def.field);
      const detail = typeof item.def.detailFormatter === 'function'
        ? item.def.detailFormatter(matches)
        : (mode === 'polygon'
          ? `${matches.count} dentro del polígono dibujado${nearestName ? `. El más cercano: ${nearestName}` : ''}.`
          : `${matches.count} dentro del radio. El más cercano${nearestName ? ` (${nearestName})` : ''} está a ${formatDistance(matches.nearest.distance)}.`);
      return {
        key: item.def.key,
        title: item.def.title,
        kind: item.def.kind,
        icon: item.def.icon,
        count: countValue,
        rawCount: matches.count,
        countTowardsTotals: item.def.countTowardsTotals !== false,
        showCount,
        distance: matches.nearest.distance,
        nearestName,
        detail
      };
    }).filter(Boolean).sort((a, b) => a.distance - b.distance);
  }

  async function queryAllLayer(typeName, maxFeatures) {
    const names = Array.isArray(typeName) ? typeName : [typeName];
    let lastError = null;

    for (const name of names) {
      for (const attempt of [
        { srsName: 'EPSG:3857', dataProjection: 'EPSG:3857' },
        { srsName: 'EPSG:4326', dataProjection: 'EPSG:4326' }
      ]) {
        try {
          const url = buildWfsUrl({
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: `${CONFIG.workspace}:${name}`,
            outputFormat: 'application/json',
            srsName: attempt.srsName,
            maxFeatures: String(maxFeatures || 50)
          });
          const json = await fetchJson(url);
          const features = new ol.format.GeoJSON().readFeatures(json, {
            dataProjection: attempt.dataProjection,
            featureProjection: 'EPSG:3857'
          });
          if (Array.isArray(features) && features.length) return features;
          lastError = new Error('Sin coincidencia');
        } catch (err) {
          lastError = err;
        }
      }
    }

    if (lastError) {
      console.warn(`No fue posible consultar todos los elementos en ${names.join(', ')}`, lastError);
    }
    return [];
  }

  async function fetchSupportRegistryFeatures() {
    if (Array.isArray(supportRegistryCache)) return supportRegistryCache;
    // El registro de refugios es específico de Celaya; si el municipio usa la config
    // por papeles y no lo definió, se omite (no hay capa que consultar).
    if (anHasConfig) { supportRegistryCache = []; return supportRegistryCache; }
    if (supportRegistryPromise) return supportRegistryPromise;

    supportRegistryPromise = queryAllLayer(['refugios_temporales_celaya'], 25)
      .then(features => {
        supportRegistryCache = Array.isArray(features) ? features : [];
        return supportRegistryCache;
      })
      .catch(err => {
        console.warn('No fue posible consultar el catálogo de refugios temporales.', err);
        supportRegistryCache = [];
        return supportRegistryCache;
      })
      .finally(() => {
        supportRegistryPromise = null;
      });

    return supportRegistryPromise;
  }

  function geometryDistanceToPoint(featureGeometry, referencePoint) {
    if (!featureGeometry || !referencePoint) return Infinity;
    try {
      const closest = featureGeometry.getClosestPoint(referencePoint);
      const dx = closest[0] - referencePoint[0];
      const dy = closest[1] - referencePoint[1];
      return Math.sqrt((dx * dx) + (dy * dy));
    } catch (_e) {
      return Infinity;
    }
  }

  function cleanSupportText(value) {
    return String(value == null ? '' : value).trim();
  }

  function buildSupportLocationLabel(props) {
    const venue = cleanSupportText(firstValue(props, ['SEDE', 'LUGAR', 'INSTITUCION', 'EQUIPAMIENTO', 'sede', 'lugar', 'institucion', 'equipamiento']));
    const address = cleanSupportText(firstValue(props, ['DIRECCION', 'DOMICILIO', 'UBICACION', 'CALLE', 'direccion', 'domicilio', 'ubicacion', 'calle']));
    const colonia = cleanSupportText(firstValue(props, ['COLONIA', 'NOM_COL', 'NOMBRE_COL', 'colonia', 'nom_col', 'nombre_col']));
    const bits = [];
    if (venue) bits.push(venue);
    if (address && address.toLowerCase() !== venue.toLowerCase()) bits.push(address);
    if (colonia) bits.push(/^col\.?/i.test(colonia) ? colonia : `Col. ${colonia}`);
    return bits.join(' · ');
  }

  function buildSupportRegistryItems(features, referencePoint, radius, geometry, mode) {
    const items = (Array.isArray(features) ? features : []).map((feature, index) => {
      const props = feature?.getProperties?.() || feature?.properties || {};
      const featureGeometry = feature?.getGeometry?.();
      const title = cleanSupportText(firstValue(props, ['NOMBRE', 'NOM_REFUGIO', 'NOMBRE_REFUGIO', 'REFUGIO', 'DESCRIPCION', 'nombre', 'nom_refugio', 'nombre_refugio', 'refugio', 'descripcion'])) || `Refugio temporal ${index + 1}`;
      const focusExtent = (() => {
        try {
          const extent = featureGeometry?.getExtent?.();
          return Array.isArray(extent) && extent.length === 4 && extent.every(Number.isFinite) ? extent.slice() : null;
        } catch (_e) {
          return null;
        }
      })();
      const focusCoordinate = (() => {
        try {
          const interiorPoint = featureGeometry?.getInteriorPoint?.()?.getCoordinates?.();
          if (Array.isArray(interiorPoint) && interiorPoint.length >= 2 && interiorPoint.every(Number.isFinite)) return interiorPoint.slice(0, 2);
          const point = featureGeometry?.getClosestPoint?.(referencePoint || [0, 0]);
          return Array.isArray(point) && point.length >= 2 && point.every(Number.isFinite) ? point.slice(0, 2) : null;
        } catch (_e) {
          return null;
        }
      })();
      return {
        icon: 'fa-house',
        title,
        detail: '',
        actionLabel: 'Ver refugio',
        focusExtent,
        focusCoordinate
      };
    });

    return items.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
  }

  function getSupportDisplayItems(report) {
    const registry = Array.isArray(report?.supportRegistry) ? report.supportRegistry : [];
    if (registry.length) return registry;
    return [{
      icon: 'fa-circle-info',
      title: 'Refugios temporales no disponibles',
      detail: `No fue posible cargar el catálogo de refugios temporales de ${MUNI} para consulta.`
    }];
  }

  function buildSupportIntroText(report) {
    const count = Array.isArray(report?.supportRegistry) ? report.supportRegistry.length : 0;
    if (count > 0) {
      return `En ${MUNI} se cuenta con ${count} refugios temporales. Pueden habilitarse en caso de emergencia, desastre o contingencia para brindar protección temporal a la población que no tenga acceso a una habitación segura.`;
    }
    return `En ${MUNI} se cuenta con refugios temporales. Pueden habilitarse en caso de emergencia, desastre o contingencia para brindar protección temporal a la población que no tenga acceso a una habitación segura.`;
  }

  function renderSupportIntro(report) {
    const host = document.getElementById('analisis-support-intro');
    if (!host) return;
    host.textContent = buildSupportIntroText(report);
  }

  function getFeaturesWithinRadius(features, point, radius) {
    let nearest = { distance: Infinity, feature: null };
    let count = 0;
    (features || []).forEach(feature => {
      try {
        const geometry = feature.getGeometry();
        if (!geometry) return;
        const closest = geometry.getClosestPoint(point);
        const dx = closest[0] - point[0];
        const dy = closest[1] - point[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          count += 1;
          if (dist < nearest.distance) {
            nearest = { distance: dist, feature };
          }
        }
      } catch (_e) {}
    });
    return { count, nearest, present: count > 0 };
  }

  function getFeaturesWithinGeometry(features, geometry, returnMatches) {
    const matches = [];
    const polygonGeom = geometry || null;
    (features || []).forEach(feature => {
      try {
        const featureGeometry = feature?.getGeometry?.();
        if (!featureGeometry || !polygonGeom) return;
        if (exactGeometryIntersectsSelection(featureGeometry, polygonGeom)) {
          matches.push(feature);
        }
      } catch (_e) {}
    });
    return {
      count: matches.length,
      nearest: { distance: 0, feature: matches.length ? matches[0] : null },
      present: matches.length > 0,
      features: returnMatches ? matches : undefined
    };
  }

  function exactGeometryIntersectsSelection(featureGeometry, selectionGeometry) {
    if (!featureGeometry || !selectionGeometry) return false;

    const featureType = featureGeometry.getType?.();
    if (featureType === 'Point') {
      return coordinateInsidePolygon(featureGeometry.getCoordinates(), selectionGeometry);
    }
    if (featureType === 'MultiPoint') {
      return flattenPointCoordinates(featureGeometry).some(coord => coordinateInsidePolygon(coord, selectionGeometry));
    }
    if (featureType === 'LineString' || featureType === 'MultiLineString') {
      return lineIntersectsPolygon(featureGeometry, selectionGeometry);
    }
    if (featureType === 'Polygon' || featureType === 'MultiPolygon') {
      return polygonIntersectsPolygon(featureGeometry, selectionGeometry);
    }

    try {
      const closest = featureGeometry.getClosestPoint(ol.extent.getCenter(selectionGeometry.getExtent()));
      return coordinateInsidePolygon(closest, selectionGeometry);
    } catch (_e) {
      return false;
    }
  }

  function coordinateInsidePolygon(coord, polygonGeometry) {
    if (!coord || !polygonGeometry || typeof polygonGeometry.intersectsCoordinate !== 'function') return false;
    try {
      return polygonGeometry.intersectsCoordinate(coord);
    } catch (_e) {
      return false;
    }
  }

  function flattenPointCoordinates(geometry) {
    const type = geometry?.getType?.();
    if (type === 'Point') return [geometry.getCoordinates()];
    if (type === 'MultiPoint') return geometry.getCoordinates() || [];
    return [];
  }

  function getLineCoordinateSets(geometry) {
    const type = geometry?.getType?.();
    if (type === 'LineString') return [geometry.getCoordinates() || []];
    if (type === 'MultiLineString') return geometry.getCoordinates() || [];
    return [];
  }

  function getPolygonRings(geometry) {
    const type = geometry?.getType?.();
    if (type === 'Polygon') return geometry.getCoordinates() || [];
    if (type === 'MultiPolygon') {
      return (geometry.getCoordinates() || []).flatMap(poly => poly || []);
    }
    return [];
  }

  function lineIntersectsPolygon(lineGeometry, polygonGeometry) {
    const lineSets = getLineCoordinateSets(lineGeometry);
    const polygonRings = getPolygonRings(polygonGeometry);
    if (!lineSets.length || !polygonRings.length) return false;

    for (const line of lineSets) {
      for (const coord of line) {
        if (coordinateInsidePolygon(coord, polygonGeometry)) return true;
      }
      for (let i = 0; i < line.length - 1; i += 1) {
        const a1 = line[i];
        const a2 = line[i + 1];
        for (const ring of polygonRings) {
          for (let j = 0; j < ring.length - 1; j += 1) {
            if (segmentsIntersect(a1, a2, ring[j], ring[j + 1])) return true;
          }
        }
      }
    }

    return false;
  }

  function polygonIntersectsPolygon(featurePolygonGeometry, selectionGeometry) {
    const featureRings = getPolygonRings(featurePolygonGeometry);
    const selectionRings = getPolygonRings(selectionGeometry);
    if (!featureRings.length || !selectionRings.length) return false;

    for (const ring of featureRings) {
      for (const coord of ring) {
        if (coordinateInsidePolygon(coord, selectionGeometry)) return true;
      }
    }

    for (const ring of selectionRings) {
      for (const coord of ring) {
        if (typeof featurePolygonGeometry.intersectsCoordinate === 'function' && featurePolygonGeometry.intersectsCoordinate(coord)) return true;
      }
    }

    for (const ringA of featureRings) {
      for (let i = 0; i < ringA.length - 1; i += 1) {
        for (const ringB of selectionRings) {
          for (let j = 0; j < ringB.length - 1; j += 1) {
            if (segmentsIntersect(ringA[i], ringA[i + 1], ringB[j], ringB[j + 1])) return true;
          }
        }
      }
    }

    return false;
  }

  function segmentsIntersect(a1, a2, b1, b2) {
    if (!a1 || !a2 || !b1 || !b2) return false;

    const orient = (p, q, r) => {
      const val = ((q[1] - p[1]) * (r[0] - q[0])) - ((q[0] - p[0]) * (r[1] - q[1]));
      if (Math.abs(val) < 1e-9) return 0;
      return val > 0 ? 1 : 2;
    };

    const onSegment = (p, q, r) => (
      q[0] <= Math.max(p[0], r[0]) + 1e-9 && q[0] + 1e-9 >= Math.min(p[0], r[0]) &&
      q[1] <= Math.max(p[1], r[1]) + 1e-9 && q[1] + 1e-9 >= Math.min(p[1], r[1])
    );

    const o1 = orient(a1, a2, b1);
    const o2 = orient(a1, a2, b2);
    const o3 = orient(b1, b2, a1);
    const o4 = orient(b1, b2, a2);

    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(a1, b1, a2)) return true;
    if (o2 === 0 && onSegment(a1, b2, a2)) return true;
    if (o3 === 0 && onSegment(b1, a1, b2)) return true;
    if (o4 === 0 && onSegment(b1, a2, b2)) return true;
    return false;
  }

  function buildSummary(context, risks, nearby, radius, mode, geometry, supportRegistry) {
    const riskNearby = nearby.filter(item => item.kind === 'risk');
    const supportNearby = nearby.filter(item => item.kind === 'support');
    const nearestRisk = riskNearby[0] || null;
    const riskCount = riskNearby.reduce((sum, item) => sum + ((item.countTowardsTotals === false) ? 0 : (Number(item.rawCount ?? item.count) || 0)), 0);
    const supportCount = supportNearby.reduce((sum, item) => sum + ((item.countTowardsTotals === false) ? 0 : (Number(item.rawCount ?? item.count) || 0)), 0);

    let level = 'Bajo';
    if (mode === 'polygon') {
      if (riskCount >= 3) level = 'Alto';
      else if (riskCount >= 1) level = 'Medio';
    } else if (nearestRisk && nearestRisk.distance <= 100) level = 'Alto';
    else if (nearestRisk && (nearestRisk.distance <= 250 || riskCount >= 2)) level = 'Medio';

    let text;
    if (mode === 'polygon') {
      const areaText = formatAreaM2(calculateGeometryArea(geometry));
      text = riskCount
        ? `Dentro del polígono dibujado (${areaText}) se localizaron ${riskCount} elemento(s) de riesgo.`
        : `Dentro del polígono dibujado (${areaText}) no se localizaron peligros del Atlas.`;
    } else {
      text = nearestRisk
        ? `Se localizaron ${riskCount} elemento(s) de riesgo dentro de ${radius} m. El más cercano está a ${formatDistance(nearestRisk.distance)}.`
        : `No se localizaron peligros del Atlas dentro de ${radius} m del punto consultado.`;
    }

    return {
      level,
      text,
      contextLabel: mode === 'polygon' ? 'Polígono dibujado' : 'Punto consultado',
      riskCount,
      supportCount,
      nearbyCount: riskCount,
      contextPopulationCount: Number(context?.poblacionTotal || 0),
      contextHousingCount: Number(context?.viviendasHabitadas || 0)
    };
  }

  function buildRecommendations(summary, risks, nearby, mode, supportRegistry, context) {
    const recs = [];
    const riskNearby = nearby.filter(item => item.kind === 'risk');

    if (context?.hasCoverage) {
      if (summary?.contextPopulationCount > 0 || summary?.contextHousingCount > 0) {
        recs.push(`Dentro del área analizada se estiman ${formatNumber(summary.contextPopulationCount)} personas y ${formatNumber(summary.contextHousingCount)} viviendas habitadas, con base en la información del Censo de Población y Vivienda 2020 del INEGI, a nivel manzana.`);
      } else if (context?.allDemographicMetricsZero) {
        recs.push('La manzana consultada sí pertenece a la cobertura urbana de esta fuente, pero no registra población o vivienda habitada; puede corresponder a uso comercial, equipamiento, industria u otro uso no habitacional.');
      }
    } else {
      recs.push('La información de población y vivienda no está disponible para esta ubicación en la fuente Manzanas INEGI 2020, porque esta fuente tiene cobertura en localidades urbanas.');
    }

    if (riskNearby.length) {
      if (mode !== 'polygon' && riskNearby[0] && riskNearby[0].distance <= 100) {
        recs.push('La proximidad a infraestructura de riesgo es alta; revisa con mayor atención el entorno inmediato del punto consultado.');
      }
      recs.push('Considera la cercanía de peligros del Atlas como factores de exposición dentro del entorno analizado.');
      recs.push('En caso de incidente, atiende indicaciones oficiales y evita acercarte a zonas operativas o acordonadas.');
    } else {
      recs.push(mode === 'polygon'
        ? 'No se detectaron peligros del Atlas dentro del polígono dibujado; puedes trazar un área mayor para revisar más entorno.'
        : 'No se detectaron peligros del Atlas dentro del radio elegido; puedes ampliar el radio para revisar un entorno mayor.');
    }

    return recs.slice(0, 5);
  }

  function riskDetailText(def) {
    switch (def.key) {
      case 'Riesgo_Inundaciones_Pluviales':
      case 'Riesgo_inundaciones_pluviales_urbanas':
      case 'Riesgo_Inundaciones_Fluviales':
        return 'El punto coincide con una capa de riesgo hídrico del Atlas.';
      case 'Encharcamientos':
        return 'Se detecta coincidencia con registro de encharcamientos.';
      case 'Riesgo_Fallas_fracturas':
      case 'Peligros_Fallas_Fracturas':
        return 'Existe coincidencia con cartografía de fallas o fracturas.';
      case 'Riesgo_Subsidencia':
        return 'El punto cae en una zona con susceptibilidad a subsidencia.';
      case 'Riesgo_Inestabilidad_Laderas':
        return 'El punto coincide con una zona de ladera o inestabilidad.';
      default:
        return 'El punto intersecta una capa prioritaria del Atlas.';
    }
  }

  function renderResults(report) {
    renderSummary(report.summary);
    renderKpis(report);
    const isPolygon = report.selectionMode === 'polygon';
    const context = report.context || {};
    const noCoverageText = 'No disponible para esta ubicación';
    const contextMetric = value => context.hasCoverage ? formatNumber(value) : noCoverageText;
    renderList('analisis-context-list', [
      { icon: 'fa-compass', title: 'Coordenadas de referencia', detail: `${context.lat.toFixed(5)}, ${context.lon.toFixed(5)}` },
      isPolygon
        ? { icon: 'fa-draw-polygon', title: 'Área dibujada', detail: formatAreaM2(report.selectionAreaM2) }
        : { icon: 'fa-circle-notch', title: 'Radio elegido', detail: `${report.radiusMeters} m` },
      { icon: 'fa-map-location-dot', title: isPolygon ? 'Colonias dentro del polígono' : 'Colonias dentro del buffer', detail: context.coloniasTexto || 'Sin dato' },
      { icon: 'fa-draw-polygon', title: isPolygon ? 'Manzanas dentro del polígono' : 'Manzanas dentro del buffer', detail: context.hasCoverage ? formatNumber(context.manzanasIncluidas || 0) : 'Sin cobertura de esta fuente' },
      { icon: 'fa-users', title: 'Población total', detail: contextMetric(context.poblacionTotal) },
      { icon: 'fa-person-dress', title: 'Población femenina', detail: contextMetric(context.poblacionFemenina) },
      { icon: 'fa-person', title: 'Población masculina', detail: contextMetric(context.poblacionMasculina) },
      { icon: 'fa-user-clock', title: 'Población mayor a 60 años', detail: contextMetric(context.poblacionMayor60) },
      { icon: 'fa-wheelchair', title: 'Población con discapacidad', detail: contextMetric(context.poblacionDiscapacidad) },
      { icon: 'fa-house-user', title: 'Total de viviendas habitadas', detail: contextMetric(context.viviendasHabitadas) },
      { icon: 'fa-database', title: 'Fuente de la información', detail: context.sourceDetail || 'Manzanas INEGI 2020 Censo de Población y Vivienda.' }
    ], true);

    const riskNearby = report.nearby.filter(item => item.kind === 'risk');
    const supportNearby = report.nearby.filter(item => item.kind === 'support');

    renderList('analisis-risk-nearby-list', riskNearby.length ? riskNearby.map(item => ({
      icon: item.icon,
      title: item.showCount === false ? item.title : `${item.title}: ${item.count || 0}`,
      detail: item.showCount === false
        ? (item.detail || (isPolygon ? 'Se localiza dentro del polígono dibujado.' : `Se localiza dentro del radio. El punto más cercano está a ${formatDistance(item.distance)} del punto.`))
        : (isPolygon ? `${item.count || 0} dentro del polígono dibujado.` : `${item.count || 0} dentro del radio. La más cercana está a ${formatDistance(item.distance)} del punto.`)
    })) : [{ icon: 'fa-circle-info', title: isPolygon ? 'Sin infraestructura de riesgo dentro del polígono' : 'Sin infraestructura de riesgo dentro del radio', detail: isPolygon ? 'No se localizaron peligros del Atlas dentro del polígono dibujado.' : `No se localizaron peligros del Atlas dentro de ${report.radiusMeters} m.` }], true);

    renderSupportIntro(report);
    renderList('analisis-support-nearby-list', getSupportDisplayItems(report), true);

    renderList('analisis-recommendations-list', report.recommendations.map(text => ({ icon: 'fa-check', title: text, detail: '' })), false);
  }

  function renderSummary(summary) {
    const card = document.getElementById('analisis-summary-card');
    const level = document.getElementById('analisis-summary-level');
    const text = document.getElementById('analisis-summary-text');
    if (!card || !level || !text) return;

    card.dataset.level = summary.level.toLowerCase();
    level.textContent = summary.level;
    text.textContent = summary.text;
  }

  function renderKpis(report) {
    const host = document.getElementById('analisis-kpi-grid');
    if (!host) return;
    const items = [
      { label: 'Riesgos cercanos', value: report.summary.riskCount },
      { label: report.selectionMode === 'polygon' ? 'Área analizada' : 'Radio analizado', value: report.selectionMode === 'polygon' ? formatAreaCompact(report.selectionAreaM2) : `${report.radiusMeters} m` },
      { label: 'Nivel', value: report.summary.level }
    ];
    host.innerHTML = items.map(item => `
      <div class="analisis-kpi-card">
        <div class="analisis-kpi-value">${escapeHtml(item.value)}</div>
        <div class="analisis-kpi-label">${escapeHtml(item.label)}</div>
      </div>
    `).join('');
  }


  function buildContextPdfItems(report) {
    const context = report?.context || {};
    const isPolygon = report?.selectionMode === 'polygon';
    const noCoverageText = 'No disponible para esta ubicación';
    const contextMetric = value => context.hasCoverage ? formatNumber(value) : noCoverageText;

    return [
      `Coordenadas: ${context.lat.toFixed(5)}, ${context.lon.toFixed(5)}`,
      isPolygon ? `Área dibujada: ${formatAreaM2(report.selectionAreaM2)}` : `Radio elegido: ${report.radiusMeters} m`,
      `${isPolygon ? 'Colonias dentro del polígono' : 'Colonias dentro del buffer'}: ${context.coloniasTexto || 'Sin dato'}`,
      `${isPolygon ? 'Manzanas dentro del polígono' : 'Manzanas dentro del buffer'}: ${context.hasCoverage ? formatNumber(context.manzanasIncluidas || 0) : 'Sin cobertura de esta fuente'}`,
      `Población total: ${contextMetric(context.poblacionTotal)}`,
      `Población femenina: ${contextMetric(context.poblacionFemenina)}`,
      `Población masculina: ${contextMetric(context.poblacionMasculina)}`,
      `Población mayor a 60 años: ${contextMetric(context.poblacionMayor60)}`,
      `Población con discapacidad: ${contextMetric(context.poblacionDiscapacidad)}`,
      `Total de viviendas habitadas: ${contextMetric(context.viviendasHabitadas)}`
    ];
  }

  function renderList(containerId, items, allowDetails) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const isSupportList = containerId === 'analisis-support-nearby-list';
    host.innerHTML = items.map((item, index) => `
      <div class="analisis-list-item${isSupportList ? ' analisis-support-item' : ''}">
        <div class="analisis-list-icon"><i class="fas ${item.icon || 'fa-circle-info'}"></i></div>
        <div class="analisis-list-content${isSupportList ? ' analisis-support-content' : ''}">
          <div class="analisis-list-title${isSupportList ? ' analisis-support-title' : ''}">${escapeHtml(item.title || 'Sin dato')}</div>
          ${allowDetails && item.detail ? `<div class="analisis-list-detail">${escapeHtml(item.detail)}</div>` : ''}
          ${item.actionLabel ? `<div class="analisis-list-actions${isSupportList ? ' analisis-support-actions' : ''}"><button type="button" class="analisis-link-btn" data-support-index="${index}" aria-label="${escapeHtml(item.actionLabel)}">${escapeHtml(item.actionLabel)}</button></div>` : ''}
        </div>
      </div>
    `).join('');
  }

  function focusSupportByIndex(index) {
    bindSupportLayerVisibility();
    const supportItems = Array.isArray(currentReport?.supportRegistry) ? currentReport.supportRegistry : [];
    const item = supportItems[index];
    if (!item || !map?.getView) return;

    const supportLayer = getSupportLayer();
    if (supportLayer && !supportLayer.getVisible?.()) {
      setSupportLayerVisible(true, { trackAuto: true });
    }

    const view = map.getView();
    if (Array.isArray(item.focusExtent) && item.focusExtent.length === 4 && item.focusExtent.every(Number.isFinite)) {
      view.fit(item.focusExtent, { duration: 700, padding: [110, 110, 110, 110], maxZoom: 18 });
      return;
    }

    if (Array.isArray(item.focusCoordinate) && item.focusCoordinate.length >= 2 && item.focusCoordinate.every(Number.isFinite)) {
      view.animate({ center: item.focusCoordinate, duration: 700, zoom: Math.max(view.getZoom?.() || 16, 16) });
    }
  }

  function centerResult() {
    if (!analysisLayer) return;
    const extent = analysisLayer.getSource().getExtent();
    if (!extent || !isFinite(extent[0])) return;
    map.getView().fit(extent, { duration: 650, padding: [90, 90, 90, 90], maxZoom: 17 });
  }

  function getAtlasLayerCandidates() {
    if (!map?.getLayers) return [];
    const root = map.getLayers().getArray ? map.getLayers().getArray() : [];
    const out = [];
    const pushLayer = (layer) => {
      if (!layer) return;
      const nested = layer.getLayers?.();
      if (nested?.getArray) {
        nested.getArray().forEach(pushLayer);
        return;
      }
      out.push(layer);
    };
    root.forEach(pushLayer);
    return out;
  }

  function getSupportLayer() {
    const candidates = getAtlasLayerCandidates();
    return candidates.find(layer => {
      const props = [
        layer?.get?.('layerKey'),
        layer?.get?.('name'),
        layer?.get?.('title'),
        layer?.getSource?.()?.getParams?.()?.LAYERS
      ].map(value => String(value || '').trim().toLowerCase());
      return props.some(value => value === 'refugios_temporales_celaya' || value.endsWith(':refugios_temporales_celaya'));
    }) || null;
  }

  function setSupportLayerVisible(visible, options = {}) {
    bindSupportLayerVisibility();
    const layer = getSupportLayer();
    if (!layer?.setVisible) return false;
    const shouldTrackAuto = options.trackAuto === true;
    const currentVisible = !!layer.getVisible?.();
    if (currentVisible === visible) {
      if (visible && shouldTrackAuto) supportLayerAutoEnabled = true;
      if (!visible) supportLayerAutoEnabled = false;
      return currentVisible;
    }

    const treeItem = document.querySelector('.layer-item[data-layer="refugios_temporales_celaya"]');
    const canUseGlobalToggle = typeof window.toggleLayer === 'function' && !!treeItem;

    supportLayerProgrammaticChange = true;
    try {
      if (canUseGlobalToggle) {
        window.toggleLayer('refugios_temporales_celaya', treeItem);
      } else {
        layer.setVisible(visible);
      }
    } finally {
      supportLayerProgrammaticChange = false;
    }

    if (visible && shouldTrackAuto) {
      supportLayerAutoEnabled = true;
    } else if (!visible) {
      supportLayerAutoEnabled = false;
    }

    syncSupportLayerTreeState();
    return !!layer.getVisible?.();
  }

  function syncSupportLayerTreeState() {
    const layer = getSupportLayer();
    const item = document.querySelector('.layer-item[data-layer="refugios_temporales_celaya"]');
    if (!item) return;
    item.classList.toggle('active', !!layer?.getVisible?.());
    if (typeof refreshLayerTreeActiveState === 'function') {
      refreshLayerTreeActiveState();
    }
    if (typeof updateLegend === 'function') {
      updateLegend();
    }
  }

  function bindSupportLayerVisibility() {
    if (supportLayerBound) return;
    const layer = getSupportLayer();
    if (!layer?.on) return;
    supportLayerBound = true;
    layer.on('change:visible', () => {
      if (!supportLayerProgrammaticChange && !layer.getVisible?.()) {
        supportLayerAutoEnabled = false;
      }
      syncSupportLayerTreeState();
    });
  }


  async function downloadReport() {
    if (!currentReport) {
      showError('Primero genera una ficha de consulta.');
      return;
    }

    const report = currentReport;
    const isPolygon = report.selectionMode === 'polygon';
    const riskItems = report.nearby.filter(item => item.kind === 'risk');
    const supportItems = report.nearby.filter(item => item.kind === 'support');
    const logoSrc = window.MUNICIPIO_CONFIG?.logo || 'assets/images/branding/apaseo-pc.png';

    try {
      const pdfBlob = await buildReportPdfBlob({ report, riskItems, supportItems, isPolygon, logoSrc });
      const filename = buildReportFilename(report);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.error('Consulta ciudadana de riesgo · descarga PDF', err);
      showError('No fue posible generar la ficha PDF para descarga directa.');
    }
  }

  async function buildReportPdfBlob({ report, riskItems, supportItems, isPolygon, logoSrc }) {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('No se pudo crear el contexto del PDF.');

    const page = {
      width: canvas.width,
      height: canvas.height,
      margin: 72,
      contentWidth: canvas.width - 144
    };

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, page.width, page.height);
    ctx.fillStyle = '#1e73be';
    ctx.fillRect(0, 0, page.width, 82);

    let y = 108;
    const logo = await loadImageSafe(logoSrc);
    if (logo) {
      drawContainedImage(ctx, logo, page.margin, y - 8, 92, 92);
    } else {
      ctx.fillStyle = '#dfeaf4';
      roundRect(ctx, page.margin, y - 8, 92, 92, 20, true, false);
      ctx.fillStyle = '#1e73be';
      ctx.font = '700 24px Arial, Helvetica, sans-serif';
      ctx.fillText('PCB', page.margin + 20, y + 48);
    }

    ctx.fillStyle = '#1e73be';
    ctx.font = '700 34px Arial, Helvetica, sans-serif';
    ctx.fillText('Análisis de riesgo por ubicación', page.margin + 116, y + 16);

    ctx.fillStyle = '#4d4d56';
    ctx.font = '400 18px Arial, Helvetica, sans-serif';
    ctx.fillText(`${window.MUNICIPIO_CONFIG?.dependencia || 'Protección Civil y Bomberos'} · Atlas Municipal de Peligros y Riesgos de ${MUNI}`, page.margin + 116, y + 48);
    ctx.fillText(`Generado: ${report.generatedAt.toLocaleString('es-MX')}`, page.margin + 116, y + 74);
    y += 114;

    ctx.fillStyle = '#e8eff6';
    roundRect(ctx, page.margin, y, 320, 42, 21, true, false);
    ctx.fillStyle = '#1e73be';
    ctx.font = '700 22px Arial, Helvetica, sans-serif';
    ctx.fillText(`Nivel de atención: ${report.summary.level}`, page.margin + 18, y + 28);
    y += 62;

    y = drawCard(ctx, {
      x: page.margin,
      y,
      width: page.contentWidth,
      padding: 18,
      title: 'Resumen',
      bodyLines: wrapTextLines(ctx, report.summary.text, page.contentWidth - 36, '400 20px Arial, Helvetica, sans-serif')
    });
    y += 20;

    const colGap = 18;
    const colWidth = (page.contentWidth - colGap) / 2;
    const kpis = [
      { value: String(report.summary.riskCount), label: 'Riesgos cercanos' },
      { value: isPolygon ? formatAreaCompact(report.selectionAreaM2) : `${report.radiusMeters} m`, label: isPolygon ? 'Área analizada' : 'Radio analizado' },
      { value: String(report.summary.level), label: 'Nivel' }
    ];

    const kpiHeight = 92;
    for (let i = 0; i < kpis.length; i += 1) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = page.margin + (col * (colWidth + colGap));
      const yy = y + (row * (kpiHeight + 14));
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#dbe8f4';
      ctx.lineWidth = 2;
      roundRect(ctx, x, yy, colWidth, kpiHeight, 18, true, true);
      ctx.fillStyle = '#1e73be';
      ctx.font = '700 30px Arial, Helvetica, sans-serif';
      fitText(ctx, kpis[i].value, x + 18, yy + 40, colWidth - 36, 30, 20);
      ctx.fillStyle = '#5a5a62';
      ctx.font = '400 18px Arial, Helvetica, sans-serif';
      const labelLines = wrapTextLines(ctx, kpis[i].label, colWidth - 36, '400 18px Arial, Helvetica, sans-serif');
      labelLines.slice(0, 2).forEach((line, idx) => ctx.fillText(line, x + 18, yy + 68 + (idx * 22)));
    }
    y += (kpiHeight * 2) + 42;

    const ubicacionItems = buildContextPdfItems(report);
    y = drawSectionList(ctx, 'Ubicación consultada', ubicacionItems, page.margin, y, page.contentWidth);

    ctx.fillStyle = '#5a5a62';
    ctx.font = 'italic 16px Arial, Helvetica, sans-serif';
    y = drawWrappedText(ctx, `Fuente de la información: ${report.context?.sourceDetail || 'Manzanas INEGI 2020 Censo de Población y Vivienda.'}`, page.margin + 14, y + 10, page.contentWidth - 28, 22, 'italic 16px Arial, Helvetica, sans-serif', '#5a5a62') + 16;

    const riskTextItems = (riskItems.length ? riskItems : [{
      title: isPolygon ? 'Sin infraestructura de riesgo dentro del polígono' : 'Sin infraestructura de riesgo dentro del radio',
      detail: isPolygon
        ? 'No se localizaron peligros del Atlas dentro del polígono dibujado.'
        : `No se localizaron peligros del Atlas dentro de ${report.radiusMeters} m.`
    }]).map(item => {
      const countTxt = item.showCount === false ? '' : `: ${Number(item.count) || 0}`;
      const distTxt = isPolygon ? '' : (item.distance != null ? ` — más cercana a ${formatDistance(item.distance)}` : '');
      const detailTxt = item.detail ? ` · ${item.detail}` : '';
      return `${item.title}${countTxt}${distTxt}${detailTxt}`;
    });
    y = drawSectionList(ctx, 'Infraestructura de riesgo cercana', riskTextItems, page.margin, y, page.contentWidth);

    const supportTextItems = [buildSupportIntroText(report)].concat(getSupportDisplayItems(report).map(item => {
      const detailTxt = item.detail ? ` · ${item.detail}` : '';
      return `${item.title}${detailTxt}`;
    }));
    y = drawSectionList(ctx, `Refugios temporales de ${MUNI}`, supportTextItems, page.margin, y, page.contentWidth);

    y = drawSectionList(ctx, 'Recomendaciones', report.recommendations, page.margin, y, page.contentWidth);

    if (y > page.height - 100) y = page.height - 100;
    ctx.strokeStyle = '#dbe8f4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(page.margin, page.height - 66);
    ctx.lineTo(page.width - page.margin, page.height - 66);
    ctx.stroke();
    ctx.fillStyle = '#666666';
    ctx.font = '400 15px Arial, Helvetica, sans-serif';
    ctx.fillText('Ficha PDF generada para descarga directa desde el visor.', page.margin, page.height - 34);

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return createPdfBlobFromJpegDataUrl(jpegDataUrl, canvas.width, canvas.height);
  }

  function buildReportFilename(report) {
    const d = report?.generatedAt instanceof Date ? report.generatedAt : new Date();
    const pad = num => String(num).padStart(2, '0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    return `Ficha_Analisis_Riesgo_Ubicacion_${stamp}.pdf`;
  }

  async function loadImageSafe(src) {
    return await new Promise(resolve => {
      try {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `${src}${src.includes('?') ? '&' : '?'}v=${Date.now()}`;
      } catch (_err) {
        resolve(null);
      }
    });
  }

  function drawContainedImage(ctx, image, x, y, width, height) {
    const iw = Number(image?.naturalWidth || image?.width || width) || width;
    const ih = Number(image?.naturalHeight || image?.height || height) || height;
    const scale = Math.min(width / iw, height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = x + ((width - dw) / 2);
    const dy = y + ((height - dh) / 2);
    ctx.drawImage(image, dx, dy, dw, dh);
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function wrapTextLines(ctx, text, maxWidth, font) {
    if (font) ctx.font = font;
    const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
    if (!clean) return [''];
    const words = clean.split(' ');
    const lines = [];
    let current = words.shift() || '';
    words.forEach(word => {
      const test = `${current} ${word}`;
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        lines.push(current);
        current = word;
      }
    });
    lines.push(current);
    return lines;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, font, color) {
    if (font) ctx.font = font;
    if (color) ctx.fillStyle = color;
    const lines = wrapTextLines(ctx, text, maxWidth, font);
    lines.forEach((line, idx) => ctx.fillText(line, x, y + (idx * lineHeight)));
    return y + (lines.length * lineHeight);
  }

  function fitText(ctx, text, x, y, maxWidth, startSize, minSize) {
    const value = String(text ?? '');
    let size = startSize;
    while (size > minSize) {
      ctx.font = `700 ${size}px Arial, Helvetica, sans-serif`;
      if (ctx.measureText(value).width <= maxWidth) break;
      size -= 1;
    }
    ctx.fillText(value, x, y);
  }

  function drawCard(ctx, { x, y, width, padding, title, bodyLines }) {
    const titleHeight = 28;
    const lineHeight = 28;
    const bodyHeight = Math.max(lineHeight, bodyLines.length * lineHeight);
    const height = padding + titleHeight + bodyHeight + padding;
    ctx.fillStyle = '#f7fbff';
    ctx.strokeStyle = '#dbe8f4';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, width, height, 18, true, true);
    ctx.fillStyle = '#1e73be';
    ctx.font = '700 22px Arial, Helvetica, sans-serif';
    ctx.fillText(title, x + padding, y + padding + 18);
    ctx.fillStyle = '#333333';
    ctx.font = '400 20px Arial, Helvetica, sans-serif';
    bodyLines.forEach((line, idx) => ctx.fillText(line, x + padding, y + padding + titleHeight + 10 + (idx * lineHeight)));
    return y + height;
  }

  function drawSectionList(ctx, title, items, x, y, width) {
    ctx.fillStyle = '#1e73be';
    ctx.font = '700 24px Arial, Helvetica, sans-serif';
    ctx.fillText(title, x, y + 22);
    y += 42;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#dbe8f4';
    ctx.lineWidth = 2;
    const listY = y;
    let innerY = y + 22;
    const bulletX = x + 18;
    const textX = x + 42;
    const maxWidth = width - 60;
    items.forEach(item => {
      const lines = wrapTextLines(ctx, item, maxWidth, '400 18px Arial, Helvetica, sans-serif');
      ctx.fillStyle = '#1e73be';
      ctx.beginPath();
      ctx.arc(bulletX, innerY - 7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.font = '400 18px Arial, Helvetica, sans-serif';
      lines.forEach((line, idx) => ctx.fillText(line, textX, innerY + (idx * 24)));
      innerY += Math.max(30, lines.length * 24) + 8;
    });
    const height = Math.max(62, innerY - listY);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.strokeStyle = '#dbe8f4';
    roundRect(ctx, x, listY, width, height, 18, true, true);

    innerY = listY + 22;
    items.forEach(item => {
      const lines = wrapTextLines(ctx, item, maxWidth, '400 18px Arial, Helvetica, sans-serif');
      ctx.fillStyle = '#1e73be';
      ctx.beginPath();
      ctx.arc(bulletX, innerY - 7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.font = '400 18px Arial, Helvetica, sans-serif';
      lines.forEach((line, idx) => ctx.fillText(line, textX, innerY + (idx * 24)));
      innerY += Math.max(30, lines.length * 24) + 8;
    });
    return listY + height + 20;
  }

  function dataUrlToBytes(dataUrl) {
    const parts = String(dataUrl || '').split(',');
    const base64 = parts.length > 1 ? parts[1] : '';
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function createPdfBlobFromJpegDataUrl(dataUrl, imgWidthPx, imgHeightPx) {
    const jpegBytes = dataUrlToBytes(dataUrl);
    const pageWidthPt = 595.28;
    const pageHeightPt = 841.89;
    const encoder = new TextEncoder();
    const text = value => encoder.encode(String(value));
    const parts = [];
    const offsets = [0];
    let size = 0;

    const pushPart = part => {
      parts.push(part);
      size += part.length;
    };

    pushPart(text('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));

    const contentStream = `q\n${pageWidthPt.toFixed(2)} 0 0 ${pageHeightPt.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`;
    const contentBytes = text(contentStream);

    const objects = {
      1: [text('<< /Type /Catalog /Pages 2 0 R >>')],
      2: [text('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')],
      3: [text(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt.toFixed(2)} ${pageHeightPt.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`)],
      4: [text(`<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`), jpegBytes, text('\nendstream')],
      5: [text(`<< /Length ${contentBytes.length} >>\nstream\n`), contentBytes, text('endstream')]
    };

    for (let i = 1; i <= 5; i += 1) {
      offsets[i] = size;
      pushPart(text(`${i} 0 obj\n`));
      objects[i].forEach(pushPart);
      pushPart(text('\nendobj\n'));
    }

    const xrefOffset = size;
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i += 1) {
      xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pushPart(text(xref));
    pushPart(text(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));

    return new Blob(parts, { type: 'application/pdf' });
  }


  function showState(state) {
    const loading = document.getElementById('analisis-loading');
    const error = document.getElementById('analisis-error');
    const results = document.getElementById('analisis-results');
    loading?.classList.toggle('analisis-hidden', state !== 'loading');
    error?.classList.toggle('analisis-hidden', state !== 'error');
    results?.classList.toggle('analisis-hidden', state !== 'results');
  }

  function showError(message) {
    const msg = document.getElementById('analisis-error-msg');
    if (msg) msg.textContent = message;
    showState('error');
  }

  function resetStateView(keepErrorHidden) {
    if (keepErrorHidden) {
      document.getElementById('analisis-error')?.classList.add('analisis-hidden');
    }
    document.getElementById('analisis-results')?.classList.add('analisis-hidden');
    document.getElementById('analisis-loading')?.classList.add('analisis-hidden');
  }

  function clearAnalysis() {
    currentReport = null;
    selectedPoint = null;
    selectedGeometry = null;
    selectionMode = 'point';
    cancelInteractions();
    analysisLayer?.getSource().clear();
    stopBufferAnimation();
    if (supportLayerAutoEnabled) {
      setSupportLayerVisible(false);
    }
    resetStateView(true);
    setSelectionStatus('Sin punto seleccionado.');
  }

  function firstValue(props, candidates) {
    if (!props) return '';
    const keys = Object.keys(props);
    const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const candidate of candidates) {
      const exact = keys.find(k => k.toLowerCase() === String(candidate).toLowerCase());
      if (exact && props[exact] != null && props[exact] !== '') return String(props[exact]);
    }
    for (const candidate of candidates) {
      const candidateNorm = normalize(candidate);
      const normalized = keys.find(k => normalize(k) === candidateNorm);
      if (normalized && props[normalized] != null && props[normalized] !== '') return String(props[normalized]);
    }
    for (const candidate of candidates) {
      const partial = keys.find(k => k.toLowerCase().includes(String(candidate).toLowerCase()));
      if (partial && props[partial] != null && props[partial] !== '') return String(props[partial]);
    }
    for (const candidate of candidates) {
      const candidateNorm = normalize(candidate);
      const partialNorm = keys.find(k => normalize(k).includes(candidateNorm) || candidateNorm.includes(normalize(k)));
      if (partialNorm && props[partialNorm] != null && props[partialNorm] !== '') return String(props[partialNorm]);
    }
    return '';
  }

  function numberValue(props, candidates) {
    const raw = firstValue(props, candidates);
    const num = Number(String(raw).replace(/[\s,]/g, ''));
    return Number.isFinite(num) ? num : 0;
  }

  function exactOrNumberValue(props, exactKey, candidates) {
    if (props && Object.prototype.hasOwnProperty.call(props, exactKey)) {
      const raw = props[exactKey];
      const num = Number(String(raw ?? '').replace(/[\s,]/g, ''));
      if (Number.isFinite(num)) return num;
    }
    return numberValue(props, candidates);
  }

  function formatNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('es-MX') : 'Sin dato';
  }

  function formatDistance(value) {
    if (!Number.isFinite(value)) return 'Sin dato';
    if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
    return `${Math.round(value)} m`;
  }

  function formatAreaM2(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 'Sin dato';
    if (n >= 10000) return `${(n / 10000).toLocaleString('es-MX', { maximumFractionDigits: 2 })} ha`;
    return `${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })} m²`;
  }

  function formatAreaCompact(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return '—';
    if (n >= 10000) return `${(n / 10000).toLocaleString('es-MX', { maximumFractionDigits: 1 })} ha`;
    return `${n.toLocaleString('es-MX', { maximumFractionDigits: 0 })} m²`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.AtlasAnalisisDemografico = {
    reset: clearAnalysis
  };

  waitForMap();
})();
