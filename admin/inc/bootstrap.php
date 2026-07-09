<?php
/**
 * Bootstrap del panel admin: carga de secretos, sesión segura y helpers.
 * Este archivo y todo /inc están bloqueados por Apache para acceso web directo.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli' && empty($_SERVER['HTTPS'])) {
    // Defensa en profundidad (además del rewrite de Apache).
    header('Location: https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ($_SERVER['REQUEST_URI'] ?? '/'));
    exit;
}

const CONFIG_FILE = '/etc/atlas-villagran/config.php';

function config(): array {
    static $cfg = null;
    if ($cfg === null) {
        if (!is_readable(CONFIG_FILE)) {
            http_response_code(500);
            exit('Configuración no disponible.');
        }
        $cfg = require CONFIG_FILE;
    }
    return $cfg;
}

/* ---- Rutas base derivadas de la URL (independientes del nombre de la carpeta) ----
   El panel siempre se sirve bajo <app>/admin/, así que la ruta se obtiene del propio
   SCRIPT_NAME. Así renombrar la carpeta del proyecto no requiere editar código. */
function admin_url_base(): string {           // p. ej. /atlas-apaseo-gde/admin
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    return $dir === '' ? '' : $dir;
}
function app_url_base(): string {              // p. ej. /atlas-apaseo-gde
    $base = admin_url_base();
    $parent = rtrim(str_replace('\\', '/', dirname($base)), '/');
    return ($parent === '' || $parent === '.') ? '' : $parent;
}

/* ---- Sesión endurecida ---- */
if (PHP_SAPI !== 'cli' && session_status() === PHP_SESSION_NONE) {
    session_name('ATLASADMIN');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => admin_url_base() . '/',   // cookie limitada al panel, sin hardcodear el nombre
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

/* ---- Cabeceras de seguridad ---- */
if (PHP_SAPI !== 'cli') {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'");
}

/* ---- Helpers ---- */
function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/**
 * <style> con las variables CSS de admin.css sobreescritas desde
 * config()['colores'] (mismo formato que municipio.config.js: primary,
 * primaryDark, primaryLight). Deriva también los tintes/sombras que
 * admin.css espera como var(--primary-tint-06|18, --primary-shadow).
 * Si la instancia no declara 'colores', no imprime nada y admin.css usa
 * su azul por defecto (Apaseo) sin cambios.
 */
function admin_theme_css(): string {
    $c = config()['colores'] ?? null;
    if (!$c || empty($c['primary'])) return '';
    $hex2rgb = function (string $hex): array {
        $hex = ltrim($hex, '#');
        if (!preg_match('/^[0-9a-fA-F]{6}$/', $hex)) return [30, 115, 190];
        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    };
    $primary      = $c['primary'];
    $primaryDark  = $c['primaryDark'] ?? $primary;
    $primaryLight = $c['primaryLight'] ?? $primary;
    [$pr, $pg, $pb] = $hex2rgb($primary);
    [$dr, $dg, $db] = $hex2rgb($primaryDark);

    $vars = sprintf(
        '--primary:%s;--primary-dark:%s;--primary-light:%s;'
        . '--primary-tint-06:rgba(%d,%d,%d,.06);--primary-tint-18:rgba(%d,%d,%d,.18);'
        . '--primary-shadow:rgba(%d,%d,%d,.28);',
        h($primary), h($primaryDark), h($primaryLight), $pr, $pg, $pb, $pr, $pg, $pb, $dr, $dg, $db
    );
    if (!empty($c['primary50']))  $vars .= '--primary-50:' . h($c['primary50']) . ';';
    if (!empty($c['primary100'])) $vars .= '--primary-100:' . h($c['primary100']) . ';';

    return '<style>:root{' . $vars . '}</style>';
}

function redirect(string $to): void { header('Location: ' . $to); exit; }

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}
function csrf_field(): string {
    return '<input type="hidden" name="_csrf" value="' . h(csrf_token()) . '">';
}
function csrf_check(): void {
    $sent = $_POST['_csrf'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        http_response_code(419);
        exit('Token CSRF inválido. Recarga la página.');
    }
}

/* ---- Flash messages ---- */
function flash(string $type, string $msg): void {
    $_SESSION['flash'][] = ['type' => $type, 'msg' => $msg];
}
function flash_take(): array {
    $f = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $f;
}

/* ---- Lectura/escritura JSON atómica ---- */
function json_read(string $path, array $default = []): array {
    if (!is_file($path)) return $default;
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') return $default;
    $d = json_decode($raw, true);
    return is_array($d) ? $d : $default;
}
function json_write(string $path, array $data): bool {
    $tmp = $path . '.tmp' . getmypid();
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    @chmod($tmp, 0640);
    return rename($tmp, $path);
}
