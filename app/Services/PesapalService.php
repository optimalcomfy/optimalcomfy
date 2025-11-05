<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PesapalService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $baseUrl;
    protected $environment;

    public function __construct()
    {
        $this->consumerKey = config('services.pesapal.key');
        $this->consumerSecret = config('services.pesapal.secret');
        $this->environment = config('services.pesapal.environment', 'production');

        // Use correct Pesapal v3 API endpoints
        $this->baseUrl = $this->environment === 'production'
            ? 'https://pay.pesapal.com/v3'
            : 'https://cybqa.pesapal.com/pesapalv3';
    }

    public function getToken()
    {
        try {
            // Check if we have a cached token first
            $cachedToken = Cache::get('pesapal_access_token');
            if ($cachedToken) {
                Log::info('Using cached Pesapal token');
                return $cachedToken;
            }

            Log::info('Pesapal Token Request', [
                'environment' => $this->environment,
                'base_url' => $this->baseUrl,
                'consumer_key' => substr($this->consumerKey, 0, 10) . '...'
            ]);

            // Pesapal v3 uses request body, not Basic Auth
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/api/Auth/RequestToken', [
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret
            ]);

            Log::info('Pesapal Token Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['token'] ?? null;

                if ($token) {
                    Log::info('Pesapal token received successfully');
                    // Cache token for 55 minutes (tokens typically expire in 1 hour)
                    Cache::put('pesapal_access_token', $token, 55 * 60);
                    return $token;
                }
            }

            Log::error('Pesapal token request failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'headers' => $response->headers()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal token error: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return null;
        }
    }

    public function makeOrder($token, $data)
    {
        try {
            Log::info('Pesapal Order Creation', [
                'order_id' => $data['id'] ?? null,
                'amount' => $data['amount'] ?? null,
                'currency' => $data['currency'] ?? 'KES'
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $data);

            Log::info('Pesapal Order Response', [
                'status' => $response->status(),
                'successful' => $response->successful()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();
                Log::info('Pesapal Order Created Successfully', $orderResponse);
                return $orderResponse;
            }

            // Log detailed error information
            $errorResponse = $response->json();
            Log::error('Pesapal order creation failed', [
                'status' => $response->status(),
                'response' => $errorResponse,
                'token_valid' => !empty($token)
            ]);

            return $errorResponse;

        } catch (\Exception $e) {
            Log::error('Pesapal order error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'EXCEPTION',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    public function getOrderStatus($orderTrackingId, $token)
    {
        try {
            $response = Http::withToken($token)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->get($this->baseUrl . "/api/Transactions/GetTransactionStatus?orderTrackingId={$orderTrackingId}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Pesapal order status check failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal status check error: ' . $e->getMessage());
            return null;
        }
    }

    public function validateIPN($ipnData)
    {
        try {
            $requiredFields = ['OrderTrackingId', 'OrderNotificationType', 'OrderMerchantReference'];

            foreach ($requiredFields as $field) {
                if (!isset($ipnData[$field]) || empty($ipnData[$field])) {
                    Log::error('Pesapal IPN missing required field: ' . $field);
                    return false;
                }
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Pesapal IPN validation error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Clear cached token (useful for testing or when credentials change)
     */
    public function clearCachedToken()
    {
        Cache::forget('pesapal_access_token');
        Log::info('Pesapal cached token cleared');
    }
}
