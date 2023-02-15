<?php

namespace controllers;

require_once('Campaign.php');

use PDO;
use PDOException;

class UploadConfig
{
    public $file_path = "db/upload_config.json";

    public $init_data = ["selectedCampaignKeys" => [], "group" => 0, "way" => "all"];

    public $upload_config = [];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->set_upload_config();
    }

    public function get_upload_config()
    {
        $this->set_upload_config();
        return $this->upload_config;
    }

    public function update()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->upload_config->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->upload_config));
        echo json_encode($this->upload_config);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->upload_config);
        exit;
    }

    public function get_data_by_key($key)
    {
        return $this->upload_config->$key;
    }

    public function set_upload_config()
    {
        $this->upload_config = json_decode(file_get_contents($this->file_path));
    }
}