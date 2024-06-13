<?php
// kill previous session if exists.
session_start();
$has_session = session_status() == PHP_SESSION_ACTIVE;
if ($has_session) {
    session_unset();
    session_destroy();
}

// Set secure session settings
ini_set('session.cookie_secure', 1);  // Ensure cookies are sent over HTTPS only
ini_set('session.cookie_httponly', 1); // Prevent JavaScript access to session cookie
ini_set('session.use_strict_mode', 1); // Use strict mode for sessions
ini_set('session.cookie_samesite', "Strict"); // Use strict mode for sessions
ini_set('session.gc_maxlifetime', 15 * 60); // Use strict mode for sessions

// Start the session
session_start();

if (!isset($_SESSION['nonce'])) {
    $_SESSION['nonce'] = base64_encode(random_bytes(16));
}

$nonce = $_SESSION['nonce'];


header("Content-Security-Policy: default-src 'self'; " .
    "script-src 'self' 'nonce-" . $nonce . "' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://code.jquery.com; " .
    "style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " .
    "font-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " .
    "object-src 'none';");



require 'php_functions.php';

// Regenerate session ID to prevent session fixation
session_regenerate_id(true);
?>