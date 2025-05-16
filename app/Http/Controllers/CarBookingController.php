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

class CarBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CarBooking::with(['car', 'user'])->orderBy('created_at', 'desc');

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


        $phone = $user->phone; 

        $mpesaKey = env('MPESA_KEY');

        // Convert +254 format to 07 format
        if (preg_match('/^\+254[7-9][0-9]{8}$/', $phone)) {
            $phone = '0' . substr($phone, 4); // Remove +254 and replace with 0
        }
    
        // Define the API URL
        $apiUrl = 'https://lipia-api.kreativelabske.com/api/request/stk';
    
        // Make STK Push request with authentication token
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$mpesaKey,
            'Content-Type' => 'application/json',
        ])->post($apiUrl, [
            'phone' => $phone, 
            'amount' => 10,
        ]);
    
        if ($response->successful()) {
            CarBooking::create([
                'user_id'         => Auth::id(),
                'car_id'          => $request->car_id, 
                'start_date'      => $request->start_date,
                'end_date'        => $request->end_date,
                'total_price'     => $request->total_price,
                'pickup_location' => $request->pickup_location,
                'dropoff_location'=> $request->dropoff_location,
                'status'          => $request->status,  
                'special_requests'=> $request->special_requests,
            ]);

            return redirect()->route('car-bookings.index')->with('success', 'Car booking added successfully.');
        } else {
            return back()->with('error', 'Payment request failed: ' . $response->json('message', 'Unknown error'));
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CarBooking $carBooking)
    {
        return Inertia::render('CarBookings/Show', [
            'carBooking' => $carBooking->load(['car', 'user']),
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
