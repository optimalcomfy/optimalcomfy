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

    // New properties for additional Mpesa APIs
    protected $initiatorName;
    protected $securityCredential; // Encrypted password for B2C, B2B, Reversal, Account Balance, Transaction Status, Check Identity
    protected $resultURL;        // Common Result URL for asynchronous responses
    protected $queueTimeOutURL;  // Common Queue Timeout URL for asynchronous responses

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->passkey = config('services.mpesa.passkey');
        $this->businessShortCode = config('services.mpesa.business_shortcode');
        $this->callbackUrl = config('services.mpesa.callback_url');
        $this->baseUrl = config('services.mpesa.base_url');

        // Initialize new configuration properties
        $this->initiatorName = config('services.mpesa.initiator_name');
        $this->securityCredential = config('services.mpesa.security_credential'); // This should be an encrypted password
        $this->resultURL = config('services.mpesa.result_url');
        $this->queueTimeOutURL = config('services.mpesa.queue_timeout_url');

        Log::info('MPesa trait initialized', [
            'business_shortcode' => $this->businessShortCode,
            'base_url' => $this->baseUrl,
            'has_initiator' => !empty($this->initiatorName),
            'has_security_credential' => !empty($this->securityCredential),
        ]);

        $this->validateConfig();
    }

    protected function validateConfig(): void
    {
        $required = [
            'consumerKey',
            'consumerSecret',
            'passkey',
            'businessShortCode',
            'baseUrl',
            // Add new required configs if they are mandatory for all operations
            // 'initiatorName',
            // 'securityCredential',
            // 'resultURL',
            // 'queueTimeOutURL',
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                Log::error("MPesa configuration error: {$key} is not configured.");
                throw new Exception("MPesa configuration error: {$key} is not configured.");
            }
        }

        Log::info('MPesa configuration validation passed');
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
        $timestampToUse = $timestamp ?? Carbon::rawParse('now')->format('YmdHis');
        $password = base64_encode($this->businessShortCode . $this->passkey . $timestampToUse);

        Log::debug('Lipa Na Mpesa password generated', [
            'timestamp' => $timestampToUse,
            'password_length' => strlen($password),
        ]);

        return $password;
    }

    public function generateAccessToken(): string
    {
        $credentials = base64_encode($this->consumerKey . ":" . $this->consumerSecret);
        $url = $this->baseUrl . "/oauth/v1/generate?grant_type=client_credentials";

        Log::info('Generating MPesa access token', ['url' => $url]);

        $curl = null; // Initialize curl
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => ["Authorization: Basic " . $credentials],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => false,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during access token generation', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                ]);
                throw new Exception('Curl error during access token generation: ' . $error);
            }

            $data = json_decode($response);
            if (!isset($data->access_token)) {
                Log::error('Failed to get access token from M-Pesa', [
                    'response' => $response,
                    'http_code' => curl_getinfo($curl, CURLINFO_HTTP_CODE),
                ]);
                throw new Exception('Failed to get access token from M-Pesa.');
            }

            Log::info('MPesa access token generated successfully');
            return $data->access_token;
        } catch (\Exception $e) {
            Log::error('Exception during access token generation', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
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
        $url = $this->baseUrl . '/mpesa/stkpush/v1/processrequest';
        $originalPhone = $phone;
        $phone = '254' . substr($phone, -9);

        $currentTime = Carbon::rawParse('now');
        $formattedTimestamp = $currentTime->format('YmdHis');

        Log::info('Initiating STK Push request', [
            'type' => $type,
            'amount' => $amount,
            'original_phone' => $originalPhone,
            'formatted_phone' => $phone,
            'reference' => $reference,
            'narrative' => $narrative,
            'callback_url' => $callback,
            'timestamp' => $formattedTimestamp,
        ]);

        $payload = [
            'BusinessShortCode' => $this->businessShortCode,
            'Password' => $this->lipaNaMpesaPassword($formattedTimestamp),
            'Timestamp' => $formattedTimestamp,
            'TransactionType' => ($type == 'Paybill') ? 'CustomerPayBillOnline' : 'CustomerBuyGoodsOnline',
            'Amount' => $amount,
            'PartyA' => $phone,
            'PartyB' => $this->businessShortCode,
            'PhoneNumber' => $phone,
            'CallBackURL' => $callback,
            'AccountReference' => $reference,
            'TransactionDesc' => $narrative,
        ];

        Log::debug('STK Push payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during STK Push', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during STK Push: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('STK Push response received', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'checkout_request_id' => $decodedResponse['CheckoutRequestID'] ?? null,
                'merchant_request_id' => $decodedResponse['MerchantRequestID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during STK Push', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'reference' => $reference,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    public function mpesaRegisterUrls(string $confirmationURL, string $validationURL): array
    {
        Log::info('Registering MPesa URLs', [
            'confirmation_url' => $confirmationURL,
            'validation_url' => $validationURL,
            'business_shortcode' => $this->businessShortCode,
        ]);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $this->baseUrl . '/mpesa/c2b/v1/registerurl',
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
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
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during URL registration', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during URL registration: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('URL registration response', [
                'http_code' => $httpCode,
                'response' => $decodedResponse,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during URL registration', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a B2C (Business to Customer) payment request.
     * @param string $amount The amount to be paid.
     * @param string $partyB The customer's phone number in 2547xx... format.
     * @param string $remarks A short description of the transaction.
     * @param string $commandID The unique command identifier (e.g., 'BusinessPayment', 'PromotionPayment').
     * @param string|null $occasion Optional: Any other relevant information.
     * @return array The response from the M-Pesa API.
     */
    public function b2cPayment(string $amount, string $partyB, string $remarks, string $commandID = 'BusinessPayment', ?string $occasion = null): array
    {
        $url = $this->baseUrl . '/mpesa/b2c/v3/paymentrequest';
        $originalPartyB = $partyB;
        $partyB = '254' . substr($partyB, -9); // Sanitize phone number

        Log::info('Initiating B2C Payment', [
            'amount' => $amount,
            'original_partyB' => $originalPartyB,
            'formatted_partyB' => $partyB,
            'command_id' => $commandID,
            'remarks' => $remarks,
            'occasion' => $occasion,
            'initiator_name' => $this->initiatorName,
        ]);

        $payload = [
            'InitiatorName' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'Amount' => $amount,
            'PartyA' => $this->businessShortCode, // Your shortcode
            'PartyB' => $partyB, // Customer's phone number
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
            'Occasion' => $occasion,
        ];

        Log::debug('B2C Payment payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during B2C Payment', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during B2C Payment: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('B2C Payment response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during B2C Payment', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'partyB' => $partyB,
                'amount' => $amount,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a B2B (Business to Business) payment request.
     * @param string $amount The amount to be paid.
     * @param string $partyB The recipient business shortcode.
     * @param string $accountReference A unique identifier for the transaction.
     * @param string $remarks A short description of the transaction.
     * @param string $commandID The unique command identifier (e.g., 'BusinessPayBill', 'BusinessBuyGoods').
     * @param string $senderIdentifierType The type of PartyA (e.g., '4' for Till Number, '6' for Paybill).
     * @param string $receiverIdentifierType The type of PartyB (e.g., '4' for Till Number, '6' for Paybill).
     * @return array The response from the M-Pesa API.
     */
    public function b2bPayment(
        string $amount,
        string $partyB,
        string $accountReference,
        string $remarks,
        string $commandID = 'BusinessPayBill',
        string $senderIdentifierType = '4', // Default to Till Number
        string $receiverIdentifierType = '4' // Default to Till Number
    ): array
    {
        $url = $this->baseUrl . '/mpesa/b2b/v1/paymentrequest';

        Log::info('Initiating B2B Payment', [
            'amount' => $amount,
            'partyB' => $partyB,
            'account_reference' => $accountReference,
            'command_id' => $commandID,
            'remarks' => $remarks,
            'sender_identifier_type' => $senderIdentifierType,
            'receiver_identifier_type' => $receiverIdentifierType,
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'SenderIdentifierType' => $senderIdentifierType,
            'RecieverIdentifierType' => $receiverIdentifierType,
            'Amount' => $amount,
            'PartyA' => $this->businessShortCode, // Your shortcode
            'PartyB' => $partyB, // Recipient business shortcode
            'AccountReference' => $accountReference,
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
        ];

        Log::debug('B2B Payment payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during B2B Payment', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during B2B Payment: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('B2B Payment response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during B2B Payment', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'partyB' => $partyB,
                'amount' => $amount,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the status of an STK Push transaction.
     * @param string $checkoutRequestID The CheckoutRequestID returned by the STK Push request.
     * @return array The response from the M-Pesa API.
     */
    public function STKPushQuery(string $checkoutRequestID): array
    {
        $url = $this->baseUrl . '/mpesa/stkpushquery/v1/query';

        $currentTime = Carbon::rawParse('now');
        $formattedTimestamp = $currentTime->format('YmdHis');

        Log::info('Initiating STK Push Query', [
            'checkout_request_id' => $checkoutRequestID,
            'timestamp' => $formattedTimestamp,
        ]);

        $payload = [
            'BusinessShortCode' => $this->businessShortCode,
            'Password' => $this->lipaNaMpesaPassword($formattedTimestamp),
            'Timestamp' => $formattedTimestamp,
            'CheckoutRequestID' => $checkoutRequestID,
        ];

        Log::debug('STK Push Query payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during STK Push Query', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during STK Push Query: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('STK Push Query response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'result_code' => $decodedResponse['ResultCode'] ?? 'Unknown',
                'result_desc' => $decodedResponse['ResultDesc'] ?? 'Unknown',
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during STK Push Query', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'checkout_request_id' => $checkoutRequestID,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a Reversal request for a transaction.
     * @param string $transactionID The M-Pesa Transaction ID of the transaction to be reversed.
     * @param string $amount The amount to be reversed.
     * @param string $remarks A short description of the reversal.
     * @param string $occasion Optional: Any other relevant information.
     * @return array The response from the M-Pesa API.
     */
    public function reversal(string $transactionID, string $amount, string $remarks, ?string $occasion = null): array
    {
        $url = $this->baseUrl . '/mpesa/reversal/v1/request';

        Log::info('Initiating Reversal request', [
            'transaction_id' => $transactionID,
            'amount' => $amount,
            'remarks' => $remarks,
            'occasion' => $occasion,
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => 'TransactionReversal',
            'TransactionID' => $transactionID,
            'Amount' => $amount,
            'ReceiverParty' => $this->businessShortCode, // Your shortcode
            'RecieverIdentifierType' => '4', // Default to Organization Shortcode
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
            'Occasion' => $occasion,
        ];

        Log::debug('Reversal payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during Reversal', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during Reversal: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('Reversal response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Reversal', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'transaction_id' => $transactionID,
                'amount' => $amount,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the status of a specific transaction.
     * @param string $transactionID The M-Pesa Transaction ID to query.
     * @param string $partyA The shortcode or MSISDN of the party initiating the transaction.
     * @param string $identifierType The type of PartyA (e.g., '4' for Till Number, '6' for Paybill, '1' for MSISDN).
     * @param string $remarks A short description of the query.
     * @param string $commandID The unique command identifier (e.g., 'TransactionStatusQuery').
     * @param string|null $occasion Optional: Any other relevant information.
     * @return array The response from the M-Pesa API.
     */
    public function transactionStatus(
        string $transactionID,
        string $partyA,
        string $identifierType = '4', // Default to Organization Shortcode
        string $remarks = 'Transaction Status Query',
        string $commandID = 'TransactionStatusQuery',
        ?string $occasion = null
    ): array
    {
        $url = $this->baseUrl . '/mpesa/transactionstatus/v1/query';

        Log::info('Initiating Transaction Status Query', [
            'transaction_id' => $transactionID,
            'partyA' => $partyA,
            'identifier_type' => $identifierType,
            'command_id' => $commandID,
            'remarks' => $remarks,
            'occasion' => $occasion,
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'TransactionID' => $transactionID,
            'PartyA' => $partyA,
            'IdentifierType' => $identifierType,
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
            'Occasion' => $occasion,
        ];

        Log::debug('Transaction Status Query payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during Transaction Status Query', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during Transaction Status Query: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('Transaction Status Query response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Transaction Status Query', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'transaction_id' => $transactionID,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the account balance of a specific shortcode.
     * @param string $commandID The unique command identifier (e.g., 'AccountBalance').
     * @param string $remarks A short description of the query.
     * @return array The response from the M-Pesa API.
     */
    public function accountBalance(string $commandID = 'AccountBalance', string $remarks = 'Account Balance Query'): array
    {
        $url = $this->baseUrl . '/mpesa/accountbalance/v1/query';

        Log::info('Initiating Account Balance Query', [
            'command_id' => $commandID,
            'remarks' => $remarks,
            'business_shortcode' => $this->businessShortCode,
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'PartyA' => $this->businessShortCode,
            'IdentifierType' => '4', // Default to Organization Shortcode
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
        ];

        Log::debug('Account Balance Query payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during Account Balance Query', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during Account Balance Query: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('Account Balance Query response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Account Balance Query', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Checks the identity of a customer.
     * @param string $partyA The customer's phone number in 2547xx... format.
     * @param string $remarks A short description of the request.
     * @param string $commandID The unique command identifier (e.g., 'CheckIdentity').
     * @return array The response from the M-Pesa API.
     */

    public function checkIdentity(string $partyA, string $remarks = 'Check Identity', string $commandID = 'CheckIdentity'): array
    {
        $url = $this->baseUrl . '/mpesa/checkidentity/v1/processrequest';
        $originalPartyA = $partyA;
        $partyA = '254' . substr($partyA, -9); // Sanitize phone number

        Log::info('Initiating Check Identity request', [
            'original_partyA' => $originalPartyA,
            'formatted_partyA' => $partyA,
            'remarks' => $remarks,
            'command_id' => $commandID,
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'PartyA' => $partyA,
            'IdentifierType' => '1', // MSISDN
            'Remarks' => $remarks,
            'QueueTimeOutURL' => $this->queueTimeOutURL,
            'ResultURL' => $this->resultURL,
        ];

        Log::debug('Check Identity payload', $payload);

        $curl = null;
        try {
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $url,
                CURLOPT_HTTPHEADER => [
                    'Content-Type:application/json',
                    'Authorization: Bearer ' . $this->generateAccessToken()
                ],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during Check Identity', [
                    'error' => $error,
                    'curl_errno' => curl_errno($curl),
                    'http_code' => $httpCode,
                ]);
                throw new Exception('Curl error during Check Identity: ' . $error);
            }

            $decodedResponse = json_decode($response, true);

            Log::info('Check Identity response', [
                'http_code' => $httpCode,
                'response_code' => $decodedResponse['ResponseCode'] ?? 'Unknown',
                'response_description' => $decodedResponse['ResponseDescription'] ?? 'Unknown',
                'conversation_id' => $decodedResponse['ConversationID'] ?? null,
                'originator_conversation_id' => $decodedResponse['OriginatorConversationID'] ?? null,
            ]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Check Identity', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'partyA' => $partyA,
            ]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }
}
