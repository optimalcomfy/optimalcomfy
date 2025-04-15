<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFoodOrderItemRequest;
use App\Http\Requests\UpdateFoodOrderItemRequest;
use App\Models\FoodOrderItem;
use App\Models\FoodOrder;
use App\Models\Food;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FoodOrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FoodOrderItem::with(['foodOrder', 'food'])->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('food', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%");
            });
        }

        $foodOrderItems = $query->paginate(10);

        return Inertia::render('FoodOrderItems/Index', [
            'foodOrderItems' => $foodOrderItems->items(),
            'pagination' => $foodOrderItems,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $foodOrders = FoodOrder::all();
        $foods = Food::all();

        return Inertia::render('FoodOrderItems/Create', [
            'foodOrders' => $foodOrders,
            'foods' => $foods,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFoodOrderItemRequest $request)
    {
        FoodOrderItem::create($request->validated());

        return redirect()->route('foodOrderItems.index')->with('success', 'Food order item added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FoodOrderItem $foodOrderItem)
    {
        return Inertia::render('FoodOrderItems/Show', [
            'foodOrderItem' => $foodOrderItem->load(['foodOrder', 'food']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FoodOrderItem $foodOrderItem)
    {
        $foodOrders = FoodOrder::all();
        $foods = Food::all();

        return Inertia::render('FoodOrderItems/Edit', [
            'foodOrderItem' => $foodOrderItem,
            'foodOrders' => $foodOrders,
            'foods' => $foods,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFoodOrderItemRequest $request, FoodOrderItem $foodOrderItem)
    {
        $foodOrderItem->update($request->validated());

        return redirect()->route('foodOrderItems.index')->with('success', 'Food order item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FoodOrderItem $foodOrderItem)
    {
        $foodOrderItem->delete();

        return redirect()->route('foodOrderItems.index')->with('success', 'Food order item deleted successfully.');
    }
}
