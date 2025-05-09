<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyGalleryRequest;
use App\Http\Requests\UpdatePropertyGalleryRequest;
use App\Models\PropertyGallery;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PropertyGallery::with('property')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('property', function($q) use ($search) {
                $q->where('property_name', 'LIKE', "%$search%");
            });
        }

        $propertyGalleries = $query->paginate(10);

        return Inertia::render('PropertyGalleries/Index', [
            'propertyGalleries' => $propertyGalleries->items(),
            'pagination' => $propertyGalleries,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $properties = Property::all();
        return Inertia::render('PropertyGalleries/Create', [
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
            'property_id' => 'required|exists:properties,id',
            'image' => 'required',
        ]);
        
        // Handle file upload
        $path = $request->file('image')->store('property-gallery', 'public');
        
        $propertyGallery = PropertyGallery::create([
            'property_id' => $request->property_id,
            'image' => $path,
        ]);
        
        // If this is an AJAX request (from the ShowProperty component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'gallery' => $propertyGallery
            ]);
        }

        return redirect()->back()->with('success', 'Property gallery added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyGallery $propertyGallery)
    {
        return Inertia::render('PropertyGalleries/Show', [
            'propertyGallery' => $propertyGallery->load('property'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PropertyGallery $propertyGallery)
    {
        $properties = Property::all();
        return Inertia::render('PropertyGalleries/Edit', [
            'propertyGallery' => $propertyGallery,
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyGalleryRequest $request, PropertyGallery $propertyGallery)
    {
        $validatedData = $request->validated();

        // Handle image replacement if needed
        if ($request->hasFile('image')) {
            // Delete old image
            if ($propertyGallery->image) {
                Storage::disk('public')->delete($propertyGallery->image);
            }
            
            // Store new image
            $validatedData['image'] = $request->file('image')->store('property-gallery', 'public');
        }

        $propertyGallery->update($validatedData);

        return redirect()->back()->with('success', 'Property gallery updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyGallery $propertyGallery)
    {
        // Delete the image file from storage
        if ($propertyGallery->image) {
            Storage::disk('public')->delete($propertyGallery->image);
        }
        
        $propertyGallery->delete();

        // If this is an AJAX request (from the ShowProperty component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Property gallery deleted successfully.');
    }
    
    /**
     * Get all gallery images for a specific property
     */
    public function getByProperty($propertyId)
    {
        $gallery = PropertyGallery::where('property_id', $propertyId)->get();
        return response()->json($gallery);
    }
}