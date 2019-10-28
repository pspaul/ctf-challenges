<?php

$db = new mysqli('db', 'rpdg-login', 'muLuqueiL7hiekei7roo', 'rpdg');
if (!$db) {
    die('db oof');
}

session_start();

if (isset($_POST['user']) && isset($_POST['pass'])) {
    $user = $_POST['user'];
    $pass = $_POST['pass'];

    if (!is_string($user) || !is_string($pass)) {
        die('nope');
    }

    $stmt = $db->prepare('SELECT `pwhash` FROM `users` WHERE `name`=?');
    if (!$stmt) {
        error_log('db oof: '.$db->error);
        die('db oof');
    }
    
    $stmt->bind_param('s', $user);
    if (!$stmt->execute()) {
        error_log('db oof: '.$db->error);
        die('db oof');
    }

    $result = $stmt->get_result();
    if (!$result) {
        die('nope');
    }

    $row = $result->fetch_assoc();
    if (!$row) {
        die('nope');
    }

    $hash = $row['pwhash'];
    $valid = password_verify($pass, $hash);

    if ($valid) {
        $_SESSION['username'] = $user;

        header('Location: /admin.php');
        die('redirecting...');
    } else {
        $error_msg = 'Your credentials are bad and you should feel bad!';
    }
}

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="description" content="">
        <meta name="author" content="">

        <title>Bundesamt für Internetkultur und würzige Ichichs</title>

        <link href="static/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark static-top">
            <div class="container">
                <a class="navbar-brand" href="index.php">Bundesamt für Internetkultur und würzige Ichichs</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarResponsive">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.php">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="register.php">Register</a>
                        </li>
                        <li class="nav-item active">
                            <a class="nav-link" href="login.php">Login</a>
                            <span class="sr-only">(current)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <h1 class="mt-5">Login</h1>
                    <?php if ($error_msg) { ?>
                    <div class="alert alert-danger" role="alert">
                        <?php echo $error_msg; ?>
                    </div>
                    <?php } ?>
                    <form method="POST">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" class="form-control" id="username" name="user" placeholder="Enter username">
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" name="pass" placeholder="Password">
                        </div>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>

        <script src="static/jquery.slim.min.js"></script>
        <script src="static/bootstrap.bundle.min.js"></script>
    </body>
</html>
