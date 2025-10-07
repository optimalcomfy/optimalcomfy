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

        $this->logConfig();
        $this->validateConfig();
    }

    protected function logConfig(): void
    {
        Log::info('MPesa configuration loaded', [
            'consumerKey' => $this->consumerKey ? 'SET' : 'NULL',
            'consumerSecret' => $this->consumerSecret ? 'SET' : 'NULL',
            'passkey' => $this->passkey ? 'SET' : 'NULL',
            'businessShortCode' => $this->businessShortCode ? 'SET' : 'NULL',
            'callbackUrl' => $this->callbackUrl ? 'SET' : 'NULL',
            'baseUrl' => $this->baseUrl ?? 'NULL',
        ]);
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
                Log::error("MPesa configuration error: {$key} is not set");
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

            Log::info("Generating M-Pesa access token for STK Push");
            $accessToken = $this->generateAccessToken();
            Log::info("Access token generated", ['accessToken' => substr($accessToken, 0, 5) . '...']);

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
            Log::info("STK Push response", ['response' => $body]);

            if ($response->successful() && isset($body['ResponseCode']) && $body['ResponseCode'] == '0') {
                return array_merge(['success' => true], $body);
            }

            return [
                'success' => false,
                'error' => 'STK_PUSH_FAILED',
                'description' => $body['errorMessage'] ?? 'Unknown error'
            ];
        } catch (Exception $e) {
            Log::error("STK Push exception", ['message' => $e->getMessage()]);
            return ['error' => 'MPESA_REQUEST_FAILED', 'message' => $e->getMessage()];
        }
    }

    protected function generateAccessToken()
    {
        Log::info("Requesting M-Pesa access token", ['baseUrl' => $this->baseUrl]);

        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if (!$response->successful()) {
            Log::error("Failed to obtain M-Pesa access token", ['response' => $response->body()]);
            throw new Exception('Failed to obtain M-Pesa access token');
        }

        $token = $response->json()['access_token'] ?? null;

        if (!$token) {
            Log::error("Access token not found in M-Pesa response", ['response' => $response->body()]);
            throw new Exception('Access token not found in M-Pesa response');
        }

        return $token;
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

        Log::error('Invalid phone number format', ['phone' => $phone]);
        throw new Exception('Invalid phone number format');
    }

    public function registerC2BUrls()
    {
        try {
            Log::info("Registering C2B URLs");
            $accessToken = $this->generateAccessToken();

            $response = Http::withToken($accessToken)->post("{$this->baseUrl}/mpesa/c2b/v1/registerurl", [
                "ShortCode" => $this->businessShortCode,
                "ResponseType" => "Completed",
                "ConfirmationURL" => $this->callbackUrl . "/mpesa/c2b/confirmation",
                "ValidationURL" => $this->callbackUrl . "/mpesa/c2b/validation",
            ]);

            Log::info("C2B registration response", ['response' => $response->json()]);

            return $response->json();
        } catch (Exception $e) {
            Log::error("C2B registration exception", ['message' => $e->getMessage()]);
            return ['error' => 'C2B_REGISTRATION_FAILED', 'message' => $e->getMessage()];
        }
    }
}
