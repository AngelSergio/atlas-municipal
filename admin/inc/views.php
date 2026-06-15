<?php
/** Vistas del panel admin. Incluido al final de index.php. */
declare(strict_types=1);

function view_header(string $title): void {
    $muni = 'Apaseo el Grande';
    echo '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . h($title) . ' · Atlas ' . h($muni) . '</title>';
    echo '<link rel="icon" href="/atlas-apaseo-gde/assets/images/branding/favicon-32.png">';
    echo '<link rel="stylesheet" href="assets/admin.css"></head><body>';
    echo '<header class="topbar"><div class="brand">';
    echo '<img src="/atlas-apaseo-gde/assets/images/branding/apaseo-pc.png" alt="" class="logo">';
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
    echo '</main><footer class="foot">Protección Civil · ' . h('Apaseo el Grande') . ' — acceso restringido</footer></body></html>';
}

/* ---------- Enrutado de vistas ---------- */
if (!admin_is_setup()) {
    view_header('Configuración inicial');
    ?>
    <div class="card narrow">
        <h1>Configuración inicial</h1>
        <p class="muted">Define la contraseña del administrador. Mínimo 10 caracteres. Se guardará cifrada (bcrypt) fuera del directorio web.</p>
        <form method="post">
            <input type="hidden" name="action" value="setup"><?= csrf_field() ?>
            <label>Contraseña<input type="password" name="password" minlength="10" required autofocus></label>
            <label>Repetir contraseña<input type="password" name="password2" minlength="10" required></label>
            <button class="btn primary">Guardar contraseña</button>
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
    <div class="card narrow">
        <h1>Iniciar sesión</h1>
        <?php if ($rem > 0): ?>
            <p class="flash err">Acceso bloqueado temporalmente. Intenta en <?= ceil($rem / 60) ?> min.</p>
        <?php endif; ?>
        <form method="post">
            <input type="hidden" name="action" value="login"><?= csrf_field() ?>
            <label>Contraseña<input type="password" name="password" required autofocus <?= $rem > 0 ? 'disabled' : '' ?>></label>
            <button class="btn primary" <?= $rem > 0 ? 'disabled' : '' ?>>Entrar</button>
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
<div class="grid">
    <section class="card">
        <h2>Publicar nueva capa</h2>
        <p class="muted">Sube un <strong>.zip de shapefile</strong> (con .shp, .shx, .dbf, .prj), <strong>.geojson</strong> o <strong>.kml</strong>. Se carga en PostGIS (reproyectado a WGS84), se publica en GeoServer y se agrega al visor.</p>
        <form method="post" enctype="multipart/form-data" class="publish">
            <input type="hidden" name="action" value="publish"><?= csrf_field() ?>
            <label>Archivo <span class="hint">máx <?= h(ini_get('upload_max_filesize')) ?></span>
                <input type="file" name="file" accept=".zip,.geojson,.json,.kml" required>
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
            <button class="btn primary">Cargar y publicar</button>
        </form>
    </section>

    <section class="card">
        <h2>Temas / agrupaciones</h2>
        <p class="muted">Renombra, reordena, crea o elimina las agrupaciones del panel lateral del visor. Un tema solo puede eliminarse si no tiene capas.</p>
        <?php foreach ($themes as $ti => $t): $tcount = 0; foreach ($catalog['layers'] as $l) if (($l['theme'] ?? '') === $t['id']) $tcount++; ?>
            <div class="theme-row">
                <form method="post" class="theme-edit">
                    <input type="hidden" name="action" value="theme_update">
                    <input type="hidden" name="id" value="<?= h($t['id']) ?>"><?= csrf_field() ?>
                    <input type="text" name="name" value="<?= h($t['name']) ?>" class="tname" required>
                    <input type="text" name="icon" value="<?= h($t['icon'] ?? '') ?>" class="ticon" placeholder="fa-…" title="Ícono FontAwesome (ej. fa-mountain)">
                    <span class="count" title="capas en este tema"><?= $tcount ?></span>
                    <button class="btn small">Guardar</button>
                </form>
                <div class="theme-actions">
                    <form method="post"><input type="hidden" name="action" value="theme_move"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><input type="hidden" name="dir" value="up"><?= csrf_field() ?><button class="btn icon" title="Subir" <?= $ti === 0 ? 'disabled' : '' ?>>▲</button></form>
                    <form method="post"><input type="hidden" name="action" value="theme_move"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><input type="hidden" name="dir" value="down"><?= csrf_field() ?><button class="btn icon" title="Bajar" <?= $ti === count($themes) - 1 ? 'disabled' : '' ?>>▼</button></form>
                    <form method="post" onsubmit="return confirm('¿Eliminar el tema “<?= h($t['name']) ?>”?');"><input type="hidden" name="action" value="theme_delete"><input type="hidden" name="id" value="<?= h($t['id']) ?>"><?= csrf_field() ?><button class="btn icon danger" title="Eliminar tema" <?= $tcount > 0 ? 'disabled' : '' ?>>🗑</button></form>
                </div>
            </div>
        <?php endforeach; ?>

        <form method="post" class="theme-add">
            <input type="hidden" name="action" value="theme_add"><?= csrf_field() ?>
            <input type="text" name="name" placeholder="Nombre del nuevo tema" required>
            <input type="text" name="icon" placeholder="fa-layer-group" class="ticon" title="Ícono FontAwesome (opcional)">
            <button class="btn primary small">+ Crear tema</button>
        </form>

        <?php $bm = catalog_basemap($catalog); ?>
        <div class="basemap-cfg">
            <h3 class="theme"><i class="fa fa-map"></i> Grupo de mapas de fondo</h3>
            <p class="muted small">Grupo especial del visor: selector de Google (mapa, híbrido, satélite, terrain) y tráfico en tiempo real. No contiene capas WMS.</p>
            <form method="post" class="theme-edit">
                <input type="hidden" name="action" value="basemap_update"><?= csrf_field() ?>
                <input type="text" name="name" value="<?= h($bm['name']) ?>" class="tname">
                <input type="text" name="icon" value="<?= h($bm['icon']) ?>" class="ticon" placeholder="fa-map" title="Ícono FontAwesome">
                <label class="inline"><input type="checkbox" name="enabled" <?= !empty($bm['enabled']) ? 'checked' : '' ?>> Mostrar en el visor</label>
                <button class="btn small">Guardar</button>
            </form>
        </div>
    </section>

    <section class="card">
        <h2>Capas del visor</h2>
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
                <div class="layer">
                    <form method="post" class="layer-edit">
                        <input type="hidden" name="action" value="layer_update">
                        <input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                        <input type="text" name="name" value="<?= h($l['name']) ?>" class="lname">
                        <code class="lid"><?= h($l['layer']) ?></code>
                        <select name="theme" class="ltheme">
                            <?php foreach ($themes as $tt): ?>
                                <option value="<?= h($tt['id']) ?>" <?= ($tt['id'] === ($l['theme'] ?? '')) ? 'selected' : '' ?>><?= h($tt['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <label class="inline" title="Visible al cargar"><input type="checkbox" name="visible" <?= !empty($l['visible']) ? 'checked' : '' ?>> 👁</label>
                        <button class="btn small">Guardar</button>
                    </form>
                    <?php
                        $geom    = $l['geom'] ?? '';
                        $allowed = sld_allowed_types($geom);
                        $curType = $l['style_type'] ?? array_key_first($allowed);
                        if (!isset($allowed[$curType])) $curType = array_key_first($allowed);
                        $curColor = $l['color'] ?? '#1e73be';
                        $curW     = $l['width'] ?? 2;
                    ?>
                    <form method="post" class="layer-style" title="Geometría: <?= h($geom ?: 'desconocida') ?>">
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
                    <div class="layer-actions">
                        <?php foreach (['up' => '▲', 'down' => '▼'] as $dir => $sym): ?>
                            <form method="post"><input type="hidden" name="action" value="layer_move"><input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><input type="hidden" name="dir" value="<?= $dir ?>"><?= csrf_field() ?><button class="btn icon" title="Mover <?= $dir ?>"><?= $sym ?></button></form>
                        <?php endforeach; ?>
                        <form method="post" class="del" onsubmit="return confirm('¿Eliminar <?= h($l['layer']) ?> del catálogo?\n\nMarca PURGAR antes para borrarla también de GeoServer y PostGIS (irreversible).');">
                            <input type="hidden" name="action" value="layer_delete"><input type="hidden" name="layer" value="<?= h($l['layer']) ?>"><?= csrf_field() ?>
                            <label class="inline danger" title="Borrar de GeoServer y PostGIS"><input type="checkbox" name="purge"> purgar</label>
                            <button class="btn icon danger" title="Eliminar">🗑</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; endif; ?>
        <?php endforeach; ?>

        <form method="post" class="regen">
            <input type="hidden" name="action" value="regenerate"><?= csrf_field() ?>
            <button class="btn ghost">Regenerar municipio.layers.js</button>
            <a class="btn ghost" href="/atlas-apaseo-gde/" target="_blank">Abrir visor ↗</a>
        </form>
    </section>

    <section class="card narrow">
        <h2>Cambiar contraseña</h2>
        <form method="post">
            <input type="hidden" name="action" value="change_password"><?= csrf_field() ?>
            <label>Contraseña actual<input type="password" name="current" required></label>
            <label>Nueva contraseña<input type="password" name="new" minlength="10" required></label>
            <button class="btn">Actualizar</button>
        </form>
    </section>
</div>
<?php
view_footer();
