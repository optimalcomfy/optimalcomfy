<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Http\Requests\UpdateCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use App\Models\User;
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
use App\Mail\CancelledCarBooking;

use Illuminate\Http\JsonResponse;

use App\Mail\CarCheckInVerification;
use App\Mail\CarCheckOutVerification;

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
                $q->where('company_id', $user->company_id);
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

    public function cancel(Request $request)
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
            
            Mail::to($booking->property->user->email)->send(new CancelledCarBooking($booking, 'host'));
        } catch (\Exception $e) {
            \Log::error('Cancellation email error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
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
            $booking = CarBooking::with('car.user')->find($callbackParams['booking_id'] ?? null);
            
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

            if($resultCode === 0) {
                $user  = User::find($booking->user_id);

                Mail::to($user->email)
                ->send(new CarBookingConfirmation($booking, 'customer'));

                Mail::to($booking->car->user->email)
                ->send(new CarBookingConfirmation($booking, 'host'));
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

    public function update(Request $request)
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
                
                return back()->with('success', 'Verification code sent to your email. Please enter it to complete check-in.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_in = now();
            $booking->checkin_verification_code = null;
            $booking->save();

            return back()->with('success', 'Successfully checked in!');
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
                
                Mail::to($booking->user->email)->send(new CarCheckOutVerification($booking));
                
                return back()->with('success', 'Verification code sent to your email. Please enter it to complete check-out.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_out = now();
            $booking->checkout_verification_code = null; 
            $booking->save();

            return back()->with('success', 'Successfully checked out!');
        }

        return back()->with('error', 'No valid action performed.');
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
