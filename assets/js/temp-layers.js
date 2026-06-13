
(function(){
  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c] || c;
    });
  }

  function getCleanName(name){
    var s = String(name || 'Capa temporal');
    s = s.replace(/<[^>]*>/g, '').replace(/\.(shp\.zip|kml|kmz|zip)$/ig, '').trim();
    return s || 'Capa temporal';
  }

  window.setupAtlasTempLayers = function(opts){
    var map = opts.map;
    var ol = opts.ol;
    var showToast = opts.showToast || function(){};
    var showFeatureInfo = opts.showFeatureInfo || null;
    var tempLayers = [];
    var colorIndex = 0;
    var colors = ['#1b4e7b','#00897b','#ef6c00','#2e7d32','#1565c0','#1466ad','#6d4c41','#6a1b9a'];

    function nextColor(){
      var c = colors[colorIndex % colors.length];
      colorIndex += 1;
      return c;
    }

    function ensureInput(){
      var input = document.getElementById('temp-layer-upload-input');
      if (input) return input;
      input = document.createElement('input');
      input.id = 'temp-layer-upload-input';
      input.type = 'file';
      input.accept = '.kml,.kmz,.zip';
      input.multiple = true;
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.style.top = '-9999px';
      document.body.appendChild(input);
      input.addEventListener('change', function(){
        var files = Array.prototype.slice.call(input.files || []);
        input.value = '';
        files.forEach(function(file){ handleFile(file); });
      });
      return input;
    }

    function fitToSource(source){
      try {
        var ext = source.getExtent();
        if (!ext || ext[0] === Infinity || ext[2] === -Infinity) return;
        map.getView().fit(ext, { padding:[60,60,60,60], duration:450, maxZoom: 19 });
      } catch(_e){}
    }

    function makeDefaultStyle(color){
      var fill = 'rgba(123, 27, 50, 0.18)';
      var stroke = color || '#1b4e7b';
      return function(feature){
        var geom = feature && feature.getGeometry ? feature.getGeometry() : null;
        var type = geom && geom.getType ? geom.getType() : '';
        if (type === 'Polygon' || type === 'MultiPolygon') {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({ color: stroke, width: 2.5 }),
            fill: new ol.style.Fill({ color: fill })
          });
        }
        if (type === 'LineString' || type === 'MultiLineString') {
          return new ol.style.Style({
            stroke: new ol.style.Stroke({ color: stroke, width: 3 })
          });
        }
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: '#ffffff' }),
            stroke: new ol.style.Stroke({ color: stroke, width: 2.5 })
          })
        });
      };
    }

    function buildTempGroup(){
      var tree = document.getElementById('layer-tree');
      if (!tree) return null;
      var group = document.getElementById('temp-layers-group');
      if (group) return group;

      group = document.createElement('div');
      group.id = 'temp-layers-group';
      group.className = 'layer-group temp-layers-group';
      group.innerHTML = [
        '<div class="layer-group-header collapsed" id="temp-layers-header">',
          '<i class="fas fa-chevron-down toggle"></i>',
          '<i class="fas fa-paperclip icon"></i>',
          '<span class="group-title">Capas temporales</span>',
          '<span class="temp-count is-hidden" id="temp-layers-count">0</span>',
        '</div>',
        '<div class="layer-group-content collapsed" id="temp-layers-content"></div>'
      ].join('');

      var temasGroup = tree.querySelector('.layer-group');
      if (temasGroup && temasGroup.nextSibling) {
        tree.insertBefore(group, temasGroup.nextSibling);
      } else if (temasGroup) {
        tree.appendChild(group);
      } else {
        tree.prepend(group);
      }
      var header = group.querySelector('#temp-layers-header');
      var content = group.querySelector('#temp-layers-content');
      header.addEventListener('click', function(e){
        if (e.target.closest('.temp-header-action')) return;
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      });
      return group;
    }

    function expandTempGroup(){
      var header = document.getElementById('temp-layers-header');
      var content = document.getElementById('temp-layers-content');
      if (!header || !content) return;
      header.classList.remove('collapsed');
      content.classList.remove('collapsed');
    }

    function refreshTempList(){
      buildTempGroup();
      var countEl = document.getElementById('temp-layers-count');
      var content = document.getElementById('temp-layers-content');
      if (!content) return;
      countEl.textContent = String(tempLayers.length);
      countEl.classList.toggle('is-hidden', tempLayers.length === 0);
      if (!tempLayers.length) {
        content.innerHTML = '<div class="temp-empty">Adjunta archivos KML, KMZ o SHP-ZIP para verlos aquí.</div>';
        return;
      }
      content.innerHTML = '';
      tempLayers.forEach(function(entry, idx){
        var row = document.createElement('div');
        row.className = 'layer-item temp-layer-item';
        row.innerHTML = [
          '<div class="layer-item-left">',
            '<input type="checkbox" class="layer-checkbox temp-layer-checkbox" ' + (entry.layer.getVisible() ? 'checked' : '') + '>',
            '<div class="layer-legend temp-layer-swatch" style="background:' + escapeHtml(entry.color || '#1b4e7b') + '"></div>',
            '<span class="layer-name" title="' + escapeHtml(entry.name) + '">' + escapeHtml(entry.name) + '</span>',
          '</div>',
          '<div class="temp-layer-actions">',
            '<button type="button" class="temp-layer-action" data-action="zoom" data-index="' + idx + '" title="Acercar a la capa"><i class="fas fa-search-plus"></i></button>',
            '<button type="button" class="temp-layer-action" data-action="remove" data-index="' + idx + '" title="Quitar capa"><i class="fas fa-trash"></i></button>',
          '</div>'
        ].join('');
        var checkbox = row.querySelector('.temp-layer-checkbox');
        checkbox.addEventListener('change', function(){
          entry.layer.setVisible(checkbox.checked);
        });
        row.querySelectorAll('.temp-layer-action').forEach(function(btn){
          btn.addEventListener('click', function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            var action = btn.dataset.action;
            var i = parseInt(btn.dataset.index, 10);
            var item = tempLayers[i];
            if (!item) return;
            if (action === 'zoom') {
              fitToSource(item.source);
            } else if (action === 'remove') {
              removeTempLayer(item.id);
            }
          });
        });
        content.appendChild(row);
      });
    }

    function removeTempLayer(id){
      var idx = tempLayers.findIndex(function(item){ return item.id === id; });
      if (idx < 0) return;
      var entry = tempLayers[idx];
      try { map.removeLayer(entry.layer); } catch(_e){}
      tempLayers.splice(idx, 1);
      refreshTempList();
      showToast('Capa temporal eliminada', 'success');
    }

    function addVectorLayer(name, features, options){
      if (!features || !features.length) {
        showToast('No se encontraron geometrías en el archivo', 'error');
        return;
      }
      var source = new ol.source.Vector({ features: features });
      var id = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      var cleanName = getCleanName(name);
      var color = nextColor();
      var useDefaultStyle = !options || options.sourceType === 'shpzip';
      var layer = new ol.layer.Vector({
        source: source,
        visible: true,
        zIndex: 6999,
        style: useDefaultStyle ? makeDefaultStyle(color) : undefined,
        properties: {
          name: cleanName,
          layerKey: id,
          cp_temp_layer: true
        }
      });
      try { layer.set('cp_temp_layer', true); } catch(_e){}
      try { layer.set('title', cleanName); } catch(_e){}
      features.forEach(function(f){
        try { f.set('layerObject', layer); } catch(_e){}
      });
      map.addLayer(layer);
      tempLayers.push({ id:id, name:cleanName, layer:layer, source:source, color:color });
      refreshTempList();
      expandTempGroup();
      fitToSource(source);
      showToast('Capa adjuntada: ' + cleanName, 'success');
    }

    async function handleFile(file){
      var fname = file && file.name ? file.name : 'Capa temporal';
      var lower = fname.toLowerCase();
      try {
        if (lower.endsWith('.kml')) {
          var text = await file.text();
          var kml = new ol.format.KML({ extractStyles: true });
          var feats = kml.readFeatures(text, { featureProjection: 'EPSG:3857' });
          addVectorLayer(fname, feats, { sourceType: 'kml' });
          return;
        }
        if (lower.endsWith('.kmz')) {
          if (!window.JSZip) {
            showToast('No se encontró JSZip para leer KMZ', 'error');
            return;
          }
          var ab = await file.arrayBuffer();
          var zip = await window.JSZip.loadAsync(ab);
          var kmlFile = null;
          zip.forEach(function(path, entry){
            if (!kmlFile && /\.kml$/i.test(path)) kmlFile = entry;
          });
          if (!kmlFile) {
            showToast('El KMZ no contiene un archivo KML', 'error');
            return;
          }
          var kmlText = await kmlFile.async('text');
          var kml2 = new ol.format.KML({ extractStyles: true });
          var feats2 = kml2.readFeatures(kmlText, { featureProjection: 'EPSG:3857' });
          addVectorLayer(fname, feats2, { sourceType: 'kmz' });
          return;
        }
        if (lower.endsWith('.zip')) {
          if (typeof window.shp !== 'function') {
            showToast('No se encontró shpjs para leer SHP-ZIP', 'error');
            return;
          }
          var ab2 = await file.arrayBuffer();
          var geojson = await window.shp(ab2);
          var gj = new ol.format.GeoJSON();
          var feats3 = gj.readFeatures(geojson, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
          addVectorLayer(fname, feats3, { sourceType: 'shpzip' });
          return;
        }
        showToast('Formato no soportado: ' + fname, 'error');
      } catch(err) {
        console.error(err);
        showToast('No se pudo cargar el archivo: ' + fname, 'error');
      }
    }

    function openPicker(){
      ensureInput().click();
    }

    function bindButton(){
      var btn = document.getElementById('btn-upload-layer');
      if (!btn || btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function(){ openPicker(); });
    }

    function handleTempMapClick(evt){
      var handled = false;
      try {
        map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
          if (handled) return true;
          try {
            if (!layer || !layer.get || layer.get('cp_temp_layer') !== true) return false;
            var props = Object.assign({}, feature.getProperties ? feature.getProperties() : {});
            delete props.geometry;
            delete props.layerObject;
            if (showFeatureInfo) {
              showFeatureInfo({ properties: props }, layer.get('name') || 'Capa temporal');
            }
            handled = true;
            return true;
          } catch(_e){ return false; }
        }, { hitTolerance: 6 });
      } catch(_e){}
      return handled;
    }

    ensureInput();
    bindButton();
    refreshTempList();

    function hideAllTempLayers(){
      var hidden = 0;
      tempLayers.forEach(function(entry){
        try {
          if (entry.layer && entry.layer.getVisible && entry.layer.getVisible()) {
            entry.layer.setVisible(false);
            hidden += 1;
          }
        } catch(_e){}
      });
      refreshTempList();
      return hidden;
    }

    window.AtlasTempLayers = {
      open: openPicker,
      handleMapClick: handleTempMapClick,
      refreshList: refreshTempList,
      hideAll: hideAllTempLayers
    };
  };
})();
