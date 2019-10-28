<?php

session_start();

if (isset($_SESSION['username']) && $_SESSION['username'] === 'admin') {
    echo "flag{GDPR_is_here_to_save_y'all}";
} else {
    header('HTTP/1.1 403 Forbidden');
    die('nope');
}

?>
