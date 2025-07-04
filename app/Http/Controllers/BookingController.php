<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;

class BookingController extends Controller
{
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
        ]);

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'status' => 'pending',
            'variation_id'=>$request->variation_id
        ]);

        try {
            $pesapal = new PesapalController();

            $paymentResponse = $pesapal->initiatePayment(new Request([
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'property'
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
            'status' => 'pending',
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
