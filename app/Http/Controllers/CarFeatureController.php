<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarFeatureRequest;
use App\Http\Requests\UpdateCarFeatureRequest;
use App\Models\CarFeature;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CarFeature::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%");
        }

        $carFeatures = $query->paginate(10);

        return Inertia::render('CarFeatures/Index', [
            'carFeatures' => $carFeatures->items(),
            'pagination' => $carFeatures,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CarFeatures/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarFeatureRequest $request)
    {
        $validatedData = $request->validated();

        // Handle Image Upload
        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('features', 'public');
        }

        $carFeature = CarFeature::create($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $carFeature
            ]);
        }

        return redirect()->back()->with('success', 'Car feature added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CarFeature $carFeature)
    {
        return Inertia::render('CarFeatures/Show', [
            'feature' => $carFeature,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarFeature $carFeature)
    {
        return Inertia::render('CarFeatures/Edit', [
            'carFeature' => $carFeature,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarFeatureRequest $request, CarFeature $carFeature)
    {
        $validatedData = $request->validated();

        // Handle Image Update
        if ($request->hasFile('icon')) {
            // Delete old image
            if ($carFeature->image) {
                Storage::disk('public')->delete($carFeature->icon);
            }
            $validatedData['icon'] = $request->file('icon')->store('features', 'public');
        }

        $carFeature->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $carFeature
            ]);
        }

        return redirect()->back()->with('success', 'Car feature updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarFeature $carFeature)
    {
        // Delete the image file if it exists
        if ($carFeature->icon) {
            Storage::disk('public')->delete($carFeature->icon);
        }

        $carFeature->delete();

        return redirect()->back()->with('success', 'Car feature deleted successfully.');
    }
}
