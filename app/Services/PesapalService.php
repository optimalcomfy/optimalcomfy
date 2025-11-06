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

        $this->baseUrl = $this->environment === 'production'
            ? 'https://pay.pesapal.com/v3'
            : 'https://cybqa.pesapal.com/pesapalv3';
    }

    public function getToken($forceRefresh = false)
    {
        try {
            if ($forceRefresh) {
                $this->clearCachedToken();
                Log::info('Forced token refresh requested');
            }

            $cachedToken = Cache::get('pesapal_access_token');
            $tokenExpiry = Cache::get('pesapal_token_expiry');

            if ($cachedToken && $tokenExpiry && now()->lt($tokenExpiry)) {
                Log::info('Using valid cached Pesapal token');
                return $cachedToken;
            }

            Log::info('Requesting new Pesapal token');

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->timeout(30)->post($this->baseUrl . '/api/Auth/RequestToken', [
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['token'] ?? null;

                if ($token) {
                    Log::info('Pesapal token received successfully');

                    $expiry = now()->addMinutes(55);
                    Cache::put('pesapal_access_token', $token, $expiry);
                    Cache::put('pesapal_token_expiry', $expiry, $expiry);

                    return $token;
                }
            }

            Log::error('Pesapal token request failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal token error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create order with proper IPN handling
     */
    public function createOrderDirect($orderData)
    {
        try {
            // Get fresh token
            $token = $this->getToken(true);

            if (!$token) {
                throw new \Exception('Failed to get Pesapal token');
            }

            // Prepare clean order data
            $cleanOrderData = [
                'id' => $orderData['id'] ?? uniqid('BKG-'),
                'currency' => $orderData['currency'] ?? 'KES',
                'amount' => $orderData['amount'],
                'description' => $orderData['description'] ?? 'Payment',
                'callback_url' => $orderData['callback_url'],
                'cancellation_url' => $orderData['cancellation_url'],
                'notification_id' => $orderData['notification_id'] ?? config('services.pesapal.ipn_id'),
                'billing_address' => $orderData['billing_address'] ?? []
            ];

            Log::info('Creating Pesapal order', [
                'order_id' => $cleanOrderData['id'],
                'amount' => $cleanOrderData['amount'],
                'ipn_id' => $cleanOrderData['notification_id']
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->timeout(30)
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $cleanOrderData);

            Log::info('Pesapal Order Response', [
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();

                if (isset($orderResponse['error'])) {
                    Log::error('Pesapal returned error in 200 response', $orderResponse);

                    // If it's an IPN error, try without IPN
                    if (isset($orderResponse['error']['code']) && $orderResponse['error']['code'] === 'InvalidIpnId') {
                        Log::warning('IPN error detected, trying without IPN');
                        unset($cleanOrderData['notification_id']);
                        return $this->createOrderWithoutIPN($token, $cleanOrderData);
                    }

                    return $orderResponse;
                }

                // Success case
                if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                    Log::info('Pesapal order created successfully', [
                        'tracking_id' => $orderResponse['order_tracking_id'],
                        'redirect_url' => $orderResponse['redirect_url']
                    ]);
                    return $orderResponse;
                }
            }

            // Handle other status codes
            $errorResponse = $response->json();
            Log::error('Pesapal order creation failed', [
                'status' => $response->status(),
                'response' => $errorResponse
            ]);

            return $errorResponse;

        } catch (\Exception $e) {
            Log::error('Pesapal createOrderDirect error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'EXCEPTION',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Create order without IPN
     */
    private function createOrderWithoutIPN($token, $orderData)
    {
        try {
            Log::info('Creating Pesapal order without IPN', [
                'order_id' => $orderData['id'],
                'amount' => $orderData['amount']
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->timeout(30)
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $orderData);

            Log::info('Pesapal Order Response (No IPN)', [
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();

                if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                    Log::info('Pesapal order without IPN created successfully');
                    return $orderResponse;
                }
            }

            return $response->json();

        } catch (\Exception $e) {
            Log::error('Pesapal createOrderWithoutIPN error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'NO_IPN_ERROR',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Get order status
     */
    public function getOrderStatus($orderTrackingId)
    {
        try {
            $token = $this->getToken();

            Log::info('Checking Pesapal order status', [
                'order_tracking_id' => $orderTrackingId
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->get($this->baseUrl . "/api/Transactions/GetTransactionStatus?orderTrackingId={$orderTrackingId}");

            Log::info('Pesapal Order Status Response', [
                'status' => $response->status(),
                'successful' => $response->successful()
            ]);

            if ($response->successful()) {
                $statusData = $response->json();
                Log::info('Pesapal order status retrieved', $statusData);
                return $statusData;
            }

            // Handle token expiration for status check too
            if ($response->status() === 401) {
                Log::warning('Token expired during status check, refreshing');
                $newToken = $this->getToken(true);
                if ($newToken) {
                    return $this->getOrderStatus($orderTrackingId);
                }
            }

            Log::error('Pesapal order status check failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'order_tracking_id' => $orderTrackingId
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal status check error: ' . $e->getMessage(), [
                'exception' => $e,
                'order_tracking_id' => $orderTrackingId
            ]);
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

            Log::info('Pesapal IPN validation successful', [
                'order_tracking_id' => $ipnData['OrderTrackingId'],
                'notification_type' => $ipnData['OrderNotificationType']
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Pesapal IPN validation error: ' . $e->getMessage(), [
                'exception' => $e,
                'ipn_data' => $ipnData
            ]);
            return false;
        }
    }

    /**
     * Clear cached token
     */
    public function clearCachedToken()
    {
        Cache::forget('pesapal_access_token');
        Cache::forget('pesapal_token_expiry');
        Log::info('Pesapal cached tokens cleared');
    }

    /**
     * Debug method to check Pesapal configuration
     */
    public function debugConfiguration()
    {
        return [
            'environment' => $this->environment,
            'base_url' => $this->baseUrl,
            'has_consumer_key' => !empty($this->consumerKey),
            'has_consumer_secret' => !empty($this->consumerSecret),
            'token_info' => $this->getTokenInfo()
        ];
    }

    /**
     * Get token information for debugging
     */
    public function getTokenInfo()
    {
        $token = Cache::get('pesapal_access_token');
        $expiry = Cache::get('pesapal_token_expiry');

        return [
            'has_token' => !empty($token),
            'token_prefix' => $token ? substr($token, 0, 20) . '...' : null,
            'expires_at' => $expiry ? $expiry->toDateTimeString() : null,
            'is_expired' => $expiry ? now()->gt($expiry) : true,
            'minutes_remaining' => $expiry ? now()->diffInMinutes($expiry, false) : 0
        ];
    }
}
