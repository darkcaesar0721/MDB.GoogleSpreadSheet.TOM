<?php

namespace controllers;

require_once('Campaign.php');

use PDO;
use PDOException;

class Backup
{
    public $file_path = "db/backup.json";

    public $init_data = ["path" => ""];

    public $backup = [];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->set_backup();
    }

    public function get_backup()
    {
        $this->set_backup();
        return $this->backup;
    }

    public function set_data()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->backup->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->backup));
        echo json_encode($this->backup);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->backup);
        exit;
    }

    public function get_data_by_key($key)
    {
        return $this->backup->$key;
    }

    public function set_backup()
    {
        $this->backup = json_decode(file_get_contents($this->file_path));
    }

    public function run($return = true)
    {
        date_default_timezone_set('America/Los_Angeles');

        $path = $this->backup->path;
        $date = date("Y") . "" . date("m") . "" . date("d") . " " . date("h") . "_" . date("i") . "_" . date("s") . " " . date("A");
        
        $campaign_path = $path . "\\" . $date . "\\Campaigns";
        $group_path = $path . "\\" . $date . "\\Groups";
        
        if (!file_exists($campaign_path)) {
            mkdir($campaign_path, 0777, true);
        }
        if (!file_exists($group_path)) {
            mkdir($group_path, 0777, true);
        }

        $backup = file_get_contents("db/backup.json");
        file_put_contents($path . "\\" . $date . "\\" . "backup.json", $backup);

        $mdb = file_get_contents("db/mdb.json");
        file_put_contents($path . "\\" . $date . "\\" . "mdb.json", $mdb);

        $mdb = file_get_contents("db/schedule.json");
        file_put_contents($path . "\\" . $date . "\\" . "schedule.json", $mdb);

        $temp_group = file_get_contents("db/temp_group.json");
        file_put_contents($path . "\\" . $date . "\\" . "temp_group.json", $temp_group);

        $upload_config = file_get_contents("db/upload_config.json");
        file_put_contents($path . "\\" . $date . "\\" . "upload_config.json", $upload_config);

        $whatsapp_config = file_get_contents("db/WhatsApp.json");
        file_put_contents($path . "\\" . $date . "\\" . "WhatsApp.json", $whatsapp_config);

        $campaigns = glob("db\\campaigns" . "\\" . "*.json");
        foreach($campaigns as $index => $file) {
            $campaign = file_get_contents($file);
            file_put_contents($campaign_path . "\\" . ($index + 1) . ".json", $campaign);
        }

        $groups = glob("db\\groups" . "\\" . "*.json");
        foreach($groups as $index => $file) {
            $group = file_get_contents($file);
            file_put_contents($group_path . "\\" . ($index + 1) . ".json", $group);
        }
        if ($return) {
            echo json_encode("success");
            exit;
        }
    }
}