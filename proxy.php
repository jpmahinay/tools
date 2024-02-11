<?php
// Set the URL you want to proxy
$url = $_GET['url'];

// Set up cURL session
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// Forward the headers
$headers = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $headers[str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))))] = $value;
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute cURL session and echo the result
echo curl_exec($ch);

// Close cURL session
curl_close($ch);
?>
