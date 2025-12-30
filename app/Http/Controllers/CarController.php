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
use Illuminate\Support\Facades\DB;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Car::with(['user', 'category', 'bookings'])->orderBy('created_at', 'desc');

        $user = Auth::user();

        // Filter by owner if user is a car owner (role_id 2)
        if ($user->role_id == 2) {
            $query->where('user_id', $user->id);
        }

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('brand', 'LIKE', "%$search%")
                ->orWhere('model', 'LIKE', "%$search%");
            });
        }

        // Creation date filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date'),
                $request->input('end_date')
            ]);
        }

        $cars = $query->paginate(10);

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

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->input('start_date'),
                $request->input('end_date')
            ]);
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
    
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            // Validate basic fields
            $validated = $request->validate([
                'car_category_id' => 'required|exists:car_categories,id',
                'name' => 'required|string|max:255',
                'license_plate' => 'required|string|max:20|unique:cars,license_plate',
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
                'mileage' => 'required|integer|min:0',
                'body_type' => 'required|string|max:255',
                'seats' => 'required|integer|min:1',
                'doors' => 'required|integer|min:1',
                'luggage_capacity' => 'required|integer|min:1',
                'fuel_type' => 'required|string|max:255',
                'engine_capacity' => 'required|integer|min:0',
                'transmission' => 'required|string|max:255',
                'drive_type' => 'required|string|max:255',
                'fuel_economy' => 'required|string|max:255',
                'exterior_color' => 'required|string|max:255',
                'interior_color' => 'required|string|max:255',
                'host_earnings' => 'required|numeric|min:0',
                'price_per_day' => 'required|numeric|min:0',
                'description' => 'required|string',
                'is_available' => 'nullable',
                'location_address' => 'required|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
            ]);

            // Handle location coordinates
            if (!empty($validated['location_address'])) {
                $coordinates = $this->getCoordinatesFromLocation($validated['location_address']);
                if ($coordinates) {
                    $validated['latitude'] = $coordinates['latitude'];
                    $validated['longitude'] = $coordinates['longitude'];
                }
            }

            // Set user and company info
            $validated['user_id'] = auth()->id();
            $company = Company::first();
            $validated['amount'] = $validated['host_earnings']; // What host will earn

            // Create the car record
            $car = Car::create($validated);

            // Handle features if provided
            if ($request->has('features')) {
                $features = json_decode($request->input('features'), true);
                
                if (is_array($features) && !empty($features)) {
                    // First delete existing features for this car
                    CarFeature::where('car_id', $car->id)->delete();
                    
                    // Create new feature associations
                    foreach ($features as $featureId) {
                        CarFeature::create([
                            'car_id' => $car->id,
                            'feature_id' => $featureId
                        ]);
                    }
                }
            }

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('car-gallery', 'public');
                    $car->media()->create([
                        'image' => $path,
                        'is_featured' => false // You can implement logic to set featured image
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('main-cars.show', $car->id)
                ->with('success', 'Ride created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Ride creation failed: " . $e->getMessage());
            
            return back()->withInput()
                ->withErrors(['error' => 'Failed to create ride. Please try again. ' . $e->getMessage()]);
        }
    }
    /**
     * Display the specified resource.
     */
    
    public function show(Car $car)
    {

        $car->load('bookings', 'initialGallery', 'carFeatures.feature');

        $features = Feature::all();

        $keys = env('GOOGLE_MAP_API');

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
