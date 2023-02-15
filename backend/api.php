<?php

require_once('controllers/Mdb.php');
require_once('controllers/Campaign.php');
require_once('controllers/Group.php');

$class = $_REQUEST['class'];
$fn = $_REQUEST['fn'];

$class_path = "\controllers\\" . $class;

$obj = new $class_path();
$obj->init();
$obj->$fn();