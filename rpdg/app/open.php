<?php

require_once 'db.php';

// no hax
if (!isset($_GET['title']) || !is_string($_GET['title'])) {
    die('nope');
}

$title = base64_decode($_GET['title']);
if (preg_match('/(?:sleep|benchmark)/i', $title)) {
    error_log('Blocked: '.$title);
    die('hack harder');
}

$result = $db->query('SELECT * FROM `culture` WHERE `id`=(SELECT `id` FROM `culture` WHERE `title`="'.$title.'")');
if (!$result) {
    error_log('db oof: '.$db->error);
    die('db oof: '.$db->error);
}

$row = $result->fetch_assoc();
if (!$row) {
    die('nope');
}

// redirect
header('Location: '.$row['link']);

?>
