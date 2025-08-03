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
    protected $callbackUrl; // For STK Push callback
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
        $this->callbackUrl = config('services.mpesa.callback_url'); // For STK Push callback
        $this->baseUrl = config('services.mpesa.base_url');

        // Initialize new configuration properties
        $this->initiatorName = config('services.mpesa.initiator_name');
        $this->securityCredential = config('services.mpesa.security_credential'); // This should be an encrypted password
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
        ];

        foreach ($required as $key) {
            if (empty($this->$key)) {
                Log::error("MPesa configuration error: {$key} is not configured.");
                throw new Exception("MPesa configuration error: {$key} is not configured.");
            }
        }
        Log::info('MPesa configuration validated successfully');
    }

    /**
     * Generates the Lipa Na Mpesa password.
     */
    public function lipaNaMpesaPassword(?string $timestamp = null): string
    {
        $timestampToUse = $timestamp ?? Carbon::rawParse('now')->format('YmdHis'); 
        $password = base64_encode($this->businessShortCode . $this->passkey . $timestampToUse);
        Log::debug('Generated Lipa Na Mpesa password', ['timestamp' => $timestampToUse]);
        return $password;
    }

    public function generateAccessToken(): string
    {
        $credentials = base64_encode($this->consumerKey . ":" . $this->consumerSecret);
        $url = $this->baseUrl . "/oauth/v1/generate?grant_type=client_credentials";

        Log::info('Generating M-Pesa access token', ['url' => $url]);

        $curl = null;
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
                Log::error('Curl error during access token generation', ['error' => $error]);
                throw new Exception('Curl error during access token generation: ' . $error);
            }

            $data = json_decode($response);
            if (!isset($data->access_token)) {
                Log::error('Failed to get access token from M-Pesa', ['response' => $response]);
                throw new Exception('Failed to get access token from M-Pesa.');
            }

            Log::info('Successfully generated M-Pesa access token');
            return $data->access_token;
        } catch (\Exception $e) {
            Log::error('Exception during access token generation', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if ($curl) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates an STK Push request.
     */
    public function STKPush(string $type, string $amount, string $phone, string $callback, string $reference, string $narrative): array
    {
        $url = $this->baseUrl . '/mpesa/stkpush/v1/processrequest';
        $phone = '254' . substr($phone, -9);

        $currentTime = Carbon::rawParse('now');
        $formattedTimestamp = $currentTime->format('YmdHis');

        Log::info('Initiating STK Push request', [
            'type' => $type,
            'amount' => $amount,
            'phone' => $phone,
            'reference' => $reference,
            'timestamp' => $formattedTimestamp
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
                $error = curl_error($curl);
                Log::error('Curl error during STK Push', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during STK Push: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('STK Push response received', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during STK Push', [
                'exception' => $e->getMessage(),
                'payload' => $payload
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
        Log::info('Registering M-Pesa URLs', [
            'confirmationURL' => $confirmationURL,
            'validationURL' => $validationURL
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
            if ($response === false) {
                $error = curl_error($curl);
                Log::error('Curl error during URL registration', ['error' => $error]);
                throw new Exception('Curl error during URL registration: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('URL registration response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during URL registration', ['exception' => $e->getMessage()]);
            throw $e; 
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a B2C (Business to Customer) payment request.
     */
    public function b2cPayment(string $amount, string $partyB, string $remarks, string $commandID = 'BusinessPayment', ?string $occasion = null): array
    {
        $url = $this->baseUrl . '/mpesa/b2c/v3/paymentrequest';
        $partyB = '254' . substr($partyB, -9);

        Log::info('Initiating B2C payment', [
            'amount' => $amount,
            'partyB' => $partyB,
            'commandID' => $commandID
        ]);

        $payload = [
            'InitiatorName' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'Amount' => $amount,
            'PartyA' => $this->businessShortCode,
            'PartyB' => $partyB,
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
                $error = curl_error($curl);
                Log::error('Curl error during B2C Payment', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during B2C Payment: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('B2C payment response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during B2C payment', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a B2B (Business to Business) payment request.
     */
    public function b2bPayment(
        string $amount, 
        string $partyB, 
        string $accountReference, 
        string $remarks, 
        string $commandID = 'BusinessPayBill',
        string $senderIdentifierType = '4',
        string $receiverIdentifierType = '4'
    ): array
    {
        $url = $this->baseUrl . '/mpesa/b2b/v1/paymentrequest';

        Log::info('Initiating B2B payment', [
            'amount' => $amount,
            'partyB' => $partyB,
            'commandID' => $commandID
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'SenderIdentifierType' => $senderIdentifierType,
            'RecieverIdentifierType' => $receiverIdentifierType,
            'Amount' => $amount,
            'PartyA' => $this->businessShortCode,
            'PartyB' => $partyB,
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
                $error = curl_error($curl);
                Log::error('Curl error during B2B Payment', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during B2B Payment: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('B2B payment response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during B2B payment', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the status of an STK Push transaction.
     */
    public function STKPushQuery(string $checkoutRequestID): array
    {
        $url = $this->baseUrl . '/mpesa/stkpushquery/v1/query';
        $currentTime = Carbon::rawParse('now');
        $formattedTimestamp = $currentTime->format('YmdHis');

        Log::info('Querying STK Push status', [
            'checkoutRequestID' => $checkoutRequestID,
            'timestamp' => $formattedTimestamp
        ]);

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
                $error = curl_error($curl);
                Log::error('Curl error during STK Push Query', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during STK Push Query: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('STK Push Query response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during STK Push Query', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Initiates a Reversal request for a transaction.
     */
    public function reversal(string $transactionID, string $amount, string $remarks, ?string $occasion = null): array
    {
        $url = $this->baseUrl . '/mpesa/reversal/v1/request';

        Log::info('Initiating transaction reversal', [
            'transactionID' => $transactionID,
            'amount' => $amount
        ]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => 'TransactionReversal',
            'TransactionID' => $transactionID,
            'Amount' => $amount,
            'ReceiverParty' => $this->businessShortCode,
            'RecieverIdentifierType' => '4',
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
                $error = curl_error($curl);
                Log::error('Curl error during Reversal', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during Reversal: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('Reversal response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Reversal', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the status of a specific transaction.
     */
    public function transactionStatus(
        string $transactionID, 
        string $partyA, 
        string $identifierType = '4',
        string $remarks = 'Transaction Status Query', 
        string $commandID = 'TransactionStatusQuery', 
        ?string $occasion = null
    ): array
    {
        $url = $this->baseUrl . '/mpesa/transactionstatus/v1/query';

        Log::info('Querying transaction status', [
            'transactionID' => $transactionID,
            'partyA' => $partyA
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
                $error = curl_error($curl);
                Log::error('Curl error during Transaction Status Query', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during Transaction Status Query: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('Transaction status response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Transaction Status Query', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Queries the account balance of a specific shortcode.
     */
    public function accountBalance(string $commandID = 'AccountBalance', string $remarks = 'Account Balance Query'): array
    {
        $url = $this->baseUrl . '/mpesa/accountbalance/v1/query';

        Log::info('Querying account balance');

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'PartyA' => $this->businessShortCode,
            'IdentifierType' => '4',
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
                $error = curl_error($curl);
                Log::error('Curl error during Account Balance Query', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during Account Balance Query: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('Account balance response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Account Balance Query', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }

    /**
     * Checks the identity of a customer.
     */
    public function checkIdentity(string $partyA, string $remarks = 'Check Identity', string $commandID = 'CheckIdentity'): array
    {
        $url = $this->baseUrl . '/mpesa/checkidentity/v1/processrequest';
        $partyA = '254' . substr($partyA, -9);

        Log::info('Checking customer identity', ['partyA' => $partyA]);

        $payload = [
            'Initiator' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => $commandID,
            'PartyA' => $partyA,
            'IdentifierType' => '1',
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
                $error = curl_error($curl);
                Log::error('Curl error during Check Identity', ['error' => $error, 'payload' => $payload]);
                throw new Exception('Curl error during Check Identity: ' . $error);
            }
            
            $decodedResponse = json_decode($response, true);
            Log::info('Check identity response', ['response' => $decodedResponse]);

            return $decodedResponse;
        } catch (\Exception $e) {
            Log::error('Exception during Check Identity', ['exception' => $e->getMessage()]);
            throw $e;
        } finally {
            if (isset($curl)) {
                curl_close($curl);
            }
        }
    }
}