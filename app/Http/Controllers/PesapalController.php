<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Auth;

class PesapalController extends Controller
{
    private $consumerKey;
    private $consumerSecret;
    private $pesapalBaseUrl = 'https://pay.pesapal.com/v3/api';

    public function __construct()
    {
        $this->consumerKey = env('PESAPAL_CONSUMER_KEY');
        $this->consumerSecret = env('PESAPAL_CONSUMER_SECRET');
    }

    // Initiate payment for a booking
    public function initiatePayment(Request $request)
    {
        $client = new Client();
        $token = $this->getToken($client);
        $user = Auth::user();

        $booking = Booking::find($request->booking_id);
        if (!$booking) {
            return response(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $amount = $booking->total_price ?? 0; // adjust field name to your booking amount

        // Register IPN callback URL with Pesapal
        $ipn = $this->registerIPN($client, $token, $user->id, $booking->id, $request->cycle ?? 'Monthly');

        try {
            $response = $client->post("{$this->pesapalBaseUrl}/Transactions/SubmitOrderRequest", [
                'headers' => [
                    'Authorization' => "Bearer {$token}",
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'id' => uniqid(),
                    'currency' => 'KES',
                    'amount' => $amount,
                    'description' => "Booking Payment #{$booking->id}",
                    'callback_url' => url('/api/pesapal/confirm/' . $user->id . '/' . $booking->id . '/' . ($request->cycle ?? 'Monthly')),
                    'notification_id' => $ipn['ipn_id'],
                    'redirect_mode' => 'PARENT_WINDOW',
                    'billing_address' => [
                        'email_address' => $user->email,
                        'phone_number' => $user->phone,
                        'country_code' => 'KE',
                        'first_name' => $user->name,
                        'last_name' => $user->name,
                    ],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            // Log full response for debugging
            \Log::info('Pesapal SubmitOrderRequest response:', $data);

            if (!isset($data['redirect_url'])) {
                return response([
                    'success' => false,
                    'message' => 'Redirect URL missing in Pesapal response',
                    'response' => $data
                ], 500);
            }

            return response(['url' => $data['redirect_url'], 'success' => true]);

        } catch (\Exception $e) {
            \Log::error('Pesapal payment initiation error: ' . $e->getMessage());
            return response(['success' => false, 'message' => 'Payment initiation failed', 'error' => $e->getMessage()], 500);
        }
    }


    // Verify payment status from Pesapal and update booking accordingly
    public function verifyPayment(Request $request, $user_id, $booking_id, $cycle)
    {
        $transactionStatus = $this->getTransactionStatus($request->OrderTrackingId);

        if ($transactionStatus['status_code'] == 1) { // Successful payment
            $booking = Booking::find($booking_id);

            if (!$booking) {
                return response(['success' => false, 'message' => 'Booking not found'], 404);
            }

            // Update booking payment info
            $booking->status = $transactionStatus['payment_status'] ?? 'Paid';  // update with actual field names
            $booking->payment_reference = $transactionStatus['orderTrackingId'] ?? null;
            $booking->amount_paid = $transactionStatus['amount'] ?? $booking->amount_paid;
            $booking->payment_method = 'pesapal';
            $booking->payment_date = now();
            $booking->save();

            // Update or create payment record linked to this booking
            Payment::updateOrCreate(
                ['booking_id' => $booking_id, 'user_id' => $user_id],
                [
                    'amount' => $transactionStatus['amount'] ?? $booking->amount_paid,
                    'method' => 'pesapal',
                    'status' => $transactionStatus['payment_status'] ?? 'Paid',
                    'transaction_id' => $transactionStatus['orderTrackingId'] ?? null,
                ]
            );

            return response(['success' => true, 'message' => 'Booking payment verified']);
        } else {
            return response(['success' => false, 'message' => 'Payment verification failed']);
        }
    }

    // Get transaction status from Pesapal
    public function getTransactionStatus($orderTrackingId)
    {
        $client = new Client();
        $token = $this->getToken($client);

        $response = $client->get("{$this->pesapalBaseUrl}/Transactions/GetTransactionStatus?orderTrackingId={$orderTrackingId}", [
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);
        return $data;
    }

    // Get Bearer token from Pesapal
    
    private function getToken(Client $client)
    {
        $response = $client->post("{$this->pesapalBaseUrl}/Auth/RequestToken", [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'consumer_key' => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret,
            ],
        ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // JSON decode failed
            throw new \Exception('Invalid JSON response from Pesapal: ' . json_last_error_msg());
        }

        if (!isset($data['token'])) {
            // Token missing from response, throw exception or handle error
            throw new \Exception('Token not found in Pesapal response: ' . $body);
        }

        return $data['token'];
    }


    // Register Instant Payment Notification (IPN) URL with Pesapal
    public function registerIPN(Client $client, $token, $user_id, $booking_id, $cycle)
    {
        $response = $client->post("{$this->pesapalBaseUrl}/URLSetup/RegisterIPN", [
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'url' => url('/api/pesapal/confirm/' . $user_id . '/' . $booking_id . '/' . $cycle),
                'ipn_notification_type' => 'POST',
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);
        return $data;
    }
}
