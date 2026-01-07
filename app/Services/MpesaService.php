<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    protected $baseUrl;
    protected $consumerKey;
    protected $consumerSecret;
    protected $initiatorName;
    protected $securityCredential;
    protected $businessShortcode;
    protected $resultUrl;
    protected $queueTimeoutUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->initiatorName = config('services.mpesa.initiator_name');
        $this->securityCredential = config('services.mpesa.security_credential');
        $this->businessShortcode = config('services.mpesa.business_shortcode');
        $this->resultUrl = config('services.mpesa.result_url');
        $this->queueTimeoutUrl = config('services.mpesa.queue_timeout_url');
        $this->baseUrl = config('services.mpesa.base_url', 'https://api.safaricom.co.ke');
        
        // Validate required credentials
        $this->validateCredentials();
    }

    private function validateCredentials()
    {
        $required = [
            'consumer_key' => $this->consumerKey,
            'consumer_secret' => $this->consumerSecret,
            'initiator_name' => $this->initiatorName,
            'security_credential' => $this->securityCredential,
            'business_shortcode' => $this->businessShortcode,
            'result_url' => $this->resultUrl,
            'queue_timeout_url' => $this->queueTimeoutUrl,
        ];

        $missing = [];
        foreach ($required as $key => $value) {
            if (empty($value)) {
                $missing[] = $key;
            }
        }

        if (!empty($missing)) {
            Log::error('M-Pesa credentials missing or empty:', ['missing' => $missing]);
            throw new \Exception('M-Pesa configuration missing: ' . implode(', ', $missing));
        }

        Log::info('M-Pesa credentials validated successfully', [
            'consumer_key_exists' => !empty($this->consumerKey),
            'consumer_secret_exists' => !empty($this->consumerSecret),
            'business_shortcode' => $this->businessShortcode,
            'base_url' => $this->baseUrl,
        ]);
    }

    public function generateAccessToken()
    {
        try {
            Log::info('Generating M-Pesa access token', [
                'consumer_key' => substr($this->consumerKey, 0, 5) . '...',
                'base_url' => $this->baseUrl,
            ]);

            // Use the auth_url from config or build it manually
            $authUrl = config('services.mpesa.auth_url', "{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");
            
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->withoutVerifying() // Remove this in production or set proper SSL verification
                ->timeout(30)
                ->get($authUrl);

            Log::info('M-Pesa token response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
            ]);

            if (!$response->successful()) {
                Log::error('M-Pesa token request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Failed to generate token. Status: ' . $response->status());
            }

            $data = $response->json();
            
            if (!isset($data['access_token'])) {
                Log::error('Access token not found in response', ['data' => $data]);
                throw new \Exception('Access token not found in response');
            }

            Log::info('M-Pesa access token generated successfully', [
                'token_length' => strlen($data['access_token']),
            ]);

            return $data['access_token'];
            
        } catch (\Exception $e) {
            Log::error('M-Pesa token generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    public function sendB2CPayment($phone, $amount, $loanId = null)
    {
        Log::info('M-Pesa B2C Payment initiated', [
            'phone' => $phone,
            'amount' => $amount,
            'loan_id' => $loanId,
            'business_shortcode' => $this->businessShortcode,
        ]);

        $accessToken = $this->generateAccessToken();

        if (!$accessToken) {
            Log::error('Failed to generate M-Pesa access token for B2C payment');
            return [
                'error' => true,
                'message' => 'Failed to generate access token'
            ];
        }

        $formattedPhone = $this->formatPhoneNumber($phone);

        // Build result URL with loanId if provided
        $resultUrl = $this->resultUrl;
        if ($loanId) {
            $resultUrl .= (str_contains($resultUrl, '?') ? '&' : '?') . 'loanId=' . $loanId;
        }

        $payload = [
            'InitiatorName' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => 'SalaryPayment',
            'Amount' => $amount,
            'PartyA' => $this->businessShortcode,
            'PartyB' => $formattedPhone,
            'Remarks' => 'Loan Disbursement',
            'QueueTimeOutURL' => $this->queueTimeoutUrl,
            'ResultURL' => $resultUrl,
            'Occasion' => $loanId ? 'LoanID_' . $loanId : 'Disbursement',
        ];

        Log::info('M-Pesa B2C Request Payload', [
            'endpoint' => "{$this->baseUrl}/mpesa/b2c/v1/paymentrequest",
            'payload' => array_merge($payload, [
                'SecurityCredential' => substr($payload['SecurityCredential'], 0, 5) . '...', // Mask for logs
            ]),
        ]);

        try {
            $response = Http::withToken($accessToken)
                ->withoutVerifying() // Remove this in production
                ->timeout(60) // B2C can take longer
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/mpesa/b2c/v1/paymentrequest", $payload);

            $responseData = $response->json();
            
            Log::info('M-Pesa B2C Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'response' => $responseData,
            ]);

            if (!$response->successful()) {
                Log::error('M-Pesa B2C payment failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return [
                    'error' => true,
                    'message' => 'Payment request failed',
                    'details' => $responseData
                ];
            }

            return $responseData;
            
        } catch (\Exception $e) {
            Log::error('M-Pesa B2C request failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'phone' => $formattedPhone,
                'amount' => $amount,
            ]);
            return [
                'error' => true,
                'message' => 'Payment processing failed: ' . $e->getMessage()
            ];
        }
    }

    private function formatPhoneNumber($phone)
    {
        // Remove all non-digit characters
        $phone = preg_replace('/\D/', '', $phone);
        
        // If phone starts with 0, replace with 254
        if (str_starts_with($phone, '0')) {
            return '254' . substr($phone, 1);
        }
        
        // If phone starts with 254, return as is
        if (str_starts_with($phone, '254')) {
            return $phone;
        }
        
        // If phone is 9 digits (like 712345678), prepend 254
        if (strlen($phone) === 9 && is_numeric($phone)) {
            return '254' . $phone;
        }
        
        // Default: take last 9 digits and prepend 254
        return '254' . substr($phone, -9);
    }

    private function decryptSecurityCredential($encryptedCredential)
    {
        return $encryptedCredential; // Return as-is if not encrypted
    }
}