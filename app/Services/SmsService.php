<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $apiUrl;
    protected string $apiKey;
    protected string $clientId;
    protected string $accessKey;
    protected string $senderId;

    public function __construct()
    {
        $this->apiUrl = config('services.onfon.api_url', 'https://api.onfonmedia.co.ke/v1/sms/SendBulkSMS');
        $this->apiKey = config('services.onfon.api_key', '9lbRzN35WuE27HZO4XgMskU8rF6dnw0Lv1CecixjKhDJISPY');
        $this->clientId = config('services.onfon.client_id', 'ristay');
        $this->accessKey = config('services.onfon.access_key', 'ristay');
        $this->senderId = 'RISTAY'; // UPPERCASE - This works!
    }

    /**
     * Send SMS using Onfon Media API
     */
    public function sendSms(string|array $mobileNumbers, string $message): array
    {
        // Format phone numbers
        if (is_string($mobileNumbers)) {
            $mobileNumbers = [$this->formatPhoneNumber($mobileNumbers)];
        } else {
            $mobileNumbers = array_map([$this, 'formatPhoneNumber'], $mobileNumbers);
        }

        $validNumbers = array_filter($mobileNumbers, function($number) {
            return $this->isValidPhoneNumber($number);
        });

        if (empty($validNumbers)) {
            return [
                'success' => false,
                'error_code' => 'INVALID_NUMBERS',
                'message' => 'No valid phone numbers provided'
            ];
        }

        // Build MessageParameters array
        $messageParameters = [];
        foreach ($validNumbers as $number) {
            $messageParameters[] = [
                'Number' => $number,
                'Text' => $message
            ];
        }

        $payload = [
            'SenderId' => $this->senderId, // This will be "RISTAY"
            'MessageParameters' => $messageParameters,
            'ApiKey' => $this->apiKey,
            'ClientId' => $this->clientId
        ];

        try {
            Log::info('SMS Request with RISTAY SenderId', [
                'api_url' => $this->apiUrl,
                'payload' => $payload,
                'numbers_count' => count($validNumbers)
            ]);

            $response = Http::withHeaders([
                'AccessKey' => $this->accessKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(30)
            ->post($this->apiUrl, $payload);

            $result = $response->json();
            $statusCode = $response->status();

            Log::info('SMS API Response', [
                'http_status' => $statusCode,
                'response' => $result
            ]);

            if ($statusCode === 200) {
                if (isset($result['ErrorCode']) && $result['ErrorCode'] == 0) {
                    return [
                        'success' => true,
                        'error_code' => $result['ErrorCode'],
                        'error_description' => $result['ErrorDescription'] ?? 'Success',
                        'message_ids' => $result['Data'] ?? [],
                        'raw_response' => $result
                    ];
                } else {
                    return [
                        'success' => false,
                        'error_code' => $result['ErrorCode'] ?? 'UNKNOWN',
                        'error_description' => $result['ErrorDescription'] ?? 'Unknown error',
                        'raw_response' => $result
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'error_code' => 'HTTP_' . $statusCode,
                    'error_description' => 'HTTP request failed',
                    'raw_response' => $result
                ];
            }

        } catch (\Exception $e) {
            Log::error('SMS Sending Exception', [
                'error' => $e->getMessage(),
                'payload' => $payload,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error_code' => 'EXCEPTION',
                'message' => $e->getMessage(),
                'raw_response' => null
            ];
        }
    }

    /**
     * Format phone number to 254 format
     */
    private function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);

        if (str_starts_with($phone, '07') && strlen($phone) === 10) {
            return '254' . substr($phone, 1);
        } elseif (str_starts_with($phone, '7') && strlen($phone) === 9) {
            return '254' . $phone;
        } elseif (str_starts_with($phone, '254') && strlen($phone) === 12) {
            return $phone;
        }

        return $phone;
    }

    /**
     * Validate phone number
     */
    private function isValidPhoneNumber(string $phone): bool
    {
        return preg_match('/^254[17]\d{8}$/', $phone) === 1;
    }

    /**
     * Check account balance
     */
    public function getBalance(): array
    {
        try {
            $response = Http::withHeaders([
                'AccessKey' => $this->accessKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(15)
            ->get('https://api.onfonmedia.co.ke/v1/Balance');

            if ($response->successful()) {
                $result = $response->json();
                return [
                    'success' => true,
                    'balance' => $result,
                    'http_status' => $response->status()
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'HTTP Error: ' . $response->status(),
                    'http_status' => $response->status()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send bulk SMS to multiple numbers
     */
    public function sendBulkSms(array $mobileNumbers, string $message): array
    {
        return $this->sendSms($mobileNumbers, $message);
    }
}
