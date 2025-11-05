<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Property;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\MpesaStkController;
use App\Services\PesapalService;
use App\Traits\Mpesa;
use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;
use App\Mail\RefundNotification;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use App\Mail\CheckInVerification;
use App\Mail\CheckOutVerification;
use App\Mail\BookingCancelled;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Services\SmsService;

class BookingController extends Controller
{
    use Mpesa;

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Booking::with('user', 'property');

        // Role-based filtering
        if ($user->role_id == 2) {
            // Host - filter bookings for their properties
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            // Guest - filter only their own bookings
            $query->where('user_id', $user->id);
        }

        // Status filtering via translated logic for stay_status
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

        // Search by user name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });

        // Sort by newest
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $bookings = $query->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'flash' => session('flash'),
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Booking::with(['user', 'property']);

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });

        // Stay status filtering - matches the accessor logic
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

        // Search functionality
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhere('status', 'LIKE', "%$search%")
                ->orWhere('external_booking', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });
        }

        // Role-based filtering
        if ($user->role_id == 2) {
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        $exportData = $bookings->map(function ($booking) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = $checkOut->diffInDays($checkIn);
            $totalPrice = optional($booking->property)->platform_price * $nights;

            return [
                'number' => $booking->number,
                'guest_name' => optional($booking->user)->name,
                'host_price'=> $booking->host_price,
                'property_name' => optional($booking->property)->property_name,
                'check_in_date' => $booking->check_in_date,
                'check_out_date' => $booking->check_out_date,
                'nights' => $nights,
                'total_price' => 'KES ' . number_format($totalPrice, 2),
                'status' => $booking->status,
                'stay_status' => $booking->stay_status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'created_at' => $booking->created_at->toDateTimeString(),
            ];
        });

        return response()->json($exportData);
    }

    public function create()
    {
        $users = User::all();
        $user = Auth::user();

        $query = Property::with(['bookings', 'variations']);

        if ($user->role_id == 2) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Bookings/Create', [
            'users' => $users,
            'properties' => $query->get(),
        ]);
    }

    public function handleRefund(Request $request, Booking $booking, SmsService $smsService)
    {
        // Calculate maximum refundable amount
        $maxRefundable = $booking->max_refundable_amount;

        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:500',
            'refund_amount' => [
                'required_if:action,approve',
                'numeric',
                'min:0',
                'max:' . $maxRefundable,
            ],
        ], [
            'refund_amount.max' => 'Refund amount cannot exceed the maximum refundable amount of KES ' . number_format($maxRefundable, 2),
        ]);

        // Double-check the amount server-side (important security measure)
        if ($request->action === 'approve' && $request->refund_amount > $maxRefundable) {
            return redirect()->back()->withErrors([
                'refund_amount' => 'Refund amount cannot exceed the maximum refundable amount of KES ' . number_format($maxRefundable, 2)
            ]);
        }

        if ($request->action === 'approve') {
            // Check if refund amount is reasonable
            if ($request->refund_amount <= 0) {
                return redirect()->back()->withErrors([
                    'refund_amount' => 'Refund amount must be greater than 0'
                ]);
            }

            $booking->update([
                'refund_approval' => 'approved',
                'refund_amount' => $request->refund_amount,
                'non_refund_reason' => null,
            ]);

            Refund::create([
                "amount" => $request->refund_amount,
                "booking_id" => $booking->id,
                "car_booking_id" => null,
            ]);

            // Send SMS notification for refund approval
            $this->sendRefundSms($booking, 'approved', $request->refund_amount, $smsService);

            Mail::to($booking->user->email)
                ->send(new RefundNotification($booking, 'approved'));

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } else {
            $booking->update([
                'refund_approval' => 'rejected',
                'non_refund_reason' => $request->reason,
                'refund_amount' => 0,
            ]);

            // Send SMS notification for refund rejection
            $this->sendRefundSms($booking, 'rejected', 0, $smsService, $request->reason);

            Mail::to($booking->user->email)
                ->send(new RefundNotification($booking, 'rejected', $request->reason));

            return redirect()->back()->with('success', 'Refund rejected successfully.');
        }
    }

    public function store(Request $request, SmsService $smsService, PesapalService $pesapalService)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'variation_id' => 'nullable',
            'referral_code' => 'nullable'
        ]);

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'status' => 'pending',
            'variation_id' => $request->variation_id,
            'referral_code' => $request->referral_code,
            'payment_method' => $request->payment_method
        ]);

        try {
            // Send booking confirmation SMS
            $this->sendBookingConfirmationSms($booking, 'pending', $smsService);

            $company = Company::first();

            $finalAmount = $request->referral_code ? ($booking->total_price - (($booking->total_price * $company->booking_referral_percentage) / 100)) : $booking->total_price;
            $finalAmount = ceil($finalAmount);

            // Handle different payment methods
            if ($request->payment_method === 'mpesa') {
                return $this->processMpesaPayment($booking, $request->phone, $finalAmount);
            } elseif ($request->payment_method === 'pesapal') {
                return $this->processPesapalPayment($booking, $user, $finalAmount, $pesapalService);
            }

        } catch (\Exception $e) {
            Log::error('Payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            return back()
                ->withInput()
                ->withErrors(['payment' => 'Payment initiation failed due to a system error.']);
        }
    }

    /**
     * Process M-Pesa payment
     */
    private function processMpesaPayment($booking, $phone, $amount)
    {
        $callbackBase = config('services.mpesa.callback_url') ?? secure_url('/api/mpesa/stk/callback');

        $callbackData = [
            'phone' => $phone,
            'amount' => $amount,
            'booking_id' => $booking->id,
            'booking_type' => 'property'
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

        return redirect()->route('booking.payment.pending', [
            'booking' => $booking->id,
            'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
        ]);
    }

    /**
     * Process Pesapal payment - UPDATED VERSION
     */
    private function processPesapalPayment($booking, $user, $amount, $pesapalService)
    {
        try {
            // Prepare order data WITHOUT any IPN references
            $orderData = [
                'id' => $booking->number,
                'currency' => 'KES',
                'amount' => $amount,
                'description' => 'Booking for ' . $booking->property->property_name,
                'callback_url' => route('pesapal.callback'),
                'cancellation_url' => route('booking.payment.cancelled', ['booking' => $booking->id]),
                // REMOVED: 'notification_id' => '39197dd7-4f16-470a-8953-db20f6108070',
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

            Log::info('Submitting Pesapal order without IPN', [
                'booking_id' => $booking->id,
                'order_data' => $orderData
            ]);

            // Use the direct method that doesn't include IPN
            $orderResponse = $pesapalService->createOrderDirect($orderData);

            Log::info('Pesapal Order Response Details', [
                'booking_id' => $booking->id,
                'order_response' => $orderResponse
            ]);

            if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                // Store Pesapal tracking ID in booking
                $booking->update([
                    'pesapal_tracking_id' => $orderResponse['order_tracking_id']
                ]);

                Log::info('Pesapal payment initiated successfully', [
                    'booking_id' => $booking->id,
                    'tracking_id' => $orderResponse['order_tracking_id'],
                    'redirect_url' => $orderResponse['redirect_url']
                ]);

                // Redirect to Pesapal payment page
                return redirect()->away($orderResponse['redirect_url']);
            } else {
                // More detailed error logging
                $errorType = $orderResponse['error']['error_type'] ?? 'unknown_error';
                $errorCode = $orderResponse['error']['code'] ?? 'unknown_code';
                $errorMessage = $orderResponse['error']['message'] ?? 'Unknown error occurred';

                Log::error('Pesapal order creation failed', [
                    'error_type' => $errorType,
                    'error_code' => $errorCode,
                    'error_message' => $errorMessage,
                    'full_response' => $orderResponse
                ]);

                throw new \Exception("Pesapal Error [$errorCode]: $errorMessage");
            }

        } catch (\Exception $e) {
            Log::error('Pesapal payment initiation failed: ' . $e->getMessage());

            // Update booking status to failed
            $booking->update(['status' => 'failed']);

            throw $e;
        }
    }

    /**
     * Handle Pesapal callback - This is called when user returns from Pesapal
     */
    public function handlePesapalCallback(Request $request, SmsService $smsService)
    {
        try {
            $orderTrackingId = $request->input('OrderTrackingId');
            $orderMerchantReference = $request->input('OrderMerchantReference');

            Log::info('Pesapal Callback Received', [
                'order_tracking_id' => $orderTrackingId,
                'order_merchant_reference' => $orderMerchantReference,
                'all_params' => $request->all()
            ]);

            // Find booking by tracking ID or merchant reference
            $booking = Booking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->first();

            if (!$booking) {
                Log::error('Booking not found for Pesapal callback', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference
                ]);
                return redirect()->route('booking.payment.cancelled')->with('error', 'Booking not found.');
            }

            // For callback, we don't update status immediately - wait for IPN
            // But we can check the current status
            if ($booking->status === 'paid') {
                return redirect()->route('booking.payment.success', ['booking' => $booking->id]);
            }

            // If still pending, show pending page
            return redirect()->route('booking.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment is being processed. We will notify you once confirmed.'
            ]);

        } catch (\Exception $e) {
            Log::error('Pesapal callback processing error: ' . $e->getMessage());
            return redirect()->route('booking.payment.cancelled')->with('error', 'Error processing payment.');
        }
    }

    /**
     * Handle Pesapal IPN (Instant Payment Notification) - This is the reliable status update
     */
    public function handlePesapalNotification(Request $request, SmsService $smsService, PesapalService $pesapalService)
    {
        try {
            // Get the raw input for logging
            $rawInput = $request->getContent();
            $ipnData = $request->all();

            Log::info('Pesapal IPN Received - Raw', ['raw_data' => $rawInput]);
            Log::info('Pesapal IPN Received - Parsed', $ipnData);

            // Validate IPN data
            if (!$pesapalService->validateIPN($ipnData)) {
                Log::error('Pesapal IPN validation failed', $ipnData);
                return response()->json(['error' => 'Invalid IPN data'], 400);
            }

            // Extract important fields from IPN
            $orderTrackingId = $ipnData['OrderTrackingId'] ?? null;
            $orderNotificationType = $ipnData['OrderNotificationType'] ?? null;
            $orderMerchantReference = $ipnData['OrderMerchantReference'] ?? null;

            // Find booking
            $booking = Booking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->with(['user', 'property.user'])
                            ->first();

            if (!$booking) {
                Log::error('Booking not found for Pesapal IPN', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference
                ]);
                return response()->json(['error' => 'Booking not found'], 404);
            }

            // Handle different notification types
            switch ($orderNotificationType) {
                case 'CHANGE':
                    $status = $ipnData['Status'] ?? null;
                    $this->handlePaymentStatus($booking, $status, $ipnData, $smsService);
                    break;

                case 'CONFIRMED':
                    $this->handleConfirmedPayment($booking, $ipnData, $smsService);
                    break;

                default:
                    Log::warning('Unknown Pesapal notification type', [
                        'type' => $orderNotificationType,
                        'booking_id' => $booking->id
                    ]);
            }

            // Always return success to Pesapal
            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Pesapal IPN processing error: ' . $e->getMessage(), [
                'exception' => $e,
                'ipn_data' => $ipnData ?? []
            ]);
            return response()->json(['error' => 'IPN processing failed'], 500);
        }
    }

    /**
     * Handle payment status changes
     */
    private function handlePaymentStatus($booking, $status, $ipnData, $smsService)
    {
        Log::info('Handling Pesapal payment status', [
            'booking_id' => $booking->id,
            'status' => $status,
            'previous_status' => $booking->status
        ]);

        switch ($status) {
            case 'COMPLETED':
            case 'SUCCESS':
                $this->handleSuccessfulPayment($booking, $ipnData, $smsService);
                break;

            case 'FAILED':
            case 'INVALID':
                $this->handleFailedPayment($booking, $ipnData, $smsService);
                break;

            case 'PENDING':
                // Keep as pending, no action needed
                Log::info('Payment still pending', ['booking_id' => $booking->id]);
                break;

            default:
                Log::warning('Unknown payment status', [
                    'booking_id' => $booking->id,
                    'status' => $status
                ]);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'paid') {
            Log::info('Payment already processed', ['booking_id' => $booking->id]);
            return;
        }

        // Update booking status
        $booking->update(['status' => 'paid']);

        // Create payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'completed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'transaction_reference' => $ipnData['PaymentMethodReference'] ?? null,
            'booking_type' => 'property',
            'transaction_date' => now()
        ]);

        // Send confirmation emails and SMS
        $this->sendConfirmationEmails($booking);
        $this->sendBookingConfirmationSms($booking, 'confirmed', $smsService);

        Log::info('Pesapal payment completed successfully', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    /**
     * Handle confirmed payment (alternative to status change)
     */
    private function handleConfirmedPayment($booking, $ipnData, $smsService)
    {
        $this->handleSuccessfulPayment($booking, $ipnData, $smsService);
    }

    /**
     * Handle failed payment
     */
    private function handleFailedPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'failed') {
            return;
        }

        $booking->update(['status' => 'failed']);

        // Create failed payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'failed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'failure_reason' => $ipnData['Description'] ?? 'Payment failed',
            'booking_type' => 'property'
        ]);

        // Send failure notification
        $this->sendPaymentFailureSms($booking, 'Payment failed via Pesapal', $smsService);

        Log::warning('Pesapal payment failed', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    public function paymentPending(Booking $booking, Request $request)
    {
        $company = Company::first();

        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = max(1, $checkOut->diffInDays($checkIn));
            $displayAmount = $booking->markup->final_amount * $nights;
        }

        return Inertia::render('PaymentPending', [
            'booking' => $booking,
            'company' => $company,
            'displayAmount' => $displayAmount,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }

    public function paymentSuccess(Booking $booking)
    {
        return Inertia::render('PaymentSuccess', [
            'booking' => $booking,
            'message' => 'Payment completed successfully!'
        ]);
    }

    public function paymentCancelled(Booking $booking)
    {
        $booking->update(['status' => 'cancelled']);

        return Inertia::render('PaymentCancelled', [
            'booking' => $booking,
            'message' => 'Payment was cancelled. You can try again.'
        ]);
    }

    public function paymentStatus(Booking $booking)
    {
        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = max(1, $checkOut->diffInDays($checkIn));
            $displayAmount = $booking->markup->final_amount * $nights;
        }

        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $displayAmount,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }

    public function add(Request $request, SmsService $smsService)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'variation_id' => 'nullable',
        ]);

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'external_booking' => 'Yes',
            'status' => 'paid',
            'variation_id'=>$request->variation_id
        ]);

        // Send SMS for external booking
        $this->sendBookingConfirmationSms($booking, 'external', $smsService);

        return redirect()->route('bookings.index')->with('success', 'Booking added successfully.');
    }

    public function lookup(Request $request)
    {
        $request->validate([
            'type' => 'required|in:car,property',
            'number' => 'required|string',
        ]);

        if ($request->type === 'car') {
            $booking = CarBooking::where('number', $request->number)->first();
            return redirect()->route('car-bookings.show', $booking->id);
        } else {
            $booking = Booking::where('number', $request->number)->first();

            if (!$booking) {
                return back()->withErrors(['number' => 'Booking not found.']);
            }

            return Inertia::render('RistayPass', [
                'booking' => $booking->load([
                    'user',
                    'property.propertyAmenities',
                    'property.propertyFeatures',
                    'property.initialGallery',
                    'property.PropertyServices',
                    'property.user',
                ]),
            ]);
        }
    }

    public function show(Booking $booking)
    {
        $booking->load([
            'user',
            'property.propertyAmenities',
            'property.propertyFeatures',
            'property.initialGallery',
            'property.PropertyServices',
            'property.user',
            'refunds'
        ]);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking,
            'max_refundable_amount' => $booking->max_refundable_amount,
        ]);
    }

    public function edit(Booking $booking)
    {
        $users = User::all();
        $properties = Property::where('status', 'available')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking,
            'users' => $users,
            'properties' => $properties,
        ]);
    }

    public function update(Request $request, Booking $booking, SmsService $smsService)
    {
        $validated = $request->validate([
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'verification_code' => 'nullable|string',
        ]);

        // Handle check-in with verification
        if ($request->has('checked_in')) {
            if ($booking->checked_in) {
                return back()->with('error', 'This booking is already checked in.');
            }

            // Generate and send verification code if not already set
            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckInVerification($booking));

                $user = User::find($booking->user_id);

                // Send check-in verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for check-in verification is: {$booking->checkin_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-in.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_in = now();
            $booking->checkin_verification_code = null;
            $booking->save();

            // Send check-in confirmation SMS
            $this->sendCheckInConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked in!');
        }

        // Handle check-out with verification
        if ($request->has('checked_out')) {
            if ($booking->checked_out) {
                return back()->with('error', 'This booking is already checked out.');
            }

            if (!$booking->checked_in) {
                return back()->with('error', 'Cannot check out before checking in.');
            }

            // Generate and send verification code if not already set
            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckOutVerification($booking));

                $user = User::find($booking->user_id);

                // Send check-out verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for check-out verification is: {$booking->checkout_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-out.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_out = now();
            $booking->checkout_verification_code = null;
            $booking->save();

            // Send check-out confirmation SMS
            $this->sendCheckOutConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked out!');
        }

        return back()->with('error', 'No valid action performed.');
    }

    public function cancel(Request $request, SmsService $smsService)
    {
        $input = $request->all();

        $booking = Booking::with('property.user')->find($input['id']);

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

        $booking->check_in_date = Carbon::parse($booking->check_in_date);
        $booking->check_out_date = Carbon::parse($booking->check_out_date);

        try {
            Mail::to($booking->user->email)->send(new BookingCancelled($booking, 'guest'));
            Mail::to($booking->property->user->email)->send(new BookingCancelled($booking, 'host'));

            // Send cancellation SMS to guest
            $this->sendCancellationSms($booking, $smsService);

        } catch (\Exception $e) {
            Log::error('Cancellation email/SMS error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }

    /**
     * SMS Notification Methods
     */

    private function sendBookingConfirmationSms(Booking $booking, string $type = 'confirmed', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $checkIn = Carbon::parse($booking->check_in_date)->format('M j, Y');
            $checkOut = Carbon::parse($booking->check_out_date)->format('M j, Y');

            switch ($type) {
                case 'pending':
                    $message = "Hello {$user->name}, your booking at {$property->property_name} is pending payment. Amount: KES {$booking->total_price}. Check-in: {$checkIn}";
                    break;

                case 'confirmed':
                    $message = "Hello {$user->name}, your booking at {$property->property_name} is confirmed! Booking #{$booking->number}. Check-in: {$checkIn}, Check-out: {$checkOut}. Thank you for choosing Ristay!";
                    break;

                case 'external':
                    $message = "Hello {$user->name}, your external booking at {$property->property_name} has been added. Check-in: {$checkIn}, Check-out: {$checkOut}";
                    break;

                default:
                    $message = "Hello {$user->name}, your booking at {$property->property_name} has been updated. Status: {$booking->status}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Booking confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendPaymentFailureSms(Booking $booking, string $reason = '', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, your payment for booking at {$property->property_name} failed. Please try again or contact support.";

            if (!empty($reason)) {
                $message .= " Reason: {$reason}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Payment failure SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCheckInConfirmationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, you have successfully checked in to {$property->property_name}. We hope you enjoy your stay!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Check-in confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCheckOutConfirmationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, thank you for staying at {$property->property_name}. We hope to see you again soon!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Check-out confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCancellationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, your booking at {$property->property_name} has been cancelled. We hope to host you in the future.";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Cancellation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendRefundSms(Booking $booking, string $status, float $amount = 0, SmsService $smsService, string $reason = '')
    {
        try {
            $user = $booking->user;

            if ($status === 'approved') {
                $message = "Hello {$user->name}, your refund request for booking #{$booking->number} has been approved. Amount: KES {$amount}. Refund will be processed within 3-5 business days.";
            } else {
                $message = "Hello {$user->name}, your refund request for booking #{$booking->number} has been rejected.";
                if (!empty($reason)) {
                    $message .= " Reason: {$reason}";
                }
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Refund SMS failed: ' . $e->getMessage());
        }
    }

    protected function sendConfirmationEmails(Booking $booking)
    {
        try {
            if (is_string($booking->check_in_date)) {
                $booking->check_in_date = \Carbon\Carbon::parse($booking->check_in_date);
            }
            if (is_string($booking->check_out_date)) {
                $booking->check_out_date = \Carbon\Carbon::parse($booking->check_out_date);
            }

            Mail::to($booking->user->email)
                ->send(new BookingConfirmation($booking, 'customer'));

            // Send to host
            if ($booking->property->user) {
                Mail::to($booking->property->user->email)
                    ->send(new BookingConfirmation($booking, 'host'));
            }

        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
                'error' => $e
            ]);
        }
    }

    /**
     * Handle M-Pesa STK Push callback
     */
    public function handleCallback(Request $request, SmsService $smsService)
    {
        try {
            // Parse callback data
            $callbackData = $request->json()->all();

            // Extract transaction details
            $resultCode = $callbackData['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'] ?? null;
            $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'] ?? null;
            $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'] ?? null;

            // Get additional callback parameters
            $callbackParams = json_decode($request->query('data'), true);

            // Find the booking with all necessary relationships
            $booking = Booking::with(['user', 'property.user', 'payments'])
                            ->find($callbackParams['booking_id'] ?? null);

            if (!$booking) {
                Log::error('Booking not found', ['booking_id' => $callbackParams['booking_id'] ?? null]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Prepare payment data
            $paymentData = [
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'amount' => $callbackParams['amount'] ?? $booking->total_price,
                'method' => 'mpesa',
                'phone' => $callbackParams['phone'] ?? null,
                'checkout_request_id' => $checkoutRequestID,
                'merchant_request_id' => $merchantRequestID,
                'booking_type' => $callbackParams['booking_type'] ?? 'property',
                'status' => $resultCode === 0 ? 'completed' : 'failed',
                'failure_reason' => $resultCode !== 0 ? $resultDesc : null,
            ];

            // Process successful payment
            if ($resultCode === 0) {
                $callbackMetadata = $callbackData['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];

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

                $booking->update(['status' => 'paid']);

                // Send confirmation emails and SMS
                $this->sendConfirmationEmails($booking);
                $this->sendBookingConfirmationSms($booking, 'confirmed', $smsService);

            } else {
                $booking->update(['status' => 'failed']);
                // Send payment failure SMS
                $this->sendPaymentFailureSms($booking, $resultDesc, $smsService);
                Log::error('Payment failed', [
                    'booking_id' => $booking->id,
                    'error' => $resultDesc
                ]);
            }

            // Create payment record
            Payment::create($paymentData);

            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Callback processing error: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Error processing callback'
            ], 500);
        }
    }
}
