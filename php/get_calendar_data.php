<?php

require 'php_functions.php';
session_start();

require_once (__DIR__ . '/../vendor/autoload.php');
use garethp\ews\API;
use garethp\ews\API\Type;
use garethp\ews\API\Type\ItemIdType;
use garethp\ews\API\Type\boolean;
use garethp\ews\API\Type\DistinguishedFolderIdNameType;
use garethp\ews\API\ExchangeWebServices;
use garethp\ews\API\NTLMSoapClient;
use garethp\ews\API\Enumeration;
use garethp\ews\API\Enumeration\ResponseClassType;
use garethp\ews\API\Enumeration\DefaultShapeNamesType;

use garethp\ews\API\Type\ItemResponseShapeType;
use garethp\ews\API\Message\GetItemType;
use garethp\ews\API\Type\NonEmptyArrayOfBaseItemIdsType;

function get_categories($event)
{
    $categories = $event->getCategories();
    if (!$categories) {
        return array();
    }
    $categories_array = ((array) $categories)["String"];
    if (is_array($categories_array))
        return $categories_array;
    return array($categories_array);
}

function get_event_body($api, $event)
{
    $request = new GetItemType();
    $itemId = new ItemIdType();
    $itemId->setId($event->getItemId()->getId());
    $itemId->setChangeKey($event->getItemId()->getChangeKey());

    $itemIds = new NonEmptyArrayOfBaseItemIdsType();
    $itemIds->setItemId($itemId->toArray());

    $request->setItemIds($itemIds);
    $itemShape = new ItemResponseShapeType();
    // $itemShape->setBaseShape('IdOnly');
    $itemShape->setIncludeMimeContent(true);
    $itemShape->setConvertHtmlCodePageToUTF8(true);
    $itemShape->setBaseShape('AllProperties');
    $request->setItemShape($itemShape);


    $response = $api->getClient()->GetItem($request);
    $body = $response->getBody();

    return $body->_;
}

function get_events($api, $calendar_name, $start, $end, $retrieve_body = false)
{
    $events = [];

    try {
        $calendar = $api->getCalendar($calendar_name);
        $items = $calendar->getCalendarItems($start, $end);

        foreach ($items as $event) {

            $body = null;
            if ($retrieve_body)
                $body = get_event_body($api, $event);

            array_push(
                $events,
                (object) [
                    'name' => $event->getSubject(),
                    'start' => $event->getStart(),
                    'end' => $event->getEnd(),
                    'timezone' => $event->getTimeZone(),
                    'subject' => $event->getSubject(),
                    'body' => $body,
                    'categories' => json_encode(get_categories($event)),
                    'id' => $event->getItemId()->getId()
                ]
            );

        }
    } catch (\Throwable $th) {
        throw $th;
    }

    return $events;
}


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

        $source_events = get_events($api, $source_name, $start, $end, $retrieve_body);

        $mask_events = get_events($api, $mask_name, $start, $end, $retrieve_body);

        unset($_GET["source_calendar"]);
        unset($_GET["mask_calendar"]);
        unset($_GET["retrieve_body"]);

        echo json_encode(['events' => $source_events, 'masks' => $mask_events]);

    }
}