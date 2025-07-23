<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Http\Requests\UpdateCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;
use Carbon\Carbon;
use App\Http\Controllers\MpesaStkController;
use App\Services\MpesaStkService;
use App\Traits\Mpesa;

use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;

class CarBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */

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

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $carBookings = $query->paginate(10);

        return Inertia::render('CarBookings/Index', [
            'carBookings' => $carBookings->items(),
            'pagination' => $carBookings,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */

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

    /**
     * Store a newly created resource in storage.
     */


    public function store(StoreCarBookingRequest $request)
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
            'status'          => 'pending',
            'special_requests'=> $request->special_requests,
        ]);


        try {
            $callbackBase = config('services.mpesa.ride_callback_url')
                ?? secure_url('/api/mpesa/ride/stk/callback');

            $callbackData = [
                'phone' => $request->phone,
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'car'
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


            return redirect()->route('ride.payment.pending', [
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
            $booking = CarBooking::find($callbackParams['booking_id'] ?? null);
            
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
                'booking_type' => $callbackParams['booking_type'] ?? 'car',
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

            if($payment) {
                $user  = User::find($booking->user_id);

                Mail::to($user->email)
                ->send(new CarBookingConfirmation($booking, $user));
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


    public function paymentPending(CarBooking $booking, Request $request)
    {
        return Inertia::render('RidePaymentPending', [
            'booking' => $booking,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }


    public function paymentStatus(CarBooking $booking)
    {
        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $booking->total_price,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }


    public function add(StoreCarBookingRequest $request)
	{
	    $validatedData = $request->validated();
	    $user = Auth::user();
	    $validatedData['user_id'] = $user->id;

	    $car = Car::findOrFail($request->car_id); // Use findOrFail for safety

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
	        'status'          => 'Paid',
	        'special_requests'=> $request->special_requests,
	    ]);

        return redirect()->route('car-bookings.index')->with('success', 'Car booking added successfully.');
	}

    /**
     * Display the specified resource.
     */
    public function show(CarBooking $carBooking)
    {
        return Inertia::render('CarBookings/Show', [
            'carBooking' => $carBooking->load(['car', 'user', 'car.category','car.initialGallery','car.carFeatures.feature','car.user']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarBooking $carBooking)
    {
        $cars = Car::all();  // Fetch all cars for editing the booking

        return Inertia::render('CarBookings/Edit', [
            'carBooking' => $carBooking,
            'cars' => $cars,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarBookingRequest $request, CarBooking $carBooking)
    {
        $carBooking->update($request->validated());

        return redirect()->route('car-bookings.index')->with('success', 'Car booking updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarBooking $carBooking)
    {
        $carBooking->delete();

        return redirect()->route('car-bookings.index')->with('success', 'Car booking deleted successfully.');
    }
}
