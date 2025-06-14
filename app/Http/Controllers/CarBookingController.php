<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Http\Requests\UpdateCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;
use Carbon\Carbon;

class CarBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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
        $cars = Car::all(); // Fetch all cars for the booking
        return Inertia::render('CarBookings/Create', [
            'cars' => $cars,
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
	        'status'          => 'pending',
	        'special_requests'=> $request->special_requests,
	    ]);

	    try {
	        $pesapal = new PesapalController();

	        $paymentResponse = $pesapal->initiatePayment(new Request([
	            'amount' => $booking->total_price,
	            'booking_id' => $booking->id,
	            'booking_type' => 'car'
	        ]));

	    } catch (\Exception $e) {
	        \Log::error('Pesapal payment initiation failed: ' . $e->getMessage());
	        return back()->withErrors('Payment initiation failed due to a system error.');
	    }

	    if (!empty($paymentResponse->original['url']) && filter_var($paymentResponse->original['url'], FILTER_VALIDATE_URL)) {
	        return view('iframe', [
	            'iframeUrl' => $paymentResponse->original['url'],
	        ]);
	    }

	    return back()->withErrors('Payment initiation failed');
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
        $carBooking->update([
            'car_id'          => $request->car_id,  // Update car reference
            'start_date'      => $request->start_date,
            'end_date'        => $request->end_date,
            'total_price'     => $request->total_price,
            'pickup_location' => $request->pickup_location,
            'dropoff_location'=> $request->dropoff_location,
            'status'          => $request->status,
            'special_requests'=> $request->special_requests,
        ]);

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
