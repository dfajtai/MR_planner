<?php

require 'php_functions.php';
session_start();

require_once(__DIR__.'/../vendor/autoload.php');
use garethp\ews\API;
use garethp\ews\API\Type;
use garethp\ews\API\Type\DistinguishedFolderIdNameType;
use garethp\ews\API\ExchangeWebServices;
use garethp\ews\API\NTLMSoapClient;
use garethp\ews\API\Enumeration;
use garethp\ews\API\Enumeration\ResponseClassType;


if(isset($_SESSION['ews_token'])) {
    $api = getEwsApi();

    session_protection(true);

    if (!$api) {
        echo json_encode(['error' => 'Failed to get valid EWS API instance']);
        exit;
    }
    
    if(isset($_GET["source_calendar"]) && isset($_GET["mask_calendar"])){
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


        $source_calendar = $api->getCalendar($source_name);
        $mask_calendar = $api->getCalendar($mask_name);

        $source_items = $source_calendar->getCalendarItems($start, $end);
        $mask_items = $mask_calendar->getCalendarItems($start, $end);


        $source_events = [];
        foreach($source_items as $event){

            array_push($source_events,
                       (object) ['name'=>$event->getSubject(), 
                        'start' => $event->getStart(),
                        'end'=>$event->getEnd(),
                        'timezone'=>$event->getTimeZone()]);
  
        }
        
        $mask_events = [];
        foreach($mask_items as $event){

            array_push($mask_events,
                       (object) ['name'=>$event->getSubject(), 
                        'start' => $event->getStart(),
                        'end'=>$event->getEnd(),
                        'timezone'=>$event->getTimeZone()]);
  
        }
        
        unset($_GET["source_calendar"]);
        unset($_GET["mask_calendar"]);

        echo json_encode(['events'=>$source_events, 'masks' => $mask_events]);

    }
}