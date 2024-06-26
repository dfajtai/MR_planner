<?php

require_once 'php_functions.php';

session_start();


if (isset($_SESSION['ews_token'])) {
    $api = getEwsApi();

    session_protection(true);

    if (!$api) {
        echo json_encode(['error' => 'Failed to get valid EWS API instance']);
        exit;
    }

    if (isset($_POST["calendar_name"]) && isset($_POST["event_id"]) && isset($_POST["event_data"])) {
        $calendar_name = $_POST["calendar_name"];
        $event_id = $_POST["event_id"];
        $event_data = $_POST["event_data"];

        // $caledar = $api->getCalendar($calendar_name);
        // $calendar_id = $caledar->getFolderId()->getId();


        $body = "No structured data";
        if (isset($event_data['body'])) {
            $body = $event_data['body'];

        }
        $category = null;
        if (isset($event_data['category'])) {
            $category = $event_data['category'];
            if ($category == "")
                $category = null;
        }

        $start = (new \DateTime($event_data['start']))->format('c');
        $end = (new \DateTime($event_data['end']))->format('c');
        $subject = $event_data['subject'];

        $updated_items = update_event($api, $calendar_name, $event_id, $start, $end, $subject, $body, $category);


        unset($_POST["calendar_name"]);
        unset($_POST["event_id"]);
        unset($_POST["event_data"]);

        echo json_encode($updated_items);
    }
}