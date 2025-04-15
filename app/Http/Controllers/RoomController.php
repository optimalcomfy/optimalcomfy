<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Room::with(['bookings','initialGallery','roomAmenities','roomFeatures','roomServices'])->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('type', 'LIKE', "%$search%")
                  ->orWhere('price', 'LIKE', "%$search%");
        }

        $rooms = $query->paginate(10);

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms->items(),
            'pagination' => $rooms,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Rooms/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    
    public function store(StoreRoomRequest $request)
    {
        $validatedData = $request->validated();
    
        $room = Room::create($validatedData);
    
        return redirect()->route('rooms.index')->with('success', 'Room added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        $room->load('bookings', 'initialGallery', 'roomAmenities', 'roomFeatures', 'roomServices');

        return Inertia::render('Rooms/Show', [
            'room' => $room,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        return Inertia::render('Rooms/Edit', [
            'room' => $room,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdateRoomRequest $request, Room $room)
    {
        $validatedData = $request->validated();

        $room->update($validatedData);

        return redirect()->route('rooms.index')->with('success', 'Room updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        $room->delete();

        return redirect()->route('rooms.index')->with('success', 'Room deleted successfully.');
    }
}
