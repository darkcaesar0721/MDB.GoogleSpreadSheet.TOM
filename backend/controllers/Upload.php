<?php

namespace controllers;

require_once('Mdb.php');
require_once('Campaign.php');
require_once('Group.php');
require_once('UploadConfig.php');
require_once('Backup.php');

require __DIR__ . '/../vendor/autoload.php';

use Google_Client;
use Google_Service_Sheets;
use Google_Service_Sheets_ValueRange;

use PDO;
use PDOException;

class Upload
{
	public $mdb_obj;
	public $schedule_obj;
	public $campaign_obj;
	public $group_obj;
	public $upload_config_obj;
	public $backup_obj;
    public $whatsapp_obj;

	public $mdb;
	public $schedule;
	public $campaigns;
	public $groups;
	public $upload_config;
	public $backup;

	public $service;

	public $schedules = [[]];
	public $cur_schedule = [];
	public $cur_schedule_index = -1;

	public function init()
	{
        date_default_timezone_set('America/Los_Angeles');

		$this->init_mdb();
		$this->init_schedule();
		$this->init_campaigns();
		$this->init_groups();
		$this->init_upload_config();
		$this->init_backup();
        $this->init_whatsapp();

        $this->init_google_sheet_service();

        $this->schedule_obj->set_data_by_date(date("m/d/Y"));
	}

	public function init_mdb()
	{
		$this->mdb_obj = new \controllers\Mdb();
        $this->mdb_obj->init();
        $this->mdb = $this->mdb_obj->get_mdb();
	}

    public function init_schedule()
    {
        $this->schedule_obj = new \controllers\Schedule();
        $this->schedule_obj->init();
        $this->schedule = $this->schedule_obj->get_schedule();
    }

	public function init_campaigns()
	{
		$this->campaign_obj = new \controllers\Campaign();
        $this->campaign_obj->init();
        $this->campaigns = $this->campaign_obj->get_campaigns();
	}

	public function init_groups()
	{
		$this->group_obj = new \controllers\Group();
        $this->group_obj->init();
        $this->groups = $this->group_obj->get_groups();
	}

	public function init_upload_config()
	{
		$this->upload_config_obj = new \controllers\UploadConfig();
        $this->upload_config_obj->init();
        $this->upload_config = $this->upload_config_obj->get_upload_config();
	}

	public function init_backup()
	{
		$this->backup_obj = new \controllers\Backup();
        $this->backup_obj->init();
	}

    public function init_whatsapp()
    {
        $this->whatsapp_obj = new \controllers\WhatsApp();
        $this->whatsapp_obj->init();
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

	public function init_schedule_data()
	{
        date_default_timezone_set('America/Los_Angeles');

		$response = $this->service->spreadsheets_values->get('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', 'Sheet1');

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

	public function get_last_phone()
	{
		$c_i = $_REQUEST['campaignIndex'];
		$c = $this->campaigns[$c_i];

        $mdb_path = $this->mdb->path;

        $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $query = $c->query;
        $sth = $db->prepare("select * from [$query]");
        $sth->execute();

        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            $c->last_phone = $row['Phone'];
            $c->SystemCreateDate = $row['SystemCreateDate'];
            $c->isGetLastPhone = true;
            $this->campaign_obj->save_data($c);
            $this->campaigns[$c_i] = $c;
            echo json_encode($this->campaigns);
            exit;
        }
        echo json_encode($this->campaigns);
        exit;
	}

    public function upload_after_preview()
    {
        $g_i = $_REQUEST['groupIndex'];
        $g_c_i = $_REQUEST['groupCampaignIndex'];
        $c_i = $_REQUEST['campaignIndex'];

        $this->upload_after_preview_data($g_i, $g_c_i, $c_i);

        $this->campaigns[$c_i]->_last_qty = 0;
        $this->campaigns[$c_i]->_less_qty = 0;
        $this->campaigns[$c_i]->_last_phone = "";
        $this->campaigns[$c_i]->_SystemCreateDate = "";
        $this->campaigns[$c_i]->_upRows = [];
        $this->campaigns[$c_i]->_up_rows = [];
        $this->campaigns[$c_i]->isManually = false;
        $this->campaigns[$c_i]->isGetLastPhone = false;
        $this->campaigns[$c_i]->lastUploadDateTime = date("m/d/Y h:i A");

        $this->campaigns[$c_i]->isLast = true;

        foreach ($this->campaigns as $_c_i => $c) {
            if ($_c_i != $c_i) {
                $this->campaigns[$_c_i]->scheduleIndex = -1;
            }
        }

        $this->campaign_obj->save_datas($this->campaigns);

        $this->schedule_obj->upload_count_by_schedule("upload_one_by_one", $g_i, $c_i, $this->groups, $this->campaigns);

        $whatsapp = $this->whatsapp_obj->get_WhatsApp();

        if (($whatsapp->isWhatsApp == '' || $whatsapp->isWhatsApp == true || $whatsapp->isWhatsApp == 'true') && $this->campaigns[$c_i]->less_qty !== '0' && $this->campaigns[$c_i]->less_qty !== 0) {
            $this->whatsapp_obj->send($this->groups[$g_i]->campaigns[$g_c_i]);
        }

        $this->backup_obj->run(false);
        echo json_encode($this->campaigns);
        exit;
    }

	public function upload_one_by_one()
	{
        date_default_timezone_set('America/Los_Angeles');

		$g_i = $_REQUEST['groupIndex'];
	    $g_c_i = $_REQUEST['groupCampaignIndex'];
	    $c_i = $_REQUEST['campaignIndex'];
        $manually = $_REQUEST['manually'];

	    $this->upload_data($g_i, $g_c_i, $c_i, $manually);

        if ($manually == "false") {
            $this->campaigns[$c_i]->isLast = true;
            $this->campaigns[$c_i]->isManually = false;

            foreach ($this->campaigns as $_c_i => $c) {
                if ($_c_i != $c_i) {
                    $this->campaigns[$_c_i]->scheduleIndex = -1;
                }
            }
            $this->campaigns[$c_i]->isGetLastPhone = false;
            $this->campaigns[$c_i]->lastUploadDateTime = date("m/d/Y h:i A");
        } else {
            $this->campaigns[$c_i]->isManually = true;
        }

	    $this->campaign_obj->save_datas($this->campaigns);

        if ($manually == "false") {
            $this->schedule_obj->upload_count_by_schedule("upload_one_by_one", $g_i, $c_i, $this->groups, $this->campaigns);
            $whatsapp = $this->whatsapp_obj->get_WhatsApp();
            if (($whatsapp->isWhatsApp == '' || $whatsapp->isWhatsApp == true || $whatsapp->isWhatsApp == 'true') && $this->campaigns[$c_i]->less_qty !== '0' && $this->campaigns[$c_i]->less_qty !== 0) {
                $this->whatsapp_obj->send($this->groups[$g_i]->campaigns[$g_c_i]);
            }
        }

	    $this->backup_obj->run(false);

        $this->upload_config = $this->upload_config_obj->get_upload_config();
	    echo json_encode(array('campaign' => $this->campaigns[$c_i], 'config' => $this->upload_config));
	    exit;
	}

	public function randomGen($min, $max, $quantity)
    {
        $numbers = range($min, $max);
        shuffle($numbers);
        return array_slice($numbers, 0, $quantity);
    }

    public function upload_after_preview_data($g_i, $g_c_i, $c_i)
    {
        $c = $this->campaigns[$c_i];

        foreach($c->urls as $u_i => $url) {
            $url_array = parse_url($url);
            $path_array = explode("/", $url_array["path"]);

            $spreadsheetId = $path_array[3];

            $spreadSheet = $this->service->spreadsheets->get($spreadsheetId);
            $sheets = $spreadSheet->getSheets();

            $cur_sheet = [];
            foreach ($sheets as $sheet) {
                $sheetId = $sheet['properties']['sheetId'];

                $pos = strpos($url, "gid=" . $sheetId);

                if ($pos) {
                    $cur_sheet = $sheet;
                    break;
                }
            }

            if ($cur_sheet) {
                if ($u_i === 0) {
                    $this->campaigns[$c_i]->last_qty = $c->_last_qty;
                    $this->campaigns[$c_i]->less_qty = $c->_less_qty;
                    if ($c->_less_qty > 0) {
                        $this->campaigns[$c_i]->last_phone = $c->_last_phone;
                        $this->campaigns[$c_i]->SystemCreateDate = $c->_SystemCreateDate;
                    }
                    $this->campaigns[$c_i]->upRows = $c->_upRows;
                    $this->campaigns[$c_i]->lastGroupIndex = $g_i;
                }

                if (count($c->_upRows) > 0) {
                    array_push($c->_up_rows, ['', '', '', '', '', '', '', '', '', '', '', '']);

                    for($i = 1; $i < count($c->_up_rows); $i++) {
                        for ($j = 0; $j < count($c->_up_rows[$i]); $j++) {
                            if ($c->_up_rows[$i][$j] == '') $c->_up_rows[$i][$j] = ' ';
                        }
                    }

                    $valueRange = new \Google_Service_Sheets_ValueRange();
                    $valueRange->setValues($c->_up_rows);
                    $range = $cur_sheet['properties']['title']; // the service will detect the last row of this sheet
                    $options = ['valueInputOption' => 'USER_ENTERED'];

                    $response = $this->service->spreadsheets_values->get($spreadsheetId, $range);
                    $values = $response->getValues();
                    $this->service->spreadsheets_values->append($spreadsheetId, $range, $valueRange, $options);
                }
            }
        }

        $this->campaigns[$c_i]->scheduleIndex = $this->schedule_obj->get_schedule_column_index($c->schedule);
    }

	public function upload_data($g_i, $g_c_i, $c_i, $manually = false)
	{
		$g = $this->groups[$g_i];
	    $g_c = $this->groups[$g_i]->campaigns[$g_c_i];
	    $c = $this->campaigns[$c_i];

        $is_input_date_field = false;
        foreach($g_c->columns as $col) {
            $_col = json_decode(json_encode($col), true);
            if (array_key_exists('isInputDate', $_col) && ($_col['isInputDate'] != "false")) {
                $is_input_date_field = true;
            }
        }

        if ($is_input_date_field) {
            $input_date = $this->mdb_obj->get_input_date(true);

            foreach($g_c->columns as $i => $col) {
                if ($col->isInputDate != "false") {
                    $g_c->columns[$i]->field = $input_date;
                }
            }
            $this->groups[$g_i]->campaigns[$g_c_i] = $g_c;
            $this->group_obj->save_data($this->groups[$g_i]);
        }

	    $rows = array();
	    $up_rows = array();
	    $up_rows_with_key = array();

	    foreach($c->urls as $u_i => $url) {
	        $url_array = parse_url($url);
	        $path_array = explode("/", $url_array["path"]);

	        $spreadsheetId = $path_array[3];

	        $spreadSheet = $this->service->spreadsheets->get($spreadsheetId);
	        $sheets = $spreadSheet->getSheets();

	        $cur_sheet = [];
	        foreach($sheets as $sheet) {
	            $sheetId = $sheet['properties']['sheetId'];

	            $pos = strpos($url, "gid=" . $sheetId);

	            if($pos) {
	                $cur_sheet = $sheet;
	                break;
	            }
	        }

	        if ($cur_sheet) {
	            if ($u_i === 0) {
	                $is_last_phone = false;
	                $last_phone = '';

	                if ($c->last_phone != "") {
	                    $last_phone = $c->last_phone;
	                } /*else {
                        $response = $this->service->spreadsheets_values->get($spreadsheetId, $cur_sheet['properties']['title']);
                        $values = $response->getValues();

	                    for ($i = count($values) - 1; $i >= 0; $i--) {
	                        if ($is_last_phone) break;

	                        for ($j = 0; $j < count($values[$i]); $j++) {
	                            if ($values[$i][$j] === 'Phone') {
	                                $last_phone = $values[$i + 1][$j];
	                                $is_last_phone = true;
	                                break;
	                            }
	                        }
	                    }
	                }*/

	                $mdb_path = $this->mdb->path;

	                $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
	                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	                $query = $c->query;
	                $sth = $db->prepare("select * from [$query]");
	                $sth->execute();

	                while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
	                    if ($row['Phone'] === $last_phone) break;

	                    $row['key'] = $row['Phone'];
	                    array_push($rows, $row);
	                }

	                array_push($up_rows, ['', '', '', '', '', '', '', '', '', '', '', '']);
	                $up_row = array();
	                foreach ($g_c->columns as $column) {
	                    if ($column->display == 'true') array_push($up_row, $column->field);
	                }
	                array_push($up_rows, $up_row);

	                if ($g_c->way === 'all') {
	                    foreach ($rows as $row) {
	                        $up_row = array();
	                        foreach ($g_c->columns as $column) {
	                            if ($column->display == 'true') {
	                                array_push($up_row, $row[$column->name]);
	                            }
	                        }
	                        array_push($up_rows_with_key, $row);
	                        array_push($up_rows, $up_row);
	                    }
	                } else if ($g_c->way === 'static') {
	                    $count = $g_c->staticCount;
	                    if ($g_c->staticCount > count($rows)) {
	                        $count = count($rows);
	                    }

	                    foreach ($rows as $row) {
	                        if (count($up_rows_with_key) == $count) break;

	                        $up_row = array();
	                        foreach ($g_c->columns as $column) {
	                            if ($column->display == 'true') {
	                                array_push($up_row, $row[$column->name]);
	                            }
	                        }
	                        array_push($up_rows_with_key, $row);
	                        array_push($up_rows, $up_row);
	                    }
	                } else if ($g_c->way === 'random') {
	                    $count = rand($g_c->randomStart * 1, $g_c->randomEnd * 1);
	                    if ($count >= count($rows)) {
                            foreach ($rows as $row) {
                                $up_row = array();
                                foreach ($g_c->columns as $column) {
                                    if ($column->display == 'true') {
                                        array_push($up_row, $row[$column->name]);
                                    }
                                }
                                array_push($up_rows_with_key, $row);
                                array_push($up_rows, $up_row);
                            }
                        } else {
	                        $first = 0;
	                        $arrs = $this->randomGen(1, count($rows) - 1, $count * 1 - 1);
	                        array_push($arrs, $first);
	                        sort($arrs);

	                        foreach ($rows as $index => $row) {
	                            foreach ($arrs as $arr) {
	                                if ($index == $arr) {
	                                    $up_row = array();
	                                    foreach ($g_c->columns as $column) {
	                                        if ($column->display == 'true') {
	                                            array_push($up_row, $row[$column->name]);
	                                        }
	                                    }
	                                    array_push($up_rows_with_key, $row);
	                                    array_push($up_rows, $up_row);
	                                }
	                            }
	                        }
	                    }
	                } else if ($g_c->way === 'random_first') {
                        $count = rand($g_c->randomStart * 1, $g_c->randomEnd * 1);
                        if ($count >= count($rows)) {
                            foreach ($rows as $row) {
                                $up_row = array();
                                foreach ($g_c->columns as $column) {
                                    if ($column->display == 'true') {
                                        array_push($up_row, $row[$column->name]);
                                    }
                                }
                                array_push($up_rows_with_key, $row);
                                array_push($up_rows, $up_row);
                            }
                        } else {
                            $end = $g_c->randomFirst;
                            if (count($rows) < $end * 1) $end = count($rows);

                            $first = 0;
                            $arrs = $this->randomGen(1, $end * 1 - 1, $count * 1 - 1);
                            array_push($arrs, $first);
                            sort($arrs);

                            foreach ($rows as $index => $row) {
                                foreach ($arrs as $arr) {
                                    if ($index == $arr) {
                                        $up_row = array();
                                        foreach ($g_c->columns as $column) {
                                            if ($column->display == 'true') {
                                                array_push($up_row, $row[$column->name]);
                                            }
                                        }
                                        array_push($up_rows_with_key, $row);
                                        array_push($up_rows, $up_row);
                                    }
                                }
                            }
                        }
                    } else {
                        date_default_timezone_set('America/Los_Angeles');

	                    foreach ($rows as $row) {
	                        if ($g_c->isTime == "true" || $g_c->isTime === true) {
                                $g_date = strtotime(date("m/d/Y"));
                                $g_date = strtotime("-" . $g_c->dayOld * 1 . " day", $g_date);
                                $g_date = date('m/d/Y', $g_date);

	                            $date = strtotime(date("m/d/Y h:i A", strtotime($g_date . ' ' . $g_c->time . ':00 '. $g_c->meridiem)));
	                            $r_date = strtotime(date("m/d/Y h:i A", strtotime($row['SystemCreateDate'])));

	                            if ($r_date > $date) {
	                                $up_row = array();
	                                foreach ($g_c->columns as $column) {
	                                    if ($column->display == 'true') {
	                                        array_push($up_row, $row[$column->name]);
	                                    }
	                                }
	                                array_push($up_rows_with_key, $row);
	                                array_push($up_rows, $up_row);
	                            }
	                        } else {
                                $g_date = strtotime(date("m/d/Y"));
                                $g_date = strtotime("-" . ($g_c->dayOld * 1 + 1) . " day", $g_date);
                                $g_date = date('m/d/Y', $g_date);

	                            $date = strtotime(date("m/d/Y", strtotime($g_date)));
	                            $r_date = strtotime(date("m/d/Y", strtotime($row['SystemCreateDate'])));

	                            if ($r_date > $date) {
	                                $up_row = array();
	                                foreach ($g_c->columns as $column) {
	                                    if ($column->display == 'true') {
	                                        array_push($up_row, $row[$column->name]);
	                                    }
	                                }
	                                array_push($up_rows_with_key, $row);
	                                array_push($up_rows, $up_row);
	                            }
	                        }
	                    }
	                }

                    if ($manually == "false") {
                        $this->campaigns[$c_i]->last_qty = count($rows);
                        $this->campaigns[$c_i]->less_qty = count($up_rows_with_key);
                        if (count($up_rows_with_key) > 0) {
                            $this->campaigns[$c_i]->last_phone = $up_rows_with_key[0]['Phone'];
                            $this->campaigns[$c_i]->SystemCreateDate = $up_rows_with_key[0]['SystemCreateDate'];
                        }
                        $this->campaigns[$c_i]->upRows = $up_rows_with_key;
                        $this->campaigns[$c_i]->lastGroupIndex = $g_i;
                    } else {
                        $this->campaigns[$c_i]->_last_qty = count($rows);
                        $this->campaigns[$c_i]->_less_qty = count($up_rows_with_key);
                        if (count($up_rows_with_key) > 0) {
                            $this->campaigns[$c_i]->_last_phone = $up_rows_with_key[0]['Phone'];
                            $this->campaigns[$c_i]->_SystemCreateDate = $up_rows_with_key[0]['SystemCreateDate'];
                        } else {
                            $this->campaigns[$c_i]->_last_phone = "";
                            $this->campaigns[$c_i]->_SystemCreateDate = "";
                        }
                        $this->campaigns[$c_i]->_upRows = $up_rows_with_key;
                        $this->campaigns[$c_i]->_up_rows = $up_rows;
                    }

	            }

                if ($manually == "false") {
                    if (count($up_rows_with_key) > 0) {
                        array_push($up_rows, ['', '', '', '', '', '', '', '', '', '', '', '']);

                        for($i = 1; $i < count($up_rows); $i++) {
                            for ($j = 0; $j < count($up_rows[$i]); $j++) {
                                if ($up_rows[$i][$j] == '') $up_rows[$i][$j] = ' ';
                            }
                        }

                        $valueRange = new \Google_Service_Sheets_ValueRange();
                        $valueRange->setValues($up_rows);
                        $range = $cur_sheet['properties']['title']; // the service will detect the last row of this sheet
                        $options = ['valueInputOption' => 'USER_ENTERED'];
                        $this->service->spreadsheets_values->append($spreadsheetId, $range, $valueRange, $options);
                    }
                }
	        }
	    }

        if ($manually == "false") {
            $this->campaigns[$c_i]->scheduleIndex = $this->schedule_obj->get_schedule_column_index($c->schedule);
        }
	}
}