<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFoodOrderRequest;
use App\Http\Requests\UpdateFoodOrderRequest;
use App\Models\FoodOrder;
use App\Models\User;
use App\Models\Booking;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FoodOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FoodOrder::with(['user', 'booking'])->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $foodOrders = $query->paginate(10);

        return Inertia::render('FoodOrders/Index', [
            'foodOrders' => $foodOrders->items(),
            'pagination' => $foodOrders,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all();
        $bookings = Booking::all();

        return Inertia::render('FoodOrders/Create', [
            'users' => $users,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFoodOrderRequest $request)
    {
        FoodOrder::create($request->validated());

        return redirect()->route('foodOrders.index')->with('success', 'Food order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FoodOrder $foodOrder)
    {
        return Inertia::render('FoodOrders/Show', [
            'foodOrder' => $foodOrder->load(['user', 'booking', 'foodOrderItems.food']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FoodOrder $foodOrder)
    {
        $users = User::all();
        $bookings = Booking::all();

        return Inertia::render('FoodOrders/Edit', [
            'foodOrder' => $foodOrder,
            'users' => $users,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFoodOrderRequest $request, FoodOrder $foodOrder)
    {
        $foodOrder->update($request->validated());

        return redirect()->route('foodOrders.index')->with('success', 'Food order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FoodOrder $foodOrder)
    {
        $foodOrder->delete();

        return redirect()->route('foodOrders.index')->with('success', 'Food order deleted successfully.');
    }
}
