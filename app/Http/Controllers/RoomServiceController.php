<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomServiceRequest;
use App\Http\Requests\UpdateRoomServiceRequest;
use App\Models\RoomService;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoomService::with('room')->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('room', function($q) use ($search) {
                $q->where('room_number', 'LIKE', "%$search%");
            });
        }

        $roomServices = $query->paginate(10);

        return Inertia::render('RoomServices/Index', [
            'roomServices' => $roomServices->items(),
            'pagination' => $roomServices,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rooms = Room::all();
        return Inertia::render('RoomServices/Create', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * This handles both form submissions and API requests
     */
    public function store(StoreRoomServiceRequest $request)
    {

        $validatedData = $request->validated();
        
        // Handle file upload

        if ($request->hasFile('icon')) {
            $validatedData['icon'] = $request->file('icon')->store('room-service', 'public');
        }

        $roomService = RoomService::create($validatedData);
        
        // If this is an AJAX request (from the ShowRoom component)
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'service' => $roomService
            ]);
        }

        return redirect()->back()->with('success', 'Room service added successfully.');
        
    }

    /**
     * Display the specified resource.
     */
    public function show(RoomService $roomService)
    {
        return Inertia::render('RoomServices/Show', [
            'roomService' => $roomService->load('room'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RoomService $roomService)
    {
        $rooms = Room::all();
        return Inertia::render('RoomServices/Edit', [
            'roomService' => $roomService,
            'rooms' => $rooms
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoomServiceRequest $request, RoomService $roomService)
    {
        $validatedData = $request->validated();

        // Handle icon replacement if needed
        if ($request->hasFile('icon')) {
            // Delete old icon
            if ($roomService->icon) {
                Storage::disk('public')->delete($roomService->icon);
            }
            
            // Store new icon
            $validatedData['icon'] = $request->file('icon')->store('room-service', 'public');
        }

        $roomService->update($validatedData);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'service' => $roomService
            ]);
        }

        return redirect()->back()->with('success', 'Room service updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoomService $roomService)
    {
        // Delete the icon file from storage
        if ($roomService->icon) {
            Storage::disk('public')->delete($roomService->icon);
        }
        
        $roomService->delete();

        // If this is an AJAX request (from the ShowRoom component)
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true
            ]);
        }

        return redirect()->back()->with('success', 'Room service deleted successfully.');
    }
    
    /**
     * Get all service icons for a specific room
     */
    public function getByRoom($roomId)
    {
        $service = RoomService::where('room_id', $roomId)->get();
        return response()->json($service);
    }
}