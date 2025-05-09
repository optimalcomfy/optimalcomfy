<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyServiceRequest;
use App\Http\Requests\UpdatePropertyServiceRequest;
use App\Models\PropertyService;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PropertyService::with('property')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('property', function($q) use ($search) {
                $q->where('property_name', 'LIKE', "%$search%");
            });
        }

        $propertyServices = $query->paginate(10);

        return Inertia::render('PropertyServices/Index', [
            'propertyServices' => $propertyServices->items(),
            'pagination' => $propertyServices,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $properties = Property::all();
        return Inertia::render('PropertyServices/Create', [
            'properties' => $properties
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(StorePropertyServiceRequest $request)
    {

        $validatedData = $request->validated();
        
        // Handle file upload

        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('property-service', 'public');
        }

        $propertyService = PropertyService::create($validatedData);
        
        // If this is an AJAX request (from the ShowProperty component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'service' => $propertyService
            ]);
        }

        return redirect()->back()->with('success', 'Property service added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyService $propertyService)
    {
        return Inertia::render('PropertyServices/Show', [
            'propertyService' => $propertyService->load('property'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PropertyService $propertyService)
    {
        $properties = Property::all();
        return Inertia::render('PropertyServices/Edit', [
            'propertyService' => $propertyService,
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePropertyServiceRequest $request, PropertyService $propertyService)
    {
        $validatedData = $request->validated();

        // Handle icon replacement if needed
        if ($request->hasFile('icon')) {
            // Delete old icon
            if ($propertyService->icon) {
                Storage::disk('public')->delete($propertyService->icon);
            }
            
            // Store new icon
            $validatedData['icon'] = $request->file('icon')->store('property-service', 'public');
        }

        $propertyService->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'service' => $propertyService
            ]);
        }

        return redirect()->back()->with('success', 'Property service updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyService $propertyService)
    {
        // Delete the icon file from storage
        if ($propertyService->icon) {
            Storage::disk('public')->delete($propertyService->icon);
        }
        
        $propertyService->delete();

        // If this is an AJAX request (from the ShowProperty component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Property service deleted successfully.');
    }
    
    /**
     * Get all service icons for a specific property
     */
    public function getByProperty($propertyId)
    {
        $service = PropertyService::where('property_id', $propertyId)->get();
        return response()->json($service);
    }
}