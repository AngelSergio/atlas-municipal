<?php
/**
 * Autenticación de un solo administrador: setup inicial, login con bloqueo,
 * sesión y logout. La credencial (hash bcrypt) vive en /etc/atlas-apaseo/admin.json.
 */
declare(strict_types=1);

function admin_store(): string { return config()['paths']['admin']; }

function admin_data(): array { return json_read(admin_store(), []); }
function admin_save(array $d): bool { return json_write(admin_store(), $d); }

/** ¿Ya hay contraseña configurada? */
function admin_is_setup(): bool {
    $d = admin_data();
    return !empty($d['hash']);
}

/** Fija la contraseña por primera vez (o cuando no hay ninguna). */
function admin_setup(string $pw): bool {
    if (strlen($pw) < 10) return false;
    $d = admin_data();
    $d['hash'] = password_hash($pw, PASSWORD_BCRYPT);
    $d['created'] = date('c');
    $d['fails'] = 0;
    $d['lock_until'] = 0;
    return admin_save($d);
}

/** Cambia la contraseña verificando la actual. */
function admin_change_password(string $current, string $new): bool {
    $d = admin_data();
    if (empty($d['hash']) || !password_verify($current, $d['hash'])) return false;
    if (strlen($new) < 10) return false;
    $d['hash'] = password_hash($new, PASSWORD_BCRYPT);
    $d['changed'] = date('c');
    return admin_save($d);
}

const LOCK_THRESHOLD = 5;     // intentos antes de bloquear
const LOCK_SECONDS   = 900;   // 15 min

/** Segundos restantes de bloqueo (0 = no bloqueado). */
function admin_lock_remaining(): int {
    $d = admin_data();
    $until = (int)($d['lock_until'] ?? 0);
    return $until > time() ? $until - time() : 0;
}

/** Intenta autenticar. Devuelve true/false y gestiona bloqueo. */
function admin_login(string $pw): bool {
    $d = admin_data();
    if (admin_lock_remaining() > 0) return false;
    if (!empty($d['hash']) && password_verify($pw, $d['hash'])) {
        $d['fails'] = 0;
        $d['lock_until'] = 0;
        $d['last_login'] = date('c');
        admin_save($d);
        session_regenerate_id(true);
        $_SESSION['auth'] = true;
        $_SESSION['auth_at'] = time();
        return true;
    }
    $d['fails'] = (int)($d['fails'] ?? 0) + 1;
    if ($d['fails'] >= LOCK_THRESHOLD) {
        $d['lock_until'] = time() + LOCK_SECONDS;
        $d['fails'] = 0;
    }
    admin_save($d);
    return false;
}

function admin_logout(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/** Sesión válida (con caducidad por inactividad de 8 h). */
function is_authenticated(): bool {
    if (empty($_SESSION['auth'])) return false;
    if (time() - (int)($_SESSION['auth_at'] ?? 0) > 28800) { admin_logout(); return false; }
    $_SESSION['auth_at'] = time();
    return true;
}
