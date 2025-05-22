<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class MpesaService
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
    
        Log::info('M-Pesa Token Response:', ['response' => $response->body()]);
    
        return $response->json()['access_token'] ?? null;
    }    

    public function sendB2CPayment($phone, $amount, $loanId = null)
    {
        $accessToken = $this->generateAccessToken();
    
        if (!$accessToken) {
            return ['error' => 'Failed to generate access token'];
        }
    
        $formattedPhone = $this->formatPhoneNumber($phone);
    
        $resultUrlWithLoanId = env('MPESA_RESULT_URL') . '?loanId=' . $loanId;
    
        $response = Http::withToken($accessToken)
            ->post("{$this->baseUrl}/mpesa/b2c/v1/paymentrequest", [
                'InitiatorName' => env('MPESA_INITIATOR_NAME'),
                'SecurityCredential' => env('MPESA_SECURITY_CREDENTIAL'),
                'CommandID' => 'SalaryPayment',
                'Amount' => $amount,
                'PartyA' => env('MPESA_BUSINESS_SHORTCODE'),
                'PartyB' => $formattedPhone,
                'Remarks' => 'Loan Disbursement',
                'QueueTimeOutURL' => env('MPESA_QUEUE_TIMEOUT_URL'),
                'ResultURL' => $resultUrlWithLoanId, 
                'Occasion' => 'LoanID_' . $loanId,
            ]);
    
        return $response->json();
    }
    
    

    private function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/\D/', '', $phone); 
        return '254' . substr($phone, -9); 
    }
    

}
