(function () {

  /* ──────────────────────────────────────────────────────────────────────────
   *  Atlas Print Module – v2.1  (corrección DOM real ol-ext 4.0.24)
   *
   *  Hallazgos de inspección en vivo:
   *  - .ol-saveas es un <LI> que contiene un <SELECT> con <option> (NO <ul><li>)
   *    option value="1" → jpeg | value="2" → png
   *  - El botón Imprimir llama a window.print() en la página principal
   *  - _printCtrl.print({immediate:true}) SÍ dispara el evento 'print' con e.image
   *
   *  Fixes:
   *  1. filterSaveOptions() → manipula <option> del <select>, quita PNG,
   *     agrega <option value="atlas-pdf"> y escucha change → performPdfSave()
   *  2. Imprimir → override de window.print() mientras el diálogo está abierto;
   *     capturamos el e.image del evento 'print' y lo mostramos en iframe con leyenda
   *  3. Orientación Carta/Oficio → orientedDims = [h,w] si landscape (igual que v2.0)
   *  4. JPEG con leyenda → saveAsHandler intercepta el blob de ol-ext
   *  5. PDF con leyenda → captureMapToCanvas + drawLegendOnCanvas + jsPDF
   * ─────────────────────────────────────────────────────────────────────────*/

  function addSpanishLabels(ol) {
    if (!ol?.control?.PrintDialog) return;
    ol.control.PrintDialog.addLang('es', {
      title: 'Imprimir', orientation: 'Orientación',
      portrait: 'Vertical', landscape: 'Horizontal',
      size: 'Tamaño de página', custom: 'Tamaño de hoja',
      margin: 'Margen', scale: 'Escala', legend: 'Leyenda',
      north: 'Flecha norte', mapTitle: 'Título del mapa',
      saveas: 'Guardar como...', saveLegend: 'Guardar leyenda...',
      copied: '✔ Copiado al portapapeles',
      errorMsg: 'No se pudo preparar el mapa para impresión',
      printBt: 'Imprimir...', clipboardFormat: 'copiar al portapapeles...',
      jpegFormat: 'guardar como jpeg', pngFormat: 'guardar como png',
      pdfFormat: 'guardar como pdf',
      none: 'Ninguna', small: 'Pequeño', large: 'Grande', cancel: 'Cancelar'
    });
  }

  window.setupAtlasPrint = function setupAtlasPrint({ map, ol, showToast }) {
    if (!map || !ol?.control?.PrintDialog) return;

    addSpanishLabels(ol);

    ol.control.PrintDialog.prototype.paperSize = {
      '': null, 'Carta': [216, 279], 'Oficio': [216, 356]
    };

    /* ── Descarga blob ──────────────────────────────────────────────────── */
    const saveFile = (blob, fileName) => {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName || 'mapa';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (err) { console.error('[AtlasPrint] saveFile', err); }
    };

    /* ── Dims orientados ────────────────────────────────────────────────── */
    const getOrientedDims = () => {
      const c   = printControl.getContentElement?.();
      const sel = c?.querySelector('.ol-size select');
      const raw = printControl.paperSize[sel?.value || 'Carta'] || [216, 279];
      const lsc = !!c?.querySelector('input[value="landscape"]')?.checked;
      return lsc ? [raw[1], raw[0]] : [raw[0], raw[1]];
    };

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let _streetViewPrintState = null;

    const getStreetViewCoordsForRestore = () => {
      const ctrl = window.__atlasStreetViewControl;
      const coords = ctrl?._pegmanSelectedCoords;
      if (Array.isArray(coords) && coords.length >= 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
        return coords.slice(0, 2);
      }
      try {
        const panoPos = ctrl?.getStreetViewPanorama?.()?.getPosition?.();
        if (panoPos && typeof panoPos.lng === 'function' && typeof panoPos.lat === 'function') {
          return ol?.proj?.fromLonLat?.([panoPos.lng(), panoPos.lat()]) || null;
        }
      } catch (_) {}
      try {
        const center = map?.getView?.()?.getCenter?.();
        if (Array.isArray(center) && center.length >= 2) return center.slice(0, 2);
      } catch (_) {}
      return null;
    };

    const suspendStreetViewForPrint = async () => {
      if (_streetViewPrintState) return _streetViewPrintState;
      const ctrl = window.__atlasStreetViewControl;
      const body = document.body;
      const wasActive = !!body?.classList.contains('ol-street-view--activated');
      if (!ctrl || !wasActive || typeof ctrl.hideStreetView !== 'function') {
        _streetViewPrintState = { active: false };
        return _streetViewPrintState;
      }

      _streetViewPrintState = {
        active: true,
        coords: getStreetViewCoordsForRestore(),
        wasCompact: body.classList.contains('ol-street-view--compact'),
        wasHidden: body.classList.contains('ol-street-view--hidden')
      };

      try {
        ctrl.hideStreetView();
      } catch (err) {
        console.warn('[AtlasPrint] No se pudo ocultar Street View antes de imprimir', err);
      }

      await wait(220);
      try { map.updateSize(); } catch (_) {}
      await wait(140);
      return _streetViewPrintState;
    };

    const restoreStreetViewAfterPrint = async () => {
      const state = _streetViewPrintState;
      _streetViewPrintState = null;
      if (!state?.active) return;

      const ctrl = window.__atlasStreetViewControl;
      if (!ctrl || typeof ctrl.showStreetView !== 'function' || !Array.isArray(state.coords)) return;

      try {
        ctrl.showStreetView(state.coords);
        if (state.wasCompact) document.body.classList.add('ol-street-view--compact');
        else document.body.classList.remove('ol-street-view--compact');
        if (state.wasHidden) document.body.classList.add('ol-street-view--hidden');
        else document.body.classList.remove('ol-street-view--hidden');
      } catch (err) {
        console.warn('[AtlasPrint] No se pudo restaurar Street View después de imprimir', err);
      }

      await wait(220);
      try { map.updateSize(); } catch (_) {}
      await wait(140);
    };

    /* ── Leyenda sobre canvas (misma origen) ────────────────────────────── */
    /**
     * Dibuja la leyenda sobre un canvas. Se adapta automáticamente al
     * tamaño de página (Carta u Oficio) y a la orientación (vertical u
     * horizontal) utilizando el lado más corto como referencia para el
     * escalado. Esto asegura que la leyenda siempre quede proporcionada
     * y dentro de los márgenes independientemente del formato.
     *
     * @param {CanvasRenderingContext2D} ctx Contexto del canvas
     * @param {number} cW Ancho del canvas en píxeles
     * @param {number} cH Alto del canvas en píxeles
     */
    const drawLegendOnCanvas = (ctx, cW, cH) => {
      const legendRoot = document.getElementById('legend-content');
      if (!legendRoot) return;
      const itemsEls = Array.from(legendRoot.querySelectorAll('.legend-item'));
      if (!itemsEls.length) return;
      // Construye lista de elementos de leyenda a partir del DOM
      const items = itemsEls.map(it => ({
        title: it.querySelector('.legend-item-title')?.textContent?.trim() || '',
        imgEl: it.querySelector('img') || null
      }));
      // Para escalado se toma el lado más corto del canvas, pero el bloque de leyenda
      // también necesita considerar el ancho real del JPEG exportado para no quedar enano.
      const minSide     = Math.min(cW, cH);
      const longSide    = Math.max(cW, cH);
      const margin      = Math.round(minSide * 0.018);
      const pad         = Math.round(minSide * 0.012);
      const titleFontSz = Math.round(minSide * 0.020);
      const labelFontSz = Math.round(minSide * 0.017);
      const headerH     = Math.round(titleFontSz * 2.2);
      // Precalcula alto y ancho de cada imagen de la leyenda.
      // El título de cada capa se dibuja ARRIBA del símbolo para que la
      // leyenda se vea más limpia en el JPEG exportado.
      const itemTitleFontSz = Math.max(labelFontSz, Math.round(minSide * 0.017));
      const itemTitleGap    = Math.max(8, Math.round(pad * 0.70));
      const meta = items.map(({ imgEl }) => {
        let iH = 0, iW = 0;
        if (imgEl && imgEl.naturalHeight > 0) {
          // Escala la imagen para que sea más legible en el JPEG de alta resolución.
          const sc = Math.min(2.0, (cH * 0.14) / imgEl.naturalHeight);
          iH = Math.round(imgEl.naturalHeight * sc);
          iW = Math.round(imgEl.naturalWidth  * sc);
        }
        const titleH = itemTitleFontSz * 1.25;
        const symbolBlockH = iH > 0 ? (itemTitleGap + iH) : 0;
        return { iH, iW, titleH, rowH: titleH + symbolBlockH + Math.round(pad * 0.90) };
      });
      // Antes la caja estaba topada a 340 px y por eso quedaba microscópica.
      // Ahora se calcula con base en el ancho real del JPEG exportado.
      const boxW = Math.max(
        Math.round(cW * 0.22),
        Math.min(Math.round(longSide * 0.26), Math.round(cW * 0.30))
      );
      let   boxH = pad * 2 + headerH;
      meta.forEach(m => { boxH += m.rowH; });
      // Posiciona la caja en la esquina inferior derecha respetando margen
      const boxX = cW - margin - boxW;
      const boxY = cH - margin - boxH;
      const r    = 6;
      ctx.save();
      // Fondo de la caja con transparencia y borde
      ctx.fillStyle   = 'rgba(255,255,255,0.93)';
      ctx.strokeStyle = 'rgba(109,0,0,0.55)';
      ctx.lineWidth   = Math.max(1, Math.round(minSide * 0.002));
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.lineTo(boxX + boxW - r, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + r, r);
      ctx.lineTo(boxX + boxW, boxY + boxH - r);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH, r);
      ctx.lineTo(boxX + r, boxY + boxH);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - r, r);
      ctx.lineTo(boxX, boxY + r);
      ctx.arcTo(boxX, boxY, boxX + r, boxY, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Título de la leyenda
      ctx.fillStyle = '#6d0000';
      ctx.font      = `bold ${titleFontSz}px Arial, sans-serif`;
      ctx.fillText('Leyenda', boxX + pad, boxY + pad + titleFontSz);
      // Línea de separación
      ctx.strokeStyle = 'rgba(109,0,0,0.3)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + pad, boxY + headerH);
      ctx.lineTo(boxX + boxW - pad, boxY + headerH);
      ctx.stroke();
      // Dibuja cada ítem de la leyenda.
      // El nombre de la capa va arriba y el símbolo/imagen debajo.
      ctx.fillStyle = '#222';
      let curY = boxY + headerH + pad * 0.5;
      items.forEach(({ title, imgEl }, i) => {
        const { iH, iW, titleH, rowH } = meta[i];
        const maxTxW = boxW - pad * 2;
        let label = title;
        ctx.font = `bold ${itemTitleFontSz}px Arial, sans-serif`;
        // Trunca el título si excede el ancho disponible.
        while (label.length > 3 && ctx.measureText(label).width > maxTxW) {
          label = label.slice(0, -4) + '\u2026';
        }
        ctx.fillText(label, boxX + pad, curY + itemTitleFontSz);

        // Algunas imágenes de la leyenda pueden ser de origen externo. Si falla al dibujar
        // se ignora silenciosamente para evitar romper la generación del JPEG.
        if (imgEl && iH > 0) {
          try {
            ctx.drawImage(imgEl, boxX + pad, curY + titleH + itemTitleGap, iW, iH);
          } catch (_) {
            // Si ocurre un error (posiblemente por CORS), se omite la imagen
          }
        }
        curY += rowH;
      });
      ctx.restore();
    };

    /* ── Capturar mapa para exportaciones de alta calidad ───────────────── */
    const captureMapForExport = (orientedDims, imageType = 'image/png') => new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), 20000);
      printControl._printCtrl.once('print', (e) => {
        clearTimeout(t);
        if (!e.image) {
          reject(new Error('No image returned by print control'));
          return;
        }
        resolve({
          image: e.image,
          imageType: e.imageType || imageType,
          print: e.print || {},
        });
      });
      printControl._printCtrl.print({
        size: orientedDims,
        margin: 0,
        imageType,
        quality: 1,
        immediate: true,
      });
    });

    const renderCaptureToPageCanvas = async ({ capture, dims, dpi = 300, background = '#ffffff' }) => {
      const [pageWmm, pageHmm] = dims;
      const pageWidthPx = Math.max(1, Math.round((pageWmm / 25.4) * dpi));
      const pageHeightPx = Math.max(1, Math.round((pageHmm / 25.4) * dpi));

      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = capture.image;
      });

      const c = document.createElement('canvas');
      c.width = pageWidthPx;
      c.height = pageHeightPx;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, c.width, c.height);

      // Ajuste visual: en los PDF el mapa estaba quedando muy pequeño y con demasiado
      // espacio en blanco. Aquí lo escalamos para ocupar mejor la hoja completa,
      // respetando la relación de aspecto y dejando solo un margen corto uniforme.
      const shortSideMm = Math.min(pageWmm, pageHmm);
      const marginMm = Math.max(4, shortSideMm * 0.018);
      const pxPerMmX = pageWidthPx / pageWmm;
      const pxPerMmY = pageHeightPx / pageHmm;
      const marginXPx = Math.round(marginMm * pxPerMmX);
      const marginYPx = Math.round(marginMm * pxPerMmY);
      const availW = Math.max(1, c.width - marginXPx * 2);
      const availH = Math.max(1, c.height - marginYPx * 2);
      const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
      const drawW = Math.round(img.naturalWidth * scale);
      const drawH = Math.round(img.naturalHeight * scale);
      const drawX = Math.round((c.width - drawW) / 2);
      const drawY = Math.round((c.height - drawH) / 2);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      return { canvas: c, ctx };
    };

    /* ── Guardar JPEG con leyenda (callback saveAs de ol-ext) ───────────── */
    const getTargetJpegPixelSize = (dpi = 300) => {
      const [mmW, mmH] = getOrientedDims();
      return {
        width: Math.max(1, Math.round((mmW / 25.4) * dpi)),
        height: Math.max(1, Math.round((mmH / 25.4) * dpi))
      };
    };

    const saveJpegWithLegend = async (blob, fileName) => {
      try {
        const objUrl = URL.createObjectURL(blob);
        const img = await new Promise((res, rej) => {
          const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = objUrl;
        });
        URL.revokeObjectURL(objUrl);

        // Fuerza una salida equivalente a 300 DPI para Carta/Oficio según la
        // orientación actual. Esto fija el tamaño final en píxeles del JPEG.
        const target = getTargetJpegPixelSize(300);
        const c = document.createElement('canvas');
        c.width = target.width;
        c.height = target.height;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, c.width, c.height);

        // Solo dibujar la leyenda si el switch del diálogo está activo.
        const legendEnabled = !!printControl.getContentElement?.()
          ?.querySelector('.ol-legend input[type="checkbox"]')?.checked;
        if (legendEnabled) {
          drawLegendOnCanvas(ctx, c.width, c.height);
        }

        c.toBlob(b => saveFile(b, fileName), 'image/jpeg', 0.92);
      } catch (err) {
        console.error('[AtlasPrint] saveJpegWithLegend', err);
        saveFile(blob, fileName);
      }
    };

    const saveAsHandler = (blob, fileName) => {
      // En capturas internas o generación de PDF no debe escaparse ningún archivo
      // auxiliar. Si ol-ext intenta guardar una imagen, aquí se cancela.
      if (_captureOnlyMode || _suppressNextSaveAs) {
        _suppressNextSaveAs = false;
        return;
      }

      const n = (fileName || '').toLowerCase();
      if (n.endsWith('.jpg') || n.endsWith('.jpeg')) saveJpegWithLegend(blob, fileName);
      else saveFile(blob, fileName);
    };

    /* ── Guardar PDF con leyenda ─────────────────────────────────────────── */
    let _pdfBusy = false;
    let _suppressNextSaveAs = false;
    let _captureOnlyMode = false;

    const performPdfSave = async () => {
      if (_pdfBusy) return;

      // Bloquear el siguiente saveAs nativo para que no se cuele el JPEG.
      _suppressNextSaveAs = true;

      const jsPDF = window.jspdf?.jsPDF;
      if (!jsPDF) {
        if (showToast) showToast('jsPDF no disponible', 'error');
        return;
      }
      _pdfBusy = true;
      try {
        const dims = getOrientedDims();
        const [pW, pH] = dims;

        // Capturamos el mapa como PNG para evitar una compresión con pérdida
        // antes de componer el PDF final. Después rearmamos la hoja completa
        // a 300 DPI respetando Carta/Oficio y la orientación seleccionada.
        const capture = await captureMapForExport(dims, 'image/png');
        const { canvas, ctx } = await renderCaptureToPageCanvas({
          capture,
          dims,
          dpi: 300,
          background: '#ffffff',
        });

        // Solo dibujar la leyenda en el PDF si el switch está activo.
        const legendEnabled = !!printControl.getContentElement?.()
          ?.querySelector('.ol-legend input[type="checkbox"]')?.checked;
        if (legendEnabled) {
          drawLegendOnCanvas(ctx, canvas.width, canvas.height);
        }

        const pdf = new jsPDF({
          orientation: pW > pH ? 'l' : 'p',
          unit: 'mm',
          format: dims,
          compress: true,
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pW, pH);
        pdf.save('mapa-atlas.pdf');
      } catch (err) {
        console.error('[AtlasPrint] performPdfSave', err);
        if (showToast) showToast('Error al generar PDF', 'error');
      } finally {
        _pdfBusy = false;
        // Soltar el guard también por tiempo, por si ol-ext no llegó a llamar saveAs.
        setTimeout(() => { _suppressNextSaveAs = false; }, 300);
      }
    };


    const captureImageWithoutDownload = async ({ size = null, imageType = 'image/png' } = {}) => {
      const dims = Array.isArray(size) && size.length === 2 ? size : getOrientedDims();
      _captureOnlyMode = true;
      _suppressNextSaveAs = true;
      try {
        return await captureMapForExport(dims, imageType);
      } finally {
        setTimeout(() => { _suppressNextSaveAs = false; }, 800);
        setTimeout(() => { _captureOnlyMode = false; }, 1200);
      }
    };

    /* ══════════════════════════════════════════════════════════════════════
     *  INSTANCIAR PrintDialog
     *  pdf:false → quitamos el PDF nativo de ol-ext para manejarlo nosotros
     * ══════════════════════════════════════════════════════════════════════*/
    const printControl = new ol.control.PrintDialog({
      lang: 'es', className: 'atlas-print-control',
      title: 'Imprimir', copy: false, save: true,
      pdf: false, jsPDF: undefined,
      orientation: 'landscape',
      saveAs: saveAsHandler
    });

    map.addControl(printControl);
    printControl.setSize('Carta');
    printControl.setOrientation('landscape');
    printControl.setMargin(0);

    /* ── Registro permanente: capturar último render de _printCtrl ──────── */
    // ol-ext dispara 'print' antes de llamar window.print().
    // Guardamos los datos para usarlos en nuestro override de window.print.
    let _lastPrintData = null;
    printControl._printCtrl.on('print', (e) => {
      if (e.image) {
        _lastPrintData = {
          image:       e.image,
          size:        e.print?.size       || null,
          imageWidth:  e.print?.imageWidth  || null,
          imageHeight: e.print?.imageHeight || null,
          position:    e.print?.position    || [0, 0]
        };
      }
    });

    /* ── Abrir iframe de impresión con leyenda ──────────────────────────── */
    const openPrintIframe = async (data) => {
      const orientedDims = data.size || getOrientedDims();
      const [pW, pH] = orientedDims;

      try {
        const legendEnabled = !!printControl.getContentElement?.()
          ?.querySelector('.ol-legend input[type="checkbox"]')?.checked;

        const { canvas, ctx } = await renderCaptureToPageCanvas({
          capture: { image: data.image, print: data.print || {} },
          dims: orientedDims,
          dpi: 220,
          background: '#ffffff',
        });
        if (legendEnabled) {
          drawLegendOnCanvas(ctx, canvas.width, canvas.height);
        }
        const composedImage = canvas.toDataURL('image/png');

        const html =
          `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Impresion</title><style>` +
          `@page{size:${pW}mm ${pH}mm;margin:0}` +
          `html,body{margin:0;padding:0;background:#fff}` +
          `img{display:block;width:${pW}mm;height:${pH}mm}` +
          `</style></head><body>` +
          `<img src="${composedImage}" alt="mapa"/>` +
          `</body></html>`;

        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
          position:'fixed', left:'-9999px', top:'0',
          width:'1px', height:'1px', visibility:'hidden'
        });
        document.body.appendChild(iframe);
        const doc = iframe.contentWindow?.document;
        if (!doc) { document.body.removeChild(iframe); return; }
        doc.open(); doc.write(html); doc.close();

        const tryPrint = () => {
          const img = iframe.contentWindow?.document?.querySelector('img');
          if (img?.complete) {
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
            finally {
              setTimeout(() => { try { document.body.removeChild(iframe); } catch(_){} }, 1500);
            }
          } else {
            setTimeout(tryPrint, 60);
          }
        };
        tryPrint();
      } catch (err) {
        console.error('[AtlasPrint] openPrintIframe', err);
        if (window._atlasPrintOrig) window._atlasPrintOrig();
      }
    };


    /* ── Enviar directo al cuadro de impresión del navegador/Windows ────── */
    let _directPrintBusy = false;
    const directPrintFromDialog = async () => {
      if (_directPrintBusy) return;
      _directPrintBusy = true;
      // El flujo de impresión directa usa una captura interna del mapa.
      // Bloqueamos temporalmente el saveAs nativo de ol-ext para que no se cuele
      // una descarga JPEG mientras solo queremos abrir el cuadro de impresión.
      _suppressNextSaveAs = true;
      try {
        const dims = getOrientedDims();
        const capture = await captureMapForExport(dims, 'image/png');
        await openPrintIframe({
          image: capture.image,
          size: dims,
          print: capture.print || {},
          imageWidth: capture.print?.imageWidth || null,
          imageHeight: capture.print?.imageHeight || null,
          position: capture.print?.position || [0, 0],
        });
      } catch (err) {
        console.error('[AtlasPrint] directPrintFromDialog', err);
        if (showToast) showToast('No se pudo abrir la impresión del mapa', 'error');
        if (window._atlasPrintOrig) window._atlasPrintOrig();
      } finally {
        setTimeout(() => { _directPrintBusy = false; }, 500);
        setTimeout(() => { _suppressNextSaveAs = false; }, 300);
      }
    };

    const bindDirectPrintButton = () => {
      const c = printControl.getContentElement?.();
      if (!c || c.dataset.atlasDirectPrintBound) return;
      c.dataset.atlasDirectPrintBound = '1';
      c.addEventListener('click', (evt) => {
        const btn = evt.target?.closest?.('button');
        if (!btn) return;
        const txt = (btn.textContent || '').trim().toLowerCase();
        if (!txt) return;
        if (txt.includes('imprimir')) {
          evt.preventDefault();
          evt.stopPropagation();
          if (typeof evt.stopImmediatePropagation === 'function') evt.stopImmediatePropagation();
          directPrintFromDialog();
        }
      }, true);
    };

    /* ── @page style ────────────────────────────────────────────────────── */
    const updatePageStyle = (sizeName, orientation) => {
      const dims = printControl.paperSize[sizeName] || [216, 279];
      let [w, h] = dims;
      if (orientation === 'landscape') [w, h] = [h, w];
      let el = document.getElementById('atlas-print-page-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'atlas-print-page-style';
        document.head.appendChild(el);
      }
      el.textContent = `@media print { @page { size: ${w}mm ${h}mm; margin: 0; } }`;
    };

    const bindPageStyleSync = () => {
      const c = printControl.getContentElement?.();
      if (!c || c.dataset.atlasPageStyleBound) return;
      c.dataset.atlasPageStyleBound = '1';
      const sizeSelect     = c.querySelector('.ol-size select');
      const portraitRadio  = c.querySelector('input[value="portrait"]');
      const landscapeRadio = c.querySelector('input[value="landscape"]');
      const sync = () => updatePageStyle(
        sizeSelect?.value || 'Carta',
        landscapeRadio?.checked ? 'landscape' : 'portrait'
      );
      sizeSelect?.addEventListener('change',     sync);
      portraitRadio?.addEventListener('change',  sync);
      landscapeRadio?.addEventListener('change', sync);
      sync();
    };

    /* ── Leyenda en preview del diálogo ─────────────────────────────────── */
    const buildPrintLegend = () => {
      const src = document.getElementById('legend-content');
      if (!src) return null;
      const clone = src.cloneNode(true); clone.removeAttribute('id');
      const w = document.createElement('div');
      w.className = 'atlas-print-legend';
      const hdr = document.createElement('div');
      hdr.className = 'atlas-print-legend-title'; hdr.textContent = 'Leyenda';
      w.appendChild(hdr); clone.classList.add('atlas-print-legend-body'); w.appendChild(clone);
      return w;
    };

    const syncPrintLegend = () => {
      const page = printControl.getPage?.();
      if (!page) return;
      page.querySelector('.atlas-print-legend')?.remove();
      const cb = printControl.getContentElement?.()
        ?.querySelector('.ol-legend input[type="checkbox"]');
      if (cb && !cb.checked) return;
      const legend = buildPrintLegend();
      if (!legend) return;
      if (!page.style.position) page.style.position = 'relative';
      page.appendChild(legend);
    };

    const queuePrintLegendSync = () =>
      [0, 60, 180, 360].forEach(d => setTimeout(syncPrintLegend, d));

    const bindPrintDialogSync = () => {
      const c = printControl.getContentElement?.();
      if (!c || c.dataset.atlasLegendBound) return;
      c.dataset.atlasLegendBound = '1';
      c.addEventListener('change', queuePrintLegendSync);
      c.addEventListener('input',  queuePrintLegendSync);
      c.addEventListener('click',  queuePrintLegendSync);
    };

    /* ── Filtrar "Guardar como": dejar JPEG y PDF ─────────────────────── */
    // CORRECCIÓN: ol-ext 4.0.24 usa <select> con <option>, NO <ul><li>
    const filterSaveOptions = () => {
      const c = printControl.getContentElement?.();
      if (!c) return;
      const saveas = c.querySelector('.ol-saveas');
      if (!saveas) return;
      const sel = saveas.querySelector('select');
      if (!sel) return;

      // Quitar PNG y cualquier PDF duplicado previo.
      sel.querySelectorAll('option').forEach(opt => {
        const txt = (opt.text || '').toLowerCase().trim();
        if (txt.includes('png')) opt.remove();
        if (txt.includes('pdf') && (opt.value || '').toLowerCase() !== 'atlas-pdf') opt.remove();
      });

      // Agregar nuestra opción PDF personalizada solo una vez.
      if (!sel.querySelector('option[value="atlas-pdf"]')) {
        const pdfOpt = document.createElement('option');
        pdfOpt.value = 'atlas-pdf';
        pdfOpt.text = 'guardar como pdf';
        sel.appendChild(pdfOpt);
      }

      // Enlazar el cambio una sola vez.
      if (!sel.dataset.atlasPdfBound) {
        sel.dataset.atlasPdfBound = '1';
        const onSelChange = () => {
          if ((sel.value || '').toLowerCase() === 'atlas-pdf') {
            sel.value = '';
            performPdfSave();
          }
        };
        sel.addEventListener('change', onSelChange);
        sel.addEventListener('input', onSelChange);
      }
    };

    const scheduleFilterSaveOptions = () => {
      [0, 80, 200, 400, 800].forEach(d => setTimeout(filterSaveOptions, d));
      const c = printControl.getContentElement?.();
      if (c && !c.dataset.atlasSaveObserver) {
        c.dataset.atlasSaveObserver = '1';
        new MutationObserver(filterSaveOptions).observe(c, { childList:true, subtree:true });
      }
    };

    /* ── Toggle leyenda en diálogo ───────────────────────────────────────── */
    const injectLegendToggle = () => {
      const c = printControl.getContentElement?.();
      if (!c) return;
      setTimeout(() => {
        const li = c.querySelector('.ol-legend');
        if (!li) return;
        li.classList.remove('hidden');
        li.style.display = 'block';
        const cb = li.querySelector('input[type="checkbox"]');
        if (cb && !cb.dataset.atlasLegendInit) {
          cb.dataset.atlasLegendInit = '1'; cb.checked = true;
        }
      }, 150);
    };

    /* ── syncTitle ───────────────────────────────────────────────────────── */
    const syncTitle = () => {
      const c      = printControl.getContentElement?.();
      const ttBlk  = c?.querySelector('.ol-print-title');
      const ttTog  = ttBlk?.querySelector('input[type="checkbox"]');
      const ttInp  = ttBlk?.querySelector('input[type="text"]');
      const upVis  = () => {
        if (!ttInp) return;
        ttInp.style.display = ttTog?.checked ? 'block' : 'none';
        if (!ttTog?.checked) ttInp.value = '';
      };
      if (ttInp) ttInp.placeholder = 'Título';
      if (ttTog && !ttTog.dataset.atlasBound) {
        ttTog.dataset.atlasBound = '1';
        ttTog.addEventListener('change', () => {
          upVis();
          if (ttTog.checked && ttInp) requestAnimationFrame(() => ttInp.focus());
        });
      }
      if (ttTog && !ttTog.dataset.atlasInit) {
        ttTog.dataset.atlasInit = '1'; ttTog.checked = false;
        ttTog.dispatchEvent(new Event('change', { bubbles:true }));
      }
      upVis();
      const ss = c?.querySelector('.ol-size select');
      if (ss) { ss.value = 'Carta'; ss.dispatchEvent(new Event('change', { bubbles:true })); }
      const ms = c?.querySelector('.ol-margin select');
      if (ms) { ms.value = '0'; ms.dispatchEvent(new Event('change', { bubbles:true })); }
      const lsc = c?.querySelector('input[value="landscape"]');
      if (lsc && !lsc.checked) { lsc.checked = true; lsc.dispatchEvent(new Event('change', { bubbles:true })); }
      injectLegendToggle();
    };

    /* ══════════════════════════════════════════════════════════════════════
     *  EVENTOS DEL CONTROL
     * ══════════════════════════════════════════════════════════════════════*/
    printControl.on('show', async () => {
      document.body.classList.add('atlas-print-open');
      window.AtlasMeasure?.suspendForPrint?.();
      window.AtlasElevationProfile?.suspendForPrint?.();
      await suspendStreetViewForPrint();

      syncTitle();
      bindPrintDialogSync();
      bindPageStyleSync();
      bindDirectPrintButton();
      scheduleFilterSaveOptions();
      queuePrintLegendSync();

      /* ── Override window.print: intercepta la llamada de ol-ext ─────────
       * ol-ext llama window.print() DESPUÉS de capturar el canvas al evento 'print'.
       * Nosotros ya capturamos el canvas en _lastPrintData via el listener permanente.
       * En lugar de imprimir la página entera, abrimos un iframe con leyenda.
       * ────────────────────────────────────────────────────────────────── */
      if (!window._atlasPrintOrig) {
        window._atlasPrintOrig = window.print.bind(window);
        window.print = function atlasPrintRedirect() {
          if (_lastPrintData) {
            openPrintIframe(_lastPrintData);
          } else {
            // Fallback: imprimir la página normalmente
            window._atlasPrintOrig();
          }
        };
      }

      setTimeout(() => map.updateSize(), 60);
    });

    printControl.on('hide', async () => {
      document.body.classList.remove('atlas-print-open');

      // Restaurar window.print original
      if (window._atlasPrintOrig) {
        window.print = window._atlasPrintOrig;
        delete window._atlasPrintOrig;
      }

      await restoreStreetViewAfterPrint();
      window.AtlasMeasure?.restoreAfterPrint?.();
      window.AtlasElevationProfile?.restoreAfterPrint?.();
      setTimeout(() => map.updateSize(), 60);
    });

    printControl.on('error', () => {
      if (showToast) showToast('No se pudo preparar la impresión del mapa', 'error');
    });

    /* ── API pública ────────────────────────────────────────────────────── */
    window.AtlasPrint = {
      control: printControl,
      async open() {
        await suspendStreetViewForPrint();
        syncTitle();
        printControl.setSize('Carta');
        printControl.setOrientation('landscape');
        printControl.setMargin(0);
        updatePageStyle('Carta', 'landscape');
        try {
          printControl.print({ size: 'Carta', orientation: 'landscape', margin: 0 });
        } catch(_) {
          // Fallback si el mapa aún no está listo
          printControl.show?.();
        }
        queuePrintLegendSync();
      },
      async captureImage(options = {}) {
        return captureImageWithoutDownload(options);
      }
    };
  };
})();
