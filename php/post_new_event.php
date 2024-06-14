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
    
    if(isset($_POST["source_calendar"]) && isset($_POST["event_data"])){
        $source_name = $_POST["source_calendar"];
        $event_data = $_POST["event_data"];
        
        $source_calendar = $api->getCalendar($source_name);
        
        $event = array('CalendarItem'=>array(
            'Start' => (new \DateTime($event_data['start']))->format('c'),
            'End' => (new \DateTime($event_data['end']))->format('c'),
            'Subject' => $event_data['text']
        ));
        
        $createdItemIds = $source_calendar->createCalendarItems($event);

        unset($_POST["source_calendar"]);
        unset($_POST["event_data"]);

        echo json_encode($createdItemIds);
    }
}