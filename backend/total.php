<?php

require __DIR__ . '/vendor/autoload.php';

$client = new \Google_Client();

$client->setApplicationName('Google Sheets and PHP');

$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);

$client->setAccessType('offline');

$client->setAuthConfig(__DIR__ . '/credentials.json');

$service = new Google_Service_Sheets($client);

date_default_timezone_set('America/Los_Angeles');

$response = $service->spreadsheets_values->get('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', 'Sheet1');

$schedule_values = $response->getValues();

$cur_schedule = [];
$cur_schedule_index = -1;
foreach($schedule_values as $i => $v) {
    foreach($v as $j => $r) {
        if (strtotime(date('Y-m-d')) == strtotime(date($r))) {
            $cur_schedule_index = $i;
            $cur_schedule = $v;
        }
    }
}

//get data json info
$json_file_name = 'campaign.json';
$data = json_decode(file_get_contents($json_file_name));

function write_sheet($service, $schedule_values, $d, $g_i, $g_c_i, $c_i) {
    $g = $d->groups[$g_i];
    $g_c = $d->groups[$g_i]->campaigns[$g_c_i];
    $c = $d->campaigns[$c_i];

    $rows = array();
    $up_rows = array();
    $up_rows_with_key = array();

    foreach($c->urls as $u_i => $url) {
        $url_array = parse_url($url);
        $path_array = explode("/", $url_array["path"]);

        $spreadsheetId = $path_array[3];

        $spreadSheet = $service->spreadsheets->get($spreadsheetId);
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
            $response = $service->spreadsheets_values->get($spreadsheetId, $cur_sheet['properties']['title']);

            $values = $response->getValues();

            if ($u_i === 0) {
                $is_last_phone = false;
                $last_phone = '';

                if ($g_c->isEditPhone == 'true') {
                    $last_phone = $c->last_phone;
                } else {
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


                $mdb_path = $d->mdb_path;

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
                    $count = rand($g_c->randomStart, $g_c->randomEnd);
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
                        function randomGen($min, $max, $quantity)
                        {
                            $numbers = range($min, $max);
                            shuffle($numbers);
                            return array_slice($numbers, 0, $quantity);
                        }

                        $first = 0;
                        $arrs = randomGen(1, count($rows) - 1, $count);
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
                            $date = strtotime(date("m/d/Y h A", strtotime($g_c->date . ' ' . $g_c->time . ' '. $g_c->meridiem)));
                            $r_date = strtotime(date("m/d/Y h A", strtotime($row['SystemCreateDate'])));

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

                $d->campaigns[$c_i]->last_qty = count($rows);
                $d->campaigns[$c_i]->less_qty = count($up_rows_with_key);
                if (count($up_rows_with_key) > 0) {
                    $d->campaigns[$c_i]->last_phone = $up_rows_with_key[0]['Phone'];
                    $d->campaigns[$c_i]->SystemCreateDate = $up_rows_with_key[0]['SystemCreateDate'];
                } else {
                    $d->campaigns[$c_i]->last_phone = "";
                    $d->campaigns[$c_i]->SystemCreateDate = "";
                }
                $d->campaigns[$c_i]->upRows = $up_rows_with_key;
                $d->campaigns[$c_i]->lastGroupIndex = $g_i;
            }

            if (count($up_rows_with_key) > 0) {
                array_push($up_rows, ['', '', '', '', '', '', '', '', '', '', '', '']);

                $valueRange = new \Google_Service_Sheets_ValueRange();
                $valueRange->setValues($up_rows);
                $range = $cur_sheet['properties']['title']; // the service will detect the last row of this sheet
                $options = ['valueInputOption' => 'USER_ENTERED'];
                $service->spreadsheets_values->append($spreadsheetId, $range, $valueRange, $options);
            }
        }
    }

    $index = -1;
    foreach($schedule_values as $i => $v) {
        foreach($v as $j => $r) {
            if ($r == $c->schedule) {
                $index = $j;
            }
        }
    }
    $d->campaigns[$c_i]->scheduleIndex = $index;

    return $d;
}

$action = $_REQUEST['action'];
if ($action == 'upload_all') {
    $g_i = $_REQUEST['groupIndex'];

    foreach ($data->groups[$g_i]->campaigns as $g_c_i => $g_c) {
        foreach ($data->upload->selectedCampaignKeys as $key) {
            if ($key == $g_c->key) {
                $data = write_sheet($service, $schedule_values, $data, $g_i, $g_c_i, $data->groups[$g_i]->campaigns[$g_c_i]->index);
            }
        }
    }
} else {
    $g_i = $_REQUEST['groupIndex'];
    $g_c_i = $_REQUEST['groupCampaignIndex'];
    $c_i = $_REQUEST['campaignIndex'];

    $data = write_sheet($service, $schedule_values, $data, $g_i, $g_c_i, $c_i);

    foreach($data->groups[$g_i]->campaigns as $i => $c) {
        if ($g_c_i == $i) {
            $data->groups[$g_i]->campaigns[$i]->isLast = true;
        } else {
            $data->groups[$g_i]->campaigns[$i]->isLast = false;
        }
    }
}

if (date('w') == 4) {
    $name = date('l') . ' ' . $data->groups[$g_i]->name;
    $cur_schedule = [];
    $cur_schedule_index = -1;
    foreach($schedule_values as $i => $v) {
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

    for ($i = 3; $i < (3 + count($data->campaigns)); $i++) {
        $ext = false;
        foreach($data->campaigns as $c_index => $c){
            if ($i == $c->scheduleIndex) {
                if ($action == 'upload_all' || ($action != 'upload_all' && $c_index == $c_i)) {
                    if ($cur_schedule_index !== -1) {
                        if ($cur_schedule[$i]) {
                            array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
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
    for ($i = 3; $i < (3 + count($data->campaigns)); $i++) {
        $ext = false;
        foreach($data->campaigns as $c_index => $c){
            if ($i == $c->scheduleIndex) {
                if ($action == 'upload_all' || ($action != 'upload_all' && $c_index == $c_i)) {
                    if ($cur_schedule_index !== -1) {
                        if ($cur_schedule[$i]) {
                            array_push($row, $cur_schedule[$i] . ' ' . $c->less_qty);
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
    $update_range = 'Sheet1!' . 'A' . (count($schedule_values) + 1) . ':' . 'Z' . (count($schedule_values) + 1);
} else {
    $update_range = 'Sheet1!' . 'A' . ($cur_schedule_index + 1) . ':' . 'Z' . ($cur_schedule_index + 1);
}

$update_sheet = $service->spreadsheets_values->update('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', $update_range, $body, $params);

file_put_contents($json_file_name, json_encode($data));
echo json_encode('success');
exit;