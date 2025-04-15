<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\User;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Booking::with('user', 'room');

        if ($user->role_id == 2) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
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
        $rooms = Room::where('status', 'available')->get();

        return Inertia::render('Bookings/Create', [
            'users' => $users,
            'rooms' => $rooms,
        ]);
    }

    public function store(StoreBookingRequest $request)
    {
        Booking::create($request->validated());

        return redirect()->route('bookings.index')->with('success', 'Booking created successfully.');
    }

    public function show(Booking $booking)
    {
        return Inertia::render('Bookings/Show', [
            'booking' => $booking->load('user', 'room'),
        ]);
    }

    public function edit(Booking $booking)
    {
        $users = User::all();
        $rooms = Room::where('status', 'available')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking,
            'users' => $users,
            'rooms' => $rooms,
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
