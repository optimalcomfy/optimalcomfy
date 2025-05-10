<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Job;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Models\Property;
use App\Models\Food;
use App\Models\Car;
use App\Models\Service;
use App\Models\PropertyAmenity;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::query();

        if ($request->has('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%$search%")
                  ->orWhere('company_name', 'LIKE', "%$search%")
                  ->orWhere('location', 'LIKE', "%$search%")
                  ->orWhere('job_type', 'LIKE', "%$search%")
                  ->orWhere('salary_min', 'LIKE', "%$search%")
                  ->orWhere('salary_max', 'LIKE', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');
        $jobs = $query->paginate(10);

        $query = Property::with(['bookings','initialGallery','propertyAmenities','propertyFeatures','PropertyServices'])->orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('type', 'LIKE', "%$search%")
                  ->orWhere('price', 'LIKE', "%$search%");
        }

        $properties = $query->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'jobs' => $jobs,
            'properties'=> $properties,
            'flash' => session('flash'),
        ]);
    }

    public function restaurant(Request $request)
    {
        $foods = Food::all();

        return Inertia::render('Restaurant', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'foods'=> $foods
        ]);
    }

    public function allCars(Request $request)
    {

        return Inertia::render('Cars', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash')
        ]);
    }

    public function searchCars(Request $request)
    {

        $cars = Car::with(['bookings', 'initialGallery', 'carFeatures'])->get();

        return Inertia::render('SearchCars', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'cars'=> $cars
        ]);
    }


    public function rentNow(Request $request)
    {

        return Inertia::render('RentNow', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash')
        ]);
    }

    public function carBooking(Request $request)
    {

        return Inertia::render('CarBooking', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash')
        ]);
    }

    public function activity(Request $request)
    {
        return Inertia::render('Activity', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
        ]);
    }

    public function about(Request $request)
    {
        return Inertia::render('About', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
        ]);
    }

    public function event(Request $request)
    {
        return Inertia::render('Event', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
        ]);
    }

    public function contact(Request $request)
    {
        return Inertia::render('Contact', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
        ]);
    }

    public function gallery(Request $request)
    {
        return Inertia::render('Gallery', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
        ]);
    }

    public function propertyDetail(Request $request)
    {
        $query = Property::with([
            'bookings',
            'initialGallery',
            'propertyAmenities.amenity',
            'propertyFeatures',
            'PropertyServices'
        ])->orderBy('created_at', 'desc');
    
        if ($request->has('id')) {
            $id = $request->input('id');
            $query->where('id', '=', $id);
        }
    
        $property = $query->first();
    
        $similarProperties = [];
        if ($property) {
            $similarProperties = Property::with('initialGallery')
                ->where('type', $property->type)
                ->where('id', '!=', $property->id) 
                ->orderBy('created_at', 'desc')
                ->limit(4) 
                ->get();
        }
    
        return Inertia::render('PropertyDetail', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'property' => $property,
            'similarProperties' => $similarProperties
        ]);
    }
    

    public function services(Request $request)
    {

        $amenities = PropertyAmenity::select('name', 'icon')->distinct()->get();
        $services = Service::all();

        return Inertia::render('Services', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'amenities'=>$amenities,
            'services'=>$services
        ]);
    }


    public function properties(Request $request)
    {
        $query = Property::with(['bookings','initialGallery','propertyAmenities','propertyFeatures','PropertyServices'])
            ->orderBy('created_at', 'desc');
    
        // Search by name/type/price
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('type', 'LIKE', "%$search%")
                  ->orWhere('price', 'LIKE', "%$search%");
            });
        }
    
        // Filter by adult/child capacity
        if ($request->has('adult')) {
            $query->where('max_adults', '>=', (int) $request->input('adult'));
        }
    
        if ($request->has('child')) {
            $query->where('max_children', '>=', (int) $request->input('child'));
        }
    
        // ✅ Availability Check
        if ($request->filled(['checkIn', 'checkOut'])) {
            $checkIn = Carbon::parse($request->input('checkIn'));
            $checkOut = Carbon::parse($request->input('checkOut'));
    
            $query->whereDoesntHave('bookings', function ($bookingQuery) use ($checkIn, $checkOut) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where('check_in_date', '<', $checkOut)
                      ->where('check_out_date', '>', $checkIn);
                });
            });
        }
    
        $properties = $query->get();
    
        return Inertia::render('Properties', [
            'properties'=> $properties,
            'filters' => $request->all(),
        ]);
    }
    

    public function showJob(Job $job)
    {
        return Inertia::render('Jobs/Joby', [
            'job' => $job
        ]);
    }
}

