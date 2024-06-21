<?php

require_once 'php_functions.php';
session_start();

require_once (__DIR__ . '/../vendor/autoload.php');
use garethp\ews\API;
use garethp\ews\API\Type;
use garethp\ews\API\Type\DistinguishedFolderIdNameType;
use garethp\ews\API\ExchangeWebServices;
use garethp\ews\API\NTLMSoapClient;



if (isset($_SESSION['ews_token'])) {
    $api = getEwsApi();

    session_protection(true);

    if (!$api) {
        echo json_encode(['error' => 'Failed to get valid EWS API instance']);
        exit;
    }

    // $email = $_SESSION['ews_api']['email'];
    $cf = $api->getChildrenFolders(
        DistinguishedFolderIdNameType::CALENDAR,
        [
            'ParentFolderIds' => [
                'DistinguishedFolderId' => [
                    'id' => 'calendar',
                    // 'Mailbox' => [
                    //     'EmailAddress'=> $email
                    // ]
                ]
            ]
        ]
    );
    $calendar_names = array();
    foreach ($cf as $f) {
        array_push($calendar_names, $f->getDisplayName());
    }

    echo json_encode($calendar_names);
}