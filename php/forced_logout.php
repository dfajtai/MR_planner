<?php

function initiate_forced_logout($logout_message)
{
    if (isset($_SESSION['ews_api'])) {
        $uname = $_SESSION['ews_api']['uname'];
        // $email =$_SESSION['ews_api']['email'];
        setcookie('uname', $uname, time() + 3600, '/');
        // setcookie('email', $email, time()+3600,'/');
    }

    session_unset();
    session_destroy();

    echo json_encode($logout_message);
}

if (isset($_GET["logout"])) {
    session_start();

    if (isset($_GET["logout_message"])) {
        $logout_message = $_GET["logout_message"];
        unset($_GET["logout_message"]);
    } else {
        $logout_message = 'Logged out due to inactivity.';
    }
    initiate_forced_logout($logout_message);
    unset($_GET["logout"]);
}