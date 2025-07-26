<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\CarCategory;
use App\Models\Car;
use App\Models\Company;
use App\Models\CarFeature;
use App\Models\Feature;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Car::query();

        $user = Auth::user();

        if ($user->role_id == 2) {
            $query->where('user_id', '=', $user->id);
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('brand', 'LIKE', "%$search%")
                  ->orWhere('model', 'LIKE', "%$search%");
        }

        $cars = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Cars/Index', [
            'cars' => $cars->items(),
            'pagination' => $cars,
            'flash' => session('flash'),
        ]);
    }


    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Car::with(['user', 'category', 'bookings']);

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
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('brand', 'LIKE', "%$search%")
                ->orWhere('model', 'LIKE', "%$search%")
                ->orWhere('license_plate', 'LIKE', "%$search%")
                ->orWhere('year', 'LIKE', "%$search%")
                ->orWhere('price_per_day', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('category', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        // Availability filter
        if ($isAvailable = $request->query('is_available')) {
            $query->where('is_available', $isAvailable);
        }

        // Category filter
        if ($category = $request->query('category_id')) {
            $query->where('car_category_id', $category);
        }

        // Price range filter
        if ($minPrice = $request->query('min_price')) {
            $query->where('price_per_day', '>=', $minPrice);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->where('price_per_day', '<=', $maxPrice);
        }

        // Role-based filtering
        if ($user->role_id == 2) { // Property manager/owner
            $query->whereHas('user', function($q) use ($user) {
                $q->where('company_id', $user->company_id);
            });
        } elseif ($user->role_id == 3) { // Regular user
            $query->where('user_id', $user->id);
        }

        $cars = $query->orderBy('created_at', 'desc')->get();

        $exportData = $cars->map(function ($car) {
            return [
                'id' => $car->id,
                'name' => $car->name,
                'brand' => $car->brand,
                'model' => $car->model,
                'year' => $car->year,
                'license_plate' => $car->license_plate,
                'category' => optional($car->category)->name,
                'price_per_day' => 'KES ' . number_format($car->amount, 2),
                'platform_price' => 'KES ' . number_format($car->platform_price, 2),
                'platform_charges' => 'KES ' . number_format($car->platform_charges, 2),
                'owner' => optional($car->user)->name,
                'fuel_type' => $car->fuel_type,
                'transmission' => $car->transmission,
                'mileage' => $car->mileage,
                'seats' => $car->seats,
                'location' => $car->location_address,
                'is_available' => $car->is_available ? 'Yes' : 'No',
                'total_bookings' => $car->bookings->count(),
                'created_at' => $car->created_at->format('M d, Y H:i'),
            ];
        });

        return response()->json($exportData);
    }

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
   

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       $categories = CarCategory::all();
       $features = Feature::all();
       $company = Company::first();

        return Inertia::render('Cars/Create', [
            'categories' => $categories,
            'features'=> $features,
            'company'=> $company
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    
    public function store(StoreCarRequest $request)
    {
        $validated = $request->validated();

        // Handling the image file upload if provided
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('cars', 'public');
        }

        if (!empty($validated['location_address'])) {
            $coordinates = $this->getCoordinatesFromLocation($validated['location_address']);
            if ($coordinates) {
                $validated['latitude'] = $coordinates['latitude'];
                $validated['longitude'] = $coordinates['longitude'];
            }
        }

        $user = Auth::user();

        $validated['user_id'] = $user->id;

        $company = Company::first();
        $base = $validated['price_per_day'];
        $charges = $base * $company->percentage / 100;
        $total = $validated['price_per_day'] - $charges;

        $validated['amount'] = $total;

        // Create the car record in the database
        Car::create($validated);

        return redirect()->route('main-cars.index')->with('success', 'Car item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    
    public function show(Car $car)
    {

        $car->load('bookings', 'initialGallery', 'carFeatures.feature');

        $features = Feature::all();

        $keys = env('VITE_GOOGLE_MAP_API');

        return Inertia::render('Cars/Show', [
            'car' => $car,
            'features'=> $features,
            'keys'=>$keys
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */

    public function edit(Car $car)
    {
        $features = Feature::all();
        $categories = CarCategory::all();
        $company = Company::first();

        return Inertia::render('Cars/Edit', [
            'car' => $car,
            'features'=> $features,
            'categories'=>$categories,
            'company'=> $company
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarRequest $request, Car $car)
    {
        $validated = $request->validated();

        // Check if an image was uploaded
        if ($request->hasFile('image')) {
            // Delete the old image if it exists
            if ($car->image) {
                Storage::disk('public')->delete($car->image);
            }
            // Store the new image
            $validated['image'] = $request->file('image')->store('cars', 'public');
        }

        if (!empty($validated['location_address'])) {
            $coordinates = $this->getCoordinatesFromLocation($validated['location_address']);
            if ($coordinates) {
                $validated['latitude'] = $coordinates['latitude'];
                $validated['longitude'] = $coordinates['longitude'];
            }
        }

        $company = Company::first();
        $base = $validated['price_per_day'];
        $charges = $base * $company->percentage / 100;
        $total = $validated['price_per_day'] - $charges;

        $validated['amount'] = $total;

        // Update the car record with the validated data
        $car->update($validated);

        return redirect()->route('main-cars.index')->with('success', 'Car item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Car $car)
    {
        // Delete the image associated with the car if it exists
        if ($car->image) {
            Storage::disk('public')->delete($car->image);
        }

        // Delete the car record
        $car->delete();

        return redirect()->route('main-cars.index')->with('success', 'Car item deleted successfully.');
    }
}
