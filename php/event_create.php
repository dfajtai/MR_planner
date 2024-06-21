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

    if (isset($_POST["source_calendar"]) && isset($_POST["event_data"])) {
        $source_name = $_POST["source_calendar"];
        $event_data = $_POST["event_data"];

        $source_calendar = $api->getCalendar($source_name);
        $calendar_id = $source_calendar->getFolderId()->getId();

        $body = "No structured data";
        if (isset($event_data['body'])) {
            $body = $event_data['body'];

        }
        $category = null;
        if (isset($event_data['category'])) {
            $category = $event_data['category'];
        }

        $start = (new \DateTime($event_data['start']))->format('c');
        $end = (new \DateTime($event_data['end']))->format('c');
        $subject = $event_data['subject'];

        $createdItemIds = create_event($api, $calendar_id, $start, $end, $subject, $body, $category);


        unset($_POST["source_calendar"]);
        unset($_POST["event_data"]);

        echo json_encode($createdItemIds);
    }
}