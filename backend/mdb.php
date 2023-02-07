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
            if ($campaign->query === $query) {
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

    if ($action === 'get_data') {
        $campaigns = $_REQUEST['campaigns'];

        foreach ($campaigns as $index => $campaign) {
            $query = $campaign['query'];
            $sth = $db->prepare("select * from [$query]");

            $sth->execute();

            $campaigns[$index]['rows'] = array();
            $campaigns[$index]['uploadRows'] = array();

            while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
                if ($row['Phone'] === $campaign['last_phone']) break;

                $row['key'] = $row['Phone'];
                array_push($campaigns[$index]['rows'], $row);
            }
            $campaigns[$index]['status'] = 'get_mdb_data';
        }

        echo json_encode($campaigns);
        exit;
    }
}
catch(PDOException $e) {
    echo json_encode(array('status' => 'error', 'description' => 'Please check mdb path and query name!'));
    exit;
}