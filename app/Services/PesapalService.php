<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function getToken()
    {
        try {
            Log::info('Pesapal Token Request', [
                'environment' => $this->environment,
                'base_url' => $this->baseUrl
            ]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->withBasicAuth($this->consumerKey, $this->consumerSecret)
              ->post($this->baseUrl . '/api/Auth/RequestToken');

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Pesapal Token Response', ['token_received' => !empty($data['token'])]);
                return $data['token'] ?? null;
            }

            Log::error('Pesapal token request failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'environment' => $this->environment
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal token error: ' . $e->getMessage());
            return null;
        }
    }

    public function makeOrder($token, $data)
    {
        try {
            Log::info('Pesapal Order Creation', [
                'data' => $data,
                'environment' => $this->environment
            ]);

            $response = Http::withToken($token)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $data);

            if ($response->successful()) {
                $orderResponse = $response->json();
                Log::info('Pesapal Order Created Successfully', [
                    'order_tracking_id' => $orderResponse['order_tracking_id'] ?? null,
                    'redirect_url' => $orderResponse['redirect_url'] ?? null
                ]);
                return $orderResponse;
            }

            Log::error('Pesapal order creation failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'data' => $data,
                'environment' => $this->environment
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('Pesapal order error: ' . $e->getMessage());
            return null;
        }
    }

    public function getOrderStatus($orderTrackingId, $token)
    {
        try {
            $response = Http::withToken($token)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->get($this->baseUrl . "/api/Transactions/GetTransactionStatus?orderTrackingId={$orderTrackingId}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Pesapal order status check failed', [
                'status' => $response->status(),
                'response' => $response->body(),
                'environment' => $this->environment
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
}
