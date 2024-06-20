<?php

session_start();
$uname = $_SESSION['ews_api']['uname'];
// $email =$_SESSION['ews_api']['email'];
session_unset();
session_destroy();

// header("Location: ../index.php?uname=".$uname."&email=".$email);
header("Location: ../index.php?uname=" . $uname);
exit;