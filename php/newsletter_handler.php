<?php
/**
 * AgroSmart - Newsletter Subscription Handler (PHP)
 * Handles newsletter email subscriptions with duplicate checking.
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

$email = isset($input['email']) ? trim(strtolower($input['email'])) : '';

// ─── Validation ──────────────────────────────────────────
if (empty($email)) {
    sendJSON([
        'success' => false,
        'message' => 'Email address is required.'
    ], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJSON([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ], 422);
}

// ─── Check for duplicates ────────────────────────────────
try {
    $stmt = $pdo->prepare("SELECT id FROM newsletter WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        sendJSON([
            'success' => false,
            'message' => 'This email is already subscribed to our newsletter!'
        ], 409);
    }

    // Insert new subscriber
    $stmt = $pdo->prepare("INSERT INTO newsletter (email) VALUES (:email)");
    $stmt->execute([':email' => $email]);

    sendJSON([
        'success' => true,
        'message' => 'Successfully subscribed! You will receive weekly agricultural updates.'
    ], 201);

} catch (PDOException $e) {
    sendJSON([
        'success' => false,
        'message' => 'Subscription failed. Please try again.',
        'error'   => $e->getMessage()
    ], 500);
}
?>
