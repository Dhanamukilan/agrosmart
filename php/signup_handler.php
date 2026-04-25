<?php
/**
 * AgroSmart - Sign Up Handler (PHP)
 * Registers new users with server-side validation.
 * Passwords are hashed with bcrypt using password_hash().
 */

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

$fullName = isset($input['fullName']) ? trim(htmlspecialchars($input['fullName'])) : '';
$email    = isset($input['email'])    ? trim(strtolower($input['email']))          : '';
$phone    = isset($input['phone'])    ? trim(htmlspecialchars($input['phone']))    : '';
$password = isset($input['password']) ? $input['password']                          : '';

// ─── Server-side Validation ──────────────────────────────
$errors = [];

if (empty($fullName)) {
    $errors[] = 'Full name is required.';
} elseif (strlen($fullName) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
} elseif (strlen($fullName) > 100) {
    $errors[] = 'Name must not exceed 100 characters.';
}

if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (empty($phone)) {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[0-9]{10}$/', preg_replace('/[\s\-\+]/', '', $phone))) {
    $errors[] = 'Please enter a valid 10-digit phone number.';
}

if (empty($password)) {
    $errors[] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters long.';
} elseif (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    $errors[] = 'Password must contain at least one letter and one number.';
}

if (!empty($errors)) {
    sendJSON([
        'success' => false,
        'message' => 'Validation failed.',
        'errors'  => $errors
    ], 422);
}

// ─── Check if email already exists ───────────────────────
try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        sendJSON([
            'success' => false,
            'message' => 'An account with this email already exists. Please login instead.'
        ], 409);
    }

    // Hash the password with bcrypt (cost factor 12)
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, email, phone, password_hash)
        VALUES (:full_name, :email, :phone, :password_hash)
    ");

    $stmt->execute([
        ':full_name'     => $fullName,
        ':email'         => $email,
        ':phone'         => $phone,
        ':password_hash' => $passwordHash
    ]);

    $userId = $pdo->lastInsertId();

    sendJSON([
        'success' => true,
        'message' => 'Account created successfully! Welcome to AgroSmart, ' . $fullName . '!',
        'data'    => [
            'id'    => (int)$userId,
            'name'  => $fullName,
            'email' => $email
        ]
    ], 201);

} catch (PDOException $e) {
    sendJSON([
        'success' => false,
        'message' => 'Registration failed. Please try again.',
        'error'   => $e->getMessage()
    ], 500);
}
?>
