<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVariationRequest;
use App\Http\Requests\UpdateVariationRequest;
use App\Models\Variation;
use App\Models\Property;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VariationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Variation::with('property')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('property', function($q) use ($search) {
                $q->where('property_name', 'LIKE', "%$search%");
            });
        }

        $variations = $query->paginate(10);

        return Inertia::render('Variations/Index', [
            'variations' => $variations->items(),
            'pagination' => $variations,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $properties = Property::all();
        return Inertia::render('Variations/Create', [
            'properties' => $properties
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(StoreVariationRequest $request)
    {

        $validatedData = $request->validated();


        $variation = Variation::create($validatedData);
        
        // If this is an AJAX request (from the ShowProperty component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'variation' => $variation
            ]);
        }

        return redirect()->back()->with('success', 'Property variation added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(Variation $variation)
    {
        return Inertia::render('Variations/Show', [
            'variation' => $variation->load('property'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Variation $variation)
    {
        $properties = Property::all();
        return Inertia::render('Variations/Edit', [
            'variation' => $variation,
            'properties' => $properties
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVariationRequest $request, Variation $variation)
    {
        $validatedData = $request->validated();

        $updateVariation = Variation::find($validatedData['id']);

        $updateVariation->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'variation' => $updateVariation
            ]);
        }

        return redirect()->back()->with('success', 'Property variation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Variation $variation, $id)
    {
        $deleteVariation = Variation::find($id);
        
        $deleteVariation->delete();

        // If this is an AJAX request (from the ShowProperty component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Property variation deleted successfully.');
    }
    
    /**
     * Get all variation icons for a specific property
     */
    public function getByProperty($propertyId)
    {
        $variation = Variation::where('property_id', $propertyId)->get();
        return response()->json($variation);
    }
}