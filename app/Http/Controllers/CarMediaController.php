<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarMediaRequest;
use App\Http\Requests\UpdateCarMediaRequest;
use App\Models\CarMedia;
use App\Models\Car;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarMediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CarMedia::with('car')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('car', function($q) use ($search) {
                $q->where('car_name', 'LIKE', "%$search%");
            });
        }

        $carMedias = $query->paginate(10);

        return Inertia::render('CarMedias/Index', [
            'carMedias' => $carMedias->items(),
            'pagination' => $carMedias,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $properties = Car::all();
        return Inertia::render('CarMedias/Create', [
            'properties' => $properties
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'image' => 'required',
        ]);
        
        // Handle file upload
        $path = $request->file('image')->store('car-media', 'public');
        
        $carMedia = CarMedia::create([
            'car_id' => $request->car_id,
            'image' => $path,
        ]);
        
        // If this is an AJAX request (from the ShowCar component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'media' => $carMedia
            ]);
        }

        return redirect()->back()->with('success', 'Car media added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(CarMedia $carMedia)
    {
        return Inertia::render('CarMedias/Show', [
            'carMedia' => $carMedia->load('car'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarMedia $carMedia)
    {
        $properties = Car::all();
        return Inertia::render('CarMedias/Edit', [
            'carMedia' => $carMedia,
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarMediaRequest $request, CarMedia $carMedia)
    {
        $validatedData = $request->validated();

        // Handle image replacement if needed
        if ($request->hasFile('image')) {
            // Delete old image
            if ($carMedia->image) {
                Storage::disk('public')->delete($carMedia->image);
            }
            
            // Store new image
            $validatedData['image'] = $request->file('image')->store('car-media', 'public');
        }

        $carMedia->update($validatedData);

        return redirect()->back()->with('success', 'Car media updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarMedia $carMedia)
    {
        // Delete the image file from storage
        if ($carMedia->image) {
            Storage::disk('public')->delete($carMedia->image);
        }
        
        $carMedia->delete();

        // If this is an AJAX request (from the ShowCar component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Car media deleted successfully.');
    }
    
    /**
     * Get all media images for a specific car
     */
    public function getByCar($carId)
    {
        $media = CarMedia::where('car_id', $carId)->get();
        return response()->json($media);
    }
}