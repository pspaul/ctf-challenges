<?php

require_once 'db.php';

session_start();

$result = $db->query("SELECT * FROM `culture`");
if (!$result) {
    error_log('db oof: '.$result);
    die('db oof');
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
        <link href="static/style.css" rel="stylesheet">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark static-top">
            <div class="container">
                <a class="navbar-brand" href="#">Bundesamt für Internetkultur und würzige Ichichs</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarResponsive">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item active">
                            <a class="nav-link" href="index.php">Home</a>
                            <span class="sr-only">(current)</span>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="register.php">Register</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="login.php">Login</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container">
            <div class="row">
                <div class="col-lg-12 text-center">
                    <img id="logo" class="ma-3" src="static/logo.png">
                    <p class="lead">Besides beer, pretzels and cars, Germany also offers a wonderful internet culture. Enjoy!</p>
                    <div class="container">
                        <div class="card-columns">
                            <?php while ($row = $result->fetch_assoc()) { ?>
                            <div class="card text-white bg-dark culture-item" data-title="<?php echo $row['title']; ?>">
                                <img class="card-img-top thumbnail" src="<?php echo '//i3.ytimg.com/vi/'.substr($row['link'], -11).'/hqdefault.jpg'; ?>" alt="Thumbnail">
                                <div class="card-body text-left">
                                    <h5 class="card-title"><?php echo mb_convert_encoding($row['title'], 'utf-8'); ?></h5>
                                    <p class="card-text"><small><?php echo $row['year'] ?></small></p>
                                </div>
                            </div>
                            <?php } ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script src="static/jquery.slim.min.js"></script>
        <script src="static/bootstrap.bundle.min.js"></script>
        <script src="tracc.php"></script>
        <script>
            document.querySelectorAll('.culture-item').forEach(item => {
                item.onclick = () => {
                    window.open(`/open.php?title=${encodeURIComponent(btoa(item.dataset.title))}`, '_blank');
                };
            });
        </script>
    </body>
</html>
