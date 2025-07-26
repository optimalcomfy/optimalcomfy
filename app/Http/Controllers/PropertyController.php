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

use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

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


    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Property::with(['user', 'company', 'bookings']);

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        if (!$startDate || !$endDate) {
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        try {
            $validStartDate = Carbon::parse($startDate)->startOfDay();
            $validEndDate = Carbon::parse($endDate)->endOfDay();

            if ($validStartDate->lte($validEndDate)) {
                $query->whereBetween('created_at', [$validStartDate, $validEndDate]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format provided.'], 400);
        }

        // Search functionality
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('property_name', 'LIKE', "%$search%")
                ->orWhere('apartment_name', 'LIKE', "%$search%")
                ->orWhere('location', 'LIKE', "%$search%")
                ->orWhere('type', 'LIKE', "%$search%")
                ->orWhere('status', 'LIKE', "%$search%")
                ->orWhere('amount', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('company', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        // Status filter
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Type filter
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        // Role-based filtering
        if ($user->role_id == 2) { // Property manager/owner
            $query->whereHas('user', function($q) use ($user) {
                $q->where('company_id', $user->company_id);
            });
        } elseif ($user->role_id == 3) { // Regular user
            $query->where('user_id', $user->id);
        }

        $properties = $query->orderBy('created_at', 'desc')->get();

        $exportData = $properties->map(function ($property) {
            return [
                'id' => $property->id,
                'property_name' => $property->property_name,
                'apartment_name' => $property->apartment_name ?? 'N/A',
                'type' => $property->type,
                'status' => $property->status,
                'location' => $property->location,
                'host_price' => 'KES ' . number_format($property->amount, 2),
                'customer_price' => 'KES ' . number_format($property->platform_price, 2),
                'platform_charges' => 'KES ' . number_format($property->platform_charges, 2),
                'max_adults' => $property->max_adults,
                'max_children' => $property->max_children,
                'wifi_name' => $property->wifi_name ?? 'N/A',
                'emergency_contact' => $property->emergency_contact ?? 'N/A',
                'key_location' => $property->key_location ?? 'N/A',
                'owner_name' => optional($property->user)->name ?? 'N/A',
                'company_name' => optional($property->company)->name ?? 'N/A',
                'total_bookings' => $property->bookings->count(),
                'created_at' => $property->created_at->format('M d, Y H:i'),
                'last_booking_date' => $property->bookings->count() > 0 
                    ? $property->bookings->sortByDesc('created_at')->first()->created_at->format('M d, Y H:i')
                    : 'N/A',
            ];
        });

        return response()->json($exportData);
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
