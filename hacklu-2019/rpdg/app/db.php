<?php

$db = new mysqli('db', 'rpdg', 'Luung4aithaiCh3aetho', 'rpdg');
if (!$db) {
    die('db oof');
}

if (!$db->set_charset("utf8")) {
    error_log("db charset oof: ".$db->error);
}

?>
