<?php

require 'php/session_init.php';


if (isset($_COOKIE['uname'])) {
    $_GET['uname'] = $_COOKIE['uname'];
}

if (isset($_COOKIE['email'])) {
    $_GET['email'] = $_COOKIE['email'];
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>MR elojegyzes</title>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="libs/css/bootstrap.min.css">
    <link rel="stylesheet" href="libs/css/bootstrap-icons.css">


    <script src="libs/js/bootstrap.min.js"></script>
    <script src="libs/js/jquery-3.7.1.min.js"></script>
</head>

<body>
    <div class="d-flex align-items-center justify-content-center">

        <form class="shadow p-5 needs-validation col-md-6 col-lg-4 col-sm-10 col-12 align-self-center" action=<?php echo "'php/login.php?" . myUrlEncode($_SERVER["QUERY_STRING"]) . "'" ?> method="post">
            <h4 class="display-4 fs-1">LOGIN</h4><br>

            <?php if (isset($_GET['error'])) { ?>
                <div class="alert alert-danger" role="alert">
                    <?php echo $_GET['error']; ?>
                </div>
            <?php } ?>

            <?php if (isset($_GET['success'])) { ?>
                <div class="alert alert-success" role="alert">
                    <?php echo $_GET['success']; ?>
                </div>
            <?php } ?>

            <div class="form-group mb-2">
                <label for="usernameInput">User name</label>
                <input type="text" class="form-control" id="uname" placeholder="User Name with 'mc\'" name="uname"
                    value="<?php echo (isset($_GET['uname'])) ? $_GET['uname'] : "" ?>" required>
            </div>

            <div class="form-group mb-3">
                <label for="emailInput">E-mail</label>
                <input type="email" class="form-control" id="email" placeholder="e-mail address" name="email"
                    value="<?php echo (isset($_GET['email'])) ? $_GET['email'] : "" ?>" required>
            </div>
            <div class="form-group mb-3">
                <label for="passwordInput">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Password" name="pass">
            </div>

            <div class="flex-row">
                <button type="submit" class="btn btn-dark md-me-2 w-100">Login</button>
            </div>
        </form>

</body>

</html>