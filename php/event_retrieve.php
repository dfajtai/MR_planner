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

    if (isset($_GET["event_id"])) {
        $event_id = $_GET["event_id"];

        $retrieve_body = false;
        if (isset($_GET['retrieve_body']))
            $retrieve_body = true;

        // $caledar = $api->getCalendar($calendar_name);
        // $calendar_id = $caledar->getFolderId()->getId();

        $event = get_parsed_event($api, $event_id, $retrieve_body);

        unset($_GET["event_id"]);
        unset($_GET["retrieve_body"]);

        echo json_encode($event);
    }
}