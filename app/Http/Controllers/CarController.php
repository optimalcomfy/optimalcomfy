<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\CarCategory;
use App\Models\Car;
use App\Models\CarFeature;
use App\Models\Feature;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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

        return Inertia::render('Cars/Create', [
            'categories' => $categories,
            'features'=> $features
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

        return Inertia::render('Cars/Show', [
            'car' => $car,
            'features'=> $features
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Car $car)
    {
        $features = Feature::all();
        $categories = CarCategory::all();

        return Inertia::render('Cars/Edit', [
            'car' => $car,
            'features'=> $features,
            'categories'=>$categories
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
