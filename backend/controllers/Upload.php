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
	public $campaign_obj;
	public $group_obj;
	public $upload_config_obj;
	public $backup_obj;

	public $mdb;
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
		$this->init_mdb();
		$this->init_campaigns();
		$this->init_groups();
		$this->init_upload_config();
		$this->init_backup();

        $this->init_google_sheet_service();

        $this->init_schedule_data();

        date_default_timezone_set('America/Los_Angeles');
	}

	public function init_mdb()
	{
		$this->mdb_obj = new \controllers\Mdb();
        $this->mdb_obj->init();
        $this->mdb = $this->mdb_obj->get_mdb();
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

        $this->campaigns[$c_i]->isLast = true;

        foreach ($this->campaigns as $_c_i => $c) {
            if ($_c_i != $c_i) {
                $this->campaigns[$_c_i]->scheduleIndex = -1;
            }
        }

        $this->campaign_obj->save_datas($this->campaigns);

        $this->upload_count_by_schedule("upload_one_by_one", $g_i, $c_i);

        $this->backup_obj->run(false);
        echo json_encode($this->campaigns);
        exit;
    }

	public function upload_all()
	{
		$g_i = $_REQUEST['groupIndex'];

		foreach ($this->groups[$g_i]->campaigns as $g_c_i => $g_c) {
	        foreach ($this->upload_config->selectedCampaignKeys as $key) {
	            if ($key == $g_c->key) {
	                $this->upload_data($g_i, $g_c_i, $this->groups[$g_i]->campaigns[$g_c_i]->index);
	                $this->campaigns[$this->groups[$g_i]->campaigns[$g_c_i]->index]->isLast = true;
	            }
	        }
	    }

	    foreach ($this->campaigns as $c_i => $c) {
	    	$isExist = false;
	        foreach ($this->upload_config->selectedCampaignKeys as $key) {
	            if ($key == $c->key) {
	                $isExist = true;
	            }
	        }
	        if (!$isExist)
	        	$this->campaigns[$c_i]->scheduleIndex = -1;
	    }

	    $this->campaign_obj->save_datas($this->campaigns);

	    $this->upload_count_by_schedule("upload_all", $g_i, -1);

	    $this->backup_obj->run();
	    echo json_encode("success");
	    exit;
	}

	public function upload_one_by_one()
	{
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
        } else {
            $this->campaigns[$c_i]->isManually = true;
        }
        $this->campaigns[$c_i]->isGetLastPhone = false;
        $this->campaigns[$c_i]->lastUploadDateTime = date("m/d/Y h:i A");

	    $this->campaign_obj->save_datas($this->campaigns);

        if ($manually == "false") {
            $this->upload_count_by_schedule("upload_one_by_one", $g_i, $c_i);
        }

	    $this->backup_obj->run(false);
	    echo json_encode($this->campaigns);
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

        $index = -1;
        foreach($this->schedules as $i => $v) {
            foreach($v as $j => $r) {
                if ($r == $c->schedule) {
                    $index = $j;
                }
            }
        }
        $this->campaigns[$c_i]->scheduleIndex = $index;
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
	                } else {
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
	                }

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
	                    $count = rand($g_c->randomStart, $g_c->randomEnd * 1 - 1);
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
	                        $arrs = $this->randomGen(1, count($rows) - 1, $count);
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
                        $count = rand($g_c->randomStart, $g_c->randomEnd * 1 - 1);
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
                            $arrs = $this->randomGen(1, $end * 1 - 1, $count);
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
	                    foreach ($rows as $row) {
	                        if ($g_c->isTime) {
	                            $date = strtotime(date("m/d/Y h:i A", strtotime($g_c->date . ' ' . $g_c->time . ':00 '. $g_c->meridiem)));
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
	                            $date = strtotime(date("m/d/Y", strtotime($g_c->date . ' ' . $g_c->time . ' '. $g_c->meridiem)));
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
            $index = -1;
            foreach($this->schedules as $i => $v) {
                foreach($v as $j => $r) {
                    if ($r == $c->schedule) {
                        $index = $j;
                    }
                }
            }
            $this->campaigns[$c_i]->scheduleIndex = $index;
        }
	}

	public function upload_count_by_schedule($action, $g_i, $c_i)
	{
		$cur_schedule = $this->cur_schedule;
		$cur_schedule_index = $this->cur_schedule_index;

		if (date('w') == 4) {
		    $name = date('l') . ' ' . $this->groups[$g_i]->name;
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
		        foreach($this->campaigns as $c_index => $c){
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
		        foreach($this->campaigns as $c_index => $c){
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
		    $update_range = 'Sheet1!' . 'A' . (count($this->schedules) + 1) . ':' . 'ZZ' . (count($this->schedules) + 1);
		} else {
		    $update_range = 'Sheet1!' . 'A' . ($cur_schedule_index + 1) . ':' . 'ZZ' . ($cur_schedule_index + 1);
		}

		$update_sheet = $this->service->spreadsheets_values->update('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', $update_range, $body, $params);
	}
}