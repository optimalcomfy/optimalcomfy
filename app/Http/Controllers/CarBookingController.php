<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Http\Requests\UpdateCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use App\Models\User;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;
use Carbon\Carbon;
use App\Http\Controllers\MpesaStkController;
use App\Services\MpesaStkService;
use App\Traits\Mpesa;
use App\Services\PesapalService;

use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;
use App\Mail\CancelledCarBooking;
use App\Mail\RefundNotification;

use Illuminate\Http\JsonResponse;

use App\Mail\CarCheckInVerification;
use App\Mail\CarCheckOutVerification;
use App\Services\SmsService;

class CarBookingController extends Controller
{
    use Mpesa;

    public function index(Request $request)
    {
        $query = CarBooking::with(['car', 'user'])->orderBy('created_at', 'desc');

        $user = Auth::user();

        if ($user->role_id == 2) {
            $query->whereHas('car', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', '=', $user->id);
        }

        if ($request->has('status') && $request->input('status') != null) {
            $status = $request->input('status');

            $query->where(function ($q) use ($status) {
                if ($status === 'checked_out') {
                    $q->whereNotNull('checked_out');
                } elseif ($status === 'checked_in') {
                    $q->whereNull('checked_out')->whereNotNull('checked_in');
                } elseif ($status === 'upcoming_stay') {
                    $q->where('status', 'paid')->whereNull('checked_in');
                } else {
                    $q->where('status', $status);
                }
            });
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });

        $carBookings = $query->paginate(10);

        return Inertia::render('CarBookings/Index', [
            'carBookings' => $carBookings->items(),
            'pagination' => $carBookings,
            'flash' => session('flash'),
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = CarBooking::with(['user', 'car']);

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });


       if ($request->has('status') && $request->input('status') != null) {
            $status = $request->input('status');

            $query->where(function($q) use ($status) {
                switch ($status) {
                    case 'checked_out':
                        $q->whereNotNull('checked_out');
                        break;
                    case 'checked_in':
                        $q->whereNotNull('checked_in')
                        ->whereNull('checked_out');
                        break;
                    case 'upcoming_stay':
                        $q->where('status', 'paid')
                        ->whereNull('checked_in');
                        break;
                    default:
                        $q->where('status', $status)
                        ->whereNull('checked_in')
                        ->whereNull('checked_out');
                }
            });
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                    ->orWhere('status', 'LIKE', "%$search%")
                    ->orWhere('external_booking', 'LIKE', "%$search%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%$search%");
                    })
                    ->orWhereHas('car', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%$search%")
                            ->orWhere('license_plate', 'LIKE', "%$search%");
                    });
            });
        }


        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($user->role_id == 2) {
            $query->whereHas('car', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        $carBookings = $query->orderBy('created_at', 'desc')->get();

        $exportData = $carBookings->map(function ($booking) {
            $startDate = Carbon::parse($booking->start_date);
            $endDate = Carbon::parse($booking->end_date);
            $days = $endDate->diffInDays($startDate);
            $totalPrice = optional($booking->car)->platform_price * $days;

            return [
                'number' => $booking->number,
                'host_price'=> $booking->host_price,
                'guest_name' => optional($booking->user)->name,
                'car_name' => optional($booking->car)->name,
                'license_plate' => optional($booking->car)->license_plate,
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'days' => $days,
                'total_price' => 'KES ' . number_format($totalPrice, 2),
                'pickup_location' => $booking->pickup_location,
                'dropoff_location' => $booking->dropoff_location,
                'status' => $booking->status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'created_at' => $booking->created_at->toDateTimeString(),
            ];
        });

        return response()->json($exportData);
    }

    // Add refund handling method
    public function handleRefund(Request $request, CarBooking $carBooking, SmsService $smsService)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:255',
            'refund_amount' => 'required_if:action,approve|numeric|min:0|max:'.$carBooking->total_price,
        ]);

        if ($request->action === 'approve') {
            $carBooking->update([
                'refund_approval' => 'approved',
                'refund_amount' => $request->refund_amount,
                'non_refund_reason' => null,
            ]);

            Refund::create([
                "amount" => $request->refund_amount,
                "booking_id" => null,
                "car_booking_id" => $carBooking->id,
            ]);

            // Send SMS notification for refund approval
            $this->sendCarRefundSms($carBooking, 'approved', $request->refund_amount, $smsService);

            Mail::to($carBooking->user->email)
                ->send(new RefundNotification($carBooking, 'approved'));

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } else {
            $carBooking->update([
                'refund_approval' => 'rejected',
                'non_refund_reason' => $request->reason,
                'refund_amount' => 0,
            ]);

            // Send SMS notification for refund rejection
            $this->sendCarRefundSms($carBooking, 'rejected', 0, $smsService, $request->reason);

            Mail::to($carBooking->user->email)
                ->send(new RefundNotification($carBooking, 'rejected', $request->reason));

            return redirect()->back()->with('success', 'Refund rejected successfully.');
        }
    }

    public function cancel(Request $request, SmsService $smsService)
    {
        $input = $request->all();

        $booking = CarBooking::find($input['id']);

        $request->validate([
            'cancel_reason' => 'required|string|min:10|max:500',
        ]);

        if ($booking->checked_in || $booking->status === 'Cancelled') {
            return back()->with('error', 'Booking cannot be cancelled at this stage.');
        }

        $booking->update([
            'status' => 'Cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by_id' => auth()->id(),
        ]);

        $booking->start_date = Carbon::parse($booking->start_date);
        $booking->end_date = Carbon::parse($booking->end_date);
        $booking->cancelled_at = Carbon::parse($booking->cancelled_at);

        try {
            Mail::to($booking->user->email)->send(new CancelledCarBooking($booking, 'guest'));

            // Send cancellation SMS
            $this->sendCarCancellationSms($booking, $smsService);

            if ($booking->car->user) {
                Mail::to($booking->car->user->email)->send(new CancelledCarBooking($booking, 'host'));
            }
        } catch (\Exception $e) {
            \Log::error('Cancellation email error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
    }

    public function create()
    {
        $user = Auth::user();

        $query = Car::with(['bookings']);

        if ($user->role_id == 2) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('CarBookings/Create', [
            'cars' => $query->get(),
        ]);
    }

    public function store(StoreCarBookingRequest $request, SmsService $smsService, PesapalService $pesapalService)
    {
        $validatedData = $request->validated();

        $user = Auth::user();
        $validatedData['user_id'] = $user->id;

        $car = Car::findOrFail($request->car_id);

        // Calculate number of days
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $days = $startDate->diffInDays($endDate);
        $days = max($days, 1);

        $booking = CarBooking::create([
            'user_id'         => $user->id,
            'car_id'          => $request->car_id,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
            'total_price'     => $request->total_price,
            'pickup_location' => $request->pickup_location,
            'dropoff_location'=> $request->pickup_location,
            'status'          => 'pending',
            'special_requests'=> $request->special_requests,
            'referral_code'   => $request->referral_code,
            'payment_method'  => $request->payment_method
        ]);

        try {
            // Send booking confirmation SMS
            $this->sendCarBookingConfirmationSms($booking, 'pending', $smsService);

            // Handle different payment methods
            if ($request->payment_method === 'mpesa') {
                $company = Company::first();
                $finalAmount = $request->referral_code ? ($booking->total_price - (($booking->total_price * $company->booking_referral_percentage) / 100)) : $booking->total_price;
                $finalAmount = ceil($finalAmount);

                return $this->processCarMpesaPayment($booking, $request->phone, $finalAmount);

            } elseif ($request->payment_method === 'pesapal') {
                $company = Company::first();
                $finalAmount = $request->referral_code ? ($booking->total_price - (($booking->total_price * $company->booking_referral_percentage) / 100)) : $booking->total_price;
                $finalAmount = ceil($finalAmount);

                return $this->processCarPesapalPayment($booking, $user, $finalAmount, $pesapalService);
            }

        } catch (\Exception $e) {
            \Log::error('Payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            // Send payment failure SMS
            $this->sendCarPaymentFailureSms($booking, $e->getMessage(), $smsService);

            return back()
                ->withInput()
                ->withErrors(['payment' => 'Payment initiation failed due to a system error.']);
        }
    }

    /**
     * Process M-Pesa payment for car booking
     */
    private function processCarMpesaPayment($booking, $phone, $amount)
    {
        $callbackBase = env('MPESA_RIDE_CALLBACK_URL') ?? secure_url('/api/mpesa/ride/stk/callback');

        $callbackData = [
            'phone' => $phone,
            'amount' => $amount,
            'booking_id' => $booking->id,
            'booking_type' => 'car'
        ];

        $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

        $this->STKPush(
            'Paybill',
            $amount,
            $phone,
            $callbackUrl,
            'reference',
            'Book Ristay'
        );

        return redirect()->route('ride.payment.pending', [
            'booking' => $booking->id,
            'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
        ]);
    }

    /**
     * Process Pesapal payment for car booking
     */
    private function processCarPesapalPayment($booking, $user, $amount, $pesapalService)
    {
        try {
            // Prepare order data
            $orderData = [
                'id' => $booking->number,
                'currency' => 'KES',
                'amount' => 1, // Changed from $amount to 1 for testing
                'description' => 'Car booking for ' . $booking->car->name,
                'callback_url' => route('pesapal.car.callback'), // CHANGED: Use car-specific callback
                'cancellation_url' => route('ride.payment.cancelled', ['booking' => $booking->id]),
                'notification_id' => config('services.pesapal.ipn_id'),
                'billing_address' => [
                    'email_address' => $user->email,
                    'phone_number' => $user->phone ?? '254700000000',
                    'country_code' => 'KE',
                    'first_name' => $user->name,
                    'middle_name' => '',
                    'last_name' => '',
                    'line_1' => 'Nairobi',
                    'line_2' => '',
                    'city' => 'Nairobi',
                    'state' => 'Nairobi',
                    'postal_code' => '00100',
                    'zip_code' => '00100'
                ]
            ];

            \Log::info('Submitting Pesapal car order', [
                'booking_id' => $booking->id,
                'order_data' => $orderData,
                'callback_url' => $orderData['callback_url'] // Log the callback URL
            ]);

            $orderResponse = $pesapalService->createOrderDirect($orderData);

            \Log::info('Pesapal Car Order Response', [
                'booking_id' => $booking->id,
                'order_response' => $orderResponse
            ]);

            if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                // Store Pesapal tracking ID in booking
                $booking->update([
                    'pesapal_tracking_id' => $orderResponse['order_tracking_id']
                ]);

                \Log::info('Pesapal car payment initiated successfully', [
                    'booking_id' => $booking->id,
                    'tracking_id' => $orderResponse['order_tracking_id'],
                    'redirect_url' => $orderResponse['redirect_url'],
                    'callback_url' => $orderData['callback_url']
                ]);

                // Return Inertia response
                return Inertia::render('PaymentRedirect', [
                    'success' => true,
                    'redirect_url' => $orderResponse['redirect_url'],
                    'booking_id' => $booking->id,
                    'message' => 'Payment initiated successfully',
                    'payment_method' => 'pesapal',
                    'booking_type' => 'car'
                ]);

            } else {
                $errorType = $orderResponse['error']['error_type'] ?? 'unknown_error';
                $errorCode = $orderResponse['error']['code'] ?? 'unknown_code';
                $errorMessage = $orderResponse['error']['message'] ?? 'Unknown error occurred';

                \Log::error('Pesapal car order creation failed', [
                    'error_type' => $errorType,
                    'error_code' => $errorCode,
                    'error_message' => $errorMessage,
                    'full_response' => $orderResponse
                ]);

                return back()->withErrors([
                    'payment' => "Pesapal Error [$errorCode]: $errorMessage"
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('Pesapal car payment initiation failed: ' . $e->getMessage());

            $booking->update(['status' => 'failed']);

            return back()->withErrors([
                'payment' => 'Payment initiation failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Handle Pesapal IPN for car bookings
     */
    public function handleCarPesapalNotification(Request $request, SmsService $smsService, PesapalService $pesapalService)
    {
        try {
            $rawInput = $request->getContent();
            $ipnData = $request->all();

            \Log::info('Pesapal Car IPN Received - Raw', ['raw_data' => $rawInput]);
            \Log::info('Pesapal Car IPN Received - Parsed', $ipnData);

            // Validate IPN data
            if (!$pesapalService->validateIPN($ipnData)) {
                \Log::error('Pesapal Car IPN validation failed', $ipnData);
                return response()->json(['error' => 'Invalid IPN data'], 400);
            }

            // Extract important fields from IPN
            $orderTrackingId = $ipnData['OrderTrackingId'] ?? null;
            $orderNotificationType = $ipnData['OrderNotificationType'] ?? null;
            $orderMerchantReference = $ipnData['OrderMerchantReference'] ?? null;

            // Find car booking
            $booking = CarBooking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->with(['user', 'car.user'])
                            ->first();

            if (!$booking) {
                \Log::error('Car booking not found for Pesapal IPN', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference
                ]);
                return response()->json(['error' => 'Car booking not found'], 404);
            }

            // Handle different notification types
            switch ($orderNotificationType) {
                case 'CHANGE':
                    $status = $ipnData['Status'] ?? null;
                    $this->handleCarPaymentStatus($booking, $status, $ipnData, $smsService);
                    break;

                case 'CONFIRMED':
                    $this->handleCarConfirmedPayment($booking, $ipnData, $smsService);
                    break;

                default:
                    \Log::warning('Unknown Pesapal car notification type', [
                        'type' => $orderNotificationType,
                        'booking_id' => $booking->id
                    ]);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            \Log::error('Pesapal Car IPN processing error: ' . $e->getMessage(), [
                'exception' => $e,
                'ipn_data' => $ipnData ?? []
            ]);
            return response()->json(['error' => 'IPN processing failed'], 500);
        }
    }

    /**
     * Handle car payment status changes
     */
    private function handleCarPaymentStatus($booking, $status, $ipnData, $smsService)
    {
        \Log::info('Handling Pesapal car payment status', [
            'booking_id' => $booking->id,
            'status' => $status,
            'previous_status' => $booking->status
        ]);

        switch ($status) {
            case 'COMPLETED':
            case 'SUCCESS':
                $this->handleCarSuccessfulPayment($booking, $ipnData, $smsService);
                break;

            case 'FAILED':
            case 'INVALID':
                $this->handleCarFailedPayment($booking, $ipnData, $smsService);
                break;

            case 'PENDING':
                \Log::info('Car payment still pending', ['booking_id' => $booking->id]);
                break;

            default:
                \Log::warning('Unknown car payment status', [
                    'booking_id' => $booking->id,
                    'status' => $status
                ]);
        }
    }

    /**
     * Handle successful car payment
     */
    private function handleCarSuccessfulPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'paid') {
            \Log::info('Car payment already processed', ['booking_id' => $booking->id]);
            return;
        }

        // Update booking status
        $booking->update(['status' => 'paid']);

        // Create payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'car_booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'completed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'transaction_reference' => $ipnData['PaymentMethodReference'] ?? null,
            'booking_type' => 'car',
            'transaction_date' => now()
        ]);

        // Send confirmation emails and SMS
        $this->sendCarConfirmationEmails($booking);
        $this->sendCarBookingConfirmationSms($booking, 'confirmed', $smsService);

        \Log::info('Pesapal car payment completed successfully', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    /**
     * Handle confirmed car payment
     */
    private function handleCarConfirmedPayment($booking, $ipnData, $smsService)
    {
        $this->handleCarSuccessfulPayment($booking, $ipnData, $smsService);
    }

    /**
     * Handle failed car payment
     */
    private function handleCarFailedPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'failed') {
            return;
        }

        $booking->update(['status' => 'failed']);

        // Create failed payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'car_booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'failed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'failure_reason' => $ipnData['Description'] ?? 'Payment failed',
            'booking_type' => 'car'
        ]);

        // Send failure notification
        $this->sendCarPaymentFailureSms($booking, 'Payment failed via Pesapal', $smsService);

        \Log::warning('Pesapal car payment failed', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    /**
     * Handle Pesapal callback for car bookings
     */
    public function handleCarPesapalCallback(Request $request)
    {
        try {
            $orderTrackingId = $request->input('OrderTrackingId');
            $orderMerchantReference = $request->input('OrderMerchantReference');

            \Log::info('Pesapal Car Callback Received', [
                'order_tracking_id' => $orderTrackingId,
                'order_merchant_reference' => $orderMerchantReference,
                'all_params' => $request->all()
            ]);

            // Debug: Log all car bookings with similar tracking IDs or numbers
            $similarBookings = CarBooking::where('pesapal_tracking_id', 'like', '%' . $orderTrackingId . '%')
                ->orWhere('number', 'like', '%' . $orderMerchantReference . '%')
                ->get();

            \Log::info('Similar car bookings found', [
                'count' => $similarBookings->count(),
                'bookings' => $similarBookings->pluck('id', 'number')
            ]);

            // Find car booking by tracking ID or merchant reference
            $booking = CarBooking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->with(['car', 'user'])
                            ->first();

            if (!$booking) {
                \Log::error('Car booking not found for Pesapal callback', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference,
                    'all_car_bookings' => CarBooking::all()->pluck('number', 'pesapal_tracking_id'),
                    'similar_bookings' => $similarBookings
                ]);

                return Inertia::render('PesapalPaymentFailed', [
                    'error' => 'Car booking not found. Please contact support with your booking reference: ' . $orderMerchantReference,
                    'company' => Company::first(),
                    'booking_type' => 'car'
                ]);
            }

            \Log::info('Car booking found', [
                'booking_id' => $booking->id,
                'booking_number' => $booking->number,
                'status' => $booking->status,
                'tracking_id' => $booking->pesapal_tracking_id
            ]);

            // Update booking status based on callback data
            $booking->status = 'paid';
            $booking->save();

            // Create payment record
            Payment::create([
                'user_id' => $booking->user_id,
                'car_booking_id' => $booking->id,
                'amount' => $booking->total_price,
                'method' => 'pesapal',
                'status' => 'completed',
                'pesapal_tracking_id' => $booking->pesapal_tracking_id,
                'transaction_reference' => $request->input('PaymentMethodReference'),
                'booking_type' => 'car',
                'transaction_date' => now()
            ]);

            // Send confirmation emails and SMS
            $smsService = app(SmsService::class);
            $this->sendCarConfirmationEmails($booking);
            $this->sendCarBookingConfirmationSms($booking, 'confirmed', $smsService);

            \Log::info('Car booking status updated to paid', [
                'booking_id' => $booking->id,
                'tracking_id' => $orderTrackingId
            ]);

            return Inertia::render('PesapalPaymentSuccess', [
                'booking' => $booking,
                'company' => Company::first(),
                'booking_type' => 'car'
            ]);

        } catch (\Exception $e) {
            \Log::error('Pesapal car callback processing error: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            return Inertia::render('PesapalPaymentFailed', [
                'error' => 'Error processing payment: ' . $e->getMessage(),
                'company' => Company::first(),
                'booking_type' => 'car'
            ]);
        }
    }

    public function handleCallback(Request $request, SmsService $smsService)
    {
        try {
            // Parse the callback data
            $callbackData = $request->json()->all();

            // Extract the transaction details from callback
            $resultCode = $callbackData['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'] ?? null;
            $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'] ?? null;
            $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'] ?? null;

            // PROPERLY decode the callback parameters
            $callbackParams = [];
            $encodedData = $request->query('data');

            if ($encodedData) {
                // First URL decode, then JSON decode
                $decodedData = urldecode($encodedData);
                $callbackParams = json_decode($decodedData, true);

                // If that fails, try direct JSON decode (for backward compatibility)
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $callbackParams = json_decode($encodedData, true);
                }
            }

            // DEBUG: Log the decoding process
            \Log::info('Callback params decoding', [
                'encoded_data' => $encodedData,
                'decoded_data' => $decodedData ?? null,
                'callback_params' => $callbackParams,
                'json_last_error' => json_last_error_msg()
            ]);

            // Get booking_id from properly decoded params
            $bookingId = $callbackParams['booking_id'] ?? null;

            if (!$bookingId) {
                \Log::error('Booking ID not found in callback params', [
                    'callback_params' => $callbackParams,
                    'query_params' => $request->query()
                ]);
                return response()->json(['message' => 'Booking ID not found'], 404);
            }

            // Find the related booking
            $booking = CarBooking::with('car.user')->find($bookingId);

            if (!$booking) {
                \Log::error('Booking not found in database', [
                    'booking_id' => $bookingId,
                    'callback_params' => $callbackParams
                ]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Prepare payment data
            $paymentData = [
                'user_id' => $booking->user_id,
                'car_booking_id' => $booking->id,
                'amount' => $callbackParams['amount'] ?? $booking->total_price,
                'method' => 'mpesa',
                'phone' => $callbackParams['phone'] ?? null,
                'checkout_request_id' => $checkoutRequestID,
                'merchant_request_id' => $merchantRequestID,
                'booking_type' => 'car',
                'status' => $resultCode === 0 ? 'completed' : 'failed',
                'failure_reason' => $resultCode !== 0 ? $resultDesc : null,
            ];

            // If payment was successful
            if ($resultCode === 0) {
                $callbackMetadata = $callbackData['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];

                // Extract M-Pesa receipt details from callback metadata
                foreach ($callbackMetadata as $item) {
                    switch ($item['Name']) {
                        case 'MpesaReceiptNumber':
                            $paymentData['mpesa_receipt'] = $item['Value'];
                            break;
                        case 'TransactionDate':
                            $paymentData['transaction_date'] = date('Y-m-d H:i:s', strtotime($item['Value']));
                            break;
                        case 'Amount':
                            $paymentData['amount'] = $item['Value'];
                            break;
                        case 'PhoneNumber':
                            $paymentData['phone'] = $item['Value'];
                            break;
                    }
                }

                // Update booking status
                $booking->update(['status' => 'paid']);

                // Send confirmation SMS
                $this->sendCarBookingConfirmationSms($booking, 'confirmed', $smsService);

            } else {
                // Payment failed
                $booking->update(['status' => 'failed']);

                // Send payment failure SMS
                $this->sendCarPaymentFailureSms($booking, $resultDesc, $smsService);
            }

            // Create payment record
            $payment = Payment::create($paymentData);

            if($resultCode === 0) {
                $user  = User::find($booking->user_id);

                Mail::to($user->email)
                ->send(new CarBookingConfirmation($booking, 'customer'));

                if ($booking->car->user) {
                    Mail::to($booking->car->user->email)
                    ->send(new CarBookingConfirmation($booking, 'host'));
                }
            }

            // Return success response to M-Pesa
            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Car booking callback error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Error processing callback'
            ], 500);
        }
    }

    public function paymentPending(CarBooking $booking, Request $request)
    {
        $company = Company::first();

        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $startDate = Carbon::parse($booking->start_date);
            $endDate = Carbon::parse($booking->end_date);
            $days = max(1, $endDate->diffInDays($startDate)); // FIXED: Use days instead of hours
            $displayAmount = $booking->markup->final_amount * $days;
        }

        return Inertia::render('RidePaymentPending', [
            'booking' => $booking,
            'company' => $company,
            'displayAmount' => $displayAmount,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }

    public function paymentStatus(CarBooking $booking)
    {
        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $startDate = Carbon::parse($booking->start_date);
            $endDate = Carbon::parse($booking->end_date);
            $days = max(1, $endDate->diffInDays($startDate)); // FIXED: Use days instead of hours
            $displayAmount = $booking->markup->final_amount * $days;
        }

        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $displayAmount,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }

    public function add(StoreCarBookingRequest $request, SmsService $smsService)
    {
        $validatedData = $request->validated();
        $user = Auth::user();
        $validatedData['user_id'] = $user->id;

        $car = Car::findOrFail($request->car_id);

        // Calculate number of days
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $days = $startDate->diffInDays($endDate);

        // Ensure at least 1 day
        $days = max($days, 1);

        $totalPrice = $car->price_per_day * $days;

        $booking = CarBooking::create([
            'user_id'         => $user->id,
            'car_id'          => $request->car_id,
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
            'total_price'     => $totalPrice,
            'pickup_location' => $request->pickup_location,
            'dropoff_location'=> $request->pickup_location,
            'external_booking' => 'Yes',
            'status'          => 'Paid',
            'special_requests'=> $request->special_requests,
        ]);

        // Send external booking confirmation SMS
        $this->sendCarBookingConfirmationSms($booking, 'external', $smsService);

        return redirect()->route('car-bookings.index')->with('success', 'Car booking added successfully.');
    }

    public function show(CarBooking $carBooking)
    {
        return Inertia::render('CarBookings/Show', [
            'carBooking' => $carBooking->load(['car', 'user', 'car.category','car.initialGallery','car.carFeatures.feature','car.user']),
        ]);
    }

    public function edit(CarBooking $carBooking)
    {
        $cars = Car::all();

        return Inertia::render('CarBookings/Edit', [
            'carBooking' => $carBooking,
            'cars' => $cars,
        ]);
    }

    public function update(Request $request, SmsService $smsService)
    {
        $input = $request->all();

        $booking = CarBooking::find($input['id']);

        $validated = $request->validate([
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'verification_code' => 'nullable|string',
        ]);

        if ($request->has('checked_in')) {
            if ($booking->checked_in) {
                return back()->with('error', 'This car booking is already checked in.');
            }

            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckInVerification($booking));

                $user = User::find($booking->user_id);

                // Send check-in verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for car pickup verification is: {$booking->checkin_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-in.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_in = now();
            $booking->checkin_verification_code = null;
            $booking->save();

            // Send check-in confirmation SMS
            $this->sendCarCheckInConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked in! Enjoy your ride!');
        }

        if ($request->has('checked_out')) {
            if ($booking->checked_out) {
                return back()->with('error', 'This car booking is already checked out.');
            }

            if (!$booking->checked_in) {
                return back()->with('error', 'Cannot check out before checking in.');
            }

            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                $user = User::find($booking->user_id);

                // Send check-out verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for car drop-off verification is: {$booking->checkout_verification_code}"
                );

                Mail::to($booking->user->email)->send(new CarCheckOutVerification($booking));

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-out.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_out = now();
            $booking->checkout_verification_code = null;
            $booking->save();

            // Send check-out confirmation SMS
            $this->sendCarCheckOutConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked out! Thank you for using our service.');
        }

        return back()->with('error', 'No valid action performed.');
    }

    public function destroy(CarBooking $carBooking)
    {
        $carBooking->delete();

        return redirect()->route('car-bookings.index')->with('success', 'Car booking deleted successfully.');
    }

    /**
     * SMS Notification Methods for Car Bookings
     */

    private function sendCarBookingConfirmationSms(CarBooking $booking, string $type = 'confirmed', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $startDate = Carbon::parse($booking->start_date)->format('M j, Y');
            $endDate = Carbon::parse($booking->end_date)->format('M j, Y');

            switch ($type) {
                case 'pending':
                    $message = "Hello {$user->name}, your car booking for {$car->name} is pending payment. Amount: KES {$booking->total_price}. Pickup: {$startDate}";
                    break;

                case 'confirmed':
                    $message = "Hello {$user->name}, your car booking for {$car->name} ({$car->license_plate}) is confirmed! Booking #{$booking->number}. Pickup: {$startDate}, Return: {$endDate}. Pickup location: {$booking->pickup_location}";
                    break;

                case 'external':
                    $message = "Hello {$user->name}, your external car booking for {$car->name} has been added. Pickup: {$startDate}, Return: {$endDate}";
                    break;

                default:
                    $message = "Hello {$user->name}, your car booking for {$car->name} has been updated. Status: {$booking->status}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car booking confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCarPaymentFailureSms(CarBooking $booking, string $reason = '', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $message = "Hello {$user->name}, your payment for car booking ({$car->name}) failed. Please try again or contact support.";

            if (!empty($reason)) {
                $message .= " Reason: {$reason}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car payment failure SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCarCheckInConfirmationSms(CarBooking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $message = "Hello {$user->name}, you have successfully picked up {$car->name} ({$car->license_plate}). Have a safe and enjoyable journey!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car check-in confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCarCheckOutConfirmationSms(CarBooking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $message = "Hello {$user->name}, thank you for returning {$car->name} ({$car->license_plate}). We hope you enjoyed your ride and look forward to serving you again!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car check-out confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCarCancellationSms(CarBooking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $message = "Hello {$user->name}, your car booking for {$car->name} has been cancelled. We hope to serve you in the future.";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car cancellation SMS failed: ' . $e->getMessage());
        }
    }

    // Add refund SMS method for car bookings
    private function sendCarRefundSms(CarBooking $booking, string $status, float $amount = 0, SmsService $smsService, string $reason = '')
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            if ($status === 'approved') {
                $message = "Hello {$user->name}, your refund request for car booking #{$booking->number} ({$car->name}) has been approved. Amount: KES {$amount}. Refund will be processed within 3-5 business days.";
            } else {
                $message = "Hello {$user->name}, your refund request for car booking #{$booking->number} ({$car->name}) has been rejected.";
                if (!empty($reason)) {
                    $message .= " Reason: {$reason}";
                }
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car refund SMS failed: ' . $e->getMessage());
        }
    }

    /**
     * Send car confirmation emails
     */
    protected function sendCarConfirmationEmails(CarBooking $booking)
    {
        try {
            Mail::to($booking->user->email)
                ->send(new CarBookingConfirmation($booking, 'customer'));

            // Send to host
            if ($booking->car->user) {
                Mail::to($booking->car->user->email)
                    ->send(new CarBookingConfirmation($booking, 'host'));
            }

        } catch (\Exception $e) {
            \Log::error('Car email sending failed: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
                'error' => $e
            ]);
        }
    }

    public function paymentCancelled(CarBooking $booking)
    {
        $booking->update(['status' => 'cancelled']);

        return Inertia::render('PaymentCancelled', [
            'booking' => $booking,
            'message' => 'Payment was cancelled. You can try again.',
            'booking_type' => 'car'
        ]);
    }
}
