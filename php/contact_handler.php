<?php
/**
 * AgroSmart - Contact Form Handler (PHP)
 * Processes contact form submissions, validates input,
 * stores in MySQL database, and returns JSON response.
 */

require_once __DIR__ . '/db_config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'message' => 'Method not allowed. Use POST.'], 405);
}

// Get input data (supports both form-encoded and JSON)
$contentType = isset($_SERVER['CONTENT_TYPE']) ? trim($_SERVER['CONTENT_TYPE']) : '';

if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    $input = $_POST;
}

// Extract and sanitize fields
$name     = isset($input['name'])     ? trim(htmlspecialchars($input['name']))     : '';
$phone    = isset($input['phone'])    ? trim(htmlspecialchars($input['phone']))    : '';
$district = isset($input['district']) ? trim(htmlspecialchars($input['district'])) : '';
$query    = isset($input['query'])    ? trim(htmlspecialchars($input['query']))    : '';

// ─── Server-side Validation ──────────────────────────────
$errors = [];

if (empty($name)) {
    $errors[] = 'Full name is required.';
} elseif (strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
}

if (empty($phone)) {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[\+]?[0-9]{10,15}$/', preg_replace('/\s+/', '', $phone))) {
    $errors[] = 'Please enter a valid phone number (10-15 digits).';
}

if (empty($district)) {
    $errors[] = 'District & State is required.';
}

if (empty($query)) {
    $errors[] = 'Query message is required.';
} elseif (strlen($query) < 10) {
    $errors[] = 'Query must be at least 10 characters long.';
}

if (!empty($errors)) {
    sendJSON([
        'success' => false,
        'message' => 'Validation failed.',
        'errors'  => $errors
    ], 422);
}

// ─── Insert into database ────────────────────────────────
try {
    $stmt = $pdo->prepare("
        INSERT INTO contacts (name, phone, district, query_text)
        VALUES (:name, :phone, :district, :query_text)
    ");

    $stmt->execute([
        ':name'       => $name,
        ':phone'      => $phone,
        ':district'   => $district,
        ':query_text' => $query
    ]);

    $insertId = $pdo->lastInsertId();

    sendJSON([
        'success' => true,
        'message' => 'Your query has been submitted successfully! Our agricultural experts will contact you shortly.',
        'data'    => [
            'id'       => (int)$insertId,
            'name'     => $name,
            'phone'    => $phone,
            'district' => $district,
            'query'    => $query
        ]
    ], 201);

} catch (PDOException $e) {
    sendJSON([
        'success' => false,
        'message' => 'Failed to save your query. Please try again.',
        'error'   => $e->getMessage()
    ], 500);
}
?>
