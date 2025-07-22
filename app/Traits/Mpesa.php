<?php

namespace App\Traits;

use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait Mpesa
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $passkey;
    protected $businessShortCode;
    protected $callbackUrl;
    protected $baseUrl;

    public function __construct()
    {
        Log::info('Initializing Mpesa configuration...');
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->businessShortCode = config('services.mpesa.business_shortcode');
        $this->callbackUrl = config('services.mpesa.callback_url'); // You can set a default callback in your config
        $this->baseUrl = config('services.mpesa.base_url');

        $this->validateConfig();
        Log::info('Mpesa configuration initialized successfully.');
    }

    protected function validateConfig(): void
    {
        Log::info('Validating Mpesa configuration...');
        $required = [
            'consumerKey',
            'consumerSecret',
            'passkey',
            'businessShortCode',
            'baseUrl',
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                Log::error("MPesa configuration error: {$key} is not configured.");
                throw new Exception("MPesa configuration error: {$key} is not configured.");
            }
        }
        Log::info('Mpesa configuration validation passed.');
    }

    /**
     * Generates the Lipa Na Mpesa password.
     *
     * @param string|null $timestamp Optional: A specific timestamp to use for password generation.
     * If null, the current timestamp will be used.
     * @return string The base64 encoded password.
     */
    public function lipaNaMpesaPassword(?string $timestamp = null): string
    {
        // ✅ FIXED: Use the provided timestamp or generate a new one if not provided.
        $timestampToUse = $timestamp ?? Carbon::rawParse('now')->format('YmdHms');
        $password = base64_encode($this->businessShortCode . $this->passkey . $timestampToUse);
        Log::info("Generated Lipa Na Mpesa password.", ['timestamp' => $timestampToUse]);
        return $password;
    }

    public function generateAccessToken(): string
    {
        Log::info('Generating Mpesa access token...');
        $credentials = base64_encode($this->consumerKey . ":" . $this->consumerSecret);
        $url = $this->baseUrl . "/oauth/v1/generate?grant_type=client_credentials";

        $curl = null; // Initialize curl
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => ["Authorization: Basic " . $credentials],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => false,
                // ✅ CRITICAL: Set to true in production for security.
                // This verifies the M-Pesa server's SSL certificate.
                CURLOPT_SSL_VERIFYPEER => true, 
            ]);

            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error during access token generation: ' . curl_error($curl));
            }

            $data = json_decode($response);
            if (!isset($data->access_token)) {
                Log::error('Access token not found in M-Pesa response.', ['response' => $response]);
                throw new Exception('Failed to get access token from M-Pesa.');
            }

            Log::info('Access token generated successfully.');
            return $data->access_token;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            throw $e; // Re-throw exception to be caught by the controller
        } finally {
            if ($curl) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates an STK Push request.
     * @param string $type 'Paybill' or 'BuyGoods'
     * @param string $amount The amount to be paid.
     * @param string $phone The customer's phone number in 07xx... or 2547xx... format.
     * @param string $callback The publicly accessible HTTPS URL for receiving the transaction result.
     * @param string $reference A unique identifier for the transaction (e.g., Order ID).
     * @param string $narrative A short description of the transaction.
     * @return array The response from the M-Pesa API.
     */
    public function STKPush(string $type, string $amount, string $phone, string $callback, string $reference, string $narrative): array
    {
        Log::info('Initiating STK Push...', compact('type', 'amount', 'phone', 'callback', 'reference', 'narrative'));

        $url = $this->baseUrl . '/mpesa/stkpush/v1/processrequest';
        $phone = '254' . substr($phone, -9); // Sanitize phone number

        // ✅ FIXED: Generate a single timestamp to be used for both password and payload.
        $timestamp = Carbon::rawParse('now')->format('YmdHms');

        $payload = [
            'BusinessShortCode' => $this->businessShortCode,
            // ✅ FIXED: Pass the unified timestamp to the password generation function.
            'Password' => $this->lipaNaMpesaPassword($timestamp), 
            // ✅ FIXED: Use the unified timestamp for the payload.
            'Timestamp' => $timestamp, 
            'TransactionType' => ($type == 'Paybill') ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
            'Amount' => $amount,
            'PartyA' => $phone,
            'PartyB' => $this->businessShortCode,
            'PhoneNumber' => $phone,
            'CallBackURL' => $callback,
            'AccountReference' => $reference,
            'TransactionDesc' => $narrative,
        ];

        Log::info('STK Push payload prepared.', ['payload' => $payload]);
        $curl = null; // Initialize curl
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    // ✅ FIXED: Ensure space after 'Bearer' and regenerate token for each request.
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                // ✅ CRITICAL: Set to true in production for security.
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error during STK Push: ' . curl_error($curl));
            }
            
            $decodedResponse = json_decode($response, true);
            // ✅ IMPROVEMENT: Log the decoded array for cleaner log files.
            Log::info('STK Push response received.', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            throw $e; // Re-throw exception to be caught by the controller
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    public function mpesaRegisterUrls(string $confirmationURL, string $validationURL): array
    {
        Log::info('Registering Mpesa C2B URLs...', compact('confirmationURL', 'validationURL'));

        $curl = null; // Initialize curl
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $this->baseUrl . '/mpesa/c2b/v1/registerurl',
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    // ✅ FIXED: Ensure space after 'Bearer' and regenerate token for each request.
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode([
                    'ShortCode' => $this->businessShortCode,
                    'ResponseType' => 'Completed',
                    'ConfirmationURL' => $confirmationURL,
                    'ValidationURL' => $validationURL,
                ]),
                // ✅ CRITICAL: Set to true in production for security.
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            if ($response === false) {
                throw new Exception('Curl error during URL registration: ' . curl_error($curl));
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('Mpesa URL registration response received.', ['response' => $decodedResponse]);
            
            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            throw $e; // Re-throw exception to be caught by the controller
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }
}