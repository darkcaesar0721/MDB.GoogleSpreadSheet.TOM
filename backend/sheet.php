<?php
require __DIR__ . '/vendor/autoload.php';

$client = new \Google_Client();

$client->setApplicationName('Google Sheets and PHP');

$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);

$client->setAccessType('offline');

$client->setAuthConfig(__DIR__ . '/credentials.json');

$service = new Google_Service_Sheets($client);

$action = $_REQUEST['action'];


    $campaigns = $_REQUEST['selectedCampaigns'];

    foreach($campaigns as $index => $campaign) {
        $url_array = parse_url($campaign['url']);
        $path_array = explode("/", $url_array["path"]);

        $spreadsheetId = $path_array[3];

        $spreadSheet = $service->spreadsheets->get($spreadsheetId);
        $sheets = $spreadSheet->getSheets();

        $cur_sheet = [];
        foreach($sheets as $sheet) {
            $sheetId = $sheet['properties']['sheetId'];

            $pos = strpos($campaign['url'], "gid=" . $sheetId);

            if($pos) {
                $cur_sheet = $sheet;
                break;
            }
        }

        if ($cur_sheet) {
            $response = $service->spreadsheets_values->get($spreadsheetId, $cur_sheet['properties']['title']);

            if ($action === 'get_last_phone') {
                $values = $response->getValues();

                $campaigns[$index]['set_last_phone'] = false;
                for($i = count($values) - 1; $i >=0; $i--) {
                    if ($campaigns[$index]['set_last_phone']) break;

                    for($j = 0; $j < count($values[$i]); $j++) {
                        if ($values[$i][$j] === 'Phone') {
                            $campaigns[$index]['last_phone'] = $values[$i + 1][$j];
                            $campaigns[$index]['set_last_phone'] = true;
                            break;
                        }
                    }
                }
            } else {
                $values = $response->getValues();

                if (count($campaign['uploadRows']) > 0) {
                    $datas = array();
                    $row = array();
                    foreach($campaign['columns'] as $column) {
                        if ($column['display'] == 'true') array_push($row, $column['field']);
                    }
                    array_push($datas, $row);
                    foreach($campaign['uploadRows'] as $row) {
                        $up_row = array();
                        foreach($campaign['columns'] as $column) {
                            if ($column['display'] == 'true') array_push($up_row, $row[$column['name']]);
                        }
                        array_push($datas, $up_row);
                    }

                    $body = new Google_Service_Sheets_ValueRange([
                        'values' => $datas
                    ]);
                    $params = [
                        'valueInputOption' => 'RAW'
                    ];
                    $update_range = $cur_sheet['properties']['title'] . '!' . 'A' . (count($values) + 2) . ':' . 'Z' . (count($values) + count($datas) + 10);
                    $update_sheet = $service->spreadsheets_values->update($spreadsheetId, $update_range, $body, $params);

                    $campaigns[$index]['last_qty'] = count($campaign['rows']);
                    $campaigns[$index]['less_qty'] = count($campaign['uploadRows']);
                    $campaigns[$index]['last_phone'] = $campaign['uploadRows'][0]['Phone'];
                    $campaigns[$index]['SystemCreateDate'] = $campaign['uploadRows'][0]['SystemCreateDate'];
                }

                $json_file_name = 'campaign.json';
                $data = json_decode(file_get_contents($json_file_name));
                $data->campaigns = $campaigns;

                file_put_contents($json_file_name, json_encode($data));
            }
        }
    }

    echo json_encode($campaigns);
    exit;
