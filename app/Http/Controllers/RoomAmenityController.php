<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomAmenityRequest;
use App\Http\Requests\UpdateRoomAmenityRequest;
use App\Models\RoomAmenity;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomAmenityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoomAmenity::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%");
        }

        $roomAmenities = $query->paginate(10);

        return Inertia::render('RoomAmenities/Index', [
            'roomAmenities' => $roomAmenities->items(),
            'pagination' => $roomAmenities,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('RoomAmenities/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoomAmenityRequest $request)
    {
        $validatedData = $request->validated();

        // Handle Image Upload
        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('amenities', 'public');
        }

        $roomAmenity = RoomAmenity::create($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'amenity' => $roomAmenity
            ]);
        }

        return redirect()->back()->with('success', 'Room amenity added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(RoomAmenity $roomAmenity)
    {
        return Inertia::render('RoomAmenities/Show', [
            'amenity' => $roomAmenity,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoomAmenity $roomAmenity)
    {
        return Inertia::render('RoomAmenities/Edit', [
            'roomAmenity' => $roomAmenity,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomAmenityRequest $request, RoomAmenity $roomAmenity)
    {
        $validatedData = $request->validated();

        // Handle Image Update
        if ($request->hasFile('icon')) {
            // Delete old image
            if ($roomAmenity->image) {
                Storage::disk('public')->delete($roomAmenity->icon);
            }
            $validatedData['icon'] = $request->file('icon')->store('amenities', 'public');
        }

        $roomAmenity->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'amenity' => $roomAmenity
            ]);
        }

        return redirect()->back()->with('success', 'Room amenity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoomAmenity $roomAmenity)
    {
        // Delete the image file if it exists
        if ($roomAmenity->icon) {
            Storage::disk('public')->delete($roomAmenity->icon);
        }

        $roomAmenity->delete();

        return redirect()->back()->with('success', 'Room amenity deleted successfully.');
    }
}
