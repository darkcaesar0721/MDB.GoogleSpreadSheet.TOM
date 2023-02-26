<?php

namespace controllers;

class WhatsApp
{
    public $file_path = "db/WhatsApp.json";

    public $init_data = ["default_message" => "", "instance_id" => "", "token" => ""];

    public $WhatsApp = [];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->set_WhatsApp();
    }

    public function get_WhatsApp()
    {
        $this->set_WhatsApp();
        return $this->WhatsApp;
    }

    public function update()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->WhatsApp->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->WhatsApp));
        echo json_encode($this->WhatsApp);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->WhatsApp);
        exit;
    }

    public function get_data_by_key($key)
    {
        return $this->WhatsApp->$key;
    }

    public function set_WhatsApp()
    {
        $this->WhatsApp = json_decode(file_get_contents($this->file_path));
    }
}