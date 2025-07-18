<?php

namespace App\Http\Controllers;

use App\Services\MpesaStkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\CarBooking;
use Illuminate\Support\Facades\Auth;
use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;

class MpesaStkController extends Controller
{
    protected $mpesaService;

    public function __construct(MpesaStkService $mpesaService)
    {
        $this->mpesaService = $mpesaService;
    }

    public function initiatePayment(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'amount' => 'required|numeric|min:1',
            'booking_type' => 'required|in:property,car,food,service',
            'booking_id' => 'required|numeric'
        ]);

        $user = Auth::user();
        
        // Create payment record based on booking type
        $paymentData = [
            'user_id' => $user->id,
            'amount' => $request->amount,
            'method' => 'mpesa_stk',
            'status' => 'Pending',
            'phone' => $request->phone,
            'booking_type' => $request->booking_type
        ];

        // Set the appropriate foreign key based on booking type
        switch ($request->booking_type) {
            case 'property':
                $paymentData['booking_id'] = $request->booking_id;
                break;
            case 'car':
                $paymentData['car_booking_id'] = $request->booking_id;
                break;
            case 'food':
                $paymentData['food_order_id'] = $request->booking_id;
                break;
            case 'service':
                $paymentData['service_booking_id'] = $request->booking_id;
                break;
            default:
                Log::error('Unknown booking type', ['type' => $request->booking_type]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid booking type specified'
                ], 400);
        }

        $payment = Payment::create($paymentData);

        try {
            $response = $this->mpesaService->initiateStkPush(
                $request->phone,
                $request->amount,
                'Booking-' . $request->booking_id,
                "Payment for {$request->booking_type} booking #{$request->booking_id}"
            );

            if (isset($response['error'])) {
                $payment->update(['status' => 'Failed']);
                return response()->json(['success' => false, 'message' => $response['error']], 500);
            }

            if ($response['ResponseCode'] == '0') {
                $payment->update([
                    'checkout_request_id' => $response['CheckoutRequestID'],
                    'merchant_request_id' => $response['MerchantRequestID']
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'STK Push initiated successfully. Please check your phone to complete payment.',
                    'data' => $response
                ]);
            }

            $payment->update(['status' => 'Failed']);
            return response()->json([
                'success' => false,
                'message' => $response['ResponseDescription'] ?? 'Payment initiation failed',
                'data' => $response
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'Failed']);
            Log::error('M-Pesa STK Push Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Payment initiation failed'], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        Log::info('M-Pesa STK Callback:', $request->all());

        $callbackData = $request->all();
        $stkCallback = $callbackData['Body']['stkCallback'];

        // Find payment by CheckoutRequestID
        $payment = Payment::where('checkout_request_id', $stkCallback['CheckoutRequestID'])
                         ->first();

        if ($payment) {
            if ($stkCallback['ResultCode'] == 0) {
                $callbackMetadata = $stkCallback['CallbackMetadata']['Item'];
                $metadata = [];
                
                foreach ($callbackMetadata as $item) {
                    $metadata[$item['Name']] = $item['Value'];
                }

                $payment->update([
                    'status' => 'Completed',
                    'mpesa_receipt' => $metadata['MpesaReceiptNumber'] ?? null,
                    'transaction_date' => $metadata['TransactionDate'] ?? null,
                    'transaction_id' => $metadata['TransactionID'] ?? null
                ]);

                // Update booking status based on type
                $this->updateBookingStatus($payment->booking_type, $payment);

                // Send confirmation email
                $this->sendConfirmationEmail($payment);
            } else {
                $payment->update([
                    'status' => 'Failed',
                    'failure_reason' => $stkCallback['ResultDesc']
                ]);
            }
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
    }

    private function updateBookingStatus($bookingType, $payment)
    {
        $booking = null;
        $status = 'Paid';
        
        switch ($bookingType) {
            case 'property':
                $booking = Booking::find($payment->booking_id);
                break;
            case 'car':
                $booking = CarBooking::find($payment->car_booking_id);
                break;
            case 'food':
                // Handle food booking status update if needed
                break;
            case 'service':
                // Handle service booking status update if needed
                break;
            default:
                Log::warning('Unknown booking type in status update', ['type' => $bookingType]);
                return;
        }

        if ($booking) {
            $booking->status = $status;
            $booking->save();
        }
    }

    private function sendConfirmationEmail($payment)
    {
        try {
            $user = $payment->user;
            
            switch ($payment->booking_type) {
                case 'property':
                    $booking = Booking::with(['property'])->find($payment->booking_id);
                    Mail::to($user->email)->send(new BookingConfirmation($booking));
                    break;
                case 'car':
                    $booking = CarBooking::find($payment->car_booking_id);
                    Mail::to($user->email)->send(new CarBookingConfirmation($booking, $user));
                    break;
                case 'food':
                    // Handle food booking confirmation if needed
                    break;
                case 'service':
                    // Handle service booking confirmation if needed
                    break;
                default:
                    Log::warning('Unknown booking type in email confirmation', ['type' => $payment->booking_type]);
                    break;
            }
            
            Log::info('Booking confirmation email sent for payment ID: ' . $payment->id);
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
        }
    }
}