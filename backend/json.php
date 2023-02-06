<?php

$action = $_REQUEST['action'];

$json_file_name = 'campaign.json';

if ($action === 'read_mdb_path') {
    if (file_exists($json_file_name))
    {
        $data = file_get_contents($json_file_name);
        echo json_decode($data)->mdb_path;
        exit;
    }
}

if ($action === 'write_mdb_path') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));
        $data->mdb_path = $_REQUEST['path'];

        file_put_contents($json_file_name, json_encode($data));
        exit;
    }
}

if ($action === 'create_campaign') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));
        array_push($data->campaigns, $_REQUEST['campaign']);

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->campaigns);
        exit;
    }
}

if ($action === 'update_campaign') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->campaigns = array_map(function($row) {
            return $row->query === $_REQUEST['campaign']['query'] ? $_REQUEST : $row;
        }, $data->campaigns);

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->campaigns);
        exit;
    }
}

if ($action === 'delete_campaign') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->campaigns = array_filter($data->campaigns, function($row) {
            return $row->query !== $_REQUEST['campaign']['query'];
        });

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->campaigns);
        exit;
    }
}