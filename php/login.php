<?php

require_once (__DIR__ . '/../vendor/autoload.php');
require 'php_functions.php';

use garethp\ews\API;
use garethp\ews\API\Type\DistinguishedFolderIdNameType;
use garethp\ews\API\Type\ConnectingSIDType;
use garethp\ews\API\Type\ExchangeImpersonation;



session_start();

global $ews_address;
$ews_address = '10.10.1.113/EWS/Exchange.asmx';

global $api;

function authenticateUser($username, $password)
{
    global $ews_address;

    // Validate credentials with EWS
    try {
        global $api;

        $api = API::withUsernameAndPassword($ews_address, $username, $password);

        // if the auth failed, this will raise an error...
        $cf = $api->getChildrenFolders(
            DistinguishedFolderIdNameType::CALENDAR,
            [
                'ParentFolderIds' => [
                    'DistinguishedFolderId' => [
                        'id' => 'calendar',
                        // 'Mailbox' => [
                        //     'EmailAddress' => $email
                        // ]
                    ]
                ]
            ]
        );

        $key = bin2hex(random_bytes(32));
        $api_info = [
            'ews_url' => $ews_address,
            'uname' => $username,
            // 'email' => $email,
            'pwd' => encryptString($password, $key)
        ];

        $_SESSION['ews_token'] = $key;
        $_SESSION['ews_api'] = $api_info;

        return true;
    } catch (Exception $e) {
        $em = $e->getMessage();
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['uname']) && isset($_POST['pass'])) {

    $username = $_POST['uname'];
    $password = $_POST['pass'];
    // $email = $_POST['email'];

    // $data = "uname=" . $username . "&email=" . $email;
    $data = "uname=" . $username;

    if (authenticateUser($username, $password)) {
        // Redirect to a secure page, e.g., dashboard

        kill_session_if_too_old(); // to inti auth datetime

        header('Location: ../home.php?');
        exit();
    } else {
        $em = "Incorect user name or password";
        // $em = "Incorect user name, e-mail or password";
        header("Location: ../index.php?error=$em&$data");
        exit;
    }
}
