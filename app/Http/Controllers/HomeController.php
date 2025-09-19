<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Job;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Models\Property;
use App\Models\Company;
use App\Models\Repayment;
use App\Models\Food;
use App\Models\Car;
use App\Models\CarBooking;
use App\Models\Booking;
use App\Models\Service;
use App\Models\PropertyAmenity;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Services\ImageOptimizer;


class HomeController extends Controller
{
    public function index(Request $request)
    {
        // Check if location-based filtering is requested
        if ($request->has('latitude') && $request->has('longitude')) {
            $latitude = $request->query('latitude');
            $longitude = $request->query('longitude');
            $limit = 56;

            // Validate parameters
            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                return response()->json([
                    'error' => 'Valid latitude and longitude are required',
                    'data' => []
                ], 400);
            }

            // Query for location-based results
            $properties = Property::with([
                "bookings",
                "variations",
                "initialGallery",
                "propertyAmenities",
                "propertyFeatures",
                "PropertyServices",
            ])
            ->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($longitude)) + 
                    sin(radians($latitude)) * 
                    sin(radians(latitude))
                )) AS distance
            "))
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('distance', 'ASC')
            ->limit($limit)
            ->get();
        } else {
            // Original query for non-location-based results
            $query = Property::with([
                "bookings",
                "variations",
                "initialGallery",
                "propertyAmenities",
                "propertyFeatures",
                "propertyServices",
            ])->orderBy("created_at", "desc");

            if ($request->has("search")) {
                $search = $request->input("search");
                $query
                    ->where("name", "LIKE", "%$search%")
                    ->orWhere("type", "LIKE", "%$search%")
                    ->orWhere("price", "LIKE", "%$search%");
            }

            $properties = $query->limit(28)->get();
        }

        // Optimize property images
        $properties->transform(function ($property) {
            if ($property->initialGallery && count($property->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($property->initialGallery as $image) {
                    // Assuming the image path is stored in a 'path' attribute
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path'])
                        ];
                    }
                }
                $property->optimizedGallery = $optimizedGallery;
            }
            return $property;
        });

        // Return appropriate response based on request type
        if ($request->wantsJson() || $request->has('latitude')) {
            return response()->json([
                'properties' => $properties
            ]);
        }

        return Inertia::render("Welcome", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "properties" => $properties,
            "flash" => session("flash"),
        ]);
    }

    public function restaurant(Request $request)
    {
        $foods = Food::all();

        return Inertia::render("Restaurant", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "foods" => $foods,
        ]);
    }

    public function allCars(Request $request)
    {
        // Check if location-based filtering is requested
        if ($request->has('latitude') && $request->has('longitude')) {
            $latitude = $request->query('latitude');
            $longitude = $request->query('longitude');
            $limit = 56;

            // Validate parameters
            if (!is_numeric($latitude) || !is_numeric($longitude)) {
                return response()->json([
                    'error' => 'Valid latitude and longitude are required',
                    'data' => []
                ], 400);
            }

            // Query for location-based results
            $cars = Car::with([
                "bookings",
                "initialGallery",
                "carFeatures",
            ])
            ->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($longitude)) + 
                    sin(radians($latitude)) * 
                    sin(radians(latitude))
                )) AS distance
            "))
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('distance', 'ASC')
            ->limit($limit)
            ->get();
        } else {
            // Original query for non-location-based results
            $query = Car::with([
                "bookings",
                "initialGallery",
                "carFeatures",
            ])->orderBy("created_at", "desc");

            if ($request->has("search")) {
                $search = $request->input("search");
                $query
                    ->where("make", "LIKE", "%$search%")
                    ->orWhere("model", "LIKE", "%$search%")
                    ->orWhere("type", "LIKE", "%$search%")
                    ->orWhere("price_per_day", "LIKE", "%$search%");
            }

            $cars = $query->limit(28)->get();
        }

        // Optimize car images
        $cars->transform(function ($car) {
            if ($car->initialGallery && count($car->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($car->initialGallery as $image) {
                    // Assuming the image path is stored in a 'path' attribute
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path'])
                        ];
                    }
                }
                $car->optimizedGallery = $optimizedGallery;
            }
            return $car;
        });

        // Return appropriate response based on request type
        if ($request->wantsJson() || $request->has('latitude')) {
            return response()->json([
                'cars' => $cars
            ]);
        }

        return Inertia::render("Cars", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "cars" => $cars,
        ]);
    }

    public function searchCars(Request $request)
    {
        $input = $request->all();

        $query = Car::with(["bookings", "initialGallery", "carFeatures"]);

        $latitude = null;
        $longitude = null;

        // 🌍 If location is provided, get coordinates
        if (!empty($input["location"])) {
            $location = $input["location"];

            $coordinates = $this->getCoordinatesFromLocation($location);
            if ($coordinates) {
                $latitude = $coordinates['latitude'];
                $longitude = $coordinates['longitude'];
            }
        }

        if ($request->filled(["checkIn", "checkOut"])) {
            $checkIn = Carbon::parse($input["checkIn"]);
            $checkOut = Carbon::parse($input["checkOut"]);

            $query->whereDoesntHave("bookings", function ($bookingQuery) use (
                $checkIn,
                $checkOut
            ) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where("start_date", "<", $checkOut)
                        ->where("end_date", ">", $checkIn);
                });
            });
        }

        // 📍 Distance Filter (only if lat/lng found)
        $query->when($latitude && $longitude, function ($query) use ($latitude, $longitude) {
            return $query->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($longitude)) + 
                    sin(radians($latitude)) * 
                    sin(radians(latitude))
                )) AS distance
            "))
            ->orderBy('distance', 'ASC');
        });

        $cars = $query->get();

        // Optimize car images
        $cars->transform(function ($car) {
            if ($car->initialGallery && count($car->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($car->initialGallery as $image) {
                    // Assuming the image path is stored in a 'path' attribute
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path']),
                            'responsive' => ImageOptimizer::getResponsiveUrls($image['path'])
                        ];
                    }
                }
                $car->optimizedGallery = $optimizedGallery;
            }
            
            // Also optimize the primary image if it exists
            if ($car->image) {
                $car->optimizedImage = ImageOptimizer::getOptimizedUrl($car->image);
                $car->responsiveImages = ImageOptimizer::getResponsiveUrls($car->image);
            }
            
            return $car;
        });

        $keys = env("VITE_GOOGLE_MAP_API");

        return Inertia::render("SearchCars", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "cars" => $cars,
            "keys" => $keys,
        ]);
    }


    private function getCoordinatesFromLocation($location)
    {
        $cacheKey = 'geocode:' . md5($location);
        
        return Cache::remember($cacheKey, 86400, function () use ($location) { // 24 hours cache
            // Try Nominatim first
            try {
                $nominatimResponse = \Illuminate\Support\Facades\Http::timeout(5)
                    ->retry(2, 100)
                    ->withHeaders([
                        'User-Agent' => 'YourAppName/1.0 (your@email.com)',
                        'Accept' => 'application/json',
                    ])
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'format' => 'json',
                        'q' => $location,
                        'limit' => 1
                    ]);
                
                if ($nominatimResponse->successful() && count($nominatimResponse->json()) > 0) {
                    $data = $nominatimResponse->json()[0];
                    return [
                        'latitude' => $data['lat'],
                        'longitude' => $data['lon']
                    ];
                }
            } catch (\Exception $e) {
                \Log::warning("Nominatim geocoding failed for: {$location}", ['error' => $e->getMessage()]);
            }
            
            // Fallback: Use a simple location database or return null
            return $this->getFallbackCoordinates($location);
        });
    }

    private function getFallbackCoordinates($location)
    {
        // Simple fallback for common locations
        $commonLocations = [
            'nairobi cbd' => ['latitude' => -1.2921, 'longitude' => 36.8219],
            'nairobi' => ['latitude' => -1.2921, 'longitude' => 36.8219],
            'mombasa' => ['latitude' => -4.0435, 'longitude' => 39.6682],
            'kisumu' => ['latitude' => -0.1022, 'longitude' => 34.7617],
            // Add more common locations as needed
        ];
        
        $normalizedLocation = strtolower(trim($location));
        
        if (array_key_exists($normalizedLocation, $commonLocations)) {
            return $commonLocations[$normalizedLocation];
        }
        
        return null;
    }

    public function rentNow(Request $request)
    {
        $car_id = $request->input("car_id");

        $car = Car::with([
            "category",
            "media",
            "bookings",
            "initialGallery",
            "carFeatures.feature",
            "user",
        ])
            ->where("id", "=", $car_id)
            ->first();

        // Optimize car images for rental page
        if ($car) {
            // Optimize gallery images
            if ($car->initialGallery && count($car->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($car->initialGallery as $image) {
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path']),
                            'responsive' => ImageOptimizer::getResponsiveUrls($image['path'], [320, 640, 800, 1024]),
                            'thumbnail' => ImageOptimizer::getOptimizedUrl($image['path'], 150, 80),
                            'preview' => ImageOptimizer::getOptimizedUrl($image['path'], 600, 85)
                        ];
                    }
                }
                $car->optimizedGallery = $optimizedGallery;
            }
            
            // Optimize primary image
            if ($car->image) {
                $car->optimizedImage = ImageOptimizer::getOptimizedUrl($car->image);
                $car->responsiveImages = ImageOptimizer::getResponsiveUrls($car->image, [320, 640, 800, 1024]);
                $car->heroImage = ImageOptimizer::getHighQualityOptimizedUrl($car->image, 1200, 90);
            }
            
            // Optimize media images if they exist
            if ($car->media && count($car->media) > 0) {
                $optimizedMedia = [];
                foreach ($car->media as $media) {
                    if (isset($media['path']) || isset($media['url'])) {
                        $path = $media['path'] ?? $media['url'];
                        $optimizedMedia[] = [
                            'original' => $path,
                            'optimized' => ImageOptimizer::getOptimizedUrl($path),
                            'thumbnail' => ImageOptimizer::getOptimizedUrl($path, 100, 75)
                        ];
                    }
                }
                $car->optimizedMedia = $optimizedMedia;
            }
            
            // Optimize user avatar if exists
            if ($car->user && $car->user->avatar) {
                $car->user->optimizedAvatar = ImageOptimizer::getOptimizedUrl($car->user->avatar, 100, 80);
            }
            
            // Optimize category image if exists
            if ($car->category && $car->category->image) {
                $car->category->optimizedImage = ImageOptimizer::getOptimizedUrl($car->category->image, 200, 85);
            }
        }

        return Inertia::render("RentNow", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "car" => $car,
            "flash" => session("flash"),
        ]);
    }
    

    public function hostCalendarPolicy()
    {
        return Inertia::render("HostCalendarPolicy");
    }

    public function privacyPolicy()
    {
        return Inertia::render("PrivacyPolicy");
    }

    public function termsAndConditions()
    {
        return Inertia::render("TermsAndConditions");
    }

    public function carBooking(Request $request)
    {
        $input = $request->all();
        $car = Car::with(["bookings", "initialGallery", "carFeatures"])
            ->where("id", "=", $input["car_id"])
            ->first();

        return Inertia::render("CarBooking", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "car" => $car,
        ]);
    }

    public function propertyBooking(Request $request)
    {
        $input = $request->all();
        $property = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities",
            "propertyFeatures",
            "PropertyServices",
            "variations",
        ])
            ->where("id", "=", $input["property_id"])
            ->first();

        return Inertia::render("PropertyBooking", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "property" => $property,
        ]);
    }

    public function propertyGallery(Request $request)
    {
        $input = $request->all();
        $property = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities",
            "propertyFeatures",
            "PropertyServices",
        ])
            ->where("id", "=", $input["property_id"])
            ->first();

        return Inertia::render("PropertyGallery", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "property" => $property,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->role_id === 1 || $user->role_id === "1";

        $company = Company::first();
        $p = 1 - $company->percentage / 100;

        // Calculate total revenue from property bookings (excluding external bookings)
        $propertyBookingTotal = Booking::where("status", "Paid")
            ->whereNull("external_booking") // Exclude external bookings
            ->when(true, function($q) {  // or some condition instead of true
                return $q->whereHas("user");
            })
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->with(['property', 'user'])
            ->get()
            ->sum(function ($booking) use ($p) {
                $platformPrice = $booking->property->platform_price ?? 0;
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);
                $days = $checkOut->diffInDays($checkIn);
                
                return ($platformPrice * $days) * $p; // Calculate net amount
            });

        $availablePropertyBookingTotal = Booking::where("status", "Paid")
            ->whereNull("external_booking") // Exclude external bookings
            ->when(true, function($q) {  // or some condition instead of true
                return $q->whereHas("user");
            })
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereNotNull("checked_in")
            ->with(['property', 'user'])
            ->get()
            ->sum(function ($booking) use ($p) {
                $platformPrice = $booking->property->platform_price ?? 0;
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);
                $days = $checkOut->diffInDays($checkIn);
                
                return ($platformPrice * $days) * $p; // Calculate net amount
            });

        // Calculate total revenue from car bookings (excluding external bookings)
        $carBookingTotal = CarBooking::where("status", "Paid")
            ->whereNull("external_booking")
            ->whereHas("car", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->with('car') // Load the 'car' relationship
            ->get()
            ->sum(function ($booking) use ($p) {
                $days = Carbon::parse($booking->end_date)->diffInDays(
                    Carbon::parse($booking->start_date)
                );
                return (($booking->car->platform_price ?? 0) * $days) * $p; // Calculate net amount
            });

        // Available car bookings (checked-in only)
        $availableCarBookingTotal = CarBooking::where("status", "Paid")
            ->whereNull("external_booking")
            ->whereNotNull("checked_in")
            ->whereHas("car", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->with('car')
            ->get()
            ->sum(function ($booking) use ($p) {
                $days = Carbon::parse($booking->end_date)->diffInDays(
                    Carbon::parse($booking->start_date)
                );
                return (($booking->car->platform_price ?? 0) * $days) * $p; // Calculate net amount
            });

        $availablePayouts = $availablePropertyBookingTotal + $availableCarBookingTotal;

        // Count user's cars and properties
        $carsCount = $isAdmin
            ? Car::count()
            : Car::where("user_id", $user->id)->count();
        $propertiesCount = $isAdmin
            ? Property::count()
            : Property::where("user_id", $user->id)->count();

        // Calculate pending payouts
        $pendingPayouts = $propertyBookingTotal + $carBookingTotal;

        // Recent transactions (excluding external bookings)
        $recentTransactions = collect([
            // Property bookings
            ...Booking::where("status", "Paid")
                ->whereNull("external_booking") // Exclude external bookings
                ->when(fn($q) => $q->whereHas("user"))
                ->whereHas("property", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with(["property", "user"])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($booking) use ($p) {
                    $days = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
                    $platformPrice = $booking->property->platform_price ?? 0;
                    $netAmount = ($platformPrice * $days) * $p;
                    
                    return [
                        "type" => "property",
                        "title" => $booking->property->title,
                        "amount" => $booking->total_price,
                        "platform_price" => $platformPrice,
                        "platform_charges" => $booking->property->platform_charges,
                        "net_amount" => $netAmount,
                        "guest" => $booking->user->name,
                        "date" => $booking->created_at,
                        "status" => "completed",
                        "days" => $days,
                    ];
                }),

            // Car bookings
            ...CarBooking::where("status", "Paid")
                ->whereNull("external_booking")
                ->when(fn($q) => $q->whereHas("user"))
                ->whereHas("car", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with(["car", "user"])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($booking) use ($p) {
                    $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
                    $platformPrice = $booking->car->platform_price ?? 0;
                    $netAmount = ($platformPrice * $days) * $p;
                    
                    return [
                        "type" => "car",
                        "title" => $booking->car->make . " " . $booking->car->model,
                        "amount" => $booking->total_price,
                        "platform_price" => $platformPrice,
                        "platform_charges" => $booking->car->platform_charges,
                        "net_amount" => $netAmount,
                        "guest" => $booking->user->name,
                        "date" => $booking->created_at,
                        "status" => "completed",
                        "days" => $days,
                    ];
                }),
        ])
            ->sortByDesc("date")
            ->take(10)
            ->values()
            ->all();

        // Monthly earnings - prioritize net amount calculations
        $monthlyEarnings = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth()->toDateString();
            $monthEnd = $month->copy()->endOfMonth()->toDateString();

            // Property Earnings (net amount)
            $propertyEarnings = Booking::where("status", "Paid")
                ->whereNull("external_booking")
                ->whereBetween("check_in_date", [$monthStart, $monthEnd])
                ->when(true, function($q) {
                    return $q->whereHas("user");
                })
                ->whereHas("property", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with('property')
                ->get()
                ->sum(function ($booking) use ($p) {
                    $platformPrice = $booking->property->platform_price ?? 0;
                    $days = Carbon::parse($booking->check_out_date)->diffInDays(
                        Carbon::parse($booking->check_in_date)
                    );
                    return ($platformPrice * $days) * $p; // Net amount
                });

            // Car Earnings (net amount)
            $carEarnings = CarBooking::where("status", "Paid")
                ->whereNull("external_booking")
                ->whereBetween("start_date", [$monthStart, $monthEnd])
                ->whereHas("car", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with('car')
                ->get()
                ->sum(function ($booking) use ($p) {
                    $platformPrice = $booking->car->platform_price ?? 0;
                    $days = Carbon::parse($booking->end_date)->diffInDays(
                        Carbon::parse($booking->start_date)
                    );
                    return ($platformPrice * $days) * $p; // Net amount
                });

            $monthlyEarnings[] = [
                "month" => $month->format("M Y"),
                "property_earnings" => $propertyEarnings,
                "car_earnings" => $carEarnings,
                "total" => $propertyEarnings + $carEarnings,
            ];
        }

        $repaymentAmount = Repayment::when($user->role_id != 1, function ($query) use ($user) {
            return $query->where('user_id', $user->id);
        })->sum('amount');

        return Inertia::render("Dashboard", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // Wallet specific data
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,
            "propertyBookingTotal" => $propertyBookingTotal,
            "carBookingTotal" => $carBookingTotal,
            "totalEarnings" => $propertyBookingTotal + $carBookingTotal,
            "pendingPayouts" => $pendingPayouts - $repaymentAmount,
            "availableBalance" => $availablePayouts - $repaymentAmount,
            "monthlyEarnings" => $monthlyEarnings,
            "recentTransactions" => $recentTransactions,

            // Performance metrics (excluding external bookings)
            "averagePropertyBookingValue" =>
                $propertiesCount > 0
                    ? $propertyBookingTotal / max($propertiesCount, 1)
                    : 0,
            "averageCarBookingValue" =>
                $carsCount > 0 ? $carBookingTotal / max($carsCount, 1) : 0,
            "totalBookingsCount" =>
                Booking::whereNull("external_booking")
                    ->when(fn($q) => $q->whereHas("user"))
                    ->whereHas(
                        "property",
                        fn($q) => !$isAdmin
                            ? $q->where("user_id", $user->id)
                            : null
                    )
                    ->count() +
                CarBooking::whereNull("external_booking")
                    ->when(fn($q) => $q->whereHas("user"))
                    ->whereHas(
                        "car",
                        fn($q) => !$isAdmin
                            ? $q->where("user_id", $user->id)
                            : null
                    )
                    ->count(),
        ]);
    }

    public function hostWallet(Request $request)
    {
        $user = Auth::user();

        $isAdmin = $user->role_id === 1 || $user->role_id === "1";

        // Calculate total revenue from property bookings (only non-external bookings)
        $propertyBookingTotal = Booking::where("status", "Paid")
            ->whereNull("external_booking") // Exclude external bookings
            ->when(true, function($q) {  // or some condition instead of true
                return $q->whereHas("user");
            })
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->with(['property', 'user'])
            ->get()
            ->sum(function ($booking) {
                $platformPrice = $booking->property->platform_price ?? 0;
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);
                $days = $checkOut->diffInDays($checkIn);
                
                return $platformPrice * $days;
            });

        $availablePropertyBookingTotal = Booking::where("status", "Paid")
            ->whereNull("external_booking") // Exclude external bookings
            ->when(true, function($q) {  // or some condition instead of true
                return $q->whereHas("user");
            })
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereNotNull("checked_in")
            ->with(['property', 'user'])
            ->get()
            ->sum(function ($booking) {
                $platformPrice = $booking->property->platform_price ?? 0;
                $checkIn = Carbon::parse($booking->check_in_date);
                $checkOut = Carbon::parse($booking->check_out_date);
                $days = $checkOut->diffInDays($checkIn);
                
                return $platformPrice * $days;
            });

        // Calculate total revenue from car bookings (only non-external bookings)
        $carBookingTotal = CarBooking::where("status", "Paid")
            ->whereNull("external_booking")
            ->whereHas("car", function ($query) use ($user) {
                $query->where("user_id", $user->id);
            })
            ->with('car') // Load the 'car' relationship
            ->get()
            ->sum(function ($booking) {
                $days = Carbon::parse($booking->end_date)->diffInDays(
                    Carbon::parse($booking->start_date)
                );
                return ($booking->car->platform_price ?? 0) * $days;
            });

        // Available car bookings (checked-in only)
        $availableCarBookingTotal = CarBooking::where("status", "Paid")
            ->whereNull("external_booking")
            ->whereNotNull("checked_in")
            ->whereHas("car", function ($query) use ($user) {
                $query->where("user_id", $user->id);
            })
            ->with('car')
            ->get()
            ->sum(function ($booking) {
                $days = Carbon::parse($booking->end_date)->diffInDays(
                    Carbon::parse($booking->start_date)
                );
                return ($booking->car->platform_price ?? 0) * $days;
            });

        // Count user's cars and properties
        $carsCount = Car::where("user_id", "=", $user->id)->count();
        $propertiesCount = Property::where("user_id", "=", $user->id)->count();
        $company = Company::first();
        $p = 1 - $company->percentage / 100;

        // Calculate pending payouts
        $pendingPayouts = ($propertyBookingTotal + $carBookingTotal) * $p;
        $availablePayouts = ($availablePropertyBookingTotal + $availableCarBookingTotal) * $p;

        // Recent transactions (only non-external bookings)
        $recentTransactions = collect([
            // Property bookings
            ...Booking::where("status", "Paid")
                ->whereNull("external_booking") 
                ->when(fn($q) => $q->whereHas("user"))
                ->whereHas("property", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with(["property", "user"])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($booking) use ($p) { // Add use ($p) here
                    $days = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
                    
                    // Calculate platform charges amount
                    $platformChargesAmount = $booking->property->platform_charges;
                    
                    return [
                        "type" => "property",
                        "title" => $booking->property->title,
                        "amount" => $booking->total_price,
                        "platform_price" => $booking->property->platform_price,
                        "platform_charges" => $platformChargesAmount,
                        "net_amount" => $booking->total_price * $p, // Subtract platform charges
                        "guest" => $booking->user->name,
                        "date" => $booking->created_at,
                        "status" => "completed",
                        "days" => $days,
                    ];
                }),

            // Car bookings
            ...CarBooking::where("status", "Paid")
                ->whereNull("external_booking")
                ->when(fn($q) => $q->whereHas("user"))
                ->whereHas("car", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->with(["car", "user"])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($booking) use ($p) { // Add use ($p) here
                    $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
                    
                    // Calculate platform charges amount
                    $platformChargesAmount = $booking->car->platform_charges;
                    
                    return [
                        "type" => "car",
                        "title" => $booking->car->make . " " . $booking->car->model,
                        "amount" => $booking->total_price,
                        "platform_price" => $booking->car->platform_price,
                        "platform_charges" => $platformChargesAmount,
                        "net_amount" => $booking->car->platform_price * $p, // Subtract platform charges
                        "guest" => $booking->user->name,
                        "date" => $booking->created_at,
                        "status" => "completed",
                        "days" => $days,
                    ];
                }),
        ])
        ->sortByDesc("date")
        ->take(10)
        ->values()
        ->all();


        $repaymentAmount = Repayment::when($user->role_id != 1, function ($query) use ($user) {
            return $query->where('user_id', $user->id);
        })->sum('amount');


        return Inertia::render("Wallet/Wallet", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // Wallet specific data
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,
            "propertyBookingTotal" => $propertyBookingTotal * $p,
            "carBookingTotal" => $carBookingTotal,
            "totalEarnings" => ($propertyBookingTotal * $p) + ($carBookingTotal * $p),
            "pendingPayouts" => $pendingPayouts - $repaymentAmount,
            "repaymentAmount" => $repaymentAmount,
            "availableBalance" => $availablePayouts - $repaymentAmount,
            "recentTransactions" => $recentTransactions,

            // Performance metrics (only non-external bookings)
            "averagePropertyBookingValue" =>
                $propertiesCount > 0
                    ? $propertyBookingTotal / max($propertiesCount, 1)
                    : 0,
            "averageCarBookingValue" =>
                $carsCount > 0 ? $carBookingTotal / max($carsCount, 1) : 0,
            "totalBookingsCount" =>
                Booking::whereNull("external_booking")
                    ->whereHas("property", function ($query) use ($user) {
                        $query->where("user_id", $user->id);
                    })
                    ->count() +
                CarBooking::whereNull("external_booking")
                    ->whereHas("car", function ($query) use ($user) {
                        $query->where("user_id", $user->id);
                    })
                    ->count(),
        ]);
    }

    public function activity(Request $request)
    {
        return Inertia::render("Activity", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }

    public function about(Request $request)
    {
        return Inertia::render("About", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }

    public function event(Request $request)
    {
        return Inertia::render("Event", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }

    public function contact(Request $request)
    {
        return Inertia::render("Contact", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }

    public function gallery(Request $request)
    {
        return Inertia::render("Gallery", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }

    public function propertyDetail(Request $request)
    {
        $query = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities.amenity",
            "propertyFeatures",
            "PropertyServices",
            "user",
            "variations",
        ])->orderBy("created_at", "desc");

        if ($request->has("id")) {
            $id = $request->input("id");
            $query->where("id", "=", $id);
        }

        $property = $query->first();

        // Optimize property images
        if ($property) {
            // Optimize main property images
            if ($property->initialGallery && count($property->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($property->initialGallery as $image) {
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path']),
                            'responsive' => ImageOptimizer::getResponsiveUrls($image['path'], [320, 640, 800, 1024, 1200]),
                            'thumbnail' => ImageOptimizer::getOptimizedUrl($image['path'], 150, 80)
                        ];
                    }
                }
                $property->optimizedGallery = $optimizedGallery;
            }
            
            // Optimize primary image
            if ($property->image) {
                $property->optimizedImage = ImageOptimizer::getOptimizedUrl($property->image);
                $property->responsiveImages = ImageOptimizer::getResponsiveUrls($property->image, [320, 640, 800, 1024, 1200]);
            }
            
            // Optimize user avatar if exists
            if ($property->user && $property->user->avatar) {
                $property->user->optimizedAvatar = ImageOptimizer::getOptimizedUrl($property->user->avatar, 100, 80);
            }
        }

        $similarProperties = [];
        if ($property) {
            $similarProperties = Property::with("initialGallery")
                ->where("type", $property->type)
                ->where("id", "!=", $property->id)
                ->orderBy("created_at", "desc")
                ->limit(4)
                ->get();
            
            // Optimize similar properties images
            $similarProperties->transform(function ($similarProperty) {
                if ($similarProperty->initialGallery && count($similarProperty->initialGallery) > 0) {
                    $optimizedGallery = [];
                    foreach ($similarProperty->initialGallery as $image) {
                        if (isset($image['path'])) {
                            $optimizedGallery[] = [
                                'original' => $image['path'],
                                'optimized' => ImageOptimizer::getOptimizedUrl($image['path'], 400, 75),
                                'thumbnail' => ImageOptimizer::getOptimizedUrl($image['path'], 150, 70)
                            ];
                        }
                    }
                    $similarProperty->optimizedGallery = $optimizedGallery;
                }
                
                if ($similarProperty->image) {
                    $similarProperty->optimizedImage = ImageOptimizer::getOptimizedUrl($similarProperty->image, 400, 75);
                }
                
                return $similarProperty;
            });
        }

        return Inertia::render("PropertyDetail", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "property" => $property,
            "similarProperties" => $similarProperties,
        ]);
    }

    public function services(Request $request)
    {
        $amenities = PropertyAmenity::select("name", "icon")
            ->distinct()
            ->get();
        $services = Service::all();

        return Inertia::render("Services", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "amenities" => $amenities,
            "services" => $services,
        ]);
    }

    public function properties(Request $request)
    {
        $query = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities",
            "propertyFeatures",
            "propertyServices",
        ])->orderBy("created_at", "desc");

        $input = $request->all();

        $latitude = null;
        $longitude = null;

        // 🌍 If location is provided, get coordinates
        if (!empty($input["location"])) {
            $location = $input["location"];

            $coordinates = $this->getCoordinatesFromLocation($location);
            if ($coordinates) {
                $latitude = $coordinates['latitude'];
                $longitude = $coordinates['longitude'];
            }
        }

        // ✅ Availability Check
        if ($request->filled(["checkIn", "checkOut"])) {
            $checkIn = Carbon::parse($input["checkIn"]);
            $checkOut = Carbon::parse($input["checkOut"]);

            $query->whereDoesntHave("bookings", function ($bookingQuery) use (
                $checkIn,
                $checkOut
            ) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where("check_in_date", "<", $checkOut)
                        ->where("check_out_date", ">", $checkIn);
                });
            });
        }

        // 📍 Distance Filter (only if lat/lng found)
        $query->when($latitude && $longitude, function ($query) use ($latitude, $longitude) {
            return $query->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($longitude)) + 
                    sin(radians($latitude)) * 
                    sin(radians(latitude))
                )) AS distance
            "))
            ->orderBy('distance', 'ASC');
        });

        $properties = $query->limit(56)->get();

        // Optimize property images
        $properties->transform(function ($property) {
            if ($property->initialGallery && count($property->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($property->initialGallery as $image) {
                    // Assuming the image path is stored in a 'path' attribute
                    if (isset($image['path'])) {
                        $optimizedGallery[] = [
                            'original' => $image['path'],
                            'optimized' => ImageOptimizer::getOptimizedUrl($image['path']),
                            'responsive' => ImageOptimizer::getResponsiveUrls($image['path'])
                        ];
                    }
                }
                $property->optimizedGallery = $optimizedGallery;
            }
            
            // Also optimize the primary image if it exists
            if ($property->image) {
                $property->optimizedImage = ImageOptimizer::getOptimizedUrl($property->image);
                $property->responsiveImages = ImageOptimizer::getResponsiveUrls($property->image);
            }
            
            return $property;
        });

        $keys = env("VITE_GOOGLE_MAP_API");

        return Inertia::render("Properties", [
            "properties" => $properties,
            "filters" => $request->all(),
            "keys" => $keys,
        ]);
    }

    public function showJob(Job $job)
    {
        return Inertia::render("Jobs/Joby", [
            "job" => $job,
        ]);
    }
}
