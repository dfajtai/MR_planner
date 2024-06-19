<?php

require_once (__DIR__ . '/../vendor/autoload.php');
use garethp\ews\API;

require_once ('session_protection.php');

function myUrlEncode($string)
{
  $entities = array('%21', '%2A', '%27', '%28', '%29', '%3B', '%3A', '%40', '%26', '%3D', '%2B', '%24', '%2C', '%2F', '%3F', '%25', '%23', '%5B', '%5D');
  $replacements = array('!', '*', "'", "(", ")", ";", ":", "@", "&", "=", "+", "$", ",", "/", "?", "%", "#", "[", "]");
  return str_replace($entities, $replacements, urlencode($string));
}


function var_error_log($object = null)
{
  ob_start();                    // start buffer capture
  var_dump($object);           // dump the values
  $contents = ob_get_contents(); // put the buffer into a variable
  ob_end_clean();                // end capture
  error_log($contents);        // log contents of the result of var_dump( $object )
}

function array_decode_numbers(&$array)
{
  if ($array == null)
    return;

  foreach ($array as $key => $value) {
    if ($value == '') {
      $array[$key] = null;
    } elseif (is_numeric($value))
      $array[$key] = $value + 0;
    else
      $array[$key] = $value;
  }

}

function encryptString($data, $key)
{
  $cipher = "aes-256-cbc";
  $ivlen = openssl_cipher_iv_length($cipher);
  $iv = openssl_random_pseudo_bytes($ivlen);
  $encryptedData = openssl_encrypt($data, $cipher, $key, OPENSSL_RAW_DATA, $iv);
  $encryptedData = $iv . $encryptedData;
  return base64_encode($encryptedData);
}

function decryptString($encryptedData, $key)
{
  $cipher = "aes-256-cbc";
  $encryptedData = base64_decode($encryptedData);
  $ivlen = openssl_cipher_iv_length($cipher);
  $iv = substr($encryptedData, 0, $ivlen);
  $encryptedData = substr($encryptedData, $ivlen);
  $decryptedData = openssl_decrypt($encryptedData, $cipher, $key, OPENSSL_RAW_DATA, $iv);
  return $decryptedData;
}


function getEwsApi()
{
  if (isset($_SESSION['ews_api'])) {
    // reset session if it is too old ...
    kill_session_if_too_old();

    kill_session_if_inactive();

    $ews_address = $_SESSION['ews_api']['ews_url'];
    $username = $_SESSION['ews_api']['uname'];
    $password = decryptString($_SESSION['ews_api']['pwd'], $_SESSION['ews_token']);

    // rotate key
    $_SESSION['ews_token'] = bin2hex(random_bytes(32));
    $_SESSION['ews_api']['pwd'] = encryptString($password, $_SESSION['ews_token']);

    // to avoid session fixation ...
    solve_session_fixation();

    return API::withUsernameAndPassword(
      $ews_address,
      $username,
      $password,
      // ['impersonation' => $_SESSION['ews_api']['email']]
    );
  }
  return null;
}