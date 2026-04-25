<?php
/**
 * AgroSmart - Login Handler (PHP)
 * Authenticates users using email and password.
 * Uses password_verify() for secure bcrypt password checking.
 */

session_start();
require_once __DIR__ . '/db_config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'message' => 'Method not allowed. Use POST.'], 405);
}

// Get input data
$contentType = isset($_SERVER['CONTENT_TYPE']) ? trim($_SERVER['CONTENT_TYPE']) : '';

if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

$email    = isset($input['email'])    ? trim(strtolower($input['email']))    : '';
$password = isset($input['password']) ? $input['password']                    : '';

// ─── Validation ──────────────────────────────────────────
$errors = [];

if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (empty($password)) {
    $errors[] = 'Password is required.';
}

if (!empty($errors)) {
    sendJSON([
        'success' => false,
        'message' => 'Validation failed.',
        'errors'  => $errors
    ], 422);
}

// ─── Authenticate User ──────────────────────────────────
try {
    $stmt = $pdo->prepare("SELECT id, full_name, email, password_hash FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJSON([
            'success' => false,
            'message' => 'No account found with this email address. Please sign up first.'
        ], 401);
    }

    // Verify password against bcrypt hash
    if (!password_verify($password, $user['password_hash'])) {
        sendJSON([
            'success' => false,
            'message' => 'Incorrect password. Please try again.'
        ], 401);
    }

    // Set session variables
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_name'] = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['logged_in']  = true;

    sendJSON([
        'success' => true,
        'message' => 'Login successful! Welcome back, ' . $user['full_name'] . '!',
        'data'    => [
            'id'    => $user['id'],
            'name'  => $user['full_name'],
            'email' => $user['email']
        ]
    ], 200);

} catch (PDOException $e) {
    sendJSON([
        'success' => false,
        'message' => 'Login failed due to a server error. Please try again.',
        'error'   => $e->getMessage()
    ], 500);
}
?>
