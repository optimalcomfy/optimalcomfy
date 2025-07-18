<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class MpesaStkService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $passkey;
    protected $businessShortCode;
    protected $callbackUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->businessShortCode = config('services.mpesa.business_shortcode');
        $this->callbackUrl = config('services.mpesa.callback_url');

        $this->validateConfig();
    }

    public function initiateStkPush($phone, $amount, $reference, $description)
    {
        try {
            $phone = $this->formatPhoneNumber($phone);
            $accessToken = $this->generateAccessToken();
            $timestamp = date('YmdHis');
            
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);

            $response = Http::withToken($accessToken)
                ->timeout(30) // Production should have slightly longer timeout
                ->retry(3, 100) // Retry 3 times with 100ms delay
                ->post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', [
                    'BusinessShortCode' => $this->businessShortCode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $amount,
                    'PartyA' => $phone,
                    'PartyB' => $this->businessShortCode,
                    'PhoneNumber' => $phone,
                    'CallBackURL' => $this->callbackUrl,
                    'AccountReference' => $reference,
                    'TransactionDesc' => $description
                ]);

            return $this->handleResponse($response);

        } catch (Exception $e) {
            Log::error('M-Pesa STK Push Exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['error' => 'MPESA_SERVICE_UNAVAILABLE'];
        }
    }

    protected function handleResponse($response)
    {
        $responseData = $response->json();

        if (!$response->successful()) {
            Log::error('M-Pesa API HTTP Error', $responseData);
            return ['error' => 'MPESA_API_ERROR'];
        }

        if ($responseData['ResponseCode'] == '0') {
            return [
                'success' => true,
                'CheckoutRequestID' => $responseData['CheckoutRequestID'],
                'MerchantRequestID' => $responseData['MerchantRequestID'],
                'ResponseDescription' => $responseData['ResponseDescription']
            ];
        }

        Log::error('M-Pesa STK Push Error', $responseData);
        return [
            'error' => 'MPESA_REQUEST_FAILED',
            'code' => $responseData['ResponseCode'],
            'description' => $responseData['ResponseDescription']
        ];
    }

    protected function generateAccessToken()
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->timeout(15)
            ->retry(2, 100)
            ->get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials');

        if (!$response->successful()) {
            throw new Exception('Failed to get M-Pesa access token');
        }

        return $response->json()['access_token'];
    }

    protected function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Convert 07... or 7... to 2547...
        if (preg_match('/^0?7[0-9]{8}$/', $phone)) {
            return '254' . substr($phone, -9);
        }

        // Leave 254... numbers as-is
        if (preg_match('/^2547[0-9]{8}$/', $phone)) {
            return $phone;
        }

        throw new Exception('Invalid phone number format');
    }

    protected function validateConfig()
    {
        $required = [
            'consumer_key',
            'consumer_secret',
            'passkey',
            'business_shortcode',
            'callback_url'
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                throw new Exception("MPesa $key is not configured");
            }
        }
    }
}