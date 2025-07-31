<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Property;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\MpesaStkController;
use App\Services\MpesaStkService;
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
use App\Services\MpesaService;

class BookingController extends Controller
{

    use Mpesa;

    protected $mpesaService;

    public function __construct(MpesaService $mpesaService = null)
    {
        $this->mpesaService = $mpesaService;
    }

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
        if ($request->has('status')) {
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

        if (!$startDate || !$endDate) {
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        try {
            $validStartDate = Carbon::parse($startDate)->startOfDay();
            $validEndDate = Carbon::parse($endDate)->endOfDay();

            if ($validStartDate->lte($validEndDate)) {
                $query->whereBetween('created_at', [$validStartDate, $validEndDate]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format provided.'], 400);
        }

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

        $query = Booking::with(['user', 'property']); // Removed 'stay_status' from with()

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        
        if (!$startDate || !$endDate) {
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        try {
            $validStartDate = Carbon::parse($startDate)->startOfDay();
            $validEndDate = Carbon::parse($endDate)->endOfDay();

            if ($validStartDate->lte($validEndDate)) {
                $query->whereBetween('created_at', [$validStartDate, $validEndDate]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format provided.'], 400);
        }

        // Stay status filtering - matches the accessor logic
        if ($request->has('status')) {
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
        if ($user->role_id == 2) { // Property manager/owner
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('company_id', $user->company_id);
            });
        } elseif ($user->role_id == 3) { // Regular user
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
                'property_name' => optional($booking->property)->property_name,
                'check_in_date' => $booking->check_in_date,
                'check_out_date' => $booking->check_out_date,
                'nights' => $nights,
                'total_price' => 'KES ' . number_format($totalPrice, 2),
                'status' => $booking->status,
                'stay_status' => $booking->stay_status, // Now this will use the accessor
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


    public function handleRefund(Request $request, Booking $booking)
    {

        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:255',
            'refund_amount' => 'required_if:action,approve|numeric|min:0|max:'.$booking->total_price,
        ]);

        if ($request->action === 'approve') {
            $booking->update([
                'refund_approval' => 'approved',
                'refund_amount' => $request->refund_amount,
                'non_refund_reason' => null,
            ]);
            
            Mail::to('amosbillykipchumba@gmail.com')
            ->send(new RefundNotification($booking, 'approved'));

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } else {
            $booking->update([
                'refund_approval' => 'rejected',
                'non_refund_reason' => $request->reason,
                'refund_amount' => 0,
            ]);

            Mail::to('amosbillykipchumba@gmail.com')
            ->send(new RefundNotification($booking, 'rejected', $request->reason));
            
            return redirect()->back()->with('success', 'Refund rejected successfully.');
        }
    }


    public function store(Request $request)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'variation_id' => 'nullable',
            'phone' => 'required|string' 
        ]);

        // 

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'status' => 'pending',
            'variation_id' => $request->variation_id
        ]);

        try {

            $callbackBase = config('services.mpesa.callback_url') 
                ?? secure_url('/api/mpesa/stk/callback');

            $callbackData = [
                'phone' => $request->phone,
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'property'
            ];

            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

            $this->STKPush(
                'Paybill',
                $booking->total_price,
                $request->phone,
                $callbackUrl,
                'reference',
                'Book Ristay'
            );

            return redirect()->route('booking.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
            ]);

        } catch (\Exception $e) {
            \Log::error('M-Pesa payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            return back()
                ->withInput()
                ->withErrors(['payment' => 'Payment initiation failed due to a system error.']);
        }
    }

    /**
 * Handle M-Pesa STK Push callback
 */
    public function handleCallback(Request $request)
    {

        try {
            // Parse the callback data
            $callbackData = $request->json()->all();
            
            // Extract the transaction details from callback
            $resultCode = $callbackData['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'] ?? null;
            $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'] ?? null;
            $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'] ?? null;
            
            // Get the additional data passed in the callback URL
            $callbackParams = json_decode($request->query('data'), true);
            
            // Find the related booking
            $booking = Booking::find($callbackParams['booking_id'] ?? null);
            
            if (!$booking) {
                \Log::error('Booking not found for callback', ['callbackParams' => $callbackParams]);
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
            } else {
                // Payment failed
                $booking->update(['status' => 'failed']);
            }

            // Create payment record
            $payment = Payment::create($paymentData);

            if($resultCode === 0) {
                $propertyBookingWithRelations = Booking::with(['user', 'property', 'payments'])
                                                ->find($booking->id);
                    
                    Mail::to($propertyBookingWithRelations->user->email)
                    ->send(new BookingConfirmation($propertyBookingWithRelations));
            }

            // Return success response to M-Pesa
            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Error processing callback'
            ], 500);
        }
    }



    public function paymentPending(Booking $booking, Request $request)
    {
        return Inertia::render('PaymentPending', [
            'booking' => $booking,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }


    public function paymentStatus(Booking $booking)
    {
        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $booking->total_price,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }


    public function add(Request $request)
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
            'status' => 'paid',
            'variation_id'=>$request->variation_id
        ]);

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
            
            return Inertia::render('RistayPass', [
                'booking' => $booking->load([
                    'user',
                    'property.propertyAmenities',
                    'property.propertyFeatures',
                    'property.initialGallery',   // Gallery
                    'property.PropertyServices',
                    'property.user',             // Property owner
                ]),
            ]);
        }

        if (!$booking) {
            return back()->withErrors(['number' => 'Booking not found.']);
        }

    }



    public function show(Booking $booking)
    {
        return Inertia::render('Bookings/Show', [
            'booking' => $booking->load([
                'user',
                'property.propertyAmenities',
                'property.propertyFeatures',
                'property.initialGallery',   // Gallery
                'property.PropertyServices',
                'property.user',             // Property owner
            ]),
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

    public function update(Request $request, Booking $booking)
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
                
                return back()->with('success', 'Verification code sent to your email. Please enter it to complete check-in.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_in = now();
            $booking->checkin_verification_code = null; // Clear the code after use
            $booking->save();

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
                
                return back()->with('success', 'Verification code sent to your email. Please enter it to complete check-out.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_out = now();
            $booking->checkout_verification_code = null; // Clear the code after use
            $booking->save();

            return back()->with('success', 'Successfully checked out!');
        }

        return back()->with('error', 'No valid action performed.');
    }



    public function cancel(Request $request)
    {
        $input = $request->all();

        $booking = Booking::find($input['id']);

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
        } catch (\Exception $e) {
            \Log::error('Cancellation email error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }
}
