<?php
require __DIR__ . '/vendor/autoload.php';

$client = new \Google_Client();

$client->setApplicationName('Google Sheets and PHP');

$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);

$client->setAccessType('offline');

$client->setAuthConfig(__DIR__ . '/credentials.json');

$service = new Google_Service_Sheets($client);

$action = $_REQUEST['action'];

if ($action === 'get_last_phone') {
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
        }
    }

    echo json_encode($campaigns);
    exit;
}