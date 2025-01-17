<?php
require 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET request to fetch leaderboard
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['uuid'])) {
        // Fetch score for a specific user
        $uuid = $_GET['uuid'];
        $sql = "SELECT score FROM leaderboard WHERE uuid = '$uuid'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(["score" => $row['score']]);
        } else {
            echo json_encode(["error" => "User not found"]);
        }
    } else {
        // Fetch leaderboard
        $sql = "SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 5";
        $result = $conn->query($sql);

        $leaderboard = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $leaderboard[] = $row;
            }
        }
        echo json_encode($leaderboard);
    }
}

// Handle POST request to register a new user or update score
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'];

    if ($action === 'register') {
        $name = $data['name'];
        $score = $data['score'];
        $uuid = uniqid();

        $sql = "INSERT INTO leaderboard (uuid, name, score) VALUES ('$uuid', '$name', $score)";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "uuid" => $uuid]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
    } elseif ($action === 'update') {
        $uuid = $data['uuid'];
        $score = $data['score'];

        $sql = "UPDATE leaderboard SET score = score + $score WHERE uuid = '$uuid'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $conn->error]);
        }
    }
}

$conn->close();
?>