<?php

namespace App\Traits;

use Exception;
use Illuminate\Http\Request;
use URL;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait Mpesa
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $passkey;
    protected $businessShortCode;
    protected $callbackUrl;
    protected $baseUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->businessShortCode = config('services.mpesa.business_shortcode');
        $this->callbackUrl = config('services.mpesa.callback_url');
        $this->baseUrl = config('services.mpesa.base_url');

        $this->validateConfig();
    }

    protected function validateConfig(): void
    {
        $required = [
            'consumerKey',
            'consumerSecret',
            'passkey',
            'businessShortCode',
            'callbackUrl',
            'baseUrl',
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                throw new Exception("MPesa {$key} is not configured.");
            }
        }
    }

    public function lipaNaMpesaPassword(): string
    {
        $timestamp = Carbon::rawParse('now')->format('YmdHms');
        return base64_encode($this->businessShortCode.$this->passkey.$timestamp);
    }

    public function generateAccessToken(): string
    {
        $credentials = base64_encode($this->consumerKey.":".$this->consumerSecret);
        $url = $this->baseUrl."/oauth/v1/generate?grant_type=client_credentials";
        
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => ["Authorization: Basic ".$credentials],
                CURLOPT_HEADER => false,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_RETURNTRANSFER => true,
            ]);
            
            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error: '.curl_error($curl));
            }
            
            $data = json_decode($response);
            if (!isset($data->access_token)) {
                throw new Exception('Failed to get access token');
            }
            
            return $data->access_token;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    public function STKPush(string $type, string $amount, string $phone, string $callback, string $reference, string $narrative)
    {
        $url = $this->baseUrl.'/mpesa/stkpush/v1/processrequest';
        $phone = '254'.substr($phone, -9);
        
        $payload = [
            'BusinessShortCode' => $this->businessShortCode,
            'Password' => $this->lipaNaMpesaPassword(),
            'Timestamp' => Carbon::rawParse('now')->format('YmdHms'),
            'TransactionType' => ($type == 'Paybill') ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
            'Amount' => $amount,
            'PartyA' => $phone,
            'PartyB' => $this->businessShortCode,
            'PhoneNumber' => $phone,
            'CallBackURL' => $callback,
            'AccountReference' => $reference,
            'TransactionDesc' => $narrative,
        ];

        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization:Bearer '.$this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
            ]);
            
            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error: '.curl_error($curl));
            }
            
            return json_decode($response, true);
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    public function mpesaRegisterUrls(string $confirmationURL, string $validationURL)
    {
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $this->baseUrl.'/mpesa/c2b/v1/registerurl',
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer '. $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'ShortCode' => $this->businessShortCode,
                    'ResponseType' => 'Completed',
                    'ConfirmationURL' => $confirmationURL,
                    'ValidationURL' => $validationURL,
                ]),
            ]);
            
            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error: '.curl_error($curl));
            }
            
            return json_decode($response, true);
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }
}