<?php

namespace controllers;

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

    public function create()
    {
        $campaigns = glob($this->folder_path . "\\" . "*.json");
        $name = (count($campaigns) + 1) . '.json';

        $data = $_REQUEST['data'];

        $campaign = array_merge($this->init_data, $data);
        $campaign['index'] = count($campaigns);
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