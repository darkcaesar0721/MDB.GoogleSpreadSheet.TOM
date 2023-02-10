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

if ($action === 'get_temp_group') {
    if (file_exists($json_file_name))
    {
        $data = file_get_contents($json_file_name);
        echo json_encode(json_decode($data)->tempGroup);
        exit;
    }
}

if ($action === 'update_temp_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->tempGroup = $_REQUEST['temp'];

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->tempGroup);
        exit;
    }
}

if ($action === 'get_groups') {
    if (file_exists($json_file_name))
    {
        $data = file_get_contents($json_file_name);
        echo json_encode(json_decode($data)->groups);
        exit;
    }
}

if ($action === 'get_campaigns') {
    if (file_exists($json_file_name))
    {
        $data = file_get_contents($json_file_name);
        echo json_encode(json_decode($data)->campaigns);
        exit;
    }
}

if ($action === 'update_campaign') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->campaigns = array_map(function($row) {
            return $row->query === $_REQUEST['campaign']['query'] ? $_REQUEST['campaign'] : $row;
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

if ($action === 'create_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $group = array();
        $group['key'] = $data->tempGroup->name;
        $group['name'] = $data->tempGroup->name;
        $group['campaigns'] = array();

        foreach($data->tempGroup->selectedCampaignKeys as $key) {
            foreach($data->campaigns as $index => $campaign) {
                if ($key === $campaign->key) {
                    $g_campaign = array();
                    $g_campaign = $campaign->group;
                    $g_campaign->key = $key;
                    $g_campaign->index = $index;
                    array_push($group['campaigns'], $g_campaign);

                    $data->campaigns[$index]->group = array('columns' => $campaign->columns);
                }
            }
        }

        $data->tempGroup = array('selectedCampaignKeys' => $data->tempGroup->selectedCampaignKeys, 'name' => '');
        array_push($data->groups, $group);

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->groups);
        exit;
    }
}

if ($action === 'init_temp_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->tempGroup = array('selectedCampaignKeys' => $data->tempGroup->selectedCampaignKeys, 'name' => '');
        foreach($data->campaigns as $index => $campaign) {
            $data->campaigns[$index]->group = array('columns' => $campaign->columns, 'way' => 'all');
        }

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->tempGroup);
        exit;
    }
}

if ($action === 'set_isupdated_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $group = $data->groups[$_REQUEST['index']];
        print_r($group);
        $data->tempGroup->name = $group->name;
        $data->tempGroup->selectedCampaignKeys = [];

        foreach ($group->campaigns as $g_index => $g_campaign) {
            foreach ($data->campaigns as $c_index => $c_campaign) {
                if ($g_campaign->key === $c_campaign->key) {
                    $data->campaigns[$c_index]->group = $g_campaign;
                    array_push($data->tempGroup->selectedCampaignKeys, $c_campaign->key);
                }
            }
        }

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->tempGroup);
        exit;
    }
}

if ($action === 'update_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $group = array();
        $group['key'] = $data->tempGroup->name;
        $group['name'] = $data->tempGroup->name;
        $group['campaigns'] = array();


        foreach($data->tempGroup->selectedCampaignKeys as $key) {
            foreach($data->campaigns as $index => $campaign) {
                if ($key == $campaign->key) {
                    $g_campaign = array();
                    $g_campaign = $campaign->group;
                    $g_campaign->key = $key;
                    $g_campaign->index = $index;
                    array_push($group['campaigns'], $g_campaign);

                    $data->campaigns[$index]->group = array('columns' => $campaign->columns);
                }
            }
        }

        $data->tempGroup = array('selectedCampaignKeys' => $data->tempGroup->selectedCampaignKeys, 'name' => '');
        $data->groups[$_REQUEST['index']] = $group;

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->groups);
        exit;
    }
}

if ($action === 'delete_group') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));

        $data->groups = array_filter($data->groups, function($row) {
            return $row->key !== $_REQUEST['group']['key'];
        });

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->groups);
        exit;
    }
}

if ($action === 'get_upload') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));
        echo json_encode($data->upload);
        exit;
    }
}

if ($action === 'update_upload') {
    if (file_exists($json_file_name))
    {
        $data = json_decode(file_get_contents($json_file_name));
        $data->upload = $_REQUEST['upload'];

        file_put_contents($json_file_name, json_encode($data));

        echo json_encode($data->upload);
        exit;
    }
}

