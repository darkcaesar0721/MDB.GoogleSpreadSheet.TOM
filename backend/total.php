<?php

require __DIR__ . '/vendor/autoload.php';

$client = new \Google_Client();

$client->setApplicationName('Google Sheets and PHP');

$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);

$client->setAccessType('offline');

$client->setAuthConfig(__DIR__ . '/credentials.json');

$service = new Google_Service_Sheets($client);

$group = $_REQUEST['group'];

date_default_timezone_set('America/Los_Angeles');

$response = $service->spreadsheets_values->get('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', 'Sheet1');

$schedule_values = $response->getValues();

//$cur_schedule = [];
//$cur_schedule_index = -1;
//foreach($schedule_values as $i => $v) {
//    foreach($v as $j => $r) {
//        if (strtotime(date('Y-m-d')) == strtotime(date($r))) {
//            $cur_schedule_index = $i;
//            $cur_schedule = $v;
//        }
//    }
//}

//get data json info
$json_file_name = 'campaign.json';
$data = json_decode(file_get_contents($json_file_name));

forEach ($data->groups as $g_i => $g) {
    if ($g->key == $group) {
        foreach ($g->campaigns as $g_c_i => $g_c) {
            foreach ($data->campaigns as $c_i => $c) {
                if ($g_c->key == $c->key) {

                    $url_array = parse_url($c->url);
                    $path_array = explode("/", $url_array["path"]);

                    $spreadsheetId = $path_array[3];

                    $spreadSheet = $service->spreadsheets->get($spreadsheetId);
                    $sheets = $spreadSheet->getSheets();

                    $cur_sheet = [];
                    foreach($sheets as $sheet) {
                        $sheetId = $sheet['properties']['sheetId'];

                        $pos = strpos($c->url, "gid=" . $sheetId);

                        if($pos) {
                            $cur_sheet = $sheet;
                            break;
                        }
                    }

                    if ($cur_sheet) {
                        $response = $service->spreadsheets_values->get($spreadsheetId, $cur_sheet['properties']['title']);

                        $values = $response->getValues();

                        $is_last_phone = false;
                        $last_phone = '';
                        for($i = count($values) - 1; $i >=0; $i--) {
                            if ($is_last_phone) break;

                            for($j = 0; $j < count($values[$i]); $j++) {
                                if ($values[$i][$j] === 'Phone') {
                                    $last_phone = $values[$i + 1][$j];
                                    $is_last_phone = true;
                                    break;
                                }
                            }
                        }

                        $mdb_path = $data->mdb_path;

                        $db = new PDO("odbc:Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBq=$mdb_path;Uid=;Pwd=;");
                        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                        $query = $c->query;
                        $sth = $db->prepare("select * from [$query]");
                        $sth->execute();

                        $rows = array();
                        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
                            if ($row['Phone'] === $last_phone) break;

                            $row['key'] = $row['Phone'];
                            array_push($rows, $row);
                        }

                        $up_rows = array();

                        $up_row = array();
                        foreach($g_c->columns as $column) {
                            if ($column->display == 'true') array_push($up_row, $column->field);
                        }
                        array_push($up_rows, $up_row);

                        $up_rows_with_key = array();
                        if ($g_c->way === 'all') {
                            foreach($rows as $row) {
                                $up_row = array();
                                foreach($g_c->columns as $column) {
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

                            foreach($rows as $row) {
                                if ((count($up_rows) - 1) == $count) break;

                                $up_row = array();
                                foreach($g_c->columns as $column) {
                                    if ($column->display == 'true') {
                                        array_push($up_row, $row[$column->name]);
                                    }
                                }
                                array_push($up_rows_with_key, $row);
                                array_push($up_rows, $up_row);
                            }
                        } else {
                            $count = rand($g_c->randomStart, $g_c->randomEnd);
                            if ($count >= count($rows)) {
                                foreach($rows as $row) {
                                    $up_row = array();
                                    foreach($g_c->columns as $column) {
                                        if ($column->display == 'true') {
                                            array_push($up_row, $row[$column->name]);
                                        }
                                    }
                                    array_push($up_rows_with_key, $row);
                                    array_push($up_rows, $up_row);
                                }
                            } else {
                                function randomGen($min, $max, $quantity) {
                                    $numbers = range($min, $max);
                                    shuffle($numbers);
                                    return array_slice($numbers, 0, $quantity);
                                }

                                $first = 0;
                                $arrs = randomGen(1, count($rows) - 1, $count);
                                array_push($arrs, $first);
                                sort($arrs);

                                foreach($rows as $index => $row) {
                                    foreach($arrs as $arr) {
                                        if ($index == $arr) {
                                            $up_row = array();
                                            foreach($g_c->columns as $column) {
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
                        }

                        $data->campaigns[$c_i]->last_qty = count($rows);
                        $data->campaigns[$c_i]->less_qty = count($up_rows) - 1;
                        if (count($up_rows) > 1) {
                            $data->campaigns[$c_i]->last_phone = $rows[0]['Phone'];
                            $data->campaigns[$c_i]->SystemCreateDate = $rows[0]['SystemCreateDate'];
                        }
//                        $data->campaigns[$c_i]->upRows = $up_rows_with_key;

                        $data->groups[$g_i]->campaigns[$g_c_i]->last_qty = count($rows);
                        $data->groups[$g_i]->campaigns[$g_c_i]->less_qty = count($up_rows_with_key);
                        $data->groups[$g_i]->campaigns[$g_c_i]->upRows = $up_rows_with_key;

                        $body = new Google_Service_Sheets_ValueRange([
                            'values' => $up_rows
                        ]);
                        $params = [
                            'valueInputOption' => 'RAW'
                        ];
                        $update_range = $cur_sheet['properties']['title'] . '!' . 'A' . (count($values) + 2) . ':' . 'Z' . (count($values) + count($up_rows) + 10);
                        $update_sheet = $service->spreadsheets_values->update($spreadsheetId, $update_range, $body, $params);

//                        $column_index = -1;
//                        foreach($schedule_values as $i => $v) {
//                            foreach($v as $j => $r) {
//                                if ($r == $c->schedule) {
//                                    $column_index = $j;
//                                }
//                            }
//                        }
//                        $cur_schedule[$column_index] = count($up_rows_with_key);
                    }
                }
            }
        }
    }
}

//$body = new Google_Service_Sheets_ValueRange([
//    'values' => [$cur_schedule]
//]);
//$params = [
//    'valueInputOption' => 'RAW'
//];
//$update_range = 'Sheet1!' . 'A' . ($cur_schedule_index + 1) . ':' . 'Z' . ($cur_schedule_index + 1);
//$update_sheet = $service->spreadsheets_values->update('16fiKZjpWZ3ZCY69JpRrTBAYLS4GnjqEKp8tj2G65EAI', $update_range, $body, $params);

file_put_contents($json_file_name, json_encode($data));
echo json_encode('success');
exit;