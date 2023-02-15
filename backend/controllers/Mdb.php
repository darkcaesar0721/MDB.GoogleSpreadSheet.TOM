<?php

namespace controllers;

require_once('Campaign.php');

use PDO;
use PDOException;

class Mdb
{
    public $file_path = "db/mdb.json";

    public $init_data = ["path" => ""];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }
    }

    public function set_data()
    {
        $rows = $_REQUEST['rows'];

        $contents = json_decode(file_get_contents($this->file_path));

        foreach($rows as $key => $value) {
            $contents->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($contents));
        echo json_encode($contents);
        exit;
    }

    public function get_data()
    {
        $contents = json_decode(file_get_contents($this->file_path));
        echo json_encode($contents);
        exit;
    }

    public function get_data_by_key($key) {
        $contents = json_decode(file_get_contents($this->file_path));
        return $contents->$key;
    }

    public function get_query_columns()
    {
        $query = $_REQUEST['query'];
        $campaignObj = new \controllers\Campaign();
        if ($campaignObj->is_duplicated($query)) {
            echo json_encode(array('status' => 'error', 'description' => 'This query already exists.'));
            exit;
        }

        $mdb_path = $this->get_data_by_key('path');

        try {
            # OPEN BOTH DATABASE CONNECTIONS
            $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sth = $db->prepare("select * from [$query]");
            $sth->execute();

            $data = array();
            while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
                $data = array_keys($row);
                break;
            }

            $isPhone = false;
            foreach($data as $row) {
                if ($row === 'Phone') {
                    $isPhone = true;
                    break;
                }
            }

            if (!$isPhone) {
                echo json_encode(array('status' => 'error', 'description' => "This query doesn't include phone field."));
                exit;
            }

            echo json_encode(array('status' => 'success', 'columns' => $data));
            exit;
        } catch(PDOException $e) {
            echo json_encode(array('status' => 'error', 'description' => 'Please check mdb path and query name!'));
            exit;
        }
    }
}