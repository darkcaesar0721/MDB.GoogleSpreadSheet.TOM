<?php

namespace controllers;

require_once('Campaign.php');

use PDO;
use PDOException;

class Mdb
{
    public $file_path = "db/mdb.json";

    public $init_data = ["path" => ""];

    public $mdb = [];

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->set_mdb();
    }

    public function get_mdb()
    {
        $this->set_mdb();
        return $this->mdb;
    }

    public function set_data()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->mdb->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->mdb));
        echo json_encode($this->mdb);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->mdb);
        exit;
    }

    public function get_data_by_key($key)
    {
        return $this->mdb->$key;
    }

    public function set_mdb()
    {
        $this->mdb = json_decode(file_get_contents($this->file_path));
    }

    public function get_input_date($return = false)
    {
        $mdb_path = $this->get_data_by_key('path');

        $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $input_query = "002_DateInput";
        $input_sth = $db->prepare("select * from [$input_query]");
        $input_sth->execute();

        $field = "";
        while ($input = $input_sth->fetch(PDO::FETCH_ASSOC)) {
            $field = $input['Date'];
            break;
        }

        if (!$return) {
            echo json_encode($field);
            exit;
        } else {
            return $field;
        }

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

            $columns = array();
            foreach($data as $row) {
                $column = array();
                $column['name'] = $row;

                $pos = strpos($row, "changedate");
                if ($pos) {
                    $input_query = "002_DateInput";
                    $input_sth = $db->prepare("select * from [$input_query]");
                    $input_sth->execute();

                    $field = "";
                    while ($input = $input_sth->fetch(PDO::FETCH_ASSOC)) {
                        $field = $input['Date'];
                        break;
                    }

                    $column['field'] = $field;
                    $column['isInputDate'] = true;
                } else {
                    $column['field'] = $row;
                    $column['isInputDate'] = false;
                }
                array_push($columns, $column);
            }

            echo json_encode(array('status' => 'success', 'columns' => $columns));
            exit;
        } catch(PDOException $e) {
            echo json_encode(array('status' => 'error', 'description' => 'Please check mdb path and query name!'));
            exit;
        }
    }
}