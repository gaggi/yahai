<?php
    header("Access-Control-Allow-Origin: http://n0n4m3.homeunix.org:8000");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
	header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
	echo "anything okay";
?>