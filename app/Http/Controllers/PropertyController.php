<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\Company;
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

        $query = Property::with([
            'bookings',
            'initialGallery',
            'propertyAmenities',
            'propertyFeatures',
            'PropertyServices',
            'user',
            'variations'
        ])->orderBy('created_at', 'desc');

        // Filter by user role (Agent only sees own properties)
        if ((int) $user->role_id === 2) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('id', '=', $user->id);
            });
        }

        // Search filtering
        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('property_name', 'LIKE', "%{$search}%")
                ->orWhere('type', 'LIKE', "%{$search}%")
                ->orWhere('price_per_night', 'LIKE', "%{$search}%")
                ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        $properties = $query->paginate(10)->withQueryString();

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
        $company = Company::first();

        return Inertia::render('Properties/Create', [
            'company' => $company
        ]);
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
        $property->load('bookings', 'initialGallery', 'propertyAmenities.amenity', 'propertyFeatures', 'PropertyServices', 'user', 'variations');

        $amenities = Amenity::all();

        $keys = env('VITE_GOOGLE_MAP_API');

        return Inertia::render('Properties/Show', [
            'property' => $property,
            'amenities'=>$amenities,
            'keys'=>$keys
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        $company = Company::first();

        return Inertia::render('Properties/Edit', [
            'property' => $property,
            'company'=> $company
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
