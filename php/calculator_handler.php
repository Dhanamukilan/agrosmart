<?php
/**
 * AgroSmart - Profit Calculator Handler (PHP)
 * Performs server-side profit calculations and stores results.
 * Provides AI-like profitability analysis and recommendations.
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

// Extract numeric values
$landSize  = isset($input['landSize'])  ? floatval($input['landSize'])  : 0;
$seedCost  = isset($input['seedCost'])  ? floatval($input['seedCost'])  : 0;
$fertCost  = isset($input['fertCost'])  ? floatval($input['fertCost'])  : 0;
$laborCost = isset($input['laborCost']) ? floatval($input['laborCost']) : 0;
$yieldVal  = isset($input['yield'])     ? floatval($input['yield'])     : 0;
$priceVal  = isset($input['price'])     ? floatval($input['price'])     : 0;

// ─── Validation ──────────────────────────────────────────
$errors = [];

if ($landSize <= 0)  $errors[] = 'Land size must be greater than 0.';
if ($seedCost < 0)   $errors[] = 'Seed cost cannot be negative.';
if ($fertCost < 0)   $errors[] = 'Fertilizer cost cannot be negative.';
if ($laborCost < 0)  $errors[] = 'Labor cost cannot be negative.';
if ($yieldVal <= 0)  $errors[] = 'Expected yield must be greater than 0.';
if ($priceVal <= 0)  $errors[] = 'Market price must be greater than 0.';

if (!empty($errors)) {
    sendJSON([
        'success' => false,
        'message' => 'Validation failed.',
        'errors'  => $errors
    ], 422);
}

// ─── Server-side Calculation ─────────────────────────────
$totalCost    = ($seedCost + $fertCost + $laborCost) * $landSize;
$totalRevenue = $yieldVal * $landSize * $priceVal;
$netProfit    = $totalRevenue - $totalCost;
$profitMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 1) : 0;
$roi          = $totalCost > 0 ? round(($netProfit / $totalCost) * 100, 1) : 0;

// ─── Generate Advisory ───────────────────────────────────
$advice    = '';
$alertType = 'info';

if ($netProfit > $totalCost * 0.5) {
    $advice    = 'Excellent profitability! Your projected ROI of ' . $roi . '% is outstanding. This crop-market combination is highly recommended for your land size.';
    $alertType = 'success';
} elseif ($netProfit > $totalCost * 0.2) {
    $advice    = 'Good profit expected with ' . $roi . '% ROI. Consider bulk purchasing of seeds and fertilizers to further improve margins.';
    $alertType = 'success';
} elseif ($netProfit > 0) {
    $advice    = 'Moderate profit projected (' . $roi . '% ROI). Consider reducing labor costs through mechanization or choosing a crop with better market demand.';
    $alertType = 'warning';
} else {
    $advice    = 'Warning: Projected losses of ₹' . number_format(abs($netProfit)) . '. Re-evaluate your input costs or switch to a crop with higher market value in your region.';
    $alertType = 'danger';
}

// ─── Store calculation in database ───────────────────────
try {
    $stmt = $pdo->prepare("
        INSERT INTO profit_calculations 
        (land_size, seed_cost, fertilizer_cost, labor_cost, expected_yield, market_price, total_cost, total_revenue, net_profit)
        VALUES (:land, :seed, :fert, :labor, :yield, :price, :cost, :revenue, :profit)
    ");

    $stmt->execute([
        ':land'    => $landSize,
        ':seed'    => $seedCost,
        ':fert'    => $fertCost,
        ':labor'   => $laborCost,
        ':yield'   => $yieldVal,
        ':price'   => $priceVal,
        ':cost'    => $totalCost,
        ':revenue' => $totalRevenue,
        ':profit'  => $netProfit
    ]);
} catch (PDOException $e) {
    // Log but don't fail - calculation result is still valid
    error_log('Failed to save calculation: ' . $e->getMessage());
}

// ─── Return results ──────────────────────────────────────
sendJSON([
    'success' => true,
    'message' => 'Profit calculation completed.',
    'data'    => [
        'totalCost'    => round($totalCost, 2),
        'totalRevenue' => round($totalRevenue, 2),
        'netProfit'    => round($netProfit, 2),
        'profitMargin' => $profitMargin,
        'roi'          => $roi,
        'advice'       => $advice,
        'alertType'    => $alertType
    ]
], 200);
?>
