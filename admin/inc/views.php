<?php
/** Vistas del panel admin. Incluido al final de index.php. */
declare(strict_types=1);

function view_header(string $title): void {
    $muni = config()['municipio'] ?? 'Apaseo el Grande';
    echo '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . h($title) . ' · Atlas ' . h($muni) . '</title>';
    $app = app_url_base();
    echo '<link rel="icon" href="' . h($app) . '/assets/images/branding/favicon-32.png">';
    echo '<link rel="stylesheet" href="' . h($app) . '/assets/vendor/fontawesome/css/all.min.css">';
    echo '<link rel="stylesheet" href="assets/admin.css">';
    echo admin_theme_css();
    echo '<script>document.documentElement.classList.add("js")</script></head><body>';
    echo '<header class="topbar"><div class="brand">';
    $logo = config()['logo'] ?? 'assets/images/branding/apaseo-pc.png';
    echo '<img src="' . h($app) . '/' . h(ltrim($logo, '/')) . '" alt="" class="logo">';
    echo '<div><strong>Panel administrativo</strong><span>Atlas de Peligros y Riesgos · ' . h($muni) . '</span></div></div>';
    if (is_authenticated()) {
        echo '<form method="post" class="logout"><input type="hidden" name="action" value="logout">' . csrf_field();
        echo '<button class="btn ghost">Cerrar sesión</button></form>';
    }
    echo '</header><main class="wrap">';
    foreach (flash_take() as $f) {
        $cls = $f['type'] === 'ok' ? 'ok' : 'err';
        echo '<div class="flash ' . $cls . '">' . h($f['msg']) . '</div>';
    }
}

function view_footer(): void {
    echo '</main><footer class="foot">Protección Civil · ' . h(config()['municipio'] ?? 'Apaseo el Grande') . ' — acceso restringido</footer></body></html>';
}

/* ---------- Enrutado de vistas ---------- */
if (!admin_is_setup()) {
    view_header('Configuración inicial');
    ?>
    <div class="card narrow auth-card">
        <h1><i class="fa-solid fa-shield-halved"></i> Configuración inicial</h1>
        <p class="muted">Define la contraseña del administrador. Mínimo 10 caracteres. Se guardará cifrada (bcrypt) fuera del directorio web.</p>
        <form method="post">
            <input type="hidden" name="action" value="setup"><?= csrf_field() ?>
            <label>Contraseña<input type="password" name="password" minlength="10" required autofocus></label>
            <label>Repetir contraseña<input type="password" name="password2" minlength="10" required></label>
            <button class="btn primary"><i class="fa-solid fa-floppy-disk"></i> Guardar contraseña</button>
        </form>
    </div>
    <?php
    view_footer();
    exit;
}

if (!is_authenticated()) {
    view_header('Iniciar sesión');
    $rem = admin_lock_remaining();
    ?>
    <div class="card narrow auth-card">
        <h1><i class="fa-solid fa-right-to-bracket"></i> Iniciar sesión</h1>
        <?php if ($rem > 0): ?>
            <p class="flash err">Acceso bloqueado temporalmente. Intenta en <?= ceil($rem / 60) ?> min.</p>
        <?php endif; ?>
        <form method="post">
            <input type="hidden" name="action" value="login"><?= csrf_field() ?>
            <label>Contraseña<input type="password" name="password" required autofocus <?= $rem > 0 ? 'disabled' : '' ?>></label>
            <button class="btn primary" <?= $rem > 0 ? 'disabled' : '' ?>><i class="fa-solid fa-right-to-bracket"></i> Entrar</button>
        </form>
    </div>
    <?php
    view_footer();
    exit;
}

/* ---------- Dashboard ---------- */
$catalog = catalog_load();
$themes  = $catalog['themes'];
view_header('Capas');
?>
<div class="page-head">
    <div>
        <h1>Gestión de capas</h1>
        <p class="muted">Sube, organiza y estiliza las capas que se muestran en el visor público.</p>
    </div>
    <a class="btn ghost" href="<?= h(app_url_base()) ?>/" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Abrir visor</a>
</div>
<nav class="tab-nav" role="tablist" aria-label="Secciones del panel">
    <button type="button" class="tab-btn active" data-tab="publicar"><i class="fa-solid fa-cloud-arrow-up"></i> Publicar capa</button>
    <button type="button" class="tab-btn" data-tab="importar"><i class="fa-solid fa-file-import"></i> Importar</button>
    <button type="button" class="tab-btn" data-tab="temas"><i class="fa-solid fa-layer-group"></i> Temas</button>
    <button type="button" class="tab-btn" data-tab="capas"><i class="fa-solid fa-map"></i> Capas</button>
    <button type="button" class="tab-btn" data-tab="cuenta"><i class="fa-solid fa-sliders"></i> Ajustes</button>
</nav>
<div class="tab-panels">
    <div class="tab-panel active" id="tab-publicar" data-tab="publicar">
    <section class="card">
        <h2><i class="fa-solid fa-cloud-arrow-up"></i> Publicar nueva capa</h2>
        <p class="muted">Sube un <strong>.zip de shapefile</strong> (con .shp, .shx, .dbf, .prj), <strong>.geojson</strong>, <strong>.kml</strong> o <strong>.kmz</strong>. Se carga en PostGIS (reproyectado a WGS84), se publica en GeoServer y se agrega al visor.</p>
        <form method="post" enctype="multipart/form-data" class="publish">
            <input type="hidden" name="action" value="publish"><?= csrf_field() ?>
            <label>Archivo <span class="hint">máx <?= h(ini_get('upload_max_filesize')) ?></span>
                <input type="file" name="file" accept=".zip,.geojson,.json,.kml,.kmz" required>
            </label>
            <div class="row2">
                <label>Nombre visible
                    <input type="text" name="title" placeholder="Ej. Zonas de inundación" required>
                </label>
                <label>Tema
                    <select name="theme" required>
                        <?php foreach ($themes as $t): ?>
                            <option value="<?= h($t['id']) ?>"><?= h($t['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
            </div>
            <div class="row2">
                <label>Nombre técnico (capa/tabla) <span class="hint">opcional</span>
                    <input type="text" name="layer_name" placeholder="auto desde el archivo" pattern="[A-Za-z0-9_ -]+">
                </label>
                <label>EPSG origen <span class="hint">si no trae .prj</span>
                    <input type="text" name="src_epsg" placeholder="ej. 6365" pattern="\d{4,6}">
                </label>
            </div>
            <div class="row2">
                <label>Codificación de origen <span class="hint">acentos del shapefile</span>
                    <select name="src_encoding">
                        <option value="">Auto (usa el .cpg del archivo)</option>
                        <option value="utf-8">UTF-8</option>
                        <option value="latin1">Latin1 / ISO-8859-1</option>
                        <option value="cp1252">Windows-1252</option>
                    </select>
                </label>
                <span class="hint" style="align-self:end">Si los acentos salen mal, recarga el .zip eligiendo Latin1.</span>
            </div>
            <div class="row3">
                <label>Estilo
                    <select name="style_type">
                        <option value="">Auto según geometría</option>
                        <option value="poly-outline">Polígono — solo contorno</option>
                        <option value="poly-fill">Polígono — relleno + borde</option>
                        <option value="line">Línea</option>
                        <option value="point">Punto</option>
                    </select>
                </label>
                <label>Color
                    <input type="color" name="color" value="#1e73be">
                </label>
                <label>Grosor <span class="hint">línea/borde</span>
                    <input type="number" name="width" value="2" step="0.5" min="0" max="20">
                </label>
            </div>
            <div class="checks">
                <label class="inline"><input type="checkbox" name="visible"> Visible al cargar el visor</label>
                <label class="inline"><input type="checkbox" name="overwrite"> Sobrescribir si ya existe</label>
            </div>
            <button class="btn primary"><i class="fa-solid fa-cloud-arrow-up"></i> Cargar y publicar</button>
        </form>
    </section>
    </div>
    <div class="tab-panel" id="tab-importar" data-tab="importar">
    <section class="card">
        <h2><i class="fa-solid fa-file-import"></i> Importar capa desde un servicio</h2>
        <p class="muted">
            Algunos KMZ/KML (por ejemplo del <strong>Atlas de CENAPRED</strong>) no traen la geometría:
            son un <strong>NetworkLink</strong> que apunta a un servidor ArcGIS. Aquí se descargan los datos
            reales y se convierten a <strong>GeoJSON</strong>. Luego lo descargas y lo publicas en
            <em>“Publicar capa”</em>. Solo se permiten servicios en dominios <code>.gob.mx</code> o <code>.unam.mx</code>.
        </p>
        <form method="post" enctype="multipart/form-data" class="publish" id="import-form">
            <input type="hidden" name="action" value="import_fetch"><?= csrf_field() ?>
            <label>Archivo KMZ / KML <span class="hint">con NetworkLink</span>
                <input type="file" name="file" accept=".kml,.kmz">
            </label>
            <div class="import-or"><span>o</span></div>
            <label>URL del servicio <span class="hint">ArcGIS MapServer/FeatureServer o KmlServer</span>
                <input type="url" name="service_url" placeholder="http://…/MapServer/29  ·  o el KmlServer con LayerIDs">
            </label>
            <div class="checks">
                <label class="inline"><input type="checkbox" name="clip" value="1" checked> Recortar al municipio <span class="hint">recomendado para capas estatales</span></label>
                <label class="inline"><input type="checkbox" name="clip_exact" value="1"> Recorte exacto al borde <span class="hint">más lento</span></label>
            </div>
            <button class="btn primary" id="import-submit"><i class="fa-solid fa-cloud-arrow-down"></i> Importar y convertir</button>
        </form>
        <?php if (!empty($_SESSION['import_result'])): $ir = $_SESSION['import_result']; $hasClass = !empty($ir['renderer']) && (int)$ir['categories'] > 0; ?>
        <div class="import-result">
            <h3><i class="fa-solid fa-circle-check"></i> Capa lista</h3>
            <ul class="import-meta">
                <li><strong>Nombre:</strong> <?= h($ir['name'] !== '' ? $ir['name'] : '(sin nombre)') ?></li>
                <li><strong>Entidades:</strong> <?= (int)$ir['features'] ?></li>
                <li><strong>Geometría:</strong> <?= h($ir['geom']) ?></li>
                <?php if ($hasClass): ?>
                <li><strong>Clasificación:</strong> <?= (int)$ir['categories'] ?> categorías por <code><?= h($ir['classField']) ?></code> <span class="hint">(se conserva el color y la leyenda)</span></li>
                <?php endif; ?>
            </ul>

            <form method="post" class="import-publish">
                <input type="hidden" name="action" value="import_publish">
                <input type="hidden" name="token" value="<?= h($ir['token']) ?>"><?= csrf_field() ?>
                <div class="row2">
                    <label>Nombre visible
                        <input type="text" name="title" value="<?= h($ir['name']) ?>" required>
                    </label>
                    <label>Tema
                        <select name="theme" required>
                            <?php foreach ($themes as $t): ?>
                                <option value="<?= h($t['id']) ?>"><?= h($t['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </label>
                </div>
                <label class="inline"><input type="checkbox" name="visible"> Visible al cargar el visor</label>
                <button class="btn primary"><i class="fa-solid fa-map-location-dot"></i>
                    Publicar <?= $hasClass ? 'con estilo original' : 'en el visor' ?>
                </button>
            </form>

            <p class="hint" style="margin-top:.8rem">
                <i class="fa-solid fa-download"></i>
                ¿Prefieres revisarla antes? <a href="index.php?action=import_download&amp;token=<?= h($ir['token']) ?>">Descarga el GeoJSON</a> y publícalo manualmente en “Publicar capa”.
            </p>
        </div>
        <?php endif; ?>
    </section>
    </div>
    <div class="tab-panel" id="tab-temas" data-tab="temas">
    <section class="card" id="card-temas">
        <h2><i class="fa-solid fa-layer-group"></i> Temas / agrupaciones</h2>
        <p class="muted">Renombra, reordena, crea o elimina las agrupaciones del panel lateral del visor. Un tema solo puede eliminarse si no tiene capas.</p>
        <?php foreach ($themes as $ti => $t): $tcount = 0; foreach ($catalog['layers'] as $l) if (($l['theme'] ?? '') === $t['id']) $tcount++; ?>
            <div class="theme-row">
                <form method="post" class="theme-edit ajax-form">
                    <input type="hidden" name="action" value="theme_update">
                    <input type="hidden" name="id" value="<?= h($t['id']) ?>"><?= csrf_field() ?>
                    <input type="text" name="name" value="<?= h($t['name']) ?>" class="tname" required>
                    <input type="text" name="icon" value="<?= h($t['icon'] ?? '') ?>" class="ticon" placeholder="fa-…" title="Ícono FontAwesome (ej. fa-mountain)">
                    <span class="count" title="capas en este tema"><?= $tcount ?></span>
                    <button class="btn small">Guardar</button>
                </form>
                <div class="theme-actions">
                    <form method="post" class="ajax-form"><input type="hidden" name="action" value="theme_move"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><input type="hidden" name="dir" value="up"><?= csrf_field() ?><button class="btn icon" title="Subir" <?= $ti === 0 ? 'disabled' : '' ?>><i class="fa-solid fa-chevron-up"></i></button></form>
                    <form method="post" class="ajax-form"><input type="hidden" name="action" value="theme_move"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><input type="hidden" name="dir" value="down"><?= csrf_field() ?><button class="btn icon" title="Bajar" <?= $ti === count($themes) - 1 ? 'disabled' : '' ?>><i class="fa-solid fa-chevron-down"></i></button></form>
                    <form method="post" onsubmit="return confirm('¿Eliminar el tema “<?= h($t['name']) ?>”?');"><input type="hidden" name="action" value="theme_delete"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><?= csrf_field() ?><button class="btn icon danger" title="Eliminar tema" <?= $tcount > 0 ? 'disabled' : '' ?>><i class="fa-solid fa-trash-can"></i></button></form>
                </div>
            </div>
        <?php endforeach; ?>

        <form method="post" class="theme-add ajax-form">
            <input type="hidden" name="action" value="theme_add"><?= csrf_field() ?>
            <input type="text" name="name" placeholder="Nombre del nuevo tema" required>
            <input type="text" name="icon" placeholder="fa-layer-group" class="ticon" title="Ícono FontAwesome (opcional)">
            <button class="btn primary small"><i class="fa-solid fa-plus"></i> Crear tema</button>
        </form>

        <?php $bm = catalog_basemap($catalog); ?>
        <div class="basemap-cfg">
            <h3 class="theme"><i class="fa fa-map"></i> Grupo de mapas de fondo</h3>
            <p class="muted small">Grupo especial del visor: selector de Google (mapa, híbrido, satélite, terrain) y tráfico en tiempo real. No contiene capas WMS.</p>
            <form method="post" class="theme-edit ajax-form">
                <input type="hidden" name="action" value="basemap_update"><?= csrf_field() ?>
                <input type="text" name="name" value="<?= h($bm['name']) ?>" class="tname">
                <input type="text" name="icon" value="<?= h($bm['icon']) ?>" class="ticon" placeholder="fa-map" title="Ícono FontAwesome">
                <label class="inline"><input type="checkbox" name="enabled" <?= !empty($bm['enabled']) ? 'checked' : '' ?>> Mostrar en el visor</label>
                <button class="btn small">Guardar</button>
            </form>
        </div>
    </section>
    </div>
    <div class="tab-panel" id="tab-capas" data-tab="capas">
    <section class="card" id="card-capas">
        <h2><i class="fa-solid fa-map"></i> Capas del visor</h2>
        <?php
        $byTheme = [];
        foreach ($catalog['layers'] as $l) $byTheme[$l['theme'] ?? ''][] = $l;
        foreach ($themes as $t):
            $rows = $byTheme[$t['id']] ?? [];
            usort($rows, fn($a, $b) => ((int)($a['order'] ?? 0)) <=> ((int)($b['order'] ?? 0)));
        ?>
            <h3 class="theme"><i class="fa <?= h($t['icon']) ?>"></i> <?= h($t['name']) ?> <span class="count"><?= count($rows) ?></span></h3>
            <?php if (!$rows): ?>
                <p class="muted small">Sin capas.</p>
            <?php else: foreach ($rows as $l): ?>
                <?php
                    $geom    = $l['geom'] ?? '';
                    $allowed = sld_allowed_types($geom);
                    $curType = $l['style_type'] ?? array_key_first($allowed);
                    if (!isset($allowed[$curType])) $curType = array_key_first($allowed);
                    $curColor = $l['color'] ?? '#1e73be';
                    $curW     = $l['width'] ?? 2;
                ?>
                <div class="layer">
                    <div class="layer-head">
                        <button type="button" class="layer-toggle" aria-expanded="false" aria-label="Editar <?= h($l['name']) ?>">
                            <i class="fa-solid fa-chevron-right caret"></i>
                            <span class="lname-display"><?= h($l['name']) ?></span>
                            <code class="lid"><?= h($l['layer']) ?></code>
                            <?php if (empty($l['visible'])): ?><i class="fa-regular fa-eye-slash off" title="Oculta al cargar"></i><?php endif; ?>
                        </button>
                        <div class="layer-order">
                            <?php foreach (['up' => 'fa-arrow-up', 'down' => 'fa-arrow-down'] as $dir => $ico): ?>
                                <form method="post" class="layer-move-form"><input type="hidden" name="action" value="layer_move"><input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><input type="hidden" name="dir" value="<?= $dir ?>"><?= csrf_field() ?><button class="btn icon" title="Mover <?= $dir ?>"><i class="fa-solid <?= $ico ?>"></i></button></form>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <div class="layer-body">
                        <form method="post" class="layer-edit ajax-form">
                            <input type="hidden" name="action" value="layer_update">
                            <input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                            <input type="text" name="name" value="<?= h($l['name']) ?>" class="lname">
                            <select name="theme" class="ltheme">
                                <?php foreach ($themes as $tt): ?>
                                    <option value="<?= h($tt['id']) ?>" <?= ($tt['id'] === ($l['theme'] ?? '')) ? 'selected' : '' ?>><?= h($tt['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <label class="inline" title="Visible al cargar"><input type="checkbox" name="visible" <?= !empty($l['visible']) ? 'checked' : '' ?>> <i class="fa-regular fa-eye"></i></label>
                            <button class="btn small">Guardar</button>
                        </form>
                        <form method="post" class="layer-style ajax-form" title="Geometría: <?= h($geom ?: 'desconocida') ?>">
                            <input type="hidden" name="action" value="layer_style">
                            <input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                            <?php if (count($allowed) > 1): ?>
                                <select name="style_type" class="lstype">
                                    <?php foreach ($allowed as $k => $lab): ?>
                                        <option value="<?= h($k) ?>" <?= $k === $curType ? 'selected' : '' ?>><?= h($lab) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            <?php else: ?>
                                <input type="hidden" name="style_type" value="<?= h((string)array_key_first($allowed)) ?>">
                                <span class="stype-fixed"><?= h((string)reset($allowed)) ?></span>
                            <?php endif; ?>
                            <input type="color" name="color" value="<?= h($curColor) ?>" title="Color">
                            <input type="number" name="width" value="<?= h((string)$curW) ?>" step="0.5" min="0" max="20" class="lw" title="Grosor de línea/borde">
                            <button class="btn small">Aplicar estilo</button>
                        </form>
                        <?php
                            $an      = $l['analisis'] ?? [];
                            $anRole  = is_array($an) ? ($an['role'] ?? '') : '';
                            $anField = is_array($an) ? ($an['field'] ?? '') : '';
                            $cols    = pg_columns($l['layer']);
                            $roleOpts = ['' => '— No usar —', 'colonia' => 'Colonia (contexto)', 'poblacion' => 'Población (contexto)', 'peligro' => 'Peligro', 'equipamiento' => 'Equipamiento expuesto', 'apoyo' => 'Apoyo / Refugio'];
                        ?>
                        <form method="post" class="layer-analysis ajax-form" title="Papel de esta capa en el Análisis de riesgo por ubicación">
                            <input type="hidden" name="action" value="layer_analysis">
                            <input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                            <span class="la-label"><i class="fa-solid fa-magnifying-glass-location"></i> Análisis</span>
                            <select name="role" class="la-role">
                                <?php foreach ($roleOpts as $rk => $rlab): ?>
                                    <option value="<?= h($rk) ?>" <?= $rk === $anRole ? 'selected' : '' ?>><?= h($rlab) ?></option>
                                <?php endforeach; ?>
                            </select>
                            <?php if ($cols): ?>
                                <select name="field" class="la-field" title="Campo (población a sumar, nombre de colonia, o nivel de peligro)">
                                    <option value="">— Campo (auto) —</option>
                                    <?php foreach ($cols as $col): ?>
                                        <option value="<?= h($col) ?>" <?= $col === $anField ? 'selected' : '' ?>><?= h($col) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            <?php else: ?>
                                <input type="text" name="field" value="<?= h($anField) ?>" class="la-field" placeholder="campo (opcional)">
                            <?php endif; ?>
                            <button class="btn small">Guardar</button>
                        </form>
                        <div class="layer-foot">
                            <form method="post" class="del" onsubmit="return confirm('¿Eliminar <?= h($l['layer']) ?> del catálogo?\n\nMarca PURGAR antes para borrarla también de GeoServer y PostGIS (irreversible).');">
                                <input type="hidden" name="action" value="layer_delete"><input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                                <label class="inline danger" title="Borrar de GeoServer y PostGIS"><input type="checkbox" name="purge"> purgar</label>
                                <button class="btn icon danger" title="Eliminar"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endforeach; endif; ?>
        <?php endforeach; ?>

        <form method="post" class="regen">
            <input type="hidden" name="action" value="regenerate"><?= csrf_field() ?>
            <button class="btn ghost"><i class="fa-solid fa-arrows-rotate"></i> Regenerar municipio.layers.js</button>
            <a class="btn ghost" href="<?= h(app_url_base()) ?>/" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Abrir visor</a>
        </form>
    </section>
    </div>
    <div class="tab-panel" id="tab-cuenta" data-tab="cuenta">
    <?php
        $pdfPath = dirname(config()['paths']['layersjs']) . '/pdf/atlas_municipal.pdf';
        $pdfExists = is_file($pdfPath);
    ?>
    <section class="card narrow">
        <h2><i class="fa-solid fa-file-pdf"></i> Documento del Atlas (PDF)</h2>
        <p class="muted">Este es el PDF oficial que se descarga desde el botón <strong>“información”</strong> del visor. Sube aquí el Atlas de tu municipio; reemplaza al anterior.</p>
        <?php if ($pdfExists): ?>
            <p class="hint" style="margin-bottom:.8rem">
                <i class="fa-solid fa-circle-check" style="color:var(--ok,#2e9e5b)"></i>
                Actual: <a href="../pdf/atlas_municipal.pdf" target="_blank" rel="noopener">atlas_municipal.pdf</a>
                (<?= number_format(filesize($pdfPath) / 1048576, 1) ?> MB · <?= h(date('Y-m-d', filemtime($pdfPath))) ?>)
            </p>
        <?php else: ?>
            <p class="hint" style="margin-bottom:.8rem"><i class="fa-solid fa-triangle-exclamation" style="color:#c98a00"></i> Aún no hay documento cargado.</p>
        <?php endif; ?>
        <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="action" value="atlas_pdf"><?= csrf_field() ?>
            <label>Archivo PDF <span class="hint">máx <?= h(ini_get('upload_max_filesize')) ?></span>
                <input type="file" name="pdf" accept="application/pdf,.pdf" required>
            </label>
            <button class="btn primary"><i class="fa-solid fa-cloud-arrow-up"></i> Subir documento</button>
        </form>
    </section>
    <section class="card narrow">
        <h2><i class="fa-solid fa-key"></i> Cambiar contraseña</h2>
        <form method="post">
            <input type="hidden" name="action" value="change_password"><?= csrf_field() ?>
            <label>Contraseña actual<input type="password" name="current" required></label>
            <label>Nueva contraseña<input type="password" name="new" minlength="10" required></label>
            <button class="btn primary"><i class="fa-solid fa-floppy-disk"></i> Actualizar</button>
        </form>
    </section>
    </div>
</div>
<script>
// Acordeón de capas: una sola tarjeta abierta a la vez. Al hacer clic en la
// cabecera se expande para editar; al abrir otra (o volver a hacer clic) se colapsa.
// Las flechas de orden están fuera de .layer-toggle, así que no expanden.
document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.layer-toggle');
    if (!toggle) return;
    var card = toggle.closest('.layer');
    var wasOpen = card.classList.contains('open');
    document.querySelectorAll('.layer.open').forEach(function (c) {
        c.classList.remove('open');
        var t = c.querySelector('.layer-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
        card.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
    }
});

// Reordenar capas (flechas ↑/↓) sin recargar la página: fetch + mover la tarjeta
// en el DOM. Si algo falla, recarga normal (fallback).
document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('layer-move-form')) return;
    var card = form.closest('.layer');
    var dirInput = form.querySelector('[name=dir]');
    var dir = dirInput ? dirInput.value : '';
    if (!card || !dir) return;
    // Tarjeta vecina dentro del mismo tema (el <h3> del tema corta el grupo).
    var sib = dir === 'up' ? card.previousElementSibling : card.nextElementSibling;
    e.preventDefault();
    if (!sib || !sib.classList.contains('layer')) return; // borde: nada que mover
    var fd = new FormData(form);
    fd.append('ajax', '1');
    fetch('index.php', { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) {
            if (!d || !d.ok) throw 0;
            if (dir === 'up') card.parentNode.insertBefore(card, sib);
            else            card.parentNode.insertBefore(sib, card);
            card.classList.remove('moved'); void card.offsetWidth; // reinicia la animación
            card.classList.add('moved');
            (d.flash || []).forEach(function (f) { adminToast(f.msg, f.type); });
        })
        .catch(function () { form.submit(); }); // fallback: recarga normal
});

// Resto de acciones (guardar capa, aplicar estilo, temas: crear/renombrar/reordenar,
// mapas de fondo) sin recargar: fetch + refresco parcial de las dos tarjetas dinámicas.
document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('ajax-form')) return;
    e.preventDefault();
    var actionInput = form.querySelector('[name=action]');
    var action = actionInput ? actionInput.value : '';
    var fd = new FormData(form);
    fd.append('ajax', '1');
    document.body.classList.add('is-busy');
    fetch('index.php', { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) {
            (d && d.flash || []).forEach(function (f) { adminToast(f.msg, f.type); });
            // El estilo se aplica en GeoServer y no altera la UI del panel: basta el toast.
            if (action === 'layer_style') return;
            return refreshAdminSections();
        })
        .catch(function () { form.submit(); }) // fallback: recarga normal
        .then(function () { document.body.classList.remove('is-busy'); });
});

// Re-pide la página y reemplaza solo las tarjetas Temas y Capas (estado del servidor).
function refreshAdminSections() {
    return fetch('index.php', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(function (r) { return r.text(); })
        .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            ['card-temas', 'card-capas'].forEach(function (id) {
                var fresh = doc.getElementById(id), cur = document.getElementById(id);
                if (fresh && cur) cur.replaceWith(document.importNode(fresh, true));
            });
        });
}

// Notificación efímera (toast).
function adminToast(msg, type) {
    var box = document.getElementById('admin-toasts');
    if (!box) { box = document.createElement('div'); box.id = 'admin-toasts'; document.body.appendChild(box); }
    var t = document.createElement('div');
    t.className = 'toast ' + (type === 'error' ? 'toast-err' : 'toast-ok');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, 2600);
}

// Pestañas: muestra una sección a la vez. La pestaña activa se recuerda (localStorage)
// para sobrevivir recargas (publicar capa, cambiar contraseña) y los refrescos parciales
// no la afectan porque envuelven a las secciones, no a los paneles.
function activateAdminTab(name) {
    var any = false;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
        var on = b.getAttribute('data-tab') === name; b.classList.toggle('active', on); if (on) any = true;
    });
    if (!any) return false;
    document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-tab') === name);
    });
    return true;
}
document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    var name = btn.getAttribute('data-tab');
    activateAdminTab(name);
    try { localStorage.setItem('admin-tab', name); } catch (err) {}
});
(function () {
    var saved; try { saved = localStorage.getItem('admin-tab'); } catch (err) {}
    if (saved) activateAdminTab(saved);
    // Tras importar, mostrar siempre la pestaña con el resultado.
    if (document.querySelector('.import-result')) activateAdminTab('importar');
})();

// Importar puede tardar unos segundos (descarga remota): estado de carga.
(function () {
    var f = document.getElementById('import-form');
    if (!f) return;
    f.addEventListener('submit', function () {
        var b = document.getElementById('import-submit');
        if (b) { b.disabled = true; b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importando…'; }
    });
})();
</script>
<?php
view_footer();
