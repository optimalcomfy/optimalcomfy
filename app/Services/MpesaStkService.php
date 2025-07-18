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
        $config = config('services.mpesa');

        $this->consumerKey = $config['consumer_key'];
        $this->consumerSecret = $config['consumer_secret'];
        $this->passkey = $config['passkey'];
        $this->businessShortCode = $config['business_shortcode'];
        $this->callbackUrl = $config['callback_url'];
        $this->baseUrl = $config['env'] === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';

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
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                throw new \RuntimeException("M-Pesa configuration '{$key}' is not set.");
            }
        }
    }

    protected function getAccessToken(): string
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->retry(3, 100)
            ->timeout(10)
            ->get("{$this->baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if (!$response->ok()) {
            Log::error('Failed to get M-Pesa access token', [
                'response' => $response->body(),
                'status' => $response->status(),
            ]);
            throw new \RuntimeException('Failed to get M-Pesa access token.');
        }

        return $response->json()['access_token'];
    }

    protected function formatPhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone); // Remove non-digits

        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        }

        return $phone;
    }

    public function stkPush(string $phone, int $amount, string $accountReference = 'Hayaan Travel', string $transactionDesc = 'Booking Payment'): array
    {
        try {
            $accessToken = $this->getAccessToken();
            $timestamp = now()->format('YmdHis');
            $password = base64_encode($this->businessShortCode . $this->passkey . $timestamp);

            $payload = [
                'BusinessShortCode' => $this->businessShortCode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $this->formatPhone($phone),
                'PartyB' => $this->businessShortCode,
                'PhoneNumber' => $this->formatPhone($phone),
                'CallBackURL' => $this->callbackUrl,
                'AccountReference' => $accountReference,
                'TransactionDesc' => $transactionDesc,
            ];

            $response = Http::withToken($accessToken)
                ->retry(3, 200)
                ->timeout(15)
                ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

            $result = $response->json();

            if ($response->successful() && isset($result['ResponseCode']) && $result['ResponseCode'] === '0') {
                return [
                    'success' => true,
                    'message' => $result['ResponseDescription'] ?? 'STK Push sent successfully.',
                    'CheckoutRequestID' => $result['CheckoutRequestID'] ?? null,
                ];
            }

            Log::warning('M-Pesa STK Push failed', [
                'request' => $payload,
                'response' => $result,
            ]);

            return [
                'success' => false,
                'message' => $result['errorMessage'] ?? $result['ResponseDescription'] ?? 'M-Pesa STK Push failed.',
                'code' => $result['errorCode'] ?? null,
            ];
        } catch (Exception $e) {
            Log::error('M-Pesa STK Push Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'phone' => $phone,
                'amount' => $amount,
            ]);

            return [
                'success' => false,
                'message' => 'MPESA_SERVICE_UNAVAILABLE',
            ];
        }
    }
}
