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

    public function get_groups()
    {
        $this->set_group_lists();
        return $this->group_lists;
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
        $campaigns = $campaignObj->get_campaigns();

        $group = $this->group_lists[$_REQUEST['index']];

        $selectedCampaignKeys = [];
        foreach($group->campaigns as $k => $c) {
            $campaignObj->save_data_by_rows($c->index, ["group" => $c]);
            array_push($selectedCampaignKeys, $c->key);
        }
        if ($group->orderCampaigns != "") {
            foreach($group->orderCampaigns as $o_c) {
                $campaigns[$o_c->campaignIndex]->group->order = $o_c->order;
                $campaignObj->save_data_by_rows($o_c->campaignIndex, ["group" => $campaigns[$o_c->campaignIndex]->group]);
            }
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
        $group['orderCampaigns'] = array();

        foreach($campaigns as $i => $c) {
            $orderCampaign = array();
            $orderCampaign['campaignIndex'] = $i;
            $orderCampaign['order'] = $c->group->order;
            array_push($group['orderCampaigns'], $orderCampaign);
        }

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

        $group->orderCampaigns = array();

        foreach($campaigns as $i => $c) {
            $orderCampaign = array();
            $orderCampaign['campaignIndex'] = $i;
            $orderCampaign['order'] = $c->group->order;
            array_push($group->orderCampaigns, $orderCampaign);
        }

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

    public function update_group_campaign_weekday()
    {
        $g_i = $_REQUEST['groupIndex'];
        $g_c_i = $_REQUEST['groupCampaignIndex'];

        $weekday = $_REQUEST['weekday'];

        foreach($weekday as $key => $value) {
            if ($this->group_lists[$g_i]->campaigns[$g_c_i]->weekday == '') {
                $this->group_lists[$g_i]->campaigns[$g_c_i]->weekday = [];
                $this->group_lists[$g_i]->campaigns[$g_c_i]->weekday[$key] = $value;
            } else {
                $this->group_lists[$g_i]->campaigns[$g_c_i]->weekday->$key = $value;
            }
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

    public function save_data($data)
    {
        file_put_contents($this->folder_path . '/' . $data->file_name, json_encode($data));
    }

    public function set_group_lists()
    {
        $this->group_lists = [];

        $files = glob($this->folder_path . "\\" . "*.json");
        foreach($files as $index => $file) {
            $_group = json_decode(file_get_contents($file));
            $group = json_decode(json_encode($_group), true);

            foreach ($group['campaigns'] as $i => $c) {
                if (!array_key_exists('weekday', $c)) {
                    $c['weekday'] = ['Sunday' => true, 'Monday' => true, 'Tuesday' => true, 'Wednesday' => true, 'Thursday' => true, 'Friday' => true, 'Saturday' => true];
                }
                $group['campaigns'][$i] = $c;
            }
            file_put_contents($file, json_encode($group));
            $group = json_decode(file_get_contents($file));

            array_push($this->group_lists, $group);
        }

//        usort($this->group_lists, function($a, $b) { return $a->index - $b->index; });
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