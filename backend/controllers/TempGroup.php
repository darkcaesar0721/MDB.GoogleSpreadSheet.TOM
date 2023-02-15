<?php

namespace controllers;

class TempGroup
{
    public $file_path = "db/temp_group.json";

    public $init_data = [
        "selectedCampaignKeys" => [],
        "name" => ""
    ];

    public $temp_group = [];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->set_temp_group();
    }

    public function init_data_to_edit_group()
    {
        $this->temp_group->name = "";
        $this->save_data();
    }

    public function get_temp_group()
    {
        $this->set_temp_group();
        return $this->temp_group;
    }

    public function update()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->temp_group->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->temp_group));
        echo json_encode($this->temp_group);
        exit;
    }

    public function save_data()
    {
        file_put_contents($this->file_path, json_encode($this->temp_group));
    }

    public function get_data()
    {
        echo json_encode($this->temp_group);
        exit;
    }

    public function get_data_by_key($key) {
        return $this->temp_group->$key;
    }

    public function set_temp_group() {
        $this->temp_group = json_decode(file_get_contents($this->file_path));
    }
}