<?php

namespace controllers;

class Mdb
{
    public $file_path = "db/mdb.json";
    public $folder_path = "db";
    public $init_data = ["path" => ""];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }
    }

    public function set_data() {
        $rows = $_REQUEST['rows'];

        $contents = json_decode(file_get_contents($this->file_path));

        foreach($rows as $key => $value) {
            $contents->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($contents));
        echo json_encode($contents);
        exit;
    }

    public function get_data() {
        $contents = json_decode(file_get_contents($this->file_path));
        echo json_encode($contents);
        exit;
    }
}