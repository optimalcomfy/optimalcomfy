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

class BookingController extends Controller
{

    use Mpesa;

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Booking::with('user', 'property');

        if ($user->role_id == 2) {
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', '=', $user->id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');

        $bookings = $query->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'flash' => session('flash'),
        ]);
    }

    public function create()
    {
        $users = User::all();
        $user = Auth::user();

        $query = Property::with(['bookings', 'variations']);

        if ($user->role_id == 2) { 
            $query->where('user_id', $user->id);  // Simplified the relationship query
        }

        return Inertia::render('Bookings/Create', [
            'users' => $users,
            'properties' => $query->get(),  // Added ->get() to execute the query
        ]);
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
                // 'amount' => $booking->total_price,
                'amount'=>1,
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
                'Appointment booking'
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
    public function handleMpesaCallback(Request $request)
    {
        // Log the raw callback data for debugging
        \Log::info('M-Pesa Callback Received:', $request->all());

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

            \Log::info('Payment processed:', [
                'booking_id' => $booking->id,
                'status' => $payment->status,
                'mpesa_receipt' => $payment->mpesa_receipt ?? null
            ]);

            // Return success response to M-Pesa
            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('M-Pesa callback processing failed: ' . $e->getMessage(), [
                'exception' => $e,
                'callbackData' => $request->all()
            ]);

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

    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $booking->update($request->validated());

        return redirect()->route('bookings.index')->with('success', 'Booking updated successfully.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }
}
