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
use App\Models\User;
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
        $limit = 56;

        $properties = Property::with([
            "initialGallery",
        ])
        ->withCount(['bookings as bookings_count' => function($query) {
            $query->where('status', 'Paid');
        }])
        ->orderBy('bookings_count', 'DESC')
        ->limit($limit)
        ->get();

        $properties->transform(function ($property) {
            if ($property->relationLoaded('initialGallery') && $property->initialGallery) {
                $validGallery = collect($property->initialGallery)->filter(function ($image) {
                    if (empty($image['path']) && empty($image['image'])) {
                        return false;
                    }

                    $imagePath = $image['path'] ?? $image['image'];

                    // Skip if path is null or empty
                    if (empty($imagePath)) {
                        return false;
                    }

                    // Handle both relative paths and full URLs
                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        return true; // External URL, assume it exists
                    }

                    // Local storage path
                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);

                    return file_exists($storagePath) && is_file($storagePath);
                })->values(); // Reset keys

                $property->setRelation('initialGallery', $validGallery);
            }

            return $property;
        });

        return Inertia::render("Welcome", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
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
        $limit = 56;

        // Query for location-based results
        $cars = Car::with([
            "initialGallery"
        ])
        ->withCount(['bookings as bookings_count' => function($query) {
            $query->where('status', 'Paid');
        }])
        ->orderBy('bookings_count', 'DESC')
        ->limit($limit)
        ->get();

        $cars->transform(function ($car) {
            // First, filter and validate the initialGallery images
            if ($car->relationLoaded('initialGallery') && $car->initialGallery) {
                $validGallery = collect($car->initialGallery)->filter(function ($image) {
                    if (empty($image['path']) && empty($image['image'])) {
                        return false;
                    }

                    $imagePath = $image['path'] ?? $image['image'];

                    // Skip if path is null or empty
                    if (empty($imagePath)) {
                        return false;
                    }

                    // Handle both relative paths and full URLs
                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        return true; // External URL, assume it exists
                    }

                    // Local storage path
                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);

                    return file_exists($storagePath) && is_file($storagePath);
                })->values(); // Reset keys

                $car->setRelation('initialGallery', $validGallery);
            }

            // Then create optimized gallery from the validated images
            if ($car->initialGallery && count($car->initialGallery) > 0) {
                $optimizedGallery = [];
                foreach ($car->initialGallery as $image) {
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

        $query = Car::with(["bookings", "initialGallery", "carFeatures", "user"]);

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

        // 🚗 Filter out cars that are booked during the selected dates
        if ($request->filled(["checkIn", "checkOut"])) {
            $checkIn = Carbon::parse($input["checkIn"])->startOfDay();
            $checkOut = Carbon::parse($input["checkOut"])->endOfDay();

            $query->whereDoesntHave("bookings", function ($bookingQuery) use ($checkIn, $checkOut) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where(function ($innerQ) use ($checkIn, $checkOut) {
                        // Booking starts during the selected period
                        $innerQ->where('start_date', '>=', $checkIn)
                            ->where('start_date', '<=', $checkOut);
                    })->orWhere(function ($innerQ) use ($checkIn, $checkOut) {
                        // Booking ends during the selected period
                        $innerQ->where('end_date', '>=', $checkIn)
                            ->where('end_date', '<=', $checkOut);
                    })->orWhere(function ($innerQ) use ($checkIn, $checkOut) {
                        // Booking spans the entire selected period
                        $innerQ->where('start_date', '<=', $checkIn)
                            ->where('end_date', '>=', $checkOut);
                    })->orWhere(function ($innerQ) use ($checkIn, $checkOut) {
                        // Selected period spans the entire booking
                        $innerQ->where('start_date', '>=', $checkIn)
                            ->where('end_date', '<=', $checkOut);
                    });
                })->whereIn('status', ['paid', 'Paid', 'confirmed', 'Confirmed']);
            });
        }

        // 📍 Location-based filtering with radius
        $query->when($latitude && $longitude, function ($query) use ($latitude, $longitude) {
            $radius = 10; // 10km radius

            return $query->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($longitude)) +
                    sin(radians($latitude)) *
                    sin(radians(latitude))
                )) AS distance
            "))
            ->having('distance', '<=', $radius)
            ->orderBy('distance', 'ASC');
        });

        $cars = $query->get();

        // Optimize car images with validation
        $cars->transform(function ($car) {
            // First, filter and validate the initialGallery images
            if ($car->relationLoaded('initialGallery') && $car->initialGallery) {
                $validGallery = collect($car->initialGallery)->filter(function ($image) {
                    if (empty($image['path']) && empty($image['image'])) {
                        return false;
                    }

                    $imagePath = $image['path'] ?? $image['image'];

                    // Skip if path is null or empty
                    if (empty($imagePath)) {
                        return false;
                    }

                    // Handle both relative paths and full URLs
                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        return true; // External URL, assume it exists
                    }

                    // Local storage path
                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);

                    return file_exists($storagePath) && is_file($storagePath);
                })->values(); // Reset keys

                $car->setRelation('initialGallery', $validGallery);
            }

            // Then create simple gallery from the validated images (without ImageOptimizer)
            if ($car->initialGallery && count($car->initialGallery) > 0) {
                $simpleGallery = [];
                foreach ($car->initialGallery as $image) {
                    $imagePath = $image['path'] ?? $image['image'];
                    if (isset($imagePath)) {
                        $simpleGallery[] = [
                            'original' => $imagePath,
                            'optimized' => $imagePath, // Use original as fallback
                            'responsive' => [
                                'small' => $imagePath,
                                'medium' => $imagePath,
                                'large' => $imagePath
                            ]
                        ];
                    }
                }
                $car->optimizedGallery = $simpleGallery;
            }

            // Also handle the primary image if it exists and is valid (without ImageOptimizer)
            if ($car->image) {
                $imagePath = $car->image;
                $isValid = false;

                // Validate primary image
                if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                    $isValid = true; // External URL
                } else {
                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);
                    $isValid = file_exists($storagePath) && is_file($storagePath);
                }

                if ($isValid) {
                    $car->optimizedImage = $imagePath; // Use original image
                    $car->responsiveImages = [
                        'small' => $imagePath,
                        'medium' => $imagePath,
                        'large' => $imagePath
                    ];
                }
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

        $company = Company::first();

        return Inertia::render("CarBooking", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
            "car" => $car,
            "company"=> $company
        ]);
    }

    public function propertyBooking(Request $request)
    {
        $input = $request->all();
        $company = Company::first();
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
            "company"=> $company
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
        $platformPercentage = $company->percentage / 100;
        $referralPercentage = $company->referral_percentage / 100;
        $hostPercentage = 1 - $platformPercentage;

        // =========================================================================
        // 1. DIRECT HOST EARNINGS (Properties and Cars owned by the host)
        // =========================================================================

        // DIRECT PROPERTY BOOKINGS (host's own properties)
        $directPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id") // Direct bookings only
            ->whereHas("user")
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->get();

        $directPropertyBookingTotal = $directPropertyBookings->sum(function ($booking) use ($hostPercentage) {
            return $booking->payments->sum('amount') * $hostPercentage;
        });

        $availableDirectPropertyBookingTotal = $directPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        // DIRECT CAR BOOKINGS (host's own cars)
        $directCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id") // Direct bookings only
            ->whereHas("user")
            ->whereHas("car", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereHas('payments')
            ->with(['payments', 'car'])
            ->get();

        $directCarBookingTotal = $directCarBookings->sum(function ($booking) use ($hostPercentage) {
            return $booking->payments->sum('amount') * $hostPercentage;
        });

        $availableDirectCarBookingTotal = $directCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        // =========================================================================
        // 2. MARKUP EARNINGS (Profits from other hosts' properties and cars)
        // =========================================================================

        // MARKUP PROPERTY BOOKINGS (other hosts' properties with markup)
        $markupPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->where("markup_user_id", $user->id) // This host added markup
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->get();

        $markupPropertyBookingTotal = $markupPropertyBookings->sum(function ($booking) {
            return $booking->markup_profit; // Already includes platform fee deduction
        });

        $availableMarkupPropertyBookingTotal = $markupPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // MARKUP CAR BOOKINGS (other hosts' cars with markup)
        $markupCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->where("markup_user_id", $user->id) // This host added markup
            ->whereHas('payments')
            ->with(['payments', 'car'])
            ->get();

        $markupCarBookingTotal = $markupCarBookings->sum(function ($booking) {
            return $booking->markup_profit; // Already includes platform fee deduction
        });

        $availableMarkupCarBookingTotal = $markupCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // =========================================================================
        // 3. REFERRAL EARNINGS (From User model - already calculated)
        // =========================================================================
        $referralEarnings = $user->earnings_from_referral;

        // =========================================================================
        // 4. COMBINE ALL EARNINGS
        // =========================================================================

        // COUNTS
        $carsCount = $isAdmin ? Car::count() : Car::where("user_id", $user->id)->count();
        $propertiesCount = $isAdmin ? Property::count() : Property::where("user_id", $user->id)->count();

        // TOTAL EARNINGS (All sources)
        $totalDirectEarnings = $directPropertyBookingTotal + $directCarBookingTotal;
        $totalMarkupEarnings = $markupPropertyBookingTotal + $markupCarBookingTotal;
        $totalEarnings = $totalDirectEarnings + $totalMarkupEarnings + $referralEarnings;

        // AVAILABLE PAYOUTS (checked-in bookings only)
        $availableDirectPayouts = $availableDirectPropertyBookingTotal + $availableDirectCarBookingTotal;
        $availableMarkupPayouts = $availableMarkupPropertyBookingTotal + $availableMarkupCarBookingTotal;
        $availablePayouts = $availableDirectPayouts + $availableMarkupPayouts;

        // PENDING PAYOUTS (all earnings sources)
        $pendingDirectPayouts = ($directPropertyBookingTotal - $availableDirectPropertyBookingTotal) +
                            ($directCarBookingTotal - $availableDirectCarBookingTotal);
        $pendingMarkupPayouts = ($markupPropertyBookingTotal - $availableMarkupPropertyBookingTotal) +
                            ($markupCarBookingTotal - $availableMarkupCarBookingTotal);
        $pendingPayouts = $pendingDirectPayouts + $pendingMarkupPayouts;

        // REPAYMENT AMOUNT
        $repaymentAmount = Repayment::when(!$isAdmin, function ($query) use ($user) {
            return $query->where('user_id', $user->id);
        })
        ->where('status', 'Approved')
        ->sum('amount');

        // AVAILABLE BALANCE (checked-in earnings minus repayments)
        $availableBalance = $availablePayouts - $repaymentAmount;

        // =========================================================================
        // RECENT TRANSACTIONS - COMBINED (All earnings sources)
        // =========================================================================
        $recentTransactions = collect([
            // Direct property bookings
            ...$directPropertyBookings
                ->take(3)
                ->map(function ($booking) use ($hostPercentage, $platformPercentage) {
                    $totalPayments = $booking->payments->sum('amount');
                    $days = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
                    $platformFee = $totalPayments * $platformPercentage;
                    $hostEarnings = $totalPayments * $hostPercentage;

                    return [
                        "type" => "property",
                        "title" => $booking->property->property_name ?? 'N/A',
                        "total_amount" => $totalPayments,
                        "platform_fee" => round($platformFee, 2),
                        "net_amount" => round($hostEarnings, 2),
                        "guest" => $booking->user->name ?? 'Unknown',
                        "date" => $booking->created_at,
                        "status" => $booking->checked_in ? "completed" : "pending",
                        "days" => $days,
                        "earnings_type" => "direct_host",
                        "booking_number" => $booking->number
                    ];
                }),

            // Direct car bookings
            ...$directCarBookings
                ->take(3)
                ->map(function ($booking) use ($hostPercentage, $platformPercentage) {
                    $totalPayments = $booking->payments->sum('amount');
                    $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
                    $platformFee = $totalPayments * $platformPercentage;
                    $hostEarnings = $totalPayments * $hostPercentage;

                    return [
                        "type" => "car",
                        "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? ''),
                        "total_amount" => $totalPayments,
                        "platform_fee" => round($platformFee, 2),
                        "net_amount" => round($hostEarnings, 2),
                        "guest" => $booking->user->name ?? 'Unknown',
                        "date" => $booking->created_at,
                        "status" => $booking->checked_in ? "completed" : "pending",
                        "days" => $days,
                        "earnings_type" => "direct_host",
                        "booking_number" => $booking->number
                    ];
                }),

            // Markup property bookings
            ...$markupPropertyBookings
                ->take(2)
                ->map(function ($booking) {
                    $markupProfit = $booking->markup_profit;
                    $totalPayments = $booking->payments->sum('amount');

                    return [
                        "type" => "property",
                        "title" => $booking->property->property_name ?? 'N/A' . " (Markup)",
                        "total_amount" => $totalPayments,
                        "platform_fee" => 0, // Already deducted in markup_profit
                        "net_amount" => round($markupProfit, 2),
                        "guest" => $booking->user->name ?? 'Unknown',
                        "date" => $booking->created_at,
                        "status" => $booking->checked_in ? "completed" : "pending",
                        "days" => Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date)),
                        "earnings_type" => "markup_profit",
                        "booking_number" => $booking->number
                    ];
                }),

            // Markup car bookings
            ...$markupCarBookings
                ->take(2)
                ->map(function ($booking) {
                    $markupProfit = $booking->markup_profit;
                    $totalPayments = $booking->payments->sum('amount');

                    return [
                        "type" => "car",
                        "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? '') . " (Markup)",
                        "total_amount" => $totalPayments,
                        "platform_fee" => 0, // Already deducted in markup_profit
                        "net_amount" => round($markupProfit, 2),
                        "guest" => $booking->user->name ?? 'Unknown',
                        "date" => $booking->created_at,
                        "status" => $booking->checked_in ? "completed" : "pending",
                        "days" => Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date)),
                        "earnings_type" => "markup_profit",
                        "booking_number" => $booking->number
                    ];
                }),
        ])
        ->sortByDesc("date")
        ->take(10)
        ->values()
        ->all();

        // =========================================================================
        // MONTHLY EARNINGS - COMBINED (All earnings sources)
        // =========================================================================
        $monthlyEarnings = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            // Direct Property Earnings
            $directPropertyEarnings = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->whereNull("markup_user_id")
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->whereHas("property", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($hostPercentage) {
                    return $booking->payments->sum('amount') * $hostPercentage;
                });

            // Direct Car Earnings
            $directCarEarnings = CarBooking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->whereNull("markup_user_id")
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->whereHas("car", function ($query) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $query->where("user_id", $user->id);
                    }
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($hostPercentage) {
                    return $booking->payments->sum('amount') * $hostPercentage;
                });

            // Markup Property Earnings
            $markupPropertyEarnings = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->where("markup_user_id", $user->id)
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) {
                    return $booking->markup_profit;
                });

            // Markup Car Earnings
            $markupCarEarnings = CarBooking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->where("markup_user_id", $user->id)
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) {
                    return $booking->markup_profit;
                });

            $totalMonthlyEarnings = $directPropertyEarnings + $directCarEarnings + $markupPropertyEarnings + $markupCarEarnings;

            $monthlyEarnings[] = [
                "month" => $month->format("M Y"),
                "property_earnings" => round($directPropertyEarnings + $markupPropertyEarnings, 2),
                "car_earnings" => round($directCarEarnings + $markupCarEarnings, 2),
                "direct_earnings" => round($directPropertyEarnings + $directCarEarnings, 2),
                "markup_earnings" => round($markupPropertyEarnings + $markupCarEarnings, 2),
                "total" => round($totalMonthlyEarnings, 2),
                "earnings_type" => "combined"
            ];
        }

        // =========================================================================
        // FINAL CALCULATIONS
        // =========================================================================
        $totalBookingsCount = Booking::whereNull("external_booking")
            ->where(function($query) use ($user, $isAdmin) {
                $query->whereHas("property", function ($q) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $q->where("user_id", $user->id);
                    }
                })->orWhere("markup_user_id", $user->id);
            })
            ->count() +
            CarBooking::whereNull("external_booking")
            ->where(function($query) use ($user, $isAdmin) {
                $query->whereHas("car", function ($q) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $q->where("user_id", $user->id);
                    }
                })->orWhere("markup_user_id", $user->id);
            })
            ->count();

        $hostsWithOverdrafts = [];
        if ($isAdmin) {
            $hostsWithOverdrafts = $this->getHostsWithOverdrafts();
        }

        return Inertia::render("Dashboard", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // COMBINED EARNINGS DATA (Direct + Markup + Referral)
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,
            "propertyBookingTotal" => round($directPropertyBookingTotal + $markupPropertyBookingTotal, 2),
            "carBookingTotal" => round($directCarBookingTotal + $markupCarBookingTotal, 2),
            "totalEarnings" => round($totalEarnings, 2),
            "pendingPayouts" => round($pendingPayouts, 2),
            "availableBalance" => round(max(0, $availableBalance), 2),
            "repaymentAmount" => round($repaymentAmount, 2),
            "monthlyEarnings" => $monthlyEarnings,
            "recentTransactions" => $recentTransactions,
            'hostsWithOverdrafts' => $hostsWithOverdrafts,

            // Earnings breakdown
            "earnings_breakdown" => [
                "direct_property_earnings" => round($directPropertyBookingTotal, 2),
                "direct_car_earnings" => round($directCarBookingTotal, 2),
                "markup_property_earnings" => round($markupPropertyBookingTotal, 2),
                "markup_car_earnings" => round($markupCarBookingTotal, 2),
                "referral_earnings" => round($referralEarnings, 2),
                "total_direct_earnings" => round($totalDirectEarnings, 2),
                "total_markup_earnings" => round($totalMarkupEarnings, 2),
            ],

            // Performance metrics
            "averagePropertyBookingValue" => $propertiesCount > 0 ? round(($directPropertyBookingTotal + $markupPropertyBookingTotal) / $propertiesCount, 2) : 0,
            "averageCarBookingValue" => $carsCount > 0 ? round(($directCarBookingTotal + $markupCarBookingTotal) / $carsCount, 2) : 0,
            "totalBookingsCount" => $totalBookingsCount,

            // Earnings type information
            "earnings_type" => "combined_earnings",
            "description" => "Showing all earnings: direct properties/cars + markup profits + referral commissions",
            "platform_percentage" => $company->percentage,
            "host_percentage" => round($hostPercentage * 100, 2)
        ]);
    }

    private function getHostsWithOverdrafts()
    {
        $company = Company::first();
        $platformPercentage = $company->percentage / 100;
        $hostPercentage = 1 - $platformPercentage;

        // Get all hosts (users who are not admins)
        $hosts = User::where('role_id', '!=', 1)->get();

        $hostsWithOverdrafts = [];

        foreach ($hosts as $host) {
            // Calculate total earnings from checked-in bookings (DIRECT HOST EARNINGS ONLY)
            $availablePropertyEarnings = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->whereNull("markup_user_id")
                ->whereNotNull("checked_in")
                ->whereHas("user")
                ->whereHas("property", function ($query) use ($host) {
                    $query->where("user_id", $host->id);
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($hostPercentage) {
                    return $booking->payments->sum('amount') * $hostPercentage;
                });

            $availableCarEarnings = CarBooking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->whereNull("markup_user_id")
                ->whereNotNull("checked_in")
                ->whereHas("car", function ($query) use ($host) {
                    $query->where("user_id", $host->id);
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($hostPercentage) {
                    return $booking->payments->sum('amount') * $hostPercentage;
                });

            $totalAvailableEarnings = $availablePropertyEarnings + $availableCarEarnings;

            // Calculate repayments for this host
            $repaymentAmount = Repayment::where('user_id', $host->id)
                ->where('status', 'Approved')
                ->sum('amount');

            // Calculate available balance (DIRECT HOST EARNINGS ONLY)
            $availableBalance = $totalAvailableEarnings - $repaymentAmount;

            // Check if host is in overdraft
            $isInOverdraft = $availableBalance < 0;
            $overdraftAmount = $isInOverdraft ? abs($availableBalance) : 0;

            if ($isInOverdraft) {
                $hostsWithOverdrafts[] = [
                    'id' => $host->id,
                    'name' => $host->name,
                    'email' => $host->email,
                    'available_balance' => round($availableBalance, 2),
                    'overdraft_amount' => round($overdraftAmount, 2),
                    'overdraft_limit' => $host->overdraft_limit,
                    'overdraft_enabled' => $host->overdraft_enabled,
                    'properties_count' => Property::where('user_id', $host->id)->count(),
                    'cars_count' => Car::where('user_id', $host->id)->count(),
                    'total_earnings' => round($totalAvailableEarnings, 2),
                    'direct_host_earnings' => round($totalAvailableEarnings, 2),
                    'markup_earnings' => round($host->earnings_from_markups, 2),
                    'repayment_amount' => round($repaymentAmount, 2),
                    'earnings_type' => 'direct_host'
                ];
            }
        }

        // Sort by overdraft amount (highest first)
        usort($hostsWithOverdrafts, function($a, $b) {
            return $b['overdraft_amount'] <=> $a['overdraft_amount'];
        });

        return $hostsWithOverdrafts;
    }

    public function hostWallet(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->role_id === 1 || $user->role_id === "1";

        // Get company percentages
        $company = Company::first();
        $platformPercentage = $company->percentage / 100;
        $referralPercentage = $company->referral_percentage / 100;
        $hostPercentage = 1 - $platformPercentage;

        // =========================================================================
        // 1. DIRECT HOST EARNINGS (Properties and Cars owned by the host)
        // =========================================================================

        // DIRECT PROPERTY BOOKINGS (host's own properties)
        $directPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id") // Direct bookings only
            ->whereHas("user")
            ->whereHas("property", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->get();

        $directPropertyBookingTotal = $directPropertyBookings->sum(function ($booking) use ($hostPercentage) {
            return $booking->payments->sum('amount') * $hostPercentage;
        });

        $availableDirectPropertyBookingTotal = $directPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        // DIRECT CAR BOOKINGS (host's own cars)
        $directCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id") // Direct bookings only
            ->whereHas("user")
            ->whereHas("car", function ($query) use ($user, $isAdmin) {
                if (!$isAdmin) {
                    $query->where("user_id", $user->id);
                }
            })
            ->whereHas('payments')
            ->with(['payments', 'car'])
            ->get();

        $directCarBookingTotal = $directCarBookings->sum(function ($booking) use ($hostPercentage) {
            return $booking->payments->sum('amount') * $hostPercentage;
        });

        $availableDirectCarBookingTotal = $directCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        // =========================================================================
        // 2. MARKUP EARNINGS (Profits from other hosts' properties and cars)
        // =========================================================================

        // MARKUP PROPERTY BOOKINGS (other hosts' properties with markup)
        $markupPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->where("markup_user_id", $user->id) // This host added markup
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->get();

        $markupPropertyBookingTotal = $markupPropertyBookings->sum(function ($booking) {
            return $booking->markup_profit; // Already includes platform fee deduction
        });

        $availableMarkupPropertyBookingTotal = $markupPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // MARKUP CAR BOOKINGS (other hosts' cars with markup)
        $markupCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->where("markup_user_id", $user->id) // This host added markup
            ->whereHas('payments')
            ->with(['payments', 'car'])
            ->get();

        $markupCarBookingTotal = $markupCarBookings->sum(function ($booking) {
            return $booking->markup_profit; // Already includes platform fee deduction
        });

        $availableMarkupCarBookingTotal = $markupCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // =========================================================================
        // 3. REFERRAL EARNINGS (From User model - already calculated)
        // =========================================================================
        $referralEarnings = $user->earnings_from_referral;

        // =========================================================================
        // 4. COMBINE ALL EARNINGS
        // =========================================================================

        // COUNTS
        $carsCount = $isAdmin ? Car::count() : Car::where("user_id", $user->id)->count();
        $propertiesCount = $isAdmin ? Property::count() : Property::where("user_id", $user->id)->count();

        // TOTAL EARNINGS (All sources)
        $totalDirectEarnings = $directPropertyBookingTotal + $directCarBookingTotal;
        $totalMarkupEarnings = $markupPropertyBookingTotal + $markupCarBookingTotal;
        $totalEarnings = $totalDirectEarnings + $totalMarkupEarnings + $referralEarnings;

        // AVAILABLE PAYOUTS (checked-in bookings only)
        $availableDirectPayouts = $availableDirectPropertyBookingTotal + $availableDirectCarBookingTotal;
        $availableMarkupPayouts = $availableMarkupPropertyBookingTotal + $availableMarkupCarBookingTotal;
        $availablePayouts = $availableDirectPayouts + $availableMarkupPayouts;

        // PENDING PAYOUTS (all earnings sources)
        $pendingDirectPayouts = ($directPropertyBookingTotal - $availableDirectPropertyBookingTotal) +
                            ($directCarBookingTotal - $availableDirectCarBookingTotal);
        $pendingMarkupPayouts = ($markupPropertyBookingTotal - $availableMarkupPropertyBookingTotal) +
                            ($markupCarBookingTotal - $availableMarkupCarBookingTotal);
        $pendingPayouts = $pendingDirectPayouts + $pendingMarkupPayouts;

        // REPAYMENT AMOUNT
        $repaymentAmount = Repayment::when(!$isAdmin, function ($query) use ($user) {
            return $query->where('user_id', $user->id);
        })
        ->where('status', 'Approved')
        ->sum('amount');

        // AVAILABLE BALANCE (checked-in earnings minus repayments)
        $availableBalance = $availablePayouts - $repaymentAmount;

        // Ensure available balance doesn't go negative
        $availableBalance = max(0, $availableBalance);

        // =========================================================================
        // RECENT TRANSACTIONS - COMBINED (All earnings sources)
        // =========================================================================
        $recentTransactions = collect();

        // 1. Direct Property Bookings (host's own properties)
        foreach ($directPropertyBookings->take(3) as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $days = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
            $platformFee = $totalPayments * $platformPercentage;
            $hostEarnings = $totalPayments * $hostPercentage;

            $referralAmount = $booking->referral_code ? round($totalPayments * $referralPercentage, 2) : 0;

            $recentTransactions->push([
                "type" => "property",
                "title" => $booking->property->property_name ?? 'N/A',
                "total_amount" => round($totalPayments, 2),
                "platform_fee" => round($platformFee, 2),
                "net_amount" => round($hostEarnings, 2),
                "referral_amount" => $referralAmount,
                "guest" => $booking->user->name ?? 'Unknown',
                "date" => $booking->created_at,
                "status" => $booking->checked_in ? "completed" : "pending",
                "days" => $days,
                "referral_code" => $booking->referral_code,
                "earnings_type" => "direct_host",
                "booking_number" => $booking->number
            ]);
        }

        // 2. Direct Car Bookings (host's own cars)
        foreach ($directCarBookings->take(3) as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
            $platformFee = $totalPayments * $platformPercentage;
            $hostEarnings = $totalPayments * $hostPercentage;

            $referralAmount = $booking->referral_code ? round($totalPayments * $referralPercentage, 2) : 0;

            $recentTransactions->push([
                "type" => "car",
                "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? ''),
                "total_amount" => round($totalPayments, 2),
                "platform_fee" => round($platformFee, 2),
                "net_amount" => round($hostEarnings, 2),
                "guest" => $booking->user->name ?? 'Unknown',
                "date" => $booking->created_at,
                "referral_amount" => $referralAmount,
                "status" => $booking->checked_in ? "completed" : "pending",
                "days" => $days,
                "referral_code" => $booking->referral_code,
                "earnings_type" => "direct_host",
                "booking_number" => $booking->number
            ]);
        }

        // 3. Markup Property Bookings (other hosts' properties with markup)
        foreach ($markupPropertyBookings->take(2) as $booking) {
            $markupProfit = $booking->markup_profit;
            $totalPayments = $booking->payments->sum('amount');

            $recentTransactions->push([
                "type" => "property",
                "title" => $booking->property->property_name ?? 'N/A' . " (Markup)",
                "total_amount" => round($totalPayments, 2),
                "platform_fee" => 0, // Already deducted in markup_profit
                "net_amount" => round($markupProfit, 2),
                "referral_amount" => 0,
                "guest" => $booking->user->name ?? 'Unknown',
                "date" => $booking->created_at,
                "status" => $booking->checked_in ? "completed" : "pending",
                "days" => Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date)),
                "referral_code" => null,
                "earnings_type" => "markup_profit",
                "booking_number" => $booking->number
            ]);
        }

        // 4. Markup Car Bookings (other hosts' cars with markup)
        foreach ($markupCarBookings->take(2) as $booking) {
            $markupProfit = $booking->markup_profit;
            $totalPayments = $booking->payments->sum('amount');

            $recentTransactions->push([
                "type" => "car",
                "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? '') . " (Markup)",
                "total_amount" => round($totalPayments, 2),
                "platform_fee" => 0, // Already deducted in markup_profit
                "net_amount" => round($markupProfit, 2),
                "referral_amount" => 0,
                "guest" => $booking->user->name ?? 'Unknown',
                "date" => $booking->created_at,
                "status" => $booking->checked_in ? "completed" : "pending",
                "days" => Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date)),
                "referral_code" => null,
                "earnings_type" => "markup_profit",
                "booking_number" => $booking->number
            ]);
        }

        // 5. Referral Earnings (from completed referral bookings)
        $referralBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->where("referral_code", $user->referral_code)
            ->whereNotNull("checked_in")
            ->whereNotNull("checked_out")
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->latest()
            ->limit(2)
            ->get();

        foreach ($referralBookings as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $referralEarnings = $this->calculateReferralEarnings($totalPayments, $referralPercentage, $platformPercentage * 100);

            $recentTransactions->push([
                "type" => "property",
                "title" => $booking->property->property_name ?? 'N/A' . " (Referral)",
                "total_amount" => round($totalPayments, 2),
                "platform_fee" => 0,
                "net_amount" => round($referralEarnings, 2),
                "referral_amount" => round($referralEarnings, 2),
                "guest" => $booking->user->name ?? 'Unknown',
                "date" => $booking->created_at,
                "status" => "completed",
                "days" => Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date)),
                "referral_code" => $booking->referral_code,
                "earnings_type" => "referral",
                "booking_number" => $booking->number
            ]);
        }

        // Sort all transactions by date and take top 10
        $recentTransactions = $recentTransactions
            ->sortByDesc("date")
            ->take(10)
            ->values()
            ->all();

        // =========================================================================
        // FINAL CALCULATIONS
        // =========================================================================
        $totalBookingsCount = Booking::whereNull("external_booking")
            ->where(function($query) use ($user, $isAdmin) {
                $query->whereHas("property", function ($q) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $q->where("user_id", $user->id);
                    }
                })->orWhere("markup_user_id", $user->id);
            })
            ->count() +
            CarBooking::whereNull("external_booking")
            ->where(function($query) use ($user, $isAdmin) {
                $query->whereHas("car", function ($q) use ($user, $isAdmin) {
                    if (!$isAdmin) {
                        $q->where("user_id", $user->id);
                    }
                })->orWhere("markup_user_id", $user->id);
            })
            ->count();

        return Inertia::render("Wallet/Wallet", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // =========================================================================
            // COMBINED EARNINGS (Direct + Markup + Referral)
            // =========================================================================
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,

            // Total earnings breakdown
            "propertyBookingTotal" => round($directPropertyBookingTotal + $markupPropertyBookingTotal, 2),
            "carBookingTotal" => round($directCarBookingTotal + $markupCarBookingTotal, 2),
            "totalEarnings" => round($totalEarnings, 2),

            // Balance information (includes ALL earnings minus repayments)
            "pendingPayouts" => round($pendingPayouts, 2),
            "repaymentAmount" => round($repaymentAmount, 2),
            "availableBalance" => round($availableBalance, 2),

            // Recent transactions with all earnings types
            "recentTransactions" => $recentTransactions,

            // Performance metrics
            "averagePropertyBookingValue" => $propertiesCount > 0 ? round(($directPropertyBookingTotal + $markupPropertyBookingTotal) / $propertiesCount, 2) : 0,
            "averageCarBookingValue" => $carsCount > 0 ? round(($directCarBookingTotal + $markupCarBookingTotal) / $carsCount, 2) : 0,
            "totalBookingsCount" => $totalBookingsCount,

            // Earnings breakdown for display
            "earnings_breakdown" => [
                "direct_property_earnings" => round($directPropertyBookingTotal, 2),
                "direct_car_earnings" => round($directCarBookingTotal, 2),
                "markup_property_earnings" => round($markupPropertyBookingTotal, 2),
                "markup_car_earnings" => round($markupCarBookingTotal, 2),
                "referral_earnings" => round($referralEarnings, 2),
                "total_direct_earnings" => round($totalDirectEarnings, 2),
                "total_markup_earnings" => round($totalMarkupEarnings, 2),
            ],

            // Earnings type information
            "earnings_type" => "combined_earnings", // Now includes direct + markup + referral
            "platform_percentage" => $company->percentage,
            "host_percentage" => round($hostPercentage * 100, 2),
            "referral_percentage" => $company->referral_percentage
        ]);
    }

    /**
     * Helper method to calculate referral earnings (same as in User model)
     */
    private function calculateReferralEarnings($bookingTotal, $referralPercentage, $platformPercentage = 15)
    {
        // First calculate platform commission
        $platformCommission = ($bookingTotal * $platformPercentage) / 100;

        // Then calculate referral earnings as percentage of platform commission
        $referralEarnings = ($platformCommission * $referralPercentage) / 100;

        return $referralEarnings;
    }
    /**
     * Get markup earnings separately
     */
    public function getMarkupEarnings(Request $request)
    {
        $user = Auth::user();

        $markupEarnings = $user->getDetailedReferralEarnings();

        return response()->json([
            'markup_earnings' => [
                'available_markup_balance' => round($user->balance, 2),
                'pending_markup_earnings' => round($user->pending_balance, 2),
                'upcoming_markup_earnings' => round($user->upcoming_balance, 2),
                'total_markup_earnings' => round($user->total_earnings, 2),
                'earnings_from_referrals' => round($user->earnings_from_referral, 2),
                'earnings_from_markups' => round($user->earnings_from_markups, 2),
                'detailed_breakdown' => $markupEarnings,
                'can_add_markup' => $user->can_add_markup,
                'is_host' => $user->isHost()
            ]
        ]);
    }

    /**
     * Get complete financial summary including both direct and markup earnings
     */
    public function getCompleteFinancialSummary(Request $request)
    {
        $user = Auth::user();

        // Direct host earnings from properties and cars
        $company = Company::first();
        $platformPercentage = $company->percentage / 100;
        $hostPercentage = 1 - $platformPercentage;

        // Direct property earnings
        $directPropertyEarnings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id")
            ->whereHas("property", function ($query) use ($user) {
                $query->where("user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments'])
            ->get()
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        // Direct car earnings
        $directCarEarnings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id")
            ->whereHas("car", function ($query) use ($user) {
                $query->where("user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments'])
            ->get()
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        $totalDirectEarnings = $directPropertyEarnings + $directCarEarnings;

        // Markup and referral earnings from User model
        $markupSummary = $user->getFinancialSummary();
        $detailedEarnings = $user->getDetailedReferralEarnings();

        // Repayments
        $repaymentAmount = Repayment::where('user_id', $user->id)
            ->where('status', 'Approved')
            ->sum('amount');

        return response()->json([
            'complete_financial_summary' => [
                'direct_host_earnings' => [
                    'property_earnings' => round($directPropertyEarnings, 2),
                    'car_earnings' => round($directCarEarnings, 2),
                    'total_direct_earnings' => round($totalDirectEarnings, 2),
                    'description' => 'Earnings from your own properties and cars'
                ],
                'markup_referral_earnings' => [
                    'earnings_from_markups' => round($user->earnings_from_markups, 2),
                    'earnings_from_referrals' => round($user->earnings_from_referral, 2),
                    'total_markup_referral_earnings' => round($user->total_earnings, 2),
                    'available_balance' => round($user->balance, 2),
                    'pending_earnings' => round($user->pending_balance, 2),
                    'upcoming_earnings' => round($user->upcoming_balance, 2),
                    'description' => 'Earnings from markups and referral commissions'
                ],
                'combined_totals' => [
                    'total_all_earnings' => round($totalDirectEarnings + $user->total_earnings, 2),
                    'total_available_balance' => round($totalDirectEarnings + $user->balance - $repaymentAmount, 2),
                    'total_repayments' => round($repaymentAmount, 2),
                    'net_available_balance' => round(max(0, $totalDirectEarnings + $user->balance - $repaymentAmount), 2)
                ],
                'detailed_breakdown' => $detailedEarnings,
                'platform_percentage' => $company->percentage,
                'host_percentage' => round($hostPercentage * 100, 2)
            ]
        ]);
    }

    /**
     * Admin method to view platform earnings
     */
    public function getPlatformEarnings(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $company = Company::first();
        $platformPercentage = $company->percentage / 100;

        // Platform earnings from all bookings (both direct and markup)
        $propertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereHas('payments')
            ->with(['payments'])
            ->get();

        $carBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereHas('payments')
            ->with(['payments'])
            ->get();

        $totalPlatformEarnings = $propertyBookings->sum(function ($booking) use ($platformPercentage) {
            return $booking->payments->sum('amount') * $platformPercentage;
        }) + $carBookings->sum(function ($booking) use ($platformPercentage) {
            return $booking->payments->sum('amount') * $platformPercentage;
        });

        return response()->json([
            'platform_earnings' => [
                'total_platform_earnings' => round($totalPlatformEarnings, 2),
                'platform_percentage' => $company->percentage,
                'total_bookings' => $propertyBookings->count() + $carBookings->count(),
                'breakdown' => [
                    'from_property_bookings' => round($propertyBookings->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }), 2),
                    'from_car_bookings' => round($carBookings->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }), 2),
                    'from_direct_bookings' => round($propertyBookings->whereNull('markup_user_id')->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }) + $carBookings->whereNull('markup_user_id')->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }), 2),
                    'from_markup_bookings' => round($propertyBookings->whereNotNull('markup_user_id')->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }) + $carBookings->whereNotNull('markup_user_id')->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }), 2)
                ]
            ]
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
            "user"
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

        // ✅ Availability Check - Fixed version
        if ($request->filled(["checkIn", "checkOut"])) {
            $checkIn = Carbon::parse($input["checkIn"]);
            $checkOut = Carbon::parse($input["checkOut"]);

            $query->whereDoesntHave("bookings", function ($bookingQuery) use ($checkIn, $checkOut) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where("check_in_date", "<", $checkOut)
                    ->where("check_out_date", ">", $checkIn)
                    ->whereIn('status', ['Paid', 'paid']); // Only consider paid bookings
                });
            });
        }

        // 👥 Guests Filter (adults + children)
        if ($request->filled(["adults", "children"])) {
            $adults = (int) $input["adults"];
            $children = (int) $input["children"];
            $totalGuests = $adults + $children;

            $query->where(function ($q) use ($adults, $children, $totalGuests) {
                // Filter by maximum capacity
                $q->where(function ($subQ) use ($adults, $children, $totalGuests) {
                    $subQ->where('max_adults', '>=', $adults)
                        ->where('max_children', '>=', $children);
                });

            });
        }

        // 📍 Distance Filter (only if lat/lng found)
        $query->when($latitude && $longitude, function ($query) use ($latitude, $longitude) {
            $radius = 10; // km

            return $query->select('*', DB::raw("
                (6371 * acos(
                    cos(radians($latitude)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians($longitude)) +
                    sin(radians($latitude)) *
                    sin(radians(latitude))
                )) AS distance
            "))
            ->having('distance', '<=', $radius)
            ->orderBy('distance', 'ASC');
        });

        $properties = $query->limit(56)->get();

        // Optimize property images with validation
        $properties->transform(function ($property) {
            // First, filter and validate the initialGallery images
            if ($property->relationLoaded('initialGallery') && $property->initialGallery) {
                $validGallery = collect($property->initialGallery)->filter(function ($image) {
                    if (empty($image['path']) && empty($image['image'])) {
                        return false;
                    }

                    $imagePath = $image['path'] ?? $image['image'];

                    // Skip if path is null or empty
                    if (empty($imagePath)) {
                        return false;
                    }

                    // Handle both relative paths and full URLs
                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        return true; // External URL, assume it exists
                    }

                    // Local storage path
                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);

                    return file_exists($storagePath) && is_file($storagePath);
                })->values(); // Reset keys

                $property->setRelation('initialGallery', $validGallery);
            }

            // Then create simple gallery without optimization
            if ($property->initialGallery && count($property->initialGallery) > 0) {
                $simpleGallery = [];
                foreach ($property->initialGallery as $image) {
                    $imagePath = $image['path'] ?? $image['image'];
                    if (isset($imagePath)) {
                        $simpleGallery[] = [
                            'original' => $imagePath,
                            'optimized' => $imagePath, // Fallback to original
                            'responsive' => [
                                'small' => $imagePath,
                                'medium' => $imagePath,
                                'large' => $imagePath
                            ]
                        ];
                    }
                }
                $property->optimizedGallery = $simpleGallery;
            }

            // Also handle the primary image
            if ($property->image) {
                $property->optimizedImage = $property->image;
                $property->responsiveImages = [
                    'small' => $property->image,
                    'medium' => $property->image,
                    'large' => $property->image
                ];
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


    public function listProperty(){
          return Inertia::render("ListProperty", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),
        ]);
    }
}
