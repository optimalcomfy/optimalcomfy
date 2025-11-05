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

    public function getToken($forceRefresh = false)
    {
        try {
            // Clear cache if forced refresh
            if ($forceRefresh) {
                $this->clearCachedToken();
                Log::info('Forced token refresh requested');
            }

            // Check if we have a valid cached token
            $cachedToken = Cache::get('pesapal_access_token');
            $tokenExpiry = Cache::get('pesapal_token_expiry');

            if ($cachedToken && $tokenExpiry && now()->lt($tokenExpiry)) {
                Log::info('Using valid cached Pesapal token');
                return $cachedToken;
            }

            Log::info('Requesting new Pesapal token', [
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

                    // Calculate token expiry (typically 1 hour, but use 55 minutes for safety)
                    $expiry = now()->addMinutes(55);

                    // Cache token and expiry
                    Cache::put('pesapal_access_token', $token, $expiry);
                    Cache::put('pesapal_token_expiry', $expiry, $expiry);

                    Log::info('Pesapal token cached until: ' . $expiry->toDateTimeString());
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

            // Ensure we don't send notification_id if it's empty or invalid
            $orderData = $data;
            if (isset($orderData['notification_id']) && empty($orderData['notification_id'])) {
                unset($orderData['notification_id']);
            }

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $orderData);

            Log::info('Pesapal Order Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();

                // Check if the response contains an error despite 200 status
                if (isset($orderResponse['error'])) {
                    Log::error('Pesapal order creation returned error despite 200 status', $orderResponse);
                    return $orderResponse;
                }

                Log::info('Pesapal Order Created Successfully', $orderResponse);
                return $orderResponse;
            }

            // If we get 401, the token might be expired - force refresh and retry
            if ($response->status() === 401) {
                Log::warning('Pesapal token expired (401 error), forcing refresh and retrying');

                // Force token refresh
                $newToken = $this->getToken(true);

                if ($newToken && $newToken !== $token) {
                    Log::info('Retrying order creation with new token');
                    return $this->makeOrder($newToken, $data);
                } else {
                    Log::error('Failed to refresh token for retry');
                }
            }

            // Log detailed error information
            $errorResponse = $response->json();
            Log::error('Pesapal order creation failed', [
                'status' => $response->status(),
                'response' => $errorResponse,
                'token_prefix' => substr($token, 0, 20) . '...',
                'order_data' => $orderData
            ]);

            return $errorResponse;

        } catch (\Exception $e) {
            Log::error('Pesapal order error: ' . $e->getMessage(), [
                'exception' => $e,
                'data' => $data
            ]);
            return [
                'error' => [
                    'code' => 'EXCEPTION',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Register IPN URL with Pesapal and get the IPN ID
     */
    public function registerIPN($token, $ipnUrl)
    {
        try {
            Log::info('Registering IPN URL with Pesapal', ['ipn_url' => $ipnUrl]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/api/URLSetup/RegisterIPN', [
                    'url' => $ipnUrl,
                    'ipn_notification_type' => 'POST'
                ]);

            Log::info('IPN Registration Response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $ipnResponse = $response->json();
                $ipnId = $ipnResponse['ipn_id'] ?? null;

                if ($ipnId) {
                    Log::info('IPN registered successfully', ['ipn_id' => $ipnId]);
                    return $ipnId;
                }
            }

            Log::error('IPN registration failed', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('IPN registration error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get registered IPNs
     */
    public function getRegisteredIPNs($token)
    {
        try {
            $response = Http::withToken($token)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->get($this->baseUrl . '/api/URLSetup/GetIpnList');

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to get registered IPNs', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Get IPNs error: ' . $e->getMessage());
            return null;
        }
    }

    public function getOrderStatus($orderTrackingId, $token)
    {
        try {
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
                    return $this->getOrderStatus($orderTrackingId, $newToken);
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
     * Direct order creation with automatic token management and IPN handling
     */
    public function createOrder($orderData)
    {
        try {
            // Get a fresh token for each new order
            $token = $this->getToken(true);

            if (!$token) {
                Log::error('Failed to get token for order creation');
                return [
                    'error' => [
                        'code' => 'TOKEN_ERROR',
                        'message' => 'Failed to authenticate with Pesapal'
                    ]
                ];
            }

            // Try to register IPN first if needed
            $ipnUrl = config('services.pesapal.notification_url');
            if ($ipnUrl) {
                $ipnId = $this->registerIPN($token, $ipnUrl);
                if ($ipnId) {
                    $orderData['notification_id'] = $ipnId;
                    Log::info('Using registered IPN ID for order', ['ipn_id' => $ipnId]);
                } else {
                    Log::warning('Failed to register IPN, proceeding without IPN');
                    // Remove notification_id if it exists to avoid InvalidIpnId error
                    unset($orderData['notification_id']);
                }
            } else {
                // Ensure no notification_id is sent
                unset($orderData['notification_id']);
            }

            return $this->makeOrder($token, $orderData);

        } catch (\Exception $e) {
            Log::error('Pesapal createOrder error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'CREATE_ORDER_ERROR',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Simple order creation without IPN (for testing)
     */
    public function createSimpleOrder($orderData)
    {
        try {
            // Get a fresh token
            $token = $this->getToken(true);

            if (!$token) {
                return [
                    'error' => [
                        'code' => 'TOKEN_ERROR',
                        'message' => 'Failed to authenticate with Pesapal'
                    ]
                ];
            }

            // Explicitly remove notification_id to avoid IPN issues
            unset($orderData['notification_id']);

            return $this->makeOrder($token, $orderData);

        } catch (\Exception $e) {
            Log::error('Pesapal createSimpleOrder error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'CREATE_ORDER_ERROR',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * Clear cached token (useful for testing or when credentials change)
     */
    public function clearCachedToken()
    {
        Cache::forget('pesapal_access_token');
        Cache::forget('pesapal_token_expiry');
        Log::info('Pesapal cached tokens cleared');
    }
}
