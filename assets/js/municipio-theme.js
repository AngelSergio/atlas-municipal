(function () {
  const C = window.MUNICIPIO_CONFIG;
  if (!C) return;

  // Aplica variables CSS inmediatamente para evitar destello de colores por defecto
  if (C.colores) {
    const root = document.documentElement;
    const vars = {
      '--primary':       C.colores.primary,
      '--primary-dark':  C.colores.primaryDark,
      '--primary-light': C.colores.primaryLight,
      '--accent':        C.colores.accent
    };
    Object.entries(vars).forEach(([k, v]) => v && root.style.setProperty(k, v));
  }

  function applyToDOM() {
    const titulo = `Atlas Municipal de Peligros y Riesgos de ${C.municipio}`;

    // Título y meta tags
    document.title = titulo;
    const setMeta = (sel, attr, val) => document.querySelector(sel)?.setAttribute(attr, val);
    setMeta('meta[name="description"]',        'content', `Consulta los peligros y riesgos del territorio del municipio de ${C.municipio}, ${C.estado}. Sistema de información geográfica de ${C.dependencia}.`);
    setMeta('meta[property="og:title"]',       'content', titulo);
    setMeta('meta[property="og:description"]', 'content', `Conoce los peligros y riesgos de tu colonia en ${C.municipio}, ${C.estado}.`);
    setMeta('meta[property="og:image"]',       'content', C.logo);
    setMeta('meta[name="theme-color"]',        'content', C.colores?.primary || '#931D3D');

    // Logo splash
    const splashLogo = document.getElementById('splash-logo');
    if (splashLogo) {
      splashLogo.src = C.logo;
      splashLogo.alt = `${C.dependencia} ${C.municipio}`;
    }

    // Tagline splash
    const taglineSub = document.querySelector('.intro-splash__tagline-sub');
    if (taglineSub) taglineSub.textContent = `Conoce los peligros y riesgos del territorio en el municipio de ${C.municipio}, ${C.estado}`;

    // Logo escudo en header
    const headerLogoImg = document.getElementById('header-logo-escudo');
    if (headerLogoImg) {
      headerLogoImg.src = C.logoEscudo;
      headerLogoImg.alt = `${C.dependencia} ${C.municipio}`;
    }

    // Texto header: dependencia y municipio
    const line1 = document.querySelector('.header-logo-line1');
    if (line1) line1.textContent = C.dependencia.toUpperCase();
    const line2 = document.querySelector('.header-logo-line2');
    if (line2) line2.textContent = C.municipio.toUpperCase();

    // Título principal en header
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.textContent = titulo;

    // Logo municipio sobre el mapa
    const mapBrandLogo = document.getElementById('map-brand-logo');
    if (mapBrandLogo) {
      mapBrandLogo.src = C.logoMunicipio;
      mapBrandLogo.alt = C.municipio;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyToDOM);
  } else {
    applyToDOM();
  }
})();
