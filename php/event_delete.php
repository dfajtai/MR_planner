<?php

require 'php_functions.php';
require 'ews_api_extension.php';

session_start();


if (isset($_SESSION['ews_token'])) {
    $api = getEwsApi();

    session_protection(true);

    if (!$api) {
        echo json_encode(['error' => 'Failed to get valid EWS API instance']);
        exit;
    }

    if (isset($_POST["calendar_name"]) && isset($_POST["event_id"])) {
        $calendar_name = $_POST["calendar_name"];
        $event_id = $_POST["event_id"];

        // $calendar = $api->getCalendar($calendar_name);
        // $calendar_id = $calendar->getFolderId()->getId();


        $response = delete_event($api, $calendar_name, $event_id);


        unset($_POST["calendar_name"]);
        unset($_POST["event_id"]);

        echo json_encode($response);
    }
}