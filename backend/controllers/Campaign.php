<?php

namespace controllers;

require_once('TempGroup.php');

class Campaign
{
    public $folder_path = "db/campaigns";

    public $init_data = [
        "index" => 0,
        "key" => "",
        "query" => "",
        "urls" => [],
        "schedule" => "",
        "columns" => [],
        "file_name" => "",
        "group" => [
            "columns" => [],
            "way" => "all",
            "order" => 0,
        ]
    ];

    public $campaign_lists = [];

    public function init()
    {
        if (!file_exists($this->folder_path)) {
            mkdir($this->folder_path, 0777, true);
        }

        $this->set_campaign_lists();
    }

    public function get_campaigns()
    {
        $this->set_campaign_lists();
        return $this->campaign_lists;
    }

    public function init_data_to_edit_group()
    {
        foreach($this->campaign_lists as $i => $c) {
            $this->campaign_lists[$i]->group = array_merge($this->init_data['group'], array("columns" => $c->columns, "order" => $c->index + 1));
            file_put_contents($this->folder_path . '/' . $c->file_name, json_encode($this->campaign_lists[$i]));
        }
    }

    public function save_data_by_rows($index, $rows)
    {
        $campaign = $this->campaign_lists[$index];

        $file_name = $campaign->file_name;
        $file_path = $this->folder_path . '/' . $file_name;

        foreach ($rows as $key => $value) {
            $campaign->$key = $value;
        }
        file_put_contents($file_path, json_encode($campaign));
    }

    public function create()
    {
        $name = (count($this->campaign_lists) + 1) . '.json';

        $data = $_REQUEST['data'];

        $campaign = array_merge($this->init_data, $data);
        $campaign['index'] = count($this->campaign_lists);
        $campaign['key'] = $campaign['query'];
        $campaign['file_name'] = $name;
        $campaign['group']['columns'] = $campaign['columns'];
        $campaign['group']['order'] = $campaign['index'] + 1;

        $fp = fopen($this->folder_path . '/' . $name, 'w');
        fwrite($fp, json_encode($campaign));
        fclose($fp);

        array_push($this->campaign_lists, $campaign);

        echo json_encode($this->campaign_lists);
        exit;
    }

    public function update()
    {
        $file_name = $_REQUEST['file_name'];

        $file_path = $this->folder_path . '/' . $file_name;

        $campaign = json_decode(file_get_contents($file_path));

        if (array_key_exists('campaign', $_REQUEST)) {
            $c = $_REQUEST['campaign'];
            foreach($c as $k => $v) {
                $campaign->$k = $v;
            }
        }

        if (array_key_exists('group', $_REQUEST)) {
            $g = $_REQUEST['group'];
            foreach($g as $k => $v) {
                $campaign->group->$k = $v;
            }
        }

        file_put_contents($file_path, json_encode($campaign));

        $this->set_campaign_lists();
        echo json_encode($this->campaign_lists);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->campaign_lists);
        exit;
    }

    public function set_campaign_lists()
    {
        $this->campaign_lists = [];

        $files = glob($this->folder_path . "\\" . "*.json");
        foreach($files as $index => $file) {
            $campaign = json_decode(file_get_contents($file));
            array_push($this->campaign_lists, $campaign);
        }
    }

    public function save_data($data)
    {
        file_put_contents($this->folder_path . '/' . $data->file_name, json_encode($data));
    }

    public function save_datas($datas)
    {
        foreach ($datas as $data) {
            file_put_contents($this->folder_path . '/' . $data->file_name, json_encode($data));
        }
    }

    public function update_group_order()
    {
        $campaigns = $_REQUEST['campaigns'];
        foreach($campaigns as $i => $n_c) {
            foreach($this->campaign_lists as $j => $o_c) {
                if ($n_c['key'] === $o_c->key) {
                    $o_c->group->order = $i + 1;
                    $this->save_data($o_c);
                }
            }
        }

        $tempGroupObj = new \controllers\TempGroup();
        $selectedCampaignKeys = [];
        foreach($campaigns as $i => $c) {
            foreach($tempGroupObj->get_data_by_key("selectedCampaignKeys") as $j => $s_c_key) {
                if ($c['key'] === $s_c_key) {
                    array_push($selectedCampaignKeys, $s_c_key);
                }
            }
        }
        $tempGroupObj->update_data_by_keys(["selectedCampaignKeys" => $selectedCampaignKeys]);

        echo json_encode("success");
    }

    public function is_duplicated($query)
    {
        $is_duplicated = false;
        $files = glob($this->folder_path . "\\" . "*.json");

        foreach($files as $index => $file) {
            $campaign = json_decode(file_get_contents($file));

            if ($campaign->query == $query) {
                $is_duplicated = true;
                break;
            }
        }

        return $is_duplicated;
    }
}