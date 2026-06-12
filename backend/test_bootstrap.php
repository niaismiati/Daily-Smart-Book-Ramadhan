<?php
require __DIR__.'/vendor/autoload.php';
try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    echo "App created successfully\n";
    echo get_class($app) . "\n";
} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
