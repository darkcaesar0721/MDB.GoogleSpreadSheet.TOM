<?php

namespace controllers;

require_once('TempGroup.php');
require_once('Campaign.php');

class Group
{
    public $folder_path = "db/groups";

    public $init_data = [
        "index" => 0,
        "key" => "",
        "name" => "",
        "campaigns" => [
        ]
    ];

    public $group_lists = [];

    public function init()
    {
        if (!file_exists($this->folder_path)) {
            mkdir($this->folder_path, 0777, true);
        }

        $this->set_group_lists();
    }

    public function init_edit_group()
    {
        $tempGroupObj = new \controllers\TempGroup();
        $tempGroupObj->init();
        $tempGroupObj->init_data_to_edit_group();

        $campaignObj = new \controllers\Campaign();
        $campaignObj->init();
        $campaignObj->init_data_to_edit_group();

        echo json_encode("success");
        exit;
    }

    public function set_edit_group()
    {

        $tempGroupObj = new \controllers\TempGroup();
        $tempGroupObj->init();

        $campaignObj = new \controllers\Campaign();
        $campaignObj->init();

        $group = $this->group_lists[$_REQUEST['index']];

        $selectedCampaignKeys = [];
        foreach($group->campaigns as $k => $c) {
            $campaignObj->save_data_by_rows($c->index, ["group" => $c]);
            array_push($selectedCampaignKeys, $c->key);
        }

        $tempGroupObj->save_data_by_rows(["selectedCampaignKeys" => $selectedCampaignKeys, "name" => $group->name]);
        echo json_encode("success");
        exit;
    }

    public function create()
    {
        $tempGroupObj = new \controllers\TempGroup();
        $temp_group = $tempGroupObj->get_temp_group();

        $campaignObj = new \controllers\Campaign();
        $campaigns = $campaignObj->get_campaigns();

        $name = (count($this->group_lists) + 1) . '.json';

        $group = array();

        $group['index'] = count($this->group_lists);
        $group['file_name'] = $name;
        $group['key'] = $temp_group->name;
        $group['name'] = $temp_group->name;
        $group['order'] = $group['index'] + 1;
        $group['campaigns'] = array();
        

        foreach($temp_group->selectedCampaignKeys as $key) {
            foreach($campaigns as $i => $c) {
                if ($key === $c->key) {
                    $g_c = array();
                    $g_c = $c->group;
                    $g_c->key = $key;
                    $g_c->index = $c->index;
                    $g_c->order = $c->group->order;
                    array_push($group['campaigns'], $g_c);
                }
            }
        }

        $tempGroupObj->init();
        $tempGroupObj->init_data_to_edit_group();

        $campaignObj->init();
        $campaignObj->init_data_to_edit_group();

        $fp = fopen($this->folder_path . '/' . $name, 'w');
        fwrite($fp, json_encode($group));
        fclose($fp);

        array_push($this->group_lists, $group);

        echo json_encode($this->group_lists);
        exit;
    }

    public function update()
    {
        $tempGroupObj = new \controllers\TempGroup();
        $temp_group = $tempGroupObj->get_temp_group();

        $campaignObj = new \controllers\Campaign();
        $campaigns = $campaignObj->get_campaigns();

        $group = $this->group_lists[$_REQUEST['index']];

        $group->key = $temp_group->name;
        $group->name = $temp_group->name;
        $group->campaigns = array();
        

        foreach($temp_group->selectedCampaignKeys as $key) {
            foreach($campaigns as $i => $c) {
                if ($key === $c->key) {
                    $g_c = array();
                    $g_c = $c->group;
                    $g_c->key = $key;
                    $g_c->index = $c->index;
                    $g_c->order = $c->group->order;
                    array_push($group->campaigns, $g_c);
                }
            }
        }

        $tempGroupObj->init();
        $tempGroupObj->init_data_to_edit_group();

        $campaignObj->init();
        $campaignObj->init_data_to_edit_group();

        $fp = fopen($this->folder_path . '/' . $group->file_name, 'w');
        fwrite($fp, json_encode($group));
        fclose($fp);

        array_push($this->group_lists, $group);

        echo json_encode($this->group_lists);
        exit;
    }

    public function update_group_campaign()
    {
        $g_i = $_REQUEST['groupIndex'];
        $g_c_i = $_REQUEST['groupCampaignIndex'];

        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->group_lists[$g_i]->campaigns[$g_c_i]->$key = $value;
        }

        $group =$this->group_lists[$g_i];

        $fp = fopen($this->folder_path . '/' . $group->file_name, 'w');
        fwrite($fp, json_encode($group));
        fclose($fp);

        echo json_encode($this->group_lists);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->group_lists);
        exit;
    }

    public function set_group_lists()
    {
        $this->group_lists = [];

        $files = glob($this->folder_path . "\\" . "*.json");
        foreach($files as $index => $file) {
            $group = json_decode(file_get_contents($file));
            array_push($this->group_lists, $group);
        }
    }

    public function is_name_duplicated($name)
    {
        $is_duplicated = false;
        $files = glob($this->folder_path . "\\" . "*.json");

        foreach($files as $index => $file) {
            $group = json_decode(file_get_contents($file));

            if ($group->name == $name) {
                $is_duplicated = true;
                break;
            }
        }

        return $is_duplicated;
    }
}