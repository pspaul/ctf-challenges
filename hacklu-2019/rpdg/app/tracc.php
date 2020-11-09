<?php

require_once 'db.php';

session_start();

if (isset($_POST['dat-juicy-data']) && is_string($_POST['dat-juicy-data'])) {
    if (isset($_SESSION['username'])) {
        // this is to make the challenge easier to host (DB is read-only => faster)
        //die('soooo... normally your data would be tracked now, but to make challenge hosting easier there is no DB write ¯\_(ツ)_/¯');
    } else {
        header('HTTP/1.1 403 Forbidden');
        die('nope');
    }

    // decode JSON data
    $d = $_POST['dat-juicy-data'];
    $data = json_decode($d, true);

    // no hax
    if (!is_array($data)) {
        error_log('nope');
        die('nope');
    }

    // no spam
    if (sizeof($data) > 100) {
        error_log('3big5me');
        die('3big5me');
    }

    // get user id by name
    $result = $db->query('SELECT `id` FROM `users` WHERE `name`="'.$_SESSION['username'].'"');
    if (!$result) {
        error_log('db oof: '.$db->error);
        die('db oof');
    }
    $userid = (int) $result->fetch_assoc()['id'];

    foreach ($data as $i => $key_stroke) {
        $key = $key_stroke['k'];
        $timestamp = $key_stroke['t'];

        // no hax
        if (!is_string($key) || !is_long($timestamp)) {
            continue;
        }

        // insert into db
        $stmt = $db->prepare('INSERT INTO `tracking` (`key`, `timestamp`, `user`, `path`) VALUES (?, ?, ?, ?)');
        $path = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH);
        $stmt->bind_param('siis', $key, $timestamp, $userid, $path);
        $result = $stmt->execute();
        if (!$result) {
            error_log('db oof: '.$db->error);
            die('db oof');
        }
    }
} else if (isset($_REQUEST['tracc-me-pls'])) {
    // allow tracking
    $_SESSION['tracc-me-pls'] = true;
    echo 'thx :)';
} else {
    header('Content-Type: application/javascript');
    if (isset($_SESSION['tracc-me-pls'])) {
        // serve the tracking JS
        require 'static/tracc.js';
    } else {
        // serve the GDPR dialog JS
        require 'static/gdpr.js';
    }
}

?>
