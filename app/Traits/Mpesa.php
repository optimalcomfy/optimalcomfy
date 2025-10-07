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

        // Hard-coded base URL
        $this->baseUrl = 'https://api.safaricom.co.ke';

        $this->initiatorName = config('services.mpesa.initiator_name');
        $this->securityCredential = config('services.mpesa.security_credential');
        $this->resultURL = config('services.mpesa.result_url');
        $this->queueTimeOutURL = config('services.mpesa.queue_timeout_url');

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
            // Use the internal property name $key to check if the value is truthy
            if (empty($this->$key)) {
                // Log the failure with the property name for better debugging
                Log::error("MPesa configuration error: Required config '{$key}' is missing or empty.");
                throw new Exception("MPesa configuration error: {$key} is not configured.");
            }
        }
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
        return $password;
    }

    public function generateAccessToken(): string
    {
        $credentials = base64_encode($this->consumerKey . ":" . $this->consumerSecret);

        // Make sure the full URL includes the host
        $url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

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
            throw new \Exception('Curl error during access token generation: ' . $error);
        }

        $data = json_decode($response);
        if (!isset($data->access_token)) {
            throw new \Exception('Failed to get access token from M-Pesa. Response: ' . $response);
        }

        curl_close($curl);

        return $data->access_token;
    }


    public function STKPush(string $type, string $amount, string $phone, string $callback, string $reference, string $narrative): array
    {
        // Use $this->baseUrl which is guaranteed not to have a trailing slash
        $url = $this->baseUrl . '/mpesa/stkpush/v1/processrequest';
        $phone = '254' . substr($phone, -9);

        $formattedTimestamp = Carbon::rawParse('now')->format('YmdHis');

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

        $curl = null;
        try {
            // Note: Removed PartyB and PhoneNumber from payload log to match original log structure,
            // but kept Amount and essential info.
            Log::info('Initiating STK Push', ['url' => $url, 'payload' => [
                'BusinessShortCode' => $this->businessShortCode,
                'Timestamp' => $formattedTimestamp,
                'TransactionType' => $payload['TransactionType'],
                'Amount' => $payload['Amount'],
                'PartyA' => $payload['PartyA'],
                'CallBackURL' => $payload['CallBackURL'],
                'AccountReference' => $payload['AccountReference'],
                'TransactionDesc' => $payload['TransactionDesc'],
            ]]);

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
            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during STK Push', ['error' => $error]);
                throw new Exception('Curl error during STK Push: ' . $error);
            }

            $decodedResponse = json_decode($response, true);
            Log::info('STK Push response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('STK Push failed', ['message' => $e->getMessage()]);
            throw $e;
        } finally {
            if ($curl) curl_close($curl);
        }
    }

    public function mpesaRegisterUrls(string $confirmationURL, string $validationURL): array
    {
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
            if ($response === false) {
                throw new Exception('Curl error during URL registration: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
        $partyB = '254' . substr($partyB, -9); // Sanitize phone number

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
            if ($response === false) {
                throw new Exception('Curl error during B2C Payment: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
            if ($response === false) {
                throw new Exception('Curl error during B2B Payment: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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

        $payload = [
            'BusinessShortCode' => $this->businessShortCode,
            'Password' => $this->lipaNaMpesaPassword($formattedTimestamp),
            'Timestamp' => $formattedTimestamp,
            'CheckoutRequestID' => $checkoutRequestID,
        ];

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
            if ($response === false) {
                throw new Exception('Curl error during STK Push Query: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
            if ($response === false) {
                throw new Exception('Curl error during Reversal: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
            if ($response === false) {
                throw new Exception('Curl error during Transaction Status Query: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
            if ($response === false) {
                throw new Exception('Curl error during Account Balance Query: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
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
        $partyA = '254' . substr($partyA, -9); // Sanitize phone number

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
            if ($response === false) {
                throw new Exception('Curl error during Check Identity: ' . curl_error($curl));
            }

            $decodedResponse = json_decode($response, true);

            return $decodedResponse;
        } catch (\Exception $e) {
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }
}
