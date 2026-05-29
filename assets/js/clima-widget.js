(function () {
  const DEFAULT_COORDS = { lat: 20.5235, lon: -100.8157, label: 'Centro de Celaya' };

  /* Descripciones completas para el ciudadano */
  const WX = {
    0:'Cielo despejado', 1:'Mayormente despejado', 2:'Parcialmente nublado', 3:'Cielo nublado',
    45:'Niebla', 48:'Niebla engelante',
    51:'Llovizna ligera', 53:'Llovizna moderada', 55:'Llovizna intensa',
    61:'Lluvia ligera', 63:'Lluvia moderada', 65:'Lluvia intensa',
    71:'Nieve ligera', 73:'Nieve moderada', 75:'Nieve intensa',
    80:'Chubascos ligeros', 81:'Chubascos moderados', 82:'Chubascos fuertes',
    95:'Tormenta eléctrica', 96:'Tormenta con granizo', 99:'Tormenta fuerte con granizo'
  };
  /* Versión corta para las filas de horas/días */
  const WX_SHORT = {
    0:'Despejado', 1:'May. despejado', 2:'Parc. nublado', 3:'Nublado',
    45:'Niebla', 48:'Niebla engelante',
    51:'Llovizna', 53:'Llovizna', 55:'Llovizna intensa',
    61:'Lluvia ligera', 63:'Lluvia', 65:'Lluvia intensa',
    71:'Nieve ligera', 73:'Nieve', 75:'Nieve intensa',
    80:'Chubascos', 81:'Chubascos', 82:'Chubascos fuertes',
    95:'Tormenta', 96:'Tormenta c/granizo', 99:'Tormenta fuerte'
  };

  const DAYS   = ['dom','lun','mar','mié','jue','vie','sáb'];
  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  /* Icono FA por código WMO */
  function wxIcon(code) {
    if (code <= 1)  return 'fa-sun';
    if (code === 2) return 'fa-cloud-sun';
    if (code === 3) return 'fa-cloud';
    if (code <= 48) return 'fa-smog';
    if (code <= 57) return 'fa-cloud-drizzle';
    if (code <= 67) return 'fa-cloud-rain';
    if (code <= 77) return 'fa-snowflake';
    if (code <= 82) return 'fa-cloud-showers-heavy';
    return 'fa-bolt';
  }
  /* Clase de color según % de lluvia */
  function rainClass(pct) {
    if (pct >= 50) return 'rain-hi';
    if (pct >= 25) return 'rain-mid';
    return 'rain-lo';
  }

  let map = null, olRef = null;
  let picking = false;
  let coords = { ...DEFAULT_COORDS };

  /* ── Hook para app.js ── */
  window.AtlasClimaWidget = {
    handleMapClick: function (e) {
      if (!picking) return false;
      if (!olRef) return false;
      const ll = olRef.proj.toLonLat(e.coordinate);
      stopPicker();
      fetchAndRender({ lat: ll[1], lon: ll[0], label: 'Punto seleccionado' });
      return true;
    },
    /* Llamar tras buildLayerTree() para re-inyectar el widget si fue borrado */
    remount: function () {
      const existing = document.getElementById('clima-sidebar-section');
      if (existing && document.getElementById('layer-tree')?.contains(existing)) return;
      if (existing) existing.remove();
      mount();
    }
  };

  function waitForMap() {
    if (window.__atlasMap && window.__atlasOl) {
      map = window.__atlasMap; olRef = window.__atlasOl; mount();
    } else { setTimeout(waitForMap, 120); }
  }

  /* ── Montar al final del layer-tree ── */
  function mount() {
    if (document.getElementById('clima-sidebar-section')) return;
    const tree = document.getElementById('layer-tree');
    if (!tree) return;

    const section = document.createElement('div');
    section.id = 'clima-sidebar-section';
    section.innerHTML = `
      <div id="clima-sidebar-header" class="collapsed">
        <i class="fas fa-chevron-down csb-chevron"></i>
        <i class="fas fa-cloud-sun csb-icon"></i>
        <span class="csb-title">Clima</span>
        <span id="csb-temp-badge">--°</span>
        <button type="button" id="csb-refresh" title="Actualizar" aria-label="Actualizar">
          <i class="fas fa-rotate-right"></i>
        </button>
      </div>
      <div id="clima-sidebar-panel" class="collapsed">
        <div class="csb-body" id="csb-body">
          <div class="csb-empty">Toca ↺ para cargar el clima de Celaya.</div>
        </div>
      </div>`;

    tree.appendChild(section);

    /* Banner picker */
    const mapEl = document.getElementById('map');
    if (mapEl && !document.getElementById('clima-widget-picker')) {
      const p = document.createElement('div');
      p.className = 'clima-widget__picker'; p.id = 'clima-widget-picker'; p.hidden = true;
      p.innerHTML = '<i class="fas fa-hand-pointer" style="margin-right:7px;"></i>Haz clic en el mapa para consultar el clima ahí &nbsp;<span id="csb-picker-cancel" style="cursor:pointer;opacity:0.8;font-size:0.8em;">✕ cancelar</span>';
      mapEl.appendChild(p);
      document.getElementById('csb-picker-cancel')?.addEventListener('click', stopPicker);
    }

    bindEvents();
  }

  function bindEvents() {
    document.getElementById('clima-sidebar-header').addEventListener('click', function (e) {
      if (e.target.closest('#csb-refresh')) return;
      const panel  = document.getElementById('clima-sidebar-panel');
      const header = document.getElementById('clima-sidebar-header');
      const wasCollapsed = panel.classList.contains('collapsed');
      panel.classList.toggle('collapsed');
      header.classList.toggle('collapsed', !wasCollapsed);
      if (wasCollapsed && document.getElementById('csb-body').querySelector('.csb-empty')) {
        fetchAndRender(coords);
      }
    });
    document.getElementById('csb-refresh').addEventListener('click', function (e) {
      e.stopPropagation();
      document.getElementById('clima-sidebar-panel').classList.remove('collapsed');
      document.getElementById('clima-sidebar-header').classList.remove('collapsed');
      fetchAndRender(coords);
    });
  }

  function startPicker() {
    picking = true;
    const p = document.getElementById('clima-widget-picker');
    if (p) p.hidden = false;
    const vp = map?.getViewport?.();
    if (vp) vp.style.cursor = 'crosshair';
  }
  function stopPicker() {
    picking = false;
    const p = document.getElementById('clima-widget-picker');
    if (p) p.hidden = true;
    const vp = map?.getViewport?.();
    if (vp) vp.style.cursor = 'help';
  }
  function centerWeather() {
    if (!map || !olRef) return;
    const c = map.getView().getCenter();
    if (!c) return;
    const ll = olRef.proj.toLonLat(c);
    fetchAndRender({ lat: ll[1], lon: ll[0], label: 'Centro del mapa' });
  }

  /* ── Fetch ── */
  async function fetchAndRender(newCoords) {
    coords = newCoords;
    setBody(actionsHtml() + '<div class="csb-empty"><i class="fas fa-circle-notch fa-spin"></i> Consultando…</div>');
    bindBtns();
    try {
      const [wx, air] = await Promise.all([fetchWx(coords), fetchAir(coords)]);
      render(coords, wx, air);
    } catch (err) {
      setBody(actionsHtml() + '<div class="csb-error"><i class="fas fa-triangle-exclamation"></i> No se pudo consultar el clima.</div>');
      bindBtns(); console.error('[Clima]', err);
    }
  }

  async function fetchWx({ lat, lon }) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(lat), longitude: String(lon),
      current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,relative_humidity_2m,is_day',
      hourly: 'temperature_2m,apparent_temperature,precipitation_probability,weather_code',
      daily:  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,precipitation_sum',
      forecast_days: '5', timezone: 'auto'
    }).toString();
    const r = await fetch(url); if (!r.ok) throw new Error('wx'); return r.json();
  }
  async function fetchAir({ lat, lon }) {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    url.search = new URLSearchParams({ latitude: String(lat), longitude: String(lon), current: 'european_aqi', timezone: 'auto' }).toString();
    const r = await fetch(url); if (!r.ok) throw new Error('air'); return r.json();
  }

  /* ── Render ── */
  function render(c, wx, air) {
    const cur      = wx.current || {};
    const aqi      = rnd(air.current?.european_aqi);
    const temp     = Math.round(cur.temperature_2m ?? 0);
    const feel     = Math.round(cur.apparent_temperature ?? 0);
    const wind     = Math.round(cur.wind_speed_10m ?? 0);
    const windDir  = windCompass(cur.wind_direction_10m);
    const hum      = Math.round(cur.relative_humidity_2m ?? 0);
    const uv       = cur.uv_index ?? 0;
    const uvMax    = wx.daily?.uv_index_max?.[0] ?? null;
    const precipSum = wx.daily?.precipitation_sum?.[0] ?? null;
    const todayMax  = wx.daily?.temperature_2m_max?.[0] ?? null;
    const todayMin  = wx.daily?.temperature_2m_min?.[0] ?? null;
    const cond     = WX[cur.weather_code] || 'Condición';
    const msg      = citizenMsg(cur, aqi, uvMax, cur.is_day === 1);
    const hours    = buildHours(wx);
    const days     = buildDays(wx);
    const solarBar = solarBarHtml(wx.daily?.sunrise?.[0], wx.daily?.sunset?.[0]);
    const rainSpark = rainSparkHtml(wx);

    const badge = document.getElementById('csb-temp-badge');
    if (badge) badge.textContent = `${temp}°`;
    const curIcon  = wxIcon(cur.weather_code ?? 0);
    const isDay    = cur.is_day !== 0;
    const iconColor = isDay ? '#e07b00' : '#5b6faa';

    /* Chips del bloque Ahora */
    const aqiChip    = aqi != null ? `<span class="csb-aqi-chip">AQI <strong>${aqi} ${aqiLbl(aqi)}</strong></span>` : '';
    const uvMaxChip  = (uvMax != null && cur.is_day === 1) ? `<span>UV máx <strong>${n(uvMax,0)}</strong></span>` : '';
    const precipChip = precipSum != null ? `<span>Lluvia hoy <strong>${n(precipSum,1)} mm</strong></span>` : '';
    /* Resumen del día: máx/mín */
    const dayRange   = (todayMax != null && todayMin != null)
      ? `<span class="csb-day-chip">Hoy <strong>${Math.round(todayMin)}° – ${Math.round(todayMax)}°C</strong></span>`
      : '';

    setBody(`
      ${actionsHtml()}

      <!-- ══ AHORA ══ -->
      <div class="csb-now-row">
        <div class="csb-now-top">
          <div class="csb-now-left">
            <div class="csb-cond-row">
              <i class="fas ${curIcon} csb-wx-icon" style="color:${iconColor}"></i>
              <div class="csb-condition">${esc(cond)}</div>
            </div>
            <div class="csb-feels-sub">Sensación ${feel}°C · Humedad ${hum}%</div>
          </div>
          <div class="csb-big-temp">${temp}<sup>°C</sup></div>
        </div>
        <div class="csb-now-meta">
          ${dayRange}
          <span>${windDir ? windDir+' ' : ''}Viento <strong>${wind} km/h</strong></span>
          <span>UV <strong>${n(uv,1)}</strong></span>
          ${uvMaxChip}
          ${precipChip}
          ${aqiChip}
        </div>
      </div>

      <!-- ══ SPARKLINE LLUVIA ══ -->
      ${rainSpark}

      <!-- ══ ALERTA CIUDADANA ══ -->
      ${msg ? `<div class="csb-alert"><i class="fas fa-circle-info"></i><span>${esc(msg)}</span></div>` : ''}

      <!-- ══ BARRA SOLAR ══ -->
      ${solarBar}

      <!-- ══ HOY POR HORAS ══ -->
      <div class="csb-section-title">Hoy por horas</div>
      <div class="csb-hours">
        ${hours.map(h => `
          <div class="csb-hour-row">
            <div class="csb-h-time">${esc(h.time)}</div>
            <i class="fas ${h.icon} csb-h-icon"></i>
            <div class="csb-h-temp">${h.temp}°<span class="csb-h-feel"> / ${h.feel}°</span></div>
            <div class="csb-h-desc">${esc(h.desc)}</div>
            <div class="csb-h-rain ${h.rainCls}"><i class="fas fa-droplet"></i><span>${h.rain}%</span></div>
          </div>`).join('')}
      </div>

      <!-- ══ PRÓXIMOS DÍAS ══ -->
      <div class="csb-section-title">Próximos días</div>
      <div class="csb-days">
        ${days.map(d => `
          <div class="csb-day-row">
            <div class="csb-day-name">${esc(d.name)}</div>
            <i class="fas ${d.icon} csb-day-icon"></i>
            <div class="csb-day-cond">${esc(d.desc)}</div>
            <div class="csb-day-rain ${d.rainCls}"><i class="fas fa-droplet"></i><span>${d.rain}%</span></div>
            <div class="csb-day-range"><span>${d.min}°</span> / ${d.max}°</div>
          </div>`).join('')}
      </div>

      <div class="csb-footer">Datos meteorológicos obtenidos desde Open-Meteo.</div>
    `);
    bindBtns();
  }

  /* ── Builders ── */
  function buildHours(wx) {
    const times  = wx.hourly?.time || [];
    const temps  = wx.hourly?.temperature_2m || [];
    const feels  = wx.hourly?.apparent_temperature || [];
    const rains  = wx.hourly?.precipitation_probability || [];
    const codes  = wx.hourly?.weather_code || [];
    const nowStr = new Date().toISOString().substring(0, 13);
    let startIdx = times.findIndex(t => t.substring(0, 13) >= nowStr);
    if (startIdx < 0) startIdx = 0;
    const items  = [];
    for (let i = startIdx; i < times.length && items.length < 6; i++) {
      const rain = Math.round(rains[i] ?? 0);
      const code = codes[i] ?? 0;
      items.push({ time:    fmtHour(times[i]),
        temp:    Math.round(temps[i] ?? 0),
        feel:    Math.round(feels[i] ?? 0),
        rain,    rainCls: rainClass(rain),
        icon:    wxIcon(code),
        desc:    WX_SHORT[code] || 'Condición'
      });
    }
    return items.length ? items : [{ time:'--', temp:'--', feel:'--', rain:'--', rainCls:'rain-lo', icon:'fa-cloud', desc:'Sin datos' }];
  }

  function buildDays(wx) {
    const times = wx.daily?.time || [];
    const maxT  = wx.daily?.temperature_2m_max || [];
    const minT  = wx.daily?.temperature_2m_min || [];
    const codes = wx.daily?.weather_code || [];
    const rains = wx.daily?.precipitation_probability_max || [];
    return times.slice(1, 5).map((t, i) => {
      const d    = new Date(t + 'T12:00:00');
      const rain = Math.round(rains[i+1] ?? 0);
      const code = codes[i+1] ?? 0;
      return {
        name: `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
        icon: wxIcon(code), desc: WX_SHORT[code] || 'Condición',
        max:  Math.round(maxT[i+1] ?? 0), min: Math.round(minT[i+1] ?? 0),
        rain, rainCls: rainClass(rain)
      };
    });
  }

  /* ── Sparkline lluvia próximas 12 horas ── */
  function rainSparkHtml(wx) {
    const times = wx.hourly?.time || [];
    const rains = wx.hourly?.precipitation_probability || [];
    if (!times.length) return '';

    /* Encontrar el índice de la hora actual en el array — evita repetir */
    const nowStr = new Date().toISOString().substring(0, 13); // "2026-04-09T20"
    let startIdx = times.findIndex(t => t.substring(0, 13) >= nowStr);
    if (startIdx < 0) startIdx = 0;

    const items = [];
    for (let i = startIdx; i < times.length && items.length < 12; i++) {
      items.push({
        time: fmtHour(times[i]),
        pct:  Math.round(rains[i] ?? 0)
      });
    }
    if (!items.length) return '';
    const peakPct  = Math.max(...items.map(x => x.pct));
    const peakHour = items.find(x => x.pct === peakPct)?.time || '';
    const riskLabel = peakPct === 0  ? 'Sin lluvia prevista'
      : peakPct < 25               ? 'Lluvia poco probable'
      : peakPct < 50               ? `Posible lluvia hacia las ${peakHour}`
      : peakPct < 75               ? `Probable lluvia ~${peakHour}`
      :                              `Alta prob. lluvia a las ${peakHour}`;
    const riskColor = peakPct < 25 ? '#9a8086' : peakPct < 50 ? '#b5621a' : '#931D3D';
    const bars = items.map(item => {
      const h   = Math.max(4, Math.round((item.pct / 100) * 40));
      const col = item.pct >= 50 ? '#931D3D' : item.pct >= 25 ? '#e07340' : '#c5b4ba';
      return `<div class="csb-spark-col">
        <div class="csb-spark-bar" style="height:${h}px;background:${col}"></div>
        <div class="csb-spark-time">${item.time}</div>
      </div>`;
    }).join('');
    return `<div class="csb-spark-wrap">
      <div class="csb-spark-head">
        <i class="fas fa-droplet" style="color:${riskColor};font-size:0.72rem;"></i>
        <span class="csb-spark-label" style="color:${riskColor}">${esc(riskLabel)}</span>
      </div>
      <div class="csb-spark-chart">${bars}</div>
    </div>`;
  }

  /* ── Barra solar ── */
  function solarBarHtml(sunriseStr, sunsetStr) {
    if (!sunriseStr || !sunsetStr) return '';
    const rise = new Date(sunriseStr), set = new Date(sunsetStr), now = new Date();
    const dayLen = set - rise;
    if (dayLen <= 0) return '';
    const pct  = Math.max(0, Math.min(100, Math.round(((now - rise) / dayLen) * 100)));
    const fmtR = rise.toLocaleTimeString('es-MX', { hour:'numeric', minute:'2-digit' });
    const fmtS = set.toLocaleTimeString('es-MX', { hour:'numeric', minute:'2-digit' });
    const minsLeft = Math.round((set - now) / 60000);
    const sunLabel = now < rise ? `Amanecer a las ${fmtR}`
                   : now > set  ? `Ocaso: ${fmtS}`
                   : minsLeft > 0
                       ? `Atardecer en ${Math.floor(minsLeft/60)}h ${minsLeft % 60}m`
                   : 'Atardeciendo';
    const dotIcon = (now > rise && now < set) ? 'fa-sun' : 'fa-moon';
    return `<div class="csb-solar">
      <div class="csb-solar-bar">
        <span class="csb-solar-lbl">${fmtR}</span>
        <div class="csb-solar-track">
          <div class="csb-solar-fill" style="width:${pct}%"></div>
          <div class="csb-solar-dot" style="left:calc(${pct}% - 9px)">
            <i class="fas ${dotIcon}"></i>
          </div>
        </div>
        <span class="csb-solar-lbl">${fmtS}</span>
      </div>
      <div class="csb-solar-sub">${sunLabel}</div>
    </div>`;
  }

  /* ── Mensaje ciudadano mejorado ── */
  function citizenMsg(cur, aqi, uvMax, isDay) {
    const msgs = [];
    const t    = cur.temperature_2m ?? 20;
    const w    = cur.wind_speed_10m ?? 0;
    const uv   = isDay ? (uvMax ?? cur.uv_index ?? 0) : 0; /* UV = 0 de noche */
    const code = cur.weather_code ?? 0;
    const rain = cur.precipitation ?? 0;
    if      (t >= 35) msgs.push('Calor extremo — hidrátate, evita el sol directo.');
    else if (t >= 30) msgs.push('Calor moderado — lleva agua.');
    else if (t <= 5)  msgs.push('Frío intenso — abrígate bien.');
    else if (t <= 12) msgs.push('Frío — lleva chamarra.');
    if (rain >= 1 || [61,63,65,80,81,82,95,96,99].includes(code)) msgs.push('Lleva paraguas.');
    else if ([51,53,55].includes(code)) msgs.push('Posible llovizna — lleva impermeable.');
    if (w >= 40) msgs.push('Viento muy fuerte — precaución al manejar.');
    else if (w >= 25) msgs.push('Viento fuerte.');
    /* UV solo de día */
    if (isDay) {
      if      (uv >= 11) msgs.push('UV extremo — evita exposición entre 10am y 4pm.');
      else if (uv >= 8)  msgs.push('UV muy alto — usa protector solar.');
      else if (uv >= 6)  msgs.push('UV alto — protege tu piel.');
    }
    if ((aqi ?? 0) >= 100) msgs.push('Calidad del aire mala — evita ejercicio al exterior.');
    else if ((aqi ?? 0) >= 75) msgs.push('Calidad del aire regular para sensibles.');
    return msgs.join(' ');
  }

  /* ── Helpers ── */
  function windCompass(deg) {
    if (!Number.isFinite(deg)) return '';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
    return dirs[Math.round(deg / 22.5) % 16];
  }
  function aqiLbl(v) {
    if (!Number.isFinite(v)) return '--';
    if (v <= 20) return 'Muy buena'; if (v <= 40) return 'Buena';
    if (v <= 60) return 'Moderada';  if (v <= 80) return 'Regular';
    if (v <= 100) return 'Mala';     return 'Muy mala';
  }
  function actionsHtml() {
    return `<div class="csb-actions">
      <button type="button" class="csb-btn" id="csb-center"><i class="fas fa-crosshairs"></i> Centro del mapa</button>
      <button type="button" class="csb-btn" id="csb-pick"><i class="fas fa-hand-pointer"></i> Elegir punto</button>
    </div>`;
  }
  function bindBtns() {
    document.getElementById('csb-center')?.addEventListener('click', centerWeather);
    document.getElementById('csb-pick')?.addEventListener('click', startPicker);
  }
  function setBody(h) { const b = document.getElementById('csb-body'); if (b) b.innerHTML = h; }
  function fmtHour(v) { return new Date(v).toLocaleTimeString('es-MX', { hour:'numeric', minute:'2-digit' }).replace(':00','').toLowerCase(); }
  function fmtTime(v) { if (!v) return '--'; return new Date(v).toLocaleTimeString('es-MX', { hour:'numeric', minute:'2-digit' }); }
  function n(v, d)    { return Number.isFinite(v) ? Number(v).toFixed(d) : '--'; }
  function rnd(v)     { return Number.isFinite(v) ? Math.round(v) : null; }
  function esc(t)     { return String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  waitForMap();
})();
