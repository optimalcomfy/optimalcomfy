<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\Amenity;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Property::with(['bookings','initialGallery','propertyAmenities','propertyFeatures','PropertyServices'])->orderBy('created_at', 'desc');

        if ($user->role_id == 2) {
            $query->where('user_id', '=', $user->id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('type', 'LIKE', "%$search%")
                  ->orWhere('price', 'LIKE', "%$search%");
        }

        $properties = $query->paginate(10);

        return Inertia::render('Properties/Index', [
            'properties' => $properties->items(),
            'pagination' => $properties,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Properties/Create');
    }

    /**
     * Store a newly created resource in storage.
     */


     private function getCoordinatesFromLocation($location)
     {
         $url = "https://nominatim.openstreetmap.org/search?format=json&q=" . urlencode($location);
     
         $response = \Illuminate\Support\Facades\Http::withHeaders([
             'User-Agent' => 'LaravelApp/1.0'
         ])->get($url);
     
         if ($response->ok() && count($response->json()) > 0) {
             $data = $response->json()[0];
             return [
                 'latitude' => $data['lat'],
                 'longitude' => $data['lon']
             ];
         }
     
         return null;
     }
    
    public function store(StorePropertyRequest $request)
    {
        $validatedData = $request->validated();

        if (!empty($validatedData['location'])) {
            $coordinates = $this->getCoordinatesFromLocation($validatedData['location']);
            if ($coordinates) {
                $validatedData['latitude'] = $coordinates['latitude'];
                $validatedData['longitude'] = $coordinates['longitude'];
            }
        }

        $user = Auth::user();

        $validatedData['user_id'] = $user->id;
    
        Property::create($validatedData);
    
        return redirect()->route('properties.index')->with('success', 'Property added successfully.');
    }


    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        $property->load('bookings', 'initialGallery', 'propertyAmenities.amenity', 'propertyFeatures', 'PropertyServices', 'user');

        $amenities = Amenity::all();

        return Inertia::render('Properties/Show', [
            'property' => $property,
            'amenities'=>$amenities
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        return Inertia::render('Properties/Edit', [
            'property' => $property,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        $validatedData = $request->validated();

        if (!empty($validatedData['location'])) {
            $coordinates = $this->getCoordinatesFromLocation($validatedData['location']);
            if ($coordinates) {
                $validatedData['latitude'] = $coordinates['latitude'];
                $validatedData['longitude'] = $coordinates['longitude'];
            }
        }

        $property->update($validatedData);

        return redirect()->route('properties.index')->with('success', 'Property updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        $property->delete();

        return redirect()->route('properties.index')->with('success', 'Property deleted successfully.');
    }
}
