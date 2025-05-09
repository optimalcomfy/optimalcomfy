<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAmenityRequest;
use App\Http\Requests\UpdateAmenityRequest;
use App\Models\Amenity;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AmenityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Amenity::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('description', 'LIKE', "%$search%");
        }

        $amenities = $query->paginate(10);

        return Inertia::render('Amenities/Index', [
            'amenities' => $amenities->items(),
            'pagination' => $amenities,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Amenities/Create');
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreAmenityRequest $request)
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('amenities', 'public');
            $data['image'] = $imagePath;
        }
    
        Amenity::create($data);
    
        return redirect()->route('amenities.index')->with('success', 'Amenity created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Amenity $amenity)
    {
        return Inertia::render('Amenities/Show', [
            'amenity' => $amenity,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Amenity $amenity)
    {
        return Inertia::render('Amenities/Edit', [
            'amenity' => $amenity,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdateAmenityRequest $request, Amenity $amenity)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($amenity->image) {
                Storage::disk('public')->delete($amenity->image);
            }

            // Upload new image
            $imagePath = $request->file('image')->store('amenities', 'public');
            $data['image'] = $imagePath;
        }

        $amenity->update($data);

        return redirect()->route('amenities.index')->with('success', 'Amenity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    
    public function destroy(Amenity $amenity)
    {
        if ($amenity->image) {
            Storage::disk('public')->delete($amenity->image);
        }

        $amenity->delete();

        return redirect()->route('amenities.index')->with('success', 'Amenity deleted successfully.');
    }

}
