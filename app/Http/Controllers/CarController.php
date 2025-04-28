<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\Car;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Car::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('brand', 'LIKE', "%$search%")
                  ->orWhere('model', 'LIKE', "%$search%");
        }

        $cars = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Cars/Index', [
            'cars' => $cars->items(),
            'pagination' => $cars,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Cars/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarRequest $request)
    {
        $validated = $request->validated();

        // Handling the image file upload if provided
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('cars', 'public');
        }

        // Create the car record in the database
        Car::create($validated);

        return redirect()->route('cars.index')->with('success', 'Car item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Car $car)
    {
        return Inertia::render('Cars/Show', [
            'car' => $car,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Car $car)
    {
        return Inertia::render('Cars/Edit', [
            'car' => $car,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarRequest $request, Car $car)
    {
        $validated = $request->validated();

        // Check if an image was uploaded
        if ($request->hasFile('image')) {
            // Delete the old image if it exists
            if ($car->image) {
                Storage::disk('public')->delete($car->image);
            }
            // Store the new image
            $validated['image'] = $request->file('image')->store('cars', 'public');
        }

        // Update the car record with the validated data
        $car->update($validated);

        return redirect()->route('cars.index')->with('success', 'Car item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Car $car)
    {
        // Delete the image associated with the car if it exists
        if ($car->image) {
            Storage::disk('public')->delete($car->image);
        }

        // Delete the car record
        $car->delete();

        return redirect()->route('cars.index')->with('success', 'Car item deleted successfully.');
    }
}
