<?php

$action = $_REQUEST['action'];

$json_file_name = 'campaign.json';

$contents = file_get_contents($json_file_name);
$mdb_path = json_decode($contents)->mdb_path;
$campaigns = json_decode($contents)->campaigns;

try {
    # OPEN BOTH DATABASE CONNECTIONS
    $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($action === 'get_query_data') {
        $query = $_REQUEST['query'];

        foreach($campaigns as $campaign) {
            if ($campaign['query'] === $query) {
                echo json_encode(array('status' => 'error', 'description' => 'This query already exists.'));
                exit;
            }
        }

        $sth = $db->prepare("select * from [$query]");
        $sth->execute();

        $data = array();
        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $data = array_keys($row);
            break;
        }

        $exist = false;
        foreach($data as $row) {
            if ($row === 'Phone') {
                $exist = true;
            }
        }

        if (!$exist) {
            echo json_encode(array('status' => 'error', 'description' => "This query doesn't include phone field."));
            exit;
        }

        echo json_encode(array('status' => 'success', 'columnList' => $data));
        exit;
    }
}
catch(PDOException $e) {
    echo json_encode(array('status' => 'error', 'description' => 'Please check mdb path and query name!'));
    exit;
}