<?php
/**
 * AgroSmart - Database Configuration (PHP)
 * Handles MySQL/MariaDB database connection for the application.
 * Uses PDO for secure, prepared-statement-based queries.
 */

// Database credentials
$db_host = 'localhost';
$db_name = 'agrosmart';
$db_user = 'root';
$db_pass = '';

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Return JSON error for AJAX requests
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// ─── Create tables if they don't exist ───────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        district VARCHAR(150) NOT NULL,
        query_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS newsletter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS profit_calculations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        land_size DECIMAL(10,2) NOT NULL,
        seed_cost DECIMAL(12,2) NOT NULL,
        fertilizer_cost DECIMAL(12,2) NOT NULL,
        labor_cost DECIMAL(12,2) NOT NULL,
        expected_yield DECIMAL(10,2) NOT NULL,
        market_price DECIMAL(12,2) NOT NULL,
        total_cost DECIMAL(14,2) NOT NULL,
        total_revenue DECIMAL(14,2) NOT NULL,
        net_profit DECIMAL(14,2) NOT NULL,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// ─── Utility: send JSON response ─────────────────────────
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
    exit;
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}
?>
