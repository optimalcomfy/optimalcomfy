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
     * DIRECT SOLUTION: Create order without any IPN references
     */
    public function createOrderDirect($orderData)
    {
        try {
            // Get fresh token
            $token = $this->getToken(true);

            if (!$token) {
                throw new \Exception('Failed to get Pesapal token');
            }

            // Prepare clean order data without any IPN references
            $cleanOrderData = [
                'id' => $orderData['id'] ?? uniqid('BKG-'),
                'currency' => $orderData['currency'] ?? 'KES',
                'amount' => $orderData['amount'],
                'description' => $orderData['description'] ?? 'Payment',
                'callback_url' => $orderData['callback_url'],
                'cancellation_url' => $orderData['cancellation_url'],
                'billing_address' => $orderData['billing_address'] ?? []
            ];

            // EXPLICITLY DO NOT INCLUDE notification_id or any IPN-related fields

            Log::info('Creating Pesapal order (Direct Method)', [
                'order_id' => $cleanOrderData['id'],
                'amount' => $cleanOrderData['amount']
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->timeout(30)
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $cleanOrderData);

            Log::info('Pesapal Direct Order Response', [
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();

                // Check if this is actually an error response disguised as 200
                if (isset($orderResponse['error'])) {
                    Log::error('Pesapal returned error in 200 response', $orderResponse);

                    // If it's an IPN error, try the emergency fallback method
                    if (isset($orderResponse['error']['code']) && $orderResponse['error']['code'] === 'InvalidIpnId') {
                        Log::warning('IPN error detected, using emergency fallback');
                        return $this->emergencyOrderCreation($token, $cleanOrderData);
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
     * EMERGENCY FALLBACK: Try alternative approach for IPN issues
     */
    private function emergencyOrderCreation($token, $orderData)
    {
        try {
            Log::info('Attempting emergency order creation without IPN');

            // Try with minimal data
            $minimalData = [
                'id' => $orderData['id'],
                'currency' => $orderData['currency'],
                'amount' => $orderData['amount'],
                'description' => $orderData['description'],
                'callback_url' => $orderData['callback_url'],
                // Explicitly skip billing_address and other optional fields
            ];

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->timeout(30)
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $minimalData);

            Log::info('Emergency order creation response', [
                'status' => $response->status(),
                'response_body' => $response->body()
            ]);

            if ($response->successful()) {
                $orderResponse = $response->json();

                if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                    Log::info('Emergency order creation successful');
                    return $orderResponse;
                }
            }

            Log::error('Emergency order creation failed');
            return $response->json();

        } catch (\Exception $e) {
            Log::error('Emergency order creation error: ' . $e->getMessage());
            return [
                'error' => [
                    'code' => 'EMERGENCY_ERROR',
                    'message' => $e->getMessage()
                ]
            ];
        }
    }

    /**
     * SIMPLE WORKING METHOD: Use this for immediate testing
     */
    public function createWorkingOrder($bookingNumber, $amount, $description, $callbackUrl, $cancellationUrl, $userData)
    {
        $orderData = [
            'id' => $bookingNumber,
            'currency' => 'KES',
            'amount' => $amount,
            'description' => $description,
            'callback_url' => $callbackUrl,
            'cancellation_url' => $cancellationUrl,
            'billing_address' => [
                'email_address' => $userData['email'],
                'phone_number' => $userData['phone'] ?? '254700000000',
                'country_code' => 'KE',
                'first_name' => $userData['name'],
                'last_name' => '',
                'line_1' => 'Nairobi',
                'city' => 'Nairobi',
                'postal_code' => '00100'
            ]
        ];

        return $this->createOrderDirect($orderData);
    }

    /**
     * Get registered IPNs from Pesapal
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

    /**
     * Register IPN URL with Pesapal
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
     * Clear cached token (useful for testing or when credentials change)
     */
    public function clearCachedToken()
    {
        Cache::forget('pesapal_access_token');
        Cache::forget('pesapal_token_expiry');
        Log::info('Pesapal cached tokens cleared');
    }
}
