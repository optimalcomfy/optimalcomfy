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

            // Updated response handling to match the service's return format
            if (isset($response['error'])) {
                $payment->update(['status' => 'Failed']);
                return response()->json([
                    'success' => false,
                    'message' => $response['description'] ?? $response['error']
                ], 500);
            }

            if ($response['success'] ?? false) {
                $payment->update([
                    'checkout_request_id' => $response['CheckoutRequestID'],
                    'merchant_request_id' => $response['MerchantRequestID']
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => $response['ResponseDescription'] ?? 'STK Push initiated successfully',
                    'data' => $response
                ]);
            }

            $payment->update(['status' => 'Failed']);
            return response()->json([
                'success' => false,
                'message' => $response['description'] ?? 'Payment initiation failed',
                'data' => $response
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'Failed']);
            Log::error('M-Pesa STK Push Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed'
            ], 500);
        }
    }

    public function handleCallback(Request $request)
    {
        Log::info('M-Pesa STK Callback:', $request->all());

        try {
            $callbackData = $request->all();
            
            // Validate callback structure
            if (!isset($callbackData['Body']['stkCallback'])) {
                throw new \Exception('Invalid callback structure');
            }

            $stkCallback = $callbackData['Body']['stkCallback'];

            // Find payment by CheckoutRequestID
            $payment = Payment::where('checkout_request_id', $stkCallback['CheckoutRequestID'])
                             ->first();

            if (!$payment) {
                throw new \Exception('Payment not found for CheckoutRequestID: ' . $stkCallback['CheckoutRequestID']);
            }

            if ($stkCallback['ResultCode'] == 0) {
                if (!isset($stkCallback['CallbackMetadata']['Item'])) {
                    throw new \Exception('Missing callback metadata');
                }

                $metadata = [];
                foreach ($stkCallback['CallbackMetadata']['Item'] as $item) {
                    $metadata[$item['Name']] = $item['Value'] ?? null;
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
                    'failure_reason' => $stkCallback['ResultDesc'] ?? 'Payment failed'
                ]);
            }

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);

        } catch (\Exception $e) {
            Log::error('M-Pesa Callback Processing Error', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Error processing callback']);
        }
    }

    private function updateBookingStatus($bookingType, $payment)
    {
        try {
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
            }

            if ($booking) {
                $booking->status = $status;
                $booking->save();
            }

        } catch (\Exception $e) {
            Log::error('Booking status update failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function sendConfirmationEmail($payment)
    {
        try {
            if (!$payment->user) {
                throw new \Exception('User not found for payment');
            }

            switch ($payment->booking_type) {
                case 'property':
                    $booking = Booking::with(['property'])->find($payment->booking_id);
                    if ($booking) {
                        Mail::to($payment->user->email)->send(new BookingConfirmation($booking));
                    }
                    break;
                case 'car':
                    $booking = CarBooking::find($payment->car_booking_id);
                    if ($booking) {
                        Mail::to($payment->user->email)->send(new CarBookingConfirmation($booking, $payment->user));
                    }
                    break;
            }

            Log::info('Booking confirmation email sent', ['payment_id' => $payment->id]);

        } catch (\Exception $e) {
            Log::error('Booking confirmation email failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}