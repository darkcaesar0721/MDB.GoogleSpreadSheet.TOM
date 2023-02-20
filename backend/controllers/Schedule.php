<?php

namespace controllers;

require __DIR__ . '/../vendor/autoload.php';

use Google_Client;
use Google_Service_Sheets;
use Google_Service_Sheets_ValueRange;

use PDO;
use PDOException;

class Schedule
{
    public $file_path = "db/schedule.json";

    public $init_data = ["path" => "https://docs.google.com/spreadsheets/d/16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI/edit#gid=0"];

    public $schedule = [];

    public $schedules = [];

    public $cur_schedule_index = -1;

    public $cur_schedule = [];

    public $service;

    public function init()
    {
        if (!file_exists($this->file_path)) {
            $fp = fopen($this->file_path, 'w');
            fwrite($fp, json_encode($this->init_data));
            fclose($fp);
        }

        $this->init_google_sheet_service();
        $this->set_schedule();
    }

    public function init_google_sheet_service()
    {
        $client = new \Google_Client();
        $client->setApplicationName('Google Sheets and PHP');
        $client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);
        $client->setAccessType('offline');
        $client->setAuthConfig(__DIR__ . '/../credentials.json');
        $this->service = new Google_Service_Sheets($client);
    }

    public function get_schedule()
    {
        $this->set_schedule();
        return $this->schedule;
    }

    public function set_data()
    {
        $rows = $_REQUEST['rows'];

        foreach($rows as $key => $value) {
            $this->schedule->$key = $value;
        }

        file_put_contents($this->file_path, json_encode($this->schedule));
        echo json_encode($this->schedule);
        exit;
    }

    public function get_data()
    {
        echo json_encode($this->schedule);
        exit;
    }

    public function get_data_by_key($key)
    {
        return $this->schedule->$key;
    }

    public function set_schedule()
    {
        $this->schedule = json_decode(file_get_contents($this->file_path));
    }

    public function set_data_by_date($date)
    {
        $url_array = parse_url($this->schedule->path);
        $path_array = explode("/", $url_array["path"]);

        $spreadsheetId = $path_array[3];
        $spreadSheet = $this->service->spreadsheets->get($spreadsheetId);
        $sheets = $spreadSheet->getSheets();

        $cur_sheet = [];
        foreach($sheets as $sheet) {
            $sheetId = $sheet['properties']['sheetId'];

            $pos = strpos($this->schedule->path, "gid=" . $sheetId);

            if($pos) {
                $cur_sheet = $sheet;
                break;
            }
        }

        $response = $this->service->spreadsheets_values->get($spreadsheetId, $cur_sheet['properties']['title']);
        $this->schedules = $response->getValues();

        foreach($this->schedules as $i => $v) {
            foreach($v as $j => $r) {
                if (strtotime(date('Y-m-d')) == strtotime(date($r))) {
                    $this->cur_schedule_index = $i;
                    $this->cur_schedule = $v;
                }
            }
        }
    }

    public function get_schedule_column_index($schedule)
    {
        $index = -1;
        foreach($this->schedules as $i => $v) {
            foreach($v as $j => $r) {
                if ($r == $schedule) {
                    $index = $j;
                }
            }
        }
        return $index;
    }

    public function upload_count_by_schedule($action, $g_i, $c_i, $groups, $campaigns)
    {
        $url_array = parse_url($this->schedule->path);
        $path_array = explode("/", $url_array["path"]);

        $spreadsheetId = $path_array[3];

        $spreadSheet = $this->service->spreadsheets->get($spreadsheetId);
        $sheets = $spreadSheet->getSheets();

        $cur_sheet = [];
        foreach($sheets as $sheet) {
            $sheetId = $sheet['properties']['sheetId'];

            $pos = strpos($this->schedule->path, "gid=" . $sheetId);

            if($pos) {
                $cur_sheet = $sheet;
                break;
            }
        }

        $cur_schedule = $this->cur_schedule;
        $cur_schedule_index = $this->cur_schedule_index;

        if (date('w') == 4) {
            $name = date('l') . ' ' . $groups[$g_i]->name;
            $cur_schedule = [];
            $cur_schedule_index = -1;
            foreach($this->schedules as $i => $v) {
                $cur_date_index = -1;
                $cur_name_index = -1;
                foreach($v as $j => $r) {
                    if (strtotime(date('Y-m-d')) == strtotime(date($r))) {
                        $cur_date_index = $i;
                    }
                    if ($name == $r) {
                        $cur_name_index = $i;
                    }
                }

                if ($cur_date_index != -1 && $cur_date_index == $cur_name_index) {
                    $cur_schedule = $v;
                    $cur_schedule_index = $i;
                }
            }

            $row = ['', date('m/d/Y'), $name];

            for ($i = 3; $i < 100; $i++) {
                $ext = false;
                foreach($campaigns as $c_index => $c){
                    if ($i == $c->scheduleIndex) {
                        if ($action == 'upload_all' || ($action != 'upload_all' && $c_index == $c_i)) {
                            if ($cur_schedule_index !== -1) {
                                if ($cur_schedule[$i]) {
                                    if (strpos($cur_schedule[$i], '+') !== false) {
                                        array_push($row, $cur_schedule[$i] . '+' . $c->less_qty);
                                    } else {
                                        $exp = explode(" ", $cur_schedule[$i]);
                                        if (count($exp) > 2) {
                                            array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
                                        } else {
                                            if ((int)$exp[0] < 13) {
                                                array_push($row, $cur_schedule[$i] . '+' . $c->less_qty);
                                            } else {
                                                array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
                                            }
                                        }
                                    }
                                } else {
                                    array_push($row, $c->less_qty);
                                }

                            } else {
                                array_push($row, $c->less_qty);
                            }
                        } else {
                            if ($cur_schedule_index !== -1) {
                                if ($cur_schedule[$i]) {
                                    array_push($row, $cur_schedule[$i]);
                                } else {
                                    array_push($row, ' ');
                                }

                            } else {
                                array_push($row, ' ');
                            }
                        }
                        $ext = true;
                    }
                }

                if (!$ext) {
                    if (!$cur_schedule[$i]) array_push($row, ' ');
                    else array_push($row, $cur_schedule[$i]);
                }
            }
        } else {
            $row = ['', date('m/d/Y'), date('l')];
            for ($i = 3; $i < 100; $i++) {
                $ext = false;
                foreach($campaigns as $c_index => $c){
                    if ($i == $c->scheduleIndex) {
                        if ($action == 'upload_all' || ($action != 'upload_all' && $c_index == $c_i)) {
                            if ($cur_schedule_index !== -1) {
                                if ($cur_schedule[$i]) {
                                    if (strpos($cur_schedule[$i], '+') !== false) {
                                        array_push($row, $cur_schedule[$i] . '+' . $c->less_qty);
                                    } else {
                                        $exp = explode(" ", $cur_schedule[$i]);
                                        if (count($exp) > 2) {
                                            array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
                                        } else {
                                            if ((int)$exp[0] < 13) {
                                                array_push($row, $cur_schedule[$i] . '+' . $c->less_qty);
                                            } else {
                                                array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
                                            }
                                        }
                                    }
                                } else {
                                    array_push($row, $c->less_qty);
                                }

                            } else {
                                array_push($row, $c->less_qty);
                            }
                        } else {
                            if ($cur_schedule_index !== -1) {
                                if ($cur_schedule[$i]) {
                                    array_push($row, $cur_schedule[$i]);
                                } else {
                                    array_push($row, ' ');
                                }

                            } else {
                                array_push($row, ' ');
                            }
                        }
                        $ext = true;
                    }
                }

                if (!$ext) {
                    if (!$cur_schedule[$i]) array_push($row, ' ');
                    else array_push($row, $cur_schedule[$i]);
                }
            }
        }

        $body = new Google_Service_Sheets_ValueRange([
            'values' => [$row]
        ]);
        $params = [
            'valueInputOption' => 'USER_ENTERED'
        ];

        if ($cur_schedule_index == -1) {
            $update_range = $cur_sheet['properties']['title']. '!' . 'A' . (count($this->schedules) + 1) . ':' . 'ZZ' . (count($this->schedules) + 1);
        } else {
            $update_range = $cur_sheet['properties']['title'] . '!' . 'A' . ($cur_schedule_index + 1) . ':' . 'ZZ' . ($cur_schedule_index + 1);
        }

        $update_sheet = $this->service->spreadsheets_values->update($spreadsheetId, $update_range, $body, $params);
    }
}