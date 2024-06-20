<?php

require_once ('forced_logout.php');

function solve_session_fixation()
{
    if (!isset($_SESSION['CREATED'])) {
        $_SESSION['CREATED'] = time();
    } else if (time() - $_SESSION['CREATED'] > 1 * 60) {
        // session id updated more than 1 minutes ago
        session_regenerate_id(true);    // change session ID for the current session and invalidate old session ID
        $_SESSION['CREATED'] = time();  // update creation time
    }
}

function kill_session_if_inactive($initiate_logout = true)
{
    if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 10 * 60)) {
        // last request was more than 10 minutes ago

        $message = "[SERVER MESSAGE] Session expired due to inactivity.";
        if ($initiate_logout) {
            initiate_forced_logout($message);
            exit;
        } else {
            return $message;
        }
    }
    $_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
}


function kill_session_if_too_old($initiate_logout = true)
{
    if (!isset($_SESSION['AUTH_TIME'])) {
        $_SESSION['AUTH_TIME'] = time();
        $_SESSION['AUTH_DATETIME'] = date("Y-m-d H:i:s");
    } else if ((time() - $_SESSION['AUTH_TIME'] > 30 * 60)) {
        // session started more than 30 minutes ago
        $message = "[SERVER MESSAGE] Session expired.";
        if ($initiate_logout) {
            initiate_forced_logout($message);
            exit;
        } else {
            return $message;
        }
    }
}

function session_protection($initiate_logout = true)
{
    $message = kill_session_if_too_old($initiate_logout);
    if ($message) {
        echo json_encode($message);
    } else {
        $message = kill_session_if_inactive($initiate_logout);

        if ($message) {
            echo json_encode($message);
        } else {
            solve_session_fixation();
        }
    }
}

if (isset($_GET["session_protection"])) {
    unset($_GET["session_protection"]);
    session_start();
    session_protection(false);
}