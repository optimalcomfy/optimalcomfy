<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\CarBooking;
use App\Models\Payment;
use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Auth;
use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;

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

    public function initiatePayment(Request $request)
    {
        $client = new Client();
        $token = $this->getToken($client);
        $user = Auth::user();

        $booking = $this->resolveBooking($request->booking_type, $request->booking_id);

        if (!$booking) {
            return response(['success' => false, 'message' => 'Invalid booking type or booking not found'], 404);
        }

        $amount = $booking->total_price ?? 0;
        $cycle = $request->cycle ?? 'Monthly';

        $ipn = $this->registerIPN($client, $token, $user->id, $request->booking_type, $booking->id, $cycle);

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
                    'description' => "Payment for {$request->booking_type} booking #{$booking->id}",
                    'callback_url' => url("/api/pesapal/confirm/{$user->id}/{$request->booking_type}/{$booking->id}/{$cycle}"),
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

    public function verifyPayment(Request $request, $user_id, $booking_type, $booking_id, $cycle)
    {
        $transactionStatus = $this->getTransactionStatus($request->OrderTrackingId);

        if ($transactionStatus['status_code'] == 1) {
            $booking = $this->resolveBooking($booking_type, $booking_id);

            if (!$booking) {
                return redirect()->route('bookings.failed')->with('error', 'Booking not found.');
            }

            $booking->status = $transactionStatus['payment_status'] ?? 'Paid';
            $booking->total_price = $transactionStatus['amount'] ?? $booking->total_price;
            $booking->save();

            Payment::updateOrCreate(
                ['booking_id' => $booking_id, 'user_id' => $user_id],
                [
                    'amount' => $transactionStatus['amount'] ?? $booking->total_price,
                    'method' => 'pesapal',
                    'status' => $transactionStatus['payment_status'] ?? 'Paid',
                    'booking_type' => $booking_type
                ]
            );

            try {
                if($booking_type == 'property') {
                    $propertyBookingWithRelations = Booking::with(['user', 'property', 'payments'])
                                                ->find($booking_id);
                    
                    Mail::to($propertyBookingWithRelations->user->email)
                    ->send(new BookingConfirmation($propertyBookingWithRelations));
                }
                else {

                    $user  = User::find($user_id);
                
                    Mail::to($user->email)
                    ->send(new CarBookingConfirmation($booking, $user));
                }
                    
                \Log::info('Booking confirmation email sent for booking ID: ' . $booking_id);
                
            } catch (\Exception $e) {
                \Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
            }

            return redirect()->route('bookings.success')->with('message', 'Booking payment verified!');
        } else {
            return redirect()->route('bookings.failed')->with('error', 'Payment verification failed.');
        }
    }

    private function resolveBooking($type, $id)
    {
        return match ($type) {
            'car' => CarBooking::with('car')->find($id),
            'property' => Booking::find($id),
            default => null,
        };
    }


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

        return json_decode($response->getBody()->getContents(), true);
    }

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

        $data = json_decode($response->getBody()->getContents(), true);

        if (!isset($data['token'])) {
            throw new \Exception('Token not found in Pesapal response');
        }

        return $data['token'];
    }

    public function registerIPN(Client $client, $token, $user_id, $booking_type, $booking_id, $cycle)
    {
        $url = url("/api/pesapal/confirm/{$user_id}/{$booking_type}/{$booking_id}/{$cycle}");

        $response = $client->post("{$this->pesapalBaseUrl}/URLSetup/RegisterIPN", [
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'url' => $url,
                'ipn_notification_type' => 'POST',
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }
}
