<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaRefundService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('MPESA_BASE_URL');
    }

    public function generateAccessToken()
    {
        $consumerKey = env('MPESA_CONSUMER_KEY');
        $consumerSecret = env('MPESA_CONSUMER_SECRET');
    
        $response = Http::withBasicAuth($consumerKey, $consumerSecret)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");
    
        Log::channel('refunds')->info('M-Pesa Refund Token Response:', ['response' => $response->body()]);
    
        return $response->json()['access_token'] ?? null;
    }

    public function processRefund($phone, $amount, $reference)
    {
        $accessToken = $this->generateAccessToken();
    
        if (!$accessToken) {
            return ['error' => 'Failed to generate access token'];
        }
    
        $formattedPhone = $this->formatPhoneNumber($phone);
        $resultUrl = env('MPESA_REFUND_RESULT_URL') . '?reference=' . urlencode($reference);
    
        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/mpesa/b2c/v1/paymentrequest", [
                'InitiatorName' => env('MPESA_INITIATOR_NAME'),
                'SecurityCredential' => env('MPESA_SECURITY_CREDENTIAL'),
                'CommandID' => 'BusinessPayment',
                'Amount' => $amount,
                'PartyA' => env('MPESA_BUSINESS_SHORTCODE'),
                'PartyB' => $formattedPhone,
                'Remarks' => 'Booking Refund',
                'QueueTimeOutURL' => env('MPESA_REFUND_TIMEOUT_URL'),
                'ResultURL' => $resultUrl,
                'Occasion' => 'REFUND_' . $reference,
            ]);

        Log::channel('refunds')->info('M-Pesa Refund Request:', [
            'phone' => $formattedPhone,
            'amount' => $amount,
            'reference' => $reference,
            'response' => $response->json()
        ]);
    
        return $response->json();
    }
    
    private function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/\D/', '', $phone); 
        return '254' . substr($phone, -9); 
    }
}