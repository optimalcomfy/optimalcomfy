<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceBookingRequest;
use App\Http\Requests\UpdateServiceBookingRequest;
use App\Models\ServiceBooking;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ServiceBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ServiceBooking::with(['user', 'service'])->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('customer_name', 'LIKE', "%$search%")
                  ->orWhere('service_name', 'LIKE', "%$search%");
        }

        $serviceBookings = $query->paginate(10);

        return Inertia::render('ServiceBookings/Index', [
            'serviceBookings' => $serviceBookings->items(),
            'pagination' => $serviceBookings,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ServiceBookings/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceBookingRequest $request)
    {
        ServiceBooking::create($request->validated());

        return redirect()->route('service-bookings.index')->with('success', 'Service booking created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceBooking $serviceBooking)
    {
        return Inertia::render('ServiceBookings/Show', [
            'serviceBooking' => $serviceBooking,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceBooking $serviceBooking)
    {
        return Inertia::render('ServiceBookings/Edit', [
            'serviceBooking' => $serviceBooking,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceBookingRequest $request, ServiceBooking $serviceBooking)
    {
        $serviceBooking->update($request->validated());

        return redirect()->route('service-bookings.index')->with('success', 'Service booking updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceBooking $serviceBooking)
    {
        $serviceBooking->delete();

        return redirect()->route('service-bookings.index')->with('success', 'Service booking deleted successfully.');
    }
}
