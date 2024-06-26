<?php

require_once 'php_functions.php';

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

function parse_event_categories($event)
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

function retrieve_event_body_for_event($api, $event)
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

    return $response;
}

function parse_event_body($event)
{
    if ($event->getBody())
        return $event->getBody()->_;
    return null;
}

function parse_event($event, $calendar_name = null)
{
    $parsed_event = (object) [
        'start' => $event->getStart(),
        'end' => $event->getEnd(),
        'timezone' => $event->getTimeZone(),
        'subject' => $event->getSubject(),
        'body' => parse_event_body($event),
        'categories' => json_encode(parse_event_categories($event)),
        'id' => $event->getItemId()->getId()
    ];

    if ($calendar_name) {
        $parsed_event->calendar_name = $calendar_name;
    }

    return $parsed_event;
}

function get_event($api, $event_id, $retrieve_body = false)
{
    $request = new GetItemType();
    $itemId = new ItemIdType();
    $itemId->setId($event_id);

    $itemIds = new NonEmptyArrayOfBaseItemIdsType();
    $itemIds->setItemId($itemId->toArray());

    $request->setItemIds($itemIds);
    $itemShape = new ItemResponseShapeType();
    // $itemShape->setBaseShape('IdOnly');

    if ($retrieve_body) {
        $itemShape->setIncludeMimeContent(true);
        $itemShape->setConvertHtmlCodePageToUTF8(true);
        $itemShape->setBaseShape('AllProperties');
    }

    $request->setItemShape($itemShape);

    $response = $api->getClient()->GetItem($request);

    return $response;
}

function get_parsed_events_within_range($api, $calendar_name, $start, $end, $retrieve_body = false)
{
    $events = [];

    try {
        $calendar = $api->getCalendar($calendar_name);
        $items = $calendar->getCalendarItems($start, $end);

        foreach ($items as $event) {
            if ($retrieve_body) {
                $parsed_event = parse_event(retrieve_event_body_for_event($api, $event), $calendar_name);

            } else {
                $parsed_event = parse_event($event, $calendar_name);
            }

            array_push($events, $parsed_event);
        }
    } catch (\Throwable $th) {
        throw $th;
    }

    return $events;
}



function get_parsed_event($api, $event_id, $retrieve_body = true)
{
    $parsed_event = parse_event(get_event($api, $event_id, $retrieve_body));
    return $parsed_event;
}

function create_event($api, $calendar_id, $start, $end, $subject, $body = null, $category = null, )
{

    $event = array(
        'CalendarItem' => array(
            'Start' => $start,
            'End' => $end,
            'Subject' => $subject,
            'Body' => array(
                'BodyType' => Enumeration\BodyTypeType::HTML,
                '_value' => $body
            ),
        )
    );
    if ($category) {
        $event['CalendarItem']['Categories'] = array($category);
    }

    //Set our options
    $options = array(
        'SendMeetingInvitations' => Enumeration\CalendarItemCreateOrDeleteOperationType::SEND_TO_NONE,
        'SavedItemFolderId' => array(
            'FolderId' => array('Id' => $calendar_id)
        )
    );
    $createdItemIds = $api->createItems($event, $options);

    return $createdItemIds->getId();
}


function update_event($api, $calendar_name, $event_id, $start, $end, $subject, $body = null, $category = null)
{
    //drops the category....

    $calendar = $api->getCalendar($calendar_name);

    $itemId = new ItemIdType();
    $itemId->setId($event_id);

    $updated_data = array(
        'Start' => $start,
        'End' => $end,
        'Subject' => $subject,
        'Body' => array(
            'BodyType' => Enumeration\BodyTypeType::HTML,
            '_value' => $body
        )
    );
    if ($category) {
        $updated_data['Categories'] = $category;
    }

    $updated_event = $calendar->updateCalendarItem($itemId, (array) $updated_data);
    return $updated_event;
}

function delete_event($api, $calendar_name, $event_id)
{
    $calendar = $api->getCalendar($calendar_name);

    $itemId = new ItemIdType();
    $itemId->setId($event_id);

    $response = $calendar->deleteCalendarItem($itemId);
    return $response;

}