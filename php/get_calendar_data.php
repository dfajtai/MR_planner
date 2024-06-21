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

    if (isset($_GET["source_calendar"]) && isset($_GET["mask_calendar"])) {
        $source_name = $_GET["source_calendar"];
        $mask_name = $_GET["mask_calendar"];

        if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
            $dateString = $_GET['start_date'];
            $start = DateTime::createFromFormat('Y-m-d H:i:s', $dateString . ' 00:00:00');
            unset($_GET['start_date']);
        } else {
            $start = new DateTime('today');
        }

        if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
            $dateString = $_GET['end_date'];
            $end = DateTime::createFromFormat('Y-m-d H:i:s', $dateString . ' 23:59:59');
            unset($_GET['end_date']);

        } else {
            $end = new DateTime('today + 90 day');
        }
        $retrieve_body = false;
        if (isset($_GET['retrieve_body']))
            $retrieve_body = true;

        $source_events = get_parsed_events_within_range($api, $source_name, $start, $end, $retrieve_body);

        $mask_events = get_parsed_events_within_range($api, $mask_name, $start, $end, $retrieve_body);

        unset($_GET["source_calendar"]);
        unset($_GET["mask_calendar"]);
        unset($_GET["retrieve_body"]);

        echo json_encode(['events' => $source_events, 'masks' => $mask_events]);

    }
}