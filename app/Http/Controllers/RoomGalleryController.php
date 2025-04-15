<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomGalleryRequest;
use App\Http\Requests\UpdateRoomGalleryRequest;
use App\Models\RoomGallery;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoomGallery::with('room')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('room', function($q) use ($search) {
                $q->where('room_number', 'LIKE', "%$search%");
            });
        }

        $roomGalleries = $query->paginate(10);

        return Inertia::render('RoomGalleries/Index', [
            'roomGalleries' => $roomGalleries->items(),
            'pagination' => $roomGalleries,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rooms = Room::all();
        return Inertia::render('RoomGalleries/Create', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'image' => 'required',
        ]);
        
        // Handle file upload
        $path = $request->file('image')->store('room-gallery', 'public');
        
        $roomGallery = RoomGallery::create([
            'room_id' => $request->room_id,
            'image' => $path,
        ]);
        
        // If this is an AJAX request (from the ShowRoom component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'gallery' => $roomGallery
            ]);
        }

        return redirect()->back()->with('success', 'Room gallery added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(RoomGallery $roomGallery)
    {
        return Inertia::render('RoomGalleries/Show', [
            'roomGallery' => $roomGallery->load('room'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoomGallery $roomGallery)
    {
        $rooms = Room::all();
        return Inertia::render('RoomGalleries/Edit', [
            'roomGallery' => $roomGallery,
            'rooms' => $rooms
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomGalleryRequest $request, RoomGallery $roomGallery)
    {
        $validatedData = $request->validated();

        // Handle image replacement if needed
        if ($request->hasFile('image')) {
            // Delete old image
            if ($roomGallery->image) {
                Storage::disk('public')->delete($roomGallery->image);
            }
            
            // Store new image
            $validatedData['image'] = $request->file('image')->store('room-gallery', 'public');
        }

        $roomGallery->update($validatedData);

        return redirect()->back()->with('success', 'Room gallery updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoomGallery $roomGallery)
    {
        // Delete the image file from storage
        if ($roomGallery->image) {
            Storage::disk('public')->delete($roomGallery->image);
        }
        
        $roomGallery->delete();

        // If this is an AJAX request (from the ShowRoom component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Room gallery deleted successfully.');
    }
    
    /**
     * Get all gallery images for a specific room
     */
    public function getByRoom($roomId)
    {
        $gallery = RoomGallery::where('room_id', $roomId)->get();
        return response()->json($gallery);
    }
}