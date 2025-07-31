<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyAmenityRequest;
use App\Http\Requests\UpdatePropertyAmenityRequest;
use App\Models\PropertyAmenity;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyAmenityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PropertyAmenity::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%");
        }

        $propertyAmenities = $query->paginate(10);

        return Inertia::render('PropertyAmenities/Index', [
            'propertyAmenities' => $propertyAmenities->items(),
            'pagination' => $propertyAmenities,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('PropertyAmenities/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePropertyAmenityRequest $request)
    {
        $validatedData = $request->validated();

        // Handle Image Upload
        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('amenities', 'public');
        }

        $propertyAmenity = PropertyAmenity::create($validatedData);

        $property = Property::with('bookings', 'initialGallery', 'propertyAmenities.amenity', 'propertyFeatures', 'PropertyServices', 'user', 'variations')->find($propertyAmenity->property_id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'amenity' => $propertyAmenity,
                'property'=> $property
            ]);
        }

        return redirect()->back()->with('success', 'Property amenity added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyAmenity $propertyAmenity)
    {
        return Inertia::render('PropertyAmenities/Show', [
            'amenity' => $propertyAmenity,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PropertyAmenity $propertyAmenity)
    {
        return Inertia::render('PropertyAmenities/Edit', [
            'propertyAmenity' => $propertyAmenity,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyAmenityRequest $request, PropertyAmenity $propertyAmenity)
    {
        $validatedData = $request->validated();

        // Handle Image Update
        if ($request->hasFile('icon')) {
            // Delete old image
            if ($propertyAmenity->image) {
                Storage::disk('public')->delete($propertyAmenity->icon);
            }
            $validatedData['icon'] = $request->file('icon')->store('amenities', 'public');
        }

        $propertyAmenity->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'amenity' => $propertyAmenity
            ]);
        }

        return redirect()->back()->with('success', 'Property amenity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyAmenity $propertyAmenity)
    {
        // Delete the image file if it exists
        if ($propertyAmenity->icon) {
            Storage::disk('public')->delete($propertyAmenity->icon);
        }

        $propertyAmenity->delete();

        return redirect()->back()->with('success', 'Property amenity deleted successfully.');
    }
}
