<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyFeatureRequest;
use App\Http\Requests\UpdatePropertyFeatureRequest;
use App\Models\PropertyFeature;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PropertyFeature::with('property')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('property', function($q) use ($search) {
                $q->where('property_name', 'LIKE', "%$search%");
            });
        }

        $propertyFeatures = $query->paginate(10);

        return Inertia::render('PropertyFeatures/Index', [
            'propertyFeatures' => $propertyFeatures->items(),
            'pagination' => $propertyFeatures,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $properties = Property::all();
        return Inertia::render('PropertyFeatures/Create', [
            'properties' => $properties
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(StorePropertyFeatureRequest $request)
    {

        $validatedData = $request->validated();
        
        // Handle file upload

        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('property-feature', 'public');
        }

        $propertyFeature = PropertyFeature::create($validatedData);
        
        // If this is an AJAX request (from the ShowProperty component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $propertyFeature
            ]);
        }

        return redirect()->back()->with('success', 'Property feature added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyFeature $propertyFeature)
    {
        return Inertia::render('PropertyFeatures/Show', [
            'propertyFeature' => $propertyFeature->load('property'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PropertyFeature $propertyFeature)
    {
        $properties = Property::all();
        return Inertia::render('PropertyFeatures/Edit', [
            'propertyFeature' => $propertyFeature,
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyFeatureRequest $request, PropertyFeature $propertyFeature)
    {
        $validatedData = $request->validated();

        // Handle icon replacement if needed
        if ($request->hasFile('icon')) {
            // Delete old icon
            if ($propertyFeature->icon) {
                Storage::disk('public')->delete($propertyFeature->icon);
            }
            
            // Store new icon
            $validatedData['icon'] = $request->file('icon')->store('property-feature', 'public');
        }

        $propertyFeature->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $propertyFeature
            ]);
        }

        return redirect()->back()->with('success', 'Property feature updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyFeature $propertyFeature)
    {
        // Delete the icon file from storage
        if ($propertyFeature->icon) {
            Storage::disk('public')->delete($propertyFeature->icon);
        }
        
        $propertyFeature->delete();

        // If this is an AJAX request (from the ShowProperty component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Property feature deleted successfully.');
    }
    
    /**
     * Get all feature icons for a specific property
     */
    public function getByProperty($propertyId)
    {
        $feature = PropertyFeature::where('property_id', $propertyId)->get();
        return response()->json($feature);
    }
}