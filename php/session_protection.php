<?php

require_once ('forced_logout.php');

function kill_session_if_invalid_origin($initiate_logout = true)
{
    if (isset($_SESSION['IPadress']) && isset($_SESSION['userAgent'])) {
        if (($_SESSION['IPaddress'] != $_SERVER['REMOTE_ADDR']) || $_SESSION['userAgent'] != $_SERVER['HTTP_USER_AGENT']) {
            $message = "[SERVER MESSAGE] Invalid session origin.";
            if ($initiate_logout) {
                initiate_forced_logout($message);
                exit;
            } else {
                return $message;
            }
        }
    }
    return false;

}

function solve_session_fixation()
{
    if (!isset($_SESSION['CREATED'])) {
        $_SESSION['CREATED'] = time();
    } else if (time() - $_SESSION['CREATED'] > 1 * 60) {
        // session id updated more than 1 minutes ago

        $session_data = $_SESSION;

        session_regenerate_id(true);    // change session ID for the current session and invalidate old session ID

        $_SESSION = $session_data;

        $_SESSION['CREATED'] = time();  // update creation time
    }

}

function kill_session_if_inactive($initiate_logout = true)
{
    if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 30 * 60)) {
        // last request was more than 30 minutes ago

        $message = "[SERVER MESSAGE] Session expired due to inactivity.";
        if ($initiate_logout) {
            initiate_forced_logout($message);
            exit;
        } else {
            return $message;
        }
    }
    $_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp
    return false;
}


function kill_session_if_too_old($initiate_logout = true)
{
    if (!isset($_SESSION['AUTH_TIME'])) {
        $_SESSION['AUTH_TIME'] = time();
        $_SESSION['AUTH_DATETIME'] = date("Y-m-d H:i:s");
    } else if ((time() - $_SESSION['AUTH_TIME'] > 60 * 60)) {
        // session started more than 60 minutes ago
        $message = "[SERVER MESSAGE] Session expired.";
        if ($initiate_logout) {
            initiate_forced_logout($message);
            exit;
        } else {
            return $message;
        }
    }
    return false;
}

function session_protection($initiate_logout = true)
{
    $message = kill_session_if_invalid_origin();
    if ($message) {
        echo json_encode($message);
    } else {

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
}

if (isset($_GET["session_protection"])) {
    unset($_GET["session_protection"]);
    session_start();
    session_protection(false);
}