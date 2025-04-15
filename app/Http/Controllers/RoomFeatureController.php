<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomFeatureRequest;
use App\Http\Requests\UpdateRoomFeatureRequest;
use App\Models\RoomFeature;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomFeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoomFeature::with('room')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('room', function($q) use ($search) {
                $q->where('room_number', 'LIKE', "%$search%");
            });
        }

        $roomFeatures = $query->paginate(10);

        return Inertia::render('RoomFeatures/Index', [
            'roomFeatures' => $roomFeatures->items(),
            'pagination' => $roomFeatures,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rooms = Room::all();
        return Inertia::render('RoomFeatures/Create', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(StoreRoomFeatureRequest $request)
    {

        $validatedData = $request->validated();
        
        // Handle file upload

        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('room-feature', 'public');
        }

        $roomFeature = RoomFeature::create($validatedData);
        
        // If this is an AJAX request (from the ShowRoom component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $roomFeature
            ]);
        }

        return redirect()->back()->with('success', 'Room feature added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(RoomFeature $roomFeature)
    {
        return Inertia::render('RoomFeatures/Show', [
            'roomFeature' => $roomFeature->load('room'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoomFeature $roomFeature)
    {
        $rooms = Room::all();
        return Inertia::render('RoomFeatures/Edit', [
            'roomFeature' => $roomFeature,
            'rooms' => $rooms
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomFeatureRequest $request, RoomFeature $roomFeature)
    {
        $validatedData = $request->validated();

        // Handle icon replacement if needed
        if ($request->hasFile('icon')) {
            // Delete old icon
            if ($roomFeature->icon) {
                Storage::disk('public')->delete($roomFeature->icon);
            }
            
            // Store new icon
            $validatedData['icon'] = $request->file('icon')->store('room-feature', 'public');
        }

        $roomFeature->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'feature' => $roomFeature
            ]);
        }

        return redirect()->back()->with('success', 'Room feature updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoomFeature $roomFeature)
    {
        // Delete the icon file from storage
        if ($roomFeature->icon) {
            Storage::disk('public')->delete($roomFeature->icon);
        }
        
        $roomFeature->delete();

        // If this is an AJAX request (from the ShowRoom component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Room feature deleted successfully.');
    }
    
    /**
     * Get all feature icons for a specific room
     */
    public function getByRoom($roomId)
    {
        $feature = RoomFeature::where('room_id', $roomId)->get();
        return response()->json($feature);
    }
}