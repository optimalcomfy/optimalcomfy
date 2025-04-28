<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarFeatureRequest;
use App\Http\Requests\UpdateCarFeatureRequest;
use App\Models\CarFeature;
use Inertia\Inertia;

class CarFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carFeatures = CarFeature::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('CarFeatures/Index', [
            'carFeatures' => $carFeatures->items(),
            'pagination' => $carFeatures,
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
        CarFeature::create($request->validated());

        return redirect()->route('car-features.index')->with('success', 'Car Feature created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CarFeature $carFeature)
    {
        return Inertia::render('CarFeatures/Show', [
            'carFeature' => $carFeature,
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
        $carFeature->update($request->validated());

        return redirect()->route('car-features.index')->with('success', 'Car Feature updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarFeature $carFeature)
    {
        $carFeature->delete();

        return redirect()->route('car-features.index')->with('success', 'Car Feature deleted successfully.');
    }
}
