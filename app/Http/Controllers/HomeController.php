<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Job;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Models\Property;
use App\Models\Repayment;
use App\Models\Food;
use App\Models\Car;
use App\Models\CarBooking;
use App\Models\Booking;
use App\Models\Service;
use App\Models\PropertyAmenity;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

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
        $cars = Car::with(['bookings', 'initialGallery', 'carFeatures'])->get();
        
        return Inertia::render('Cars', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'cars'=> $cars
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

        $car_id = $request->input('car_id');

        $car = Car::with(['category','media','bookings','initialGallery','carFeatures.feature','user'])->where('id','=',$car_id)->first();

        return Inertia::render('RentNow', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'car'=>$car,
            'flash' => session('flash')
        ]);
    }

    public function carBooking(Request $request)
    {
        $input = $request->all();
        $car = Car::with(['bookings', 'initialGallery', 'carFeatures'])->where('id', '=', $input['car_id'])->first();

        return Inertia::render('CarBooking', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'car'=> $car
        ]);
    }


    public function propertyBooking(Request $request)
    {
        $input = $request->all();
        $property = Property::with(['bookings','initialGallery','propertyAmenities','propertyFeatures','PropertyServices'])->where('id', '=', $input['property_id'])->first();

        return Inertia::render('PropertyBooking', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            'property'=> $property
        ]);
    }


    public function dashboard(Request $request)
    {
        $user = Auth::user();

        // Calculate total revenue from property bookings
        $propertyBookingTotal = Booking::where('status', '=', 'Paid')
            ->whereHas('property', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->sum('total_price');

        // Calculate total revenue from car bookings  
        $carBookingTotal = CarBooking::where('status', '=', 'Paid')
            ->whereHas('car', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->sum('total_price');

        // Count user's cars and properties
        $carsCount = Car::where('user_id', '=', $user->id)->count();
        $propertiesCount = Property::where('user_id', '=', $user->id)->count();

        // Calculate pending payouts
        $pendingPayouts = ($propertyBookingTotal + $carBookingTotal) * 0.85; // Assuming 15% platform fee

        // Recent transactions
        $recentTransactions = collect([
            // Property bookings
            ...Booking::where('status', 'Paid')
                ->whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['property', 'user'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function($booking) {
                    return [
                        'type' => 'property',
                        'title' => $booking->property->title,
                        'amount' => $booking->total_price,
                        'guest' => $booking->user->name,
                        'date' => $booking->created_at,
                        'status' => 'completed'
                    ];
                }),
            
            // Car bookings
            ...CarBooking::where('status', 'Paid')
                ->whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['car', 'user'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function($booking) {
                    return [
                        'type' => 'car',
                        'title' => $booking->car->make . ' ' . $booking->car->model,
                        'amount' => $booking->total_price,
                        'guest' => $booking->user->name,
                        'date' => $booking->created_at,
                        'status' => 'completed'
                    ];
                })
        ])->sortByDesc('date')->take(10);

        // Monthly earnings data for chart
        $monthlyEarnings = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->startOfMonth()->toDateString();
            $monthEnd = $month->endOfMonth()->toDateString();
            
            $propertyEarnings = Booking::where('status', 'Paid')
                ->whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');
                
            $carEarnings = CarBooking::where('status', 'Paid')
                ->whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');
                
            $monthlyEarnings[] = [
                'month' => $month->format('M Y'),
                'property_earnings' => $propertyEarnings,
                'car_earnings' => $carEarnings,
                'total' => $propertyEarnings + $carEarnings
            ];
        }

        return Inertia::render('Dashboard', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            
            // Wallet specific data
            'carsCount' => $carsCount,
            'propertiesCount' => $propertiesCount,
            'propertyBookingTotal' => $propertyBookingTotal,
            'carBookingTotal' => $carBookingTotal,
            'totalEarnings' => $propertyBookingTotal + $carBookingTotal,
            'pendingPayouts' => $pendingPayouts,
            'availableBalance' => $pendingPayouts * 0.6, // Assuming some amount is available
            'monthlyEarnings' => $monthlyEarnings,
            'recentTransactions' => $recentTransactions,
            
            // Performance metrics
            'averagePropertyBookingValue' => $propertiesCount > 0 ? $propertyBookingTotal / max($propertiesCount, 1) : 0,
            'averageCarBookingValue' => $carsCount > 0 ? $carBookingTotal / max($carsCount, 1) : 0,
            'totalBookingsCount' => Booking::whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count() + 
                CarBooking::whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count(),
        ]);
    }


    public function hostWallet(Request $request)
    {
        $user = Auth::user();

        // Calculate total revenue from property bookings
        $propertyBookingTotal = Booking::where('status', '=', 'Paid')
            ->whereHas('property', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->sum('total_price');

        // Calculate total revenue from car bookings  
        $carBookingTotal = CarBooking::where('status', '=', 'Paid')
            ->whereHas('car', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->sum('total_price');

        // Count user's cars and properties
        $carsCount = Car::where('user_id', '=', $user->id)->count();
        $propertiesCount = Property::where('user_id', '=', $user->id)->count();

        // Calculate pending payouts
        $pendingPayouts = ($propertyBookingTotal + $carBookingTotal) * 0.85; 

        // Recent transactions
        $recentTransactions = collect([
            // Property bookings
            ...Booking::where('status', 'Paid')
                ->whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['property', 'user'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function($booking) {
                    return [
                        'type' => 'property',
                        'title' => $booking->property->property_name,
                        'amount' => $booking->total_price,
                        'guest' => $booking->user->name,
                        'date' => $booking->created_at,
                        'status' => 'Paid'
                    ];
                }),
            
            // Car bookings
            ...CarBooking::where('status', 'Paid')
                ->whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['car', 'user'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function($booking) {
                    return [
                        'type' => 'car',
                        'title' => $booking->car->make . ' ' . $booking->car->model,
                        'amount' => $booking->total_price,
                        'guest' => $booking->user->name,
                        'date' => $booking->created_at,
                        'status' => 'Paid'
                    ];
                })
        ])->sortByDesc('date')->take(10);

        // Monthly earnings data for chart
        $monthlyEarnings = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->startOfMonth()->toDateString();
            $monthEnd = $month->endOfMonth()->toDateString();
            
            $propertyEarnings = Booking::where('status', 'Paid')
                ->whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');
                
            $carEarnings = CarBooking::where('status', 'Paid')
                ->whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total_price');
                
            $monthlyEarnings[] = [
                'month' => $month->format('M Y'),
                'property_earnings' => $propertyEarnings,
                'car_earnings' => $carEarnings,
                'total' => $propertyEarnings + $carEarnings
            ];
        }

        $repaymentAmount = Repayment::where('user_id','=',$user->id)->sum('amount');

        return Inertia::render('Wallet/Wallet', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'flash' => session('flash'),
            
            // Wallet specific data
            'carsCount' => $carsCount,
            'propertiesCount' => $propertiesCount,
            'propertyBookingTotal' => $propertyBookingTotal,
            'carBookingTotal' => $carBookingTotal,
            'totalEarnings' => $propertyBookingTotal + $carBookingTotal,
            'pendingPayouts' => $pendingPayouts,
            'repaymentAmount'=> $repaymentAmount,
            'availableBalance' => $pendingPayouts - $repaymentAmount, // Assuming some amount is available
            'monthlyEarnings' => $monthlyEarnings,
            'recentTransactions' => $recentTransactions,
            
            // Performance metrics
            'averagePropertyBookingValue' => $propertiesCount > 0 ? $propertyBookingTotal / max($propertiesCount, 1) : 0,
            'averageCarBookingValue' => $carsCount > 0 ? $carBookingTotal / max($carsCount, 1) : 0,
            'totalBookingsCount' => Booking::whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count() + 
                CarBooking::whereHas('car', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count(),
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
            'PropertyServices',
            'user'
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

