<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaStkService
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

    public function initiateStkPush($phone, $amount, $reference, $description)
    {
        try {
            $phone = $this->formatPhoneNumber($phone);
            $timestamp = now()->format('YmdHis');
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);
            $accessToken = $this->generateAccessToken();

            $response = Http::withToken($accessToken)
                ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", [
                    'BusinessShortCode' => $this->businessShortCode,
                    'Password' => $password,
                    'Timestamp' => $timestamp,
                    'TransactionType' => 'CustomerPayBillOnline',
                    'Amount' => $amount,
                    'PartyA' => $phone,
                    'PartyB' => $this->businessShortCode,
                    'PhoneNumber' => $phone,
                    'CallBackURL' => $this->callbackUrl . '/mpesa/callback',
                    'AccountReference' => $reference,
                    'TransactionDesc' => $description
                ]);

            $body = $response->json();

            if ($response->successful() && isset($body['ResponseCode']) && $body['ResponseCode'] == '0') {
                return array_merge(['success' => true], $body);
            }

            return [
                'success' => false,
                'error' => 'STK_PUSH_FAILED',
                'description' => $body['errorMessage'] ?? 'Unknown error'
            ];
        } catch (Exception $e) {
            Log::error('M-Pesa STK Push failed', ['error' => $e->getMessage()]);
            return ['error' => 'MPESA_REQUEST_FAILED'];
        }
    }

    protected function generateAccessToken()
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if (!$response->successful()) {
            throw new Exception('Failed to obtain M-Pesa access token');
        }

        return $response->json()['access_token'];
    }

    protected function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (preg_match('/^0?7[0-9]{8}$/', $phone)) {
            return '254' . substr($phone, -9);
        }

        if (preg_match('/^2547[0-9]{8}$/', $phone)) {
            return $phone;
        }

        throw new Exception('Invalid phone number format');
    }

    public function registerC2BUrls()
    {
        try {
            $accessToken = $this->generateAccessToken();

            $response = Http::withToken($accessToken)->post("{$this->baseUrl}/mpesa/c2b/v1/registerurl", [
                "ShortCode" => $this->businessShortCode,
                "ResponseType" => "Completed",
                "ConfirmationURL" => $this->callbackUrl . "/mpesa/c2b/confirmation",
                "ValidationURL" => $this->callbackUrl . "/mpesa/c2b/validation",
            ]);

            Log::info('Registered C2B URLs', ['response' => $response->json()]);

            return $response->json();
        } catch (Exception $e) {
            Log::error('C2B URL Registration Failed', ['error' => $e->getMessage()]);
            return ['error' => 'C2B_REGISTRATION_FAILED'];
        }
    }
}

