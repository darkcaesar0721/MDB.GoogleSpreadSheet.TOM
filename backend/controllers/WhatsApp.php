<?php

namespace controllers;

require __DIR__ . '/../vendor/autoload.php';

require __DIR__ . '/../vendor/ultramsg/whatsapp-php-sdk/ultramsg.class.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;

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

    public function set_groups()
    {
        $token = $this->WhatsApp->token;
        $instance_id = $this->WhatsApp->instance_id;

        if ($instance_id !== '' && $token !== '') {
            $client = new Client();
            $headers = [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ];
            $params=array(
                'token' => $token
            );
            $request = new Request('GET', 'https://api.ultramsg.com/' . $instance_id . '/groups?' . http_build_query($params), $headers);
            $res = $client->sendAsync($request)->then(function ($response) {
                $this->WhatsApp->groups = $response->getBody()->getcontents();
                file_put_contents($this->file_path, json_encode($this->WhatsApp));
                echo $this->WhatsApp->groups;
            });
            $res->wait();
        }
    }

    public function send($campaign)
    {
        $token = $this->WhatsApp->token;
        $instance_id = $this->WhatsApp->instance_id;
        $message = $campaign->whatsapp_message;
        $groups = $this->WhatsApp->groups;

        if (($campaign->isWhatsApp === true || $campaign->isWhatsApp === 'true') && $campaign->whatsapp_people !== "" && count($campaign->whatsapp_people) > 0 && $message !== '') {
            $class = '\ultramsg\WhatsAppApi';
            $client = new $class($token, $instance_id);
            foreach($campaign->whatsapp_people as $person) {
                if ($person !== '') {
                    $to = $person;
                    $body = $message;
                    $api = $client->sendChatMessage($to, $body);
                    print_r($api);
                }
            }
        }
        if (($campaign->isWhatsApp === true || $campaign->isWhatsApp === 'true') && $campaign->whatsapp_groups !== "" && count($campaign->whatsapp_groups) > 0 && $message !== '') {
            foreach($campaign->whatsapp_groups as $group) {
                if ($group !== '') {
                    foreach($groups as $g) {
                        if (strpos($g->name, $group) !== false) {
                            $to = $g->id;
                            $body = $message;
                            $api = $client->sendChatMessage($to, $body);
                            print_r($api);
                        }
                    }
                }
            }
        }
    }
}