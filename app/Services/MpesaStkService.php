<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaStkService
{
    protected $baseUrl;
    protected $shortCode;
    protected $passkey;
    protected $callbackUrl;
    protected $transactionType;

    public function __construct()
    {
        $this->baseUrl = env('MPESA_BASE_URL', 'https://sandbox.safaricom.co.ke');
        $this->shortCode = env('MPESA_BUSINESS_SHORTCODE');
        $this->passkey = env('MPESA_PASSKEY');
        $this->callbackUrl = env('MPESA_STK_CALLBACK_URL');
        $this->transactionType = 'CustomerPayBillOnline'; // or 'CustomerBuyGoodsOnline'
    }

    public function generateAccessToken()
    {
        $consumerKey = env('MPESA_CONSUMER_KEY');
        $consumerSecret = env('MPESA_CONSUMER_SECRET');
    
        $response = Http::withBasicAuth($consumerKey, $consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");
    
        Log::info('M-Pesa Token Response:', ['response' => $response->body()]);
    
        return $response->json()['access_token'] ?? null;
    }

    public function initiateStkPush($phone, $amount, $accountReference, $transactionDesc = 'Payment')
    {
        $accessToken = $this->generateAccessToken();
    
        if (!$accessToken) {
            return ['error' => 'Failed to generate access token'];
        }
    
        $formattedPhone = $this->formatPhoneNumber($phone);
        $timestamp = date('YmdHis');
        $password = base64_encode($this->shortCode . $this->passkey . $timestamp);

        $payload = [
            'BusinessShortCode' => $this->shortCode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => $this->transactionType,
            'Amount' => $amount,
            'PartyA' => $formattedPhone,
            'PartyB' => $this->shortCode,
            'PhoneNumber' => $formattedPhone,
            'CallBackURL' => $this->callbackUrl,
            'AccountReference' => $accountReference,
            'TransactionDesc' => $transactionDesc
        ];

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        Log::info('M-Pesa STK Push Request:', [
            'payload' => $payload,
            'response' => $response->body()
        ]);
    
        return $response->json();
    }

    private function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/\D/', '', $phone); 
        return '254' . substr($phone, -9); 
    }
}