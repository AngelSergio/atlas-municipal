/**
 * ui-intro-labels.js  v2.3
 * Atlas Municipal de Peligros y Riesgos - guia rapida (textos basados en el tema del municipio)
 *
 * v2.3: En pantallas moviles (<= 768 px) el tour spotlight se sustituye por un
 *       bottom-sheet tactil con las funciones listadas. En desktop (>= 769 px)
 *       se mantiene el tour spotlight interactivo con flecha y paso a paso.
 *
 * target puede ser:
 *   String  -> selector CSS unico
 *   Array   -> union rect de varios elementos
 *   Object  -> hotspot relativo dentro de un contenedor
 *   null    -> paso informativo centrado
 */
(function () {
    'use strict';

    // Nombre del municipio tomado del tema (window.MUNICIPIO_CONFIG).
    var MUNI = (window.MUNICIPIO_CONFIG && window.MUNICIPIO_CONFIG.municipio) || 'tu municipio';

    /* =========================================================
       PASOS DEL TOUR
    ========================================================= */
    var STEPS = [
        {
            target: '#layer-tree .layer-group',
            side:   'right',
            icon:   '\uD83D\uDCC2',
            title:  'Temas del Atlas',
            desc:   'Abre cualquier tema para activar capas en el mapa: Medio Fisico, Medio Sociodemografico, Peligros, Riesgos y Obras. Puedes tener varias capas activas al mismo tiempo.',
        },
        {
            target: '#layer-search-box',
            side:   'right',
            icon:   '\uD83D\uDD0D',
            title:  'Busca capas por nombre',
            desc:   'Escribe el nombre de una capa \u2014 "inundacion", "fallas", "deslizamiento" \u2014 y el visor la filtra al instante sin navegar por los menus.',
        },
        {
            target: ['#temp-layers-group', '#capas-base-group'],
            side:   'right',
            icon:   '\uD83D\uDCCC',
            title:  'Capas temporales y Capas Base',
            desc:   'Visualiza tus propios archivos KML, KMZ o SHP-Z como capas temporales, cambia el mapa de fondo desde Capas Base y activa Trafico en tiempo real para ver la circulacion sobre el mapa.',
        },
        {
            target: '#clima-sidebar-section',
            side:   'right',
            icon:   '\u2601\uFE0F',
            title:  'Clima',
            desc:   'Consulta el clima actual de ' + MUNI + ' o del punto que elijas en el mapa. Desde aqui puedes actualizar los datos y abrir el panel del pronostico.',
        },
        {
            target: ['#btn-page-reload', '#btn-sidebar-handle'],
            side:   'right',
            icon:   '\u21BA',
            title:  'Restablecer y ocultar panel',
            desc:   'Aqui tienes dos controles rapidos del panel: Restablecer para recargar el visor, y Ocultar panel para colapsar la barra lateral y dejar mas espacio libre en el mapa.',
        },
        {
            target: ['#geocoder-field', '#btn-geocoder-close'],
            side:   'bottom',
            icon:   '\uD83D\uDCCD',
            title:  'Buscar direccion y mi ubicacion',
            desc:   'Usa el buscador para localizar cualquier calle, colonia, fraccionamiento o lugar de ' + MUNI + '; o pulsa el boton de mi ubicacion para centrar el mapa en tu posicion actual.',
        },
        {
            target: ['.ol-zoom', 'button[aria-label="Zoom general"]'],
            side:   'right',
            icon:   '\uD83D\uDD0E',
            title:  'Acercar, alejar y zoom general',
            desc:   'Aqui tienes tres controles rapidos: + para acercarte, - para alejarte y Zoom general para regresar de un clic a la vista completa del municipio de ' + MUNI + '.',
        },
        {
            target: { within: '#map', relX: 0.54, relY: 0.38, width: 150, height: 150 },
            side:   'bottom',
            icon:   '\uD83D\uDC46',
            title:  'Haz clic en el mapa para consultar',
            desc:   'Con una capa activa, haz clic sobre cualquier elemento \u2014 predio, zona de peligro, colonia \u2014 y veras una ficha con toda su informacion detallada.',
        },
        {
            target: ['#btn-measure-distance', '#btn-measure-area', '#btn-elevation-profile'],
            side:   'bottom',
            icon:   '\uD83D\uDCCF',
            title:  'Medir, calcular area y ver perfil de elevacion',
            desc:   'Aqui tienes tres herramientas de analisis: medir distancias, calcular areas y generar el perfil de elevacion del terreno a partir de un trazo sobre el mapa.',
        },
        {
            target: ['#btn-terrain-3d', '#btn-cesium-3d'],
            side:   'bottom',
            icon:   '\uD83C\uDF10',
            title:  'Vistas 3D del terreno',
            desc:   'Estas dos herramientas te permiten explorar el relieve en 3D: una vista basica del terreno y la vista 3D avanzada (terreno+vuelo) para navegar el municipio en tres dimensiones.',
        },
        {
            target: '#btn-analisis-demografico',
            side:   'bottom',
            icon:   '\uD83D\uDCCD',
            title:  'Riesgo por Ubicacion',
            desc:   'Esta herramienta te permite analizar un punto del municipio para generar una ficha rapida con el contexto del sitio, infraestructura de riesgo cercana y refugios temporales disponibles.',
        },
        {
            target: ['#btn-view-prev', '#btn-view-next'],
            side:   'bottom',
            icon:   '\u21A9\uFE0F',
            title:  'Historial de vistas',
            desc:   'Regresa a encuadres anteriores del mapa con la flecha izquierda o avanza con la derecha. Util para explorar varias zonas y navegar entre ellas sin perder el hilo.',
        },
        {
            target: ['#btn-upload-layer', '#btn-print'],
            side:   'bottom',
            icon:   '\uD83D\uDCE4',
            title:  'Subir capa propia e imprimir',
            desc:   'Aqui tienes dos acciones rapidas: subir tu propia capa \u2014 Shapefile, KML o GeoJSON \u2014 para visualizarla sobre el Atlas, e imprimir o guardar el mapa actual como PDF.',
        },
        {
            target: ['#btn-coords-launch', '#btn-legend', '#btn-fullscreen'],
            side:   'bottom',
            icon:   '\uD83E\uDDED',
            title:  'Coordenadas, leyenda y pantalla completa',
            desc:   'Aqui tienes tres herramientas rapidas: ir a coordenadas especificas, mostrar la leyenda de las capas activas y expandir el visor a pantalla completa.',
        },
        {
            target: ['#btn-guia', '#btn-info'],
            side:   'bottom',
            icon:   '\u2753',
            title:  'Guia visual e informacion del visor',
            desc:   'Aqui tienes dos accesos de apoyo: la guia visual para recorrer las funciones principales paso a paso, y el boton de informacion con los datos generales del Atlas.',
        },
        {
            target: '#close-legend',
            side:   'left',
            icon:   '\uD83D\uDCCB',
            title:  'Expandir o contraer la leyenda',
            desc:   'Una vez abierto el panel de leyenda, este boton la expande o contrae para ver la simbologia completa de todas las capas activas.',
        },
        {
            target: '#ol-street-view--pegman-draggable',
            side:   'left',
            icon:   '\uD83D\uDEB6',
            title:  'Street View \u2014 Vista a nivel de calle',
            desc:   'Arrastra este icono y sueltalo sobre cualquier calle del municipio para ver las fotografias de Google Street View. Presiona Esc para salir.',
        },
    ];

    /* =========================================================
       CSS — desktop spotlight tour
    ========================================================= */
    var CSS = [
        '#uit-backdrop{position:fixed;inset:0;z-index:87998;background:transparent;pointer-events:all;cursor:default;}',
        '#uit-spotlight{position:fixed;z-index:87999;border-radius:10px;pointer-events:none;opacity:0;',
        '  transition:top .38s cubic-bezier(.4,0,.2,1),left .38s cubic-bezier(.4,0,.2,1),',
        '  width .38s cubic-bezier(.4,0,.2,1),height .38s cubic-bezier(.4,0,.2,1),opacity .28s;}',
        '#uit-spotlight.visible{opacity:1;animation:uitPulse 2.2s ease-in-out infinite;}',
        '@keyframes uitPulse{',
        '  0%,100%{box-shadow:0 0 0 4px rgba(255,210,60,.95),0 0 0 8px rgba(255,210,60,.28),0 0 0 9999px rgba(0,0,0,.68);}',
        '  50%{box-shadow:0 0 0 7px rgba(255,210,60,1),0 0 0 14px rgba(255,210,60,.16),0 0 0 9999px rgba(0,0,0,.68);}',
        '}',
        '#uit-arrow{position:fixed;z-index:88002;pointer-events:none;opacity:0;transition:opacity .22s;overflow:visible;}',
        '#uit-arrow.visible{opacity:1;}',
        '#uit-card{position:fixed;z-index:88003;background:#fff;border-radius:18px;',
        '  box-shadow:0 10px 50px rgba(0,0,0,.42),0 0 0 3px #1e73be;',
        '  width:min(390px,92vw);pointer-events:all;opacity:0;',
        '  transform:scale(.90) translateY(14px);',
        '  transition:opacity .30s,transform .30s cubic-bezier(.4,0,.2,1);',
        '  font-family:"Segoe UI",Arial,sans-serif;overflow:hidden;}',
        '#uit-card.visible{opacity:1;transform:scale(1) translateY(0);}',
        '#uit-card-header{background:linear-gradient(135deg,#1e73be 0%,#14426b 100%);',
        '  padding:14px 18px 13px;display:flex;align-items:center;gap:11px;color:#fff;}',
        '#uit-card-icon{font-size:1.65rem;line-height:1;flex-shrink:0;filter:drop-shadow(0 1px 4px rgba(0,0,0,.4));}',
        '#uit-card-title{font-size:1.02rem;font-weight:700;flex:1;line-height:1.25;}',
        '#uit-card-step-badge{flex-shrink:0;font-size:.71rem;font-weight:700;',
        '  background:rgba(255,255,255,.20);border:1px solid rgba(255,255,255,.28);',
        '  padding:3px 10px;border-radius:20px;white-space:nowrap;}',
        '#uit-card-body{padding:14px 18px 6px;font-size:.895rem;color:#2d2d2d;line-height:1.60;}',
        '#uit-progress-bar{height:5px;background:#ececec;margin:8px 18px 0;border-radius:3px;overflow:hidden;}',
        '#uit-progress-fill{height:100%;background:linear-gradient(90deg,#1e73be,#307dc0);border-radius:3px;transition:width .38s ease;}',
        '#uit-card-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 14px;gap:8px;}',
        '.uit-btn{border:none;border-radius:24px;font-family:inherit;font-size:.84rem;font-weight:700;',
        '  cursor:pointer;padding:9px 17px;transition:background .16s,transform .10s;',
        '  display:flex;align-items:center;gap:4px;white-space:nowrap;}',
        '.uit-btn:active{transform:scale(.93);}',
        '.uit-btn:disabled{cursor:not-allowed;opacity:.30;}',
        '#uit-btn-close{background:#f0f0f0;color:#666;font-size:.80rem;padding:9px 13px;}',
        '#uit-btn-close:hover{background:#e0e0e0;}',
        '#uit-btn-prev{background:#f5f5f5;color:#555;}',
        '#uit-btn-prev:hover:not(:disabled){background:#e5e5e5;}',
        '#uit-btn-next{background:#1e73be;color:#fff;}',
        '#uit-btn-next:hover{background:#155a94;}',
        '#uit-btn-next.finish{background:#2e7d32;}',
        '#uit-btn-next.finish:hover{background:#1b5e20;}',
        '#uit-kb-hint{position:fixed;bottom:15px;left:50%;transform:translateX(-50%);',
        '  z-index:88010;font-family:"Segoe UI",Arial,sans-serif;font-size:.71rem;',
        '  color:rgba(255,255,255,.52);pointer-events:none;white-space:nowrap;}',
        '#uit-backdrop,#uit-spotlight,#uit-arrow,#uit-card,#uit-card *{',
        '  user-select:none!important;-webkit-user-select:none!important;',
        '  -webkit-user-drag:none;-webkit-touch-callout:none;}',
    ].join('\n');

    /* =========================================================
       CSS — mobile bottom-sheet
    ========================================================= */
    var MOBILE_CSS = [
        /* backdrop */
        '#uig-bd{position:fixed;inset:0;z-index:87998;',
        '  background:rgba(0,0,0,0.54);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);',
        '  -webkit-tap-highlight-color:transparent;}',

        /* sheet */
        '#uig-sheet{position:fixed;left:0;right:0;bottom:0;z-index:87999;',
        '  background:#fff;border-radius:22px 22px 0 0;',
        '  box-shadow:0 -6px 40px rgba(0,0,0,0.24);',
        '  max-height:88vh;display:flex;flex-direction:column;overflow:hidden;',
        '  font-family:"Inter","Segoe UI",Arial,sans-serif;',
        '  transform:translateY(100%);transition:transform 0.36s cubic-bezier(.4,0,.2,1);}',
        '#uig-sheet.uig-open{transform:translateY(0);}',

        /* drag handle */
        '#uig-handle{width:40px;height:4px;background:rgba(0,0,0,0.13);',
        '  border-radius:2px;margin:10px auto 0;flex-shrink:0;cursor:grab;touch-action:none;}',

        /* header */
        '#uig-hdr{background:linear-gradient(135deg,#1e73be 0%,#14426b 100%);',
        '  padding:13px 16px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
        '#uig-hdr-icon{font-size:1.45rem;line-height:1;flex-shrink:0;}',
        '#uig-hdr-txt{flex:1;min-width:0;}',
        '#uig-hdr-title{color:#fff;font-size:0.97rem;font-weight:700;letter-spacing:0.01em;line-height:1.2;}',
        '#uig-hdr-sub{color:rgba(255,255,255,0.68);font-size:0.70rem;margin-top:2px;}',
        '#uig-x{width:36px;height:36px;border-radius:50%;border:none;',
        '  background:rgba(255,255,255,0.16);color:#fff;font-size:1.05rem;',
        '  cursor:pointer;display:flex;align-items:center;justify-content:center;',
        '  flex-shrink:0;-webkit-tap-highlight-color:transparent;',
        '  transition:background 0.15s;min-width:44px;min-height:44px;}',
        '#uig-x:active{background:rgba(255,255,255,0.30);}',

        /* scrollable body */
        '#uig-body{overflow-y:auto;-webkit-overflow-scrolling:touch;',
        '  padding:10px 12px 0;flex:1;}',

        /* feature item */
        '.uig-row{display:flex;align-items:flex-start;gap:12px;',
        '  padding:12px 8px;border-bottom:1px solid rgba(0,0,0,0.055);}',
        '.uig-row:last-child{border-bottom:none;}',
        '.uig-ico{font-size:1.40rem;line-height:1;flex-shrink:0;',
        '  width:32px;text-align:center;margin-top:1px;}',
        '.uig-txt{flex:1;min-width:0;}',
        '.uig-ttl{font-size:0.86rem;font-weight:700;color:#1a1a1a;',
        '  line-height:1.25;margin-bottom:3px;}',
        '.uig-dsc{font-size:0.76rem;color:#555;line-height:1.52;}',
        '.uig-num{flex-shrink:0;width:20px;height:20px;',
        '  background:rgba(147,29,61,0.09);color:#1e73be;',
        '  border-radius:50%;font-size:0.62rem;font-weight:800;',
        '  display:flex;align-items:center;justify-content:center;margin-top:2px;}',

        /* safe-area spacer */
        '#uig-foot{flex-shrink:0;',
        '  height:max(env(safe-area-inset-bottom,8px),20px);}',

        /* no select */
        '#uig-bd,#uig-sheet,#uig-sheet *{',
        '  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;}',
    ].join('\n');

    /* =========================================================
       ESTADO
    ========================================================= */
    var step        = 0;
    var active      = false;
    var mobileOpen  = false;
    var els         = {};

    /* =========================================================
       DETECTAR MOVIL  (<= 768 px  o  pantalla corta)
    ========================================================= */
    function isMobile() {
        return window.innerWidth <= 768;
    }

    /* =========================================================
       getRect
    ========================================================= */
    function getRect(target) {
        if (!target) return null;

        if (target && typeof target === 'object' && !Array.isArray(target)) {
            var host = document.querySelector(target.within || '#map');
            if (!host) return null;
            var hr = host.getBoundingClientRect();
            if (hr.width === 0 || hr.height === 0) return null;
            var width  = Math.max(40, Number(target.width)  || 140);
            var height = Math.max(40, Number(target.height) || 140);
            var relX   = Math.max(0, Math.min(1, Number(target.relX)));
            var relY   = Math.max(0, Math.min(1, Number(target.relY)));
            var cx = hr.left + hr.width  * (isNaN(relX) ? 0.5 : relX);
            var cy = hr.top  + hr.height * (isNaN(relY) ? 0.5 : relY);
            return { top: cy - height/2, left: cx - width/2, width: width, height: height };
        }

        if (Array.isArray(target)) {
            var rects = target.map(function(sel) {
                var el = document.querySelector(sel);
                return (el && el.getBoundingClientRect().width > 0) ? el.getBoundingClientRect() : null;
            }).filter(Boolean);
            if (!rects.length) return null;
            var top    = Math.min.apply(null, rects.map(function(r){return r.top;}))    - 7;
            var left   = Math.min.apply(null, rects.map(function(r){return r.left;}))   - 7;
            var right  = Math.max.apply(null, rects.map(function(r){return r.right;}))  + 7;
            var bottom = Math.max.apply(null, rects.map(function(r){return r.bottom;})) + 7;
            if (right-left <= 14 || bottom-top <= 14) return null;
            return { top:top, left:left, width:right-left, height:bottom-top };
        }

        var el = document.querySelector(target);
        if (!el) return null;
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;

        if (target === '.ol-zoom') {
            var bi = document.querySelector('.ol-zoom-in');
            var bo = document.querySelector('.ol-zoom-out');
            if (bi && bo) {
                var ri = bi.getBoundingClientRect();
                var ro = bo.getBoundingClientRect();
                var zt = Math.min(ri.top, ro.top) - 7;
                var zb = Math.max(ri.bottom, ro.bottom) + 7;
                return { top:zt, left:r.left-7, width:r.width+14, height:zb-zt };
            }
        }
        return { top:r.top-7, left:r.left-7, width:r.width+14, height:r.height+14 };
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    /* =========================================================
       POSICIONAR TARJETA (desktop)
    ========================================================= */
    function positionCard(rect, side) {
        var card = els.card;
        var cW = card.offsetWidth  || 390;
        var cH = card.offsetHeight || 220;
        var vW = window.innerWidth, vH = window.innerHeight;
        var P  = 16;
        var top, left;

        if (!rect || side === 'center') {
            top  = vH/2 - cH/2;
            left = vW/2 - cW/2;
        } else {
            var mX = rect.left + rect.width  / 2;
            var mY = rect.top  + rect.height / 2;
            switch (side) {
                case 'right': left = rect.left+rect.width+P;  top  = clamp(mY-cH/2, P, vH-cH-P); break;
                case 'left':  left = rect.left-cW-P;          top  = clamp(mY-cH/2, P, vH-cH-P); break;
                case 'top':   top  = rect.top-cH-P;           left = clamp(mX-cW/2, P, vW-cW-P); break;
                default:      top  = rect.top+rect.height+P;  left = clamp(mX-cW/2, P, vW-cW-P); break;
            }
            if (left+cW > vW-P) left = rect.left-cW-P;
            if (left < P)       left = rect.left+rect.width+P;
            if (top+cH > vH-P)  top  = rect.top-cH-P;
            if (top < P)        top  = rect.top+rect.height+P;
        }
        card.style.top  = clamp(top,  P, vH-cH-P) + 'px';
        card.style.left = clamp(left, P, vW-cW-P) + 'px';
    }

    /* =========================================================
       FLECHA SVG
    ========================================================= */
    function drawArrow(rect, side) {
        var arrow = els.arrow;
        if (!rect || side === 'center') { arrow.classList.remove('visible'); return; }
        var cR  = els.card.getBoundingClientRect();
        var cMX = cR.left+cR.width/2, cMY = cR.top+cR.height/2;
        var tMX = rect.left+rect.width/2, tMY = rect.top+rect.height/2;
        var x1, y1;
        switch (side) {
            case 'right': x1=cR.left;  y1=cMY; break;
            case 'left':  x1=cR.right; y1=cMY; break;
            case 'top':   x1=cMX;      y1=cR.bottom; break;
            default:      x1=cMX;      y1=cR.top; break;
        }
        var x2=tMX, y2=tMY, M=24;
        var minX=Math.min(x1,x2)-M, minY=Math.min(y1,y2)-M;
        var w=Math.abs(x2-x1)+M*2, h=Math.abs(y2-y1)+M*2;
        arrow.style.cssText='left:'+minX+'px;top:'+minY+'px;width:'+w+'px;height:'+h+'px;';
        var lx1=x1-minX, ly1=y1-minY, lx2=x2-minX, ly2=y2-minY;
        var dx=lx2-lx1, dy=ly2-ly1, len=Math.sqrt(dx*dx+dy*dy)||1;
        var ux=dx/len, uy=dy/len, TIP=15;
        var ex=lx2-ux*TIP, ey=ly2-uy*TIP;
        var cpx=(lx1+lx2)/2-uy*32, cpy=(ly1+ly2)/2+ux*32;
        arrow.innerHTML='<svg width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg" overflow="visible">'+
            '<defs><marker id="uit-ah" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">'+
            '<path d="M0,0 L7,3 L0,6 Z" fill="rgba(255,210,60,.95)"/></marker></defs>'+
            '<path d="M'+lx1+','+ly1+' Q'+cpx+','+cpy+' '+ex+','+ey+'"'+
            ' fill="none" stroke="rgba(255,210,60,.88)" stroke-width="2.8"'+
            ' stroke-dasharray="7 5" stroke-linecap="round" marker-end="url(#uit-ah)"/>'+
            '</svg>';
        arrow.classList.add('visible');
    }

    /* =========================================================
       RENDERIZAR PASO (desktop)
    ========================================================= */
    function renderStep(idx) {
        var s     = STEPS[idx];
        var rect  = getRect(s.target);
        var total = STEPS.length;
        var vW = window.innerWidth, vH = window.innerHeight;
        var sp = els.spotlight;
        if (rect) {
            sp.style.top    = rect.top    + 'px';
            sp.style.left   = rect.left   + 'px';
            sp.style.width  = rect.width  + 'px';
            sp.style.height = rect.height + 'px';
        } else {
            sp.style.top=(vH/2)+'px'; sp.style.left=(vW/2)+'px';
            sp.style.width='0px'; sp.style.height='0px';
        }
        sp.classList.add('visible');
        els.cardIcon.textContent  = s.icon;
        els.cardTitle.textContent = s.title;
        els.cardDesc.textContent  = s.desc;
        els.cardStep.textContent  = (idx+1)+' / '+total;
        els.progressFill.style.width = ((idx+1)/total*100)+'%';
        els.btnPrev.disabled = idx===0;
        if (idx===total-1) { els.btnNext.textContent='\u00A1Listo! \u2713'; els.btnNext.classList.add('finish'); }
        else               { els.btnNext.textContent='Siguiente \u203A'; els.btnNext.classList.remove('finish'); }
        requestAnimationFrame(function() {
            positionCard(rect, s.side);
            els.card.classList.add('visible');
            requestAnimationFrame(function() { drawArrow(rect, s.side); });
        });
    }

    function goTo(idx) {
        if (idx<0||idx>=STEPS.length) return;
        els.card.classList.remove('visible');
        els.arrow.classList.remove('visible');
        setTimeout(function() { step=idx; renderStep(step); }, 195);
    }

    /* =========================================================
       CONSTRUIR DOM desktop
    ========================================================= */
    function buildDOM() {
        var styleEl = document.createElement('style');
        styleEl.id = 'uit-style'; styleEl.textContent = CSS;
        document.head.appendChild(styleEl);

        var backdrop  = document.createElement('div'); backdrop.id='uit-backdrop';
        backdrop.addEventListener('click', function(e){ if(e.target===backdrop) closeTour(); });
        var spotlight = document.createElement('div'); spotlight.id='uit-spotlight';
        var arrow     = document.createElement('div'); arrow.id='uit-arrow';

        var card = document.createElement('div'); card.id='uit-card';
        card.innerHTML =
            '<div id="uit-card-header"><span id="uit-card-icon"></span><span id="uit-card-title"></span><span id="uit-card-step-badge"></span></div>'+
            '<div id="uit-card-body"><p id="uit-card-desc" style="margin:0"></p></div>'+
            '<div id="uit-progress-bar"><div id="uit-progress-fill"></div></div>'+
            '<div id="uit-card-footer">'+
                '<button class="uit-btn" id="uit-btn-close">\u2715 Cerrar</button>'+
                '<button class="uit-btn" id="uit-btn-prev" disabled>\u2039 Anterior</button>'+
                '<button class="uit-btn" id="uit-btn-next">Siguiente \u203A</button>'+
            '</div>';

        var kbHint = document.createElement('div'); kbHint.id='uit-kb-hint';
        kbHint.textContent='\u2190 \u2192 para navegar  \u00B7  Esc para cerrar';

        var noSel = function(e){ e.preventDefault(); };
        [backdrop, spotlight, arrow, card].forEach(function(el){
            el.addEventListener('dragstart', noSel);
            el.addEventListener('selectstart', noSel);
        });

        document.body.appendChild(backdrop);
        document.body.appendChild(spotlight);
        document.body.appendChild(arrow);
        document.body.appendChild(card);
        document.body.appendChild(kbHint);

        els = {
            backdrop:spotlight, spotlight:spotlight, arrow:arrow, card:card, kbHint:kbHint,
            backdrop:backdrop,
            cardIcon:     card.querySelector('#uit-card-icon'),
            cardTitle:    card.querySelector('#uit-card-title'),
            cardDesc:     card.querySelector('#uit-card-desc'),
            cardStep:     card.querySelector('#uit-card-step-badge'),
            progressFill: card.querySelector('#uit-progress-fill'),
            btnClose:     card.querySelector('#uit-btn-close'),
            btnPrev:      card.querySelector('#uit-btn-prev'),
            btnNext:      card.querySelector('#uit-btn-next'),
        };
        els.spotlight = spotlight;
        els.btnClose.addEventListener('click', closeTour);
        els.btnPrev.addEventListener('click', function(){ goTo(step-1); });
        els.btnNext.addEventListener('click', function(){ if(step===STEPS.length-1) closeTour(); else goTo(step+1); });
    }

    function onKeyDown(e) {
        if (!active) return;
        if (e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); goTo(step+1); }
        if (e.key==='ArrowLeft' ||e.key==='ArrowUp')  { e.preventDefault(); goTo(step-1); }
        if (e.key==='Escape')                          { e.preventDefault(); closeTour();  }
    }

    function openTour() {
        if (active) { closeTour(); return; }
        active=true; step=0;
        buildDOM();
        document.addEventListener('keydown', onKeyDown);
        renderStep(0);
    }

    function closeTour() {
        active=false;
        document.removeEventListener('keydown', onKeyDown);
        ['uit-backdrop','uit-spotlight','uit-arrow','uit-card','uit-kb-hint','uit-style']
            .forEach(function(id){ var el=document.getElementById(id); if(el) el.remove(); });
        els={};
    }

    /* =========================================================
       MOBILE BOTTOM-SHEET
    ========================================================= */
    function openMobileGuide() {
        if (mobileOpen) { closeMobileGuide(); return; }
        mobileOpen = true;

        /* CSS */
        var st = document.createElement('style');
        st.id = 'uig-style'; st.textContent = MOBILE_CSS;
        document.head.appendChild(st);

        /* Backdrop */
        var bd = document.createElement('div'); bd.id='uig-bd';
        bd.addEventListener('click', closeMobileGuide);

        /* Sheet */
        var sheet = document.createElement('div'); sheet.id='uig-sheet';
        sheet.addEventListener('click', function(e){ e.stopPropagation(); });

        /* Handle (swipe-down) */
        var handle = document.createElement('div'); handle.id='uig-handle';

        /* Header */
        var hdr = document.createElement('div'); hdr.id='uig-hdr';
        hdr.innerHTML =
            '<span id="uig-hdr-icon">\uD83D\uDDFA\uFE0F</span>'+
            '<div id="uig-hdr-txt">'+
              '<div id="uig-hdr-title">Gu\u00EDa r\u00E1pida del Atlas</div>'+
              '<div id="uig-hdr-sub">'+STEPS.length+' funciones principales</div>'+
            '</div>'+
            '<button id="uig-x" aria-label="Cerrar">\u2715</button>';

        /* Body */
        var body = document.createElement('div'); body.id='uig-body';
        body.innerHTML = STEPS.map(function(s, i) {
            return '<div class="uig-row">'+
                '<span class="uig-ico">'+s.icon+'</span>'+
                '<div class="uig-txt">'+
                  '<div class="uig-ttl">'+s.title+'</div>'+
                  '<div class="uig-dsc">'+s.desc+'</div>'+
                '</div>'+
                '<span class="uig-num">'+(i+1)+'</span>'+
            '</div>';
        }).join('');

        /* Safe-area footer */
        var foot = document.createElement('div'); foot.id='uig-foot';

        sheet.appendChild(handle);
        sheet.appendChild(hdr);
        sheet.appendChild(body);
        sheet.appendChild(foot);

        document.body.appendChild(bd);
        document.body.appendChild(sheet);

        /* Close btn */
        hdr.querySelector('#uig-x').addEventListener('click', closeMobileGuide);

        /* Animate open */
        requestAnimationFrame(function(){
            requestAnimationFrame(function(){ sheet.classList.add('uig-open'); });
        });

        /* Swipe-down-to-close on handle */
        var sy = 0, cy = 0, drag = false;
        handle.addEventListener('touchstart', function(e){
            sy = e.touches[0].clientY; drag = true;
        }, { passive: true });
        handle.addEventListener('touchmove', function(e){
            if (!drag) return;
            cy = e.touches[0].clientY - sy;
            if (cy > 0) {
                sheet.style.transform  = 'translateY('+cy+'px)';
                sheet.style.transition = 'none';
            }
        }, { passive: true });
        handle.addEventListener('touchend', function(){
            drag = false;
            if (cy > 72) {
                closeMobileGuide();
            } else {
                sheet.style.transform  = '';
                sheet.style.transition = '';
            }
            cy = 0;
        });

        document.addEventListener('keydown', mobileKey);
    }

    function closeMobileGuide() {
        if (!mobileOpen) return;
        mobileOpen = false;
        document.removeEventListener('keydown', mobileKey);
        var sheet = document.getElementById('uig-sheet');
        if (sheet) {
            sheet.style.transition = 'transform 0.30s cubic-bezier(.4,0,.2,1)';
            sheet.style.transform  = 'translateY(100%)';
            setTimeout(function(){
                ['uig-bd','uig-sheet','uig-style'].forEach(function(id){
                    var el = document.getElementById(id); if(el) el.remove();
                });
            }, 320);
        }
    }

    function mobileKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); closeMobileGuide(); }
    }

    /* =========================================================
       ENTRADA PRINCIPAL — elige mode segun pantalla
    ========================================================= */
    function startGuide() {
        if (isMobile()) {
            openMobileGuide();
        } else {
            openTour();
        }
    }

    /* =========================================================
       INIT
    ========================================================= */
    function init() {
        var btn = document.getElementById('btn-guia');
        if (btn) btn.addEventListener('click', startGuide);

        var qbtn = document.getElementById('btn-sidebar-quick-guide');
        if (qbtn) {
            qbtn.addEventListener('click', function(e){
                e.preventDefault();
                startGuide();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
