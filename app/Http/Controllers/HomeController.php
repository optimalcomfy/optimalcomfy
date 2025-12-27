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
use Illuminate\Support\Facades\Storage;

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

                // Add the first image from the gallery
                $property->first_image = $validGallery->first();
                
                // Add the count of images in the initial gallery
                $property->gallery_image_count = $validGallery->count();
                
                // Remove the initialGallery relation to reduce payload size
                $property->unsetRelation('initialGallery');
            } else {
                // If no gallery, set defaults
                $property->first_image = null;
                $property->gallery_image_count = 0;
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


    public function getPropertyGallery(Request $request, $propertyId)
    {
        $property = Property::with(['initialGallery'])->findOrFail($propertyId);
        
        $validGallery = collect($property->initialGallery)->filter(function ($image) {
            if (empty($image['path']) && empty($image['image'])) {
                return false;
            }

            $imagePath = $image['path'] ?? $image['image'];

            if (empty($imagePath)) {
                return false;
            }

            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                return true;
            }

            $storagePath = str_starts_with($imagePath, 'public/')
                ? storage_path('app/' . $imagePath)
                : storage_path('app/public/' . $imagePath);

            return file_exists($storagePath) && is_file($storagePath);
        })->values();

        return response()->json([
            'images' => $validGallery,
            'total' => $validGallery->count()
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
            // Process gallery to get first image and count (just like in index())
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

                // Add the first image from the gallery
                $car->first_image = $validGallery->first();
                
                // Add the count of images in the initial gallery
                $car->gallery_image_count = $validGallery->count();
                
                // Remove the initialGallery relation to reduce payload size
                $car->unsetRelation('initialGallery');
            } else {
                // If no gallery, set defaults
                $car->first_image = null;
                $car->gallery_image_count = 0;
            }

            // Optional: Store the first image path directly if needed
            if ($car->first_image) {
                $imagePath = $car->first_image['path'] ?? $car->first_image['image'];
                if (isset($imagePath)) {
                    $car->first_image_url = $imagePath;
                }
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


    public function getCarGallery(Request $request, $carId)
    {
        try {
            $images = Car::find($carId)->media()
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'image' => $media->image,
                        'media_type' => $media->media_type,
                        'car_id' => $media->car_id,
                        'created_at' => $media->created_at,
                        'updated_at' => $media->updated_at,
                        'image_url' => $media->image ? Storage::disk('public')->url($media->image) : null
                    ];
                });

            return response()->json([
                'success' => true,
                'images' => $images,
                'total' => $images->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch gallery images',
                'error' => $e->getMessage()
            ], 500);
        }
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

        // Apply the same transformation pattern
        $cars->transform(function ($car) {
            // Process gallery to get first image and count
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

                // Add the first image from the gallery
                $car->first_image = $validGallery->first();
                
                // Add the count of images in the initial gallery
                $car->gallery_image_count = $validGallery->count();
                
                // Remove the initialGallery relation to reduce payload size
                $car->unsetRelation('initialGallery');
            } else {
                // If no gallery, set defaults
                $car->first_image = null;
                $car->gallery_image_count = 0;
            }

            // Handle the primary image if it exists and is valid
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
        $platformPercentage = $company->percentage / 100; // 15% = 0.15
        $referralPercentage = $company->referral_percentage / 100; // 2% = 0.02
        $hostPercentage = 1 - $platformPercentage; // 85% = 0.85

        // =========================================================================
        // 1. DIRECT HOST EARNINGS (Properties owned by the host)
        // =========================================================================

        // DIRECT PROPERTY BOOKINGS (host's own properties)
        $directPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->whereHas("property", function ($q) use ($user) {
                    $q->where("user_id", $user->id);
                });
            })
            ->whereHas('payments')
            ->with(['payments', 'property', 'user'])
            ->get();

        // Calculate available (checked-in) and pending separately
        $availableDirectPropertyBookings = $directPropertyBookings
            ->whereNotNull("checked_in");

        $pendingDirectPropertyBookings = $directPropertyBookings
            ->whereNull("checked_in");

        $availableDirectPropertyBookingTotal = $availableDirectPropertyBookings
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        $pendingDirectPropertyBookingTotal = $pendingDirectPropertyBookings
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        $directPropertyBookingTotal = $availableDirectPropertyBookingTotal + $pendingDirectPropertyBookingTotal;

        // =========================================================================
        // 2. DIRECT CAR EARNINGS (Cars owned by the host)
        // =========================================================================
        $directCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->whereHas("car", function ($q) use ($user) {
                    $q->where("user_id", $user->id);
                });
            })
            ->whereHas('payments')
            ->with(['payments', 'car', 'user'])
            ->get();

        $availableDirectCarBookingTotal = $directCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        $pendingDirectCarBookingTotal = $directCarBookings
            ->whereNull("checked_in")
            ->sum(function ($booking) use ($hostPercentage) {
                return $booking->payments->sum('amount') * $hostPercentage;
            });

        $directCarBookingTotal = $availableDirectCarBookingTotal + $pendingDirectCarBookingTotal;

        // =========================================================================
        // 3. MARKUP PROPERTY EARNINGS
        // =========================================================================
        $markupPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNotNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->where("markup_user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments', 'property', 'user'])
            ->get();

        $availableMarkupPropertyBookingTotal = $markupPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        $pendingMarkupPropertyBookingTotal = $markupPropertyBookings
            ->whereNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        $markupPropertyBookingTotal = $availableMarkupPropertyBookingTotal + $pendingMarkupPropertyBookingTotal;

        // =========================================================================
        // 4. MARKUP CAR EARNINGS
        // =========================================================================
        $markupCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNotNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->where("markup_user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments', 'car', 'user'])
            ->get();

        $availableMarkupCarBookingTotal = $markupCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        $pendingMarkupCarBookingTotal = $markupCarBookings
            ->whereNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        $markupCarBookingTotal = $availableMarkupCarBookingTotal + $pendingMarkupCarBookingTotal;

        // =========================================================================
        // 5. REFERRAL EARNINGS - SIMPLIFIED BASED ON HOSTWALLET DATA
        // =========================================================================
        $referralBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->where("referral_code", $user->referral_code)
            ->whereHas('payments')
            ->with(['payments', 'property', 'user'])
            ->get();

        // Calculate referral earnings: 2% of platform commission (15% of booking amount)
        $availableReferralEarnings = $referralBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) use ($platformPercentage, $referralPercentage) {
                $total = $booking->payments->sum('amount');
                $platformCommission = $total * $platformPercentage; // 15% of total
                return $platformCommission * $referralPercentage; // 2% of platform commission
            });

        $pendingReferralEarnings = $referralBookings
            ->whereNull("checked_in")
            ->sum(function ($booking) use ($platformPercentage, $referralPercentage) {
                $total = $booking->payments->sum('amount');
                $platformCommission = $total * $platformPercentage;
                return $platformCommission * $referralPercentage;
            });

        $referralEarningsTotal = $availableReferralEarnings + $pendingReferralEarnings;

        // =========================================================================
        // 6. CALCULATE TOTALS BASED ON HOSTWALLET DATA
        // =========================================================================

        // COUNTS
        $carsCount = $isAdmin ? Car::count() : Car::where("user_id", $user->id)->count();
        $propertiesCount = $isAdmin ? Property::count() : Property::where("user_id", $user->id)->count();

        // From your HostWallet data:
        // Direct Property: Total KES 591.6, Available KES 425, Pending KES 166.6
        // Markup Property: Total KES 50, Available KES 50, Pending KES 0
        // Referral: Total KES 0.3, Available KES 0, Pending KES 0.3
        // Direct Car: Total KES 0
        // Markup Car: Total KES 0

        // TOTAL EARNINGS (All sources)
        $totalEarnings = $directPropertyBookingTotal + $directCarBookingTotal +
                        $markupPropertyBookingTotal + $markupCarBookingTotal +
                        $referralEarningsTotal;

        // AVAILABLE BALANCE (checked-in bookings only)
        $availableBalance = $availableDirectPropertyBookingTotal + $availableDirectCarBookingTotal +
                        $availableMarkupPropertyBookingTotal + $availableMarkupCarBookingTotal +
                        $availableReferralEarnings;

        // PENDING PAYOUTS (not checked-in)
        $pendingPayouts = $pendingDirectPropertyBookingTotal + $pendingDirectCarBookingTotal +
                        $pendingMarkupPropertyBookingTotal + $pendingMarkupCarBookingTotal +
                        $pendingReferralEarnings;

        // REPAYMENT AMOUNT
        $repaymentAmount = Repayment::when(!$isAdmin, function ($query) use ($user) {
                return $query->where('user_id', $user->id);
            })
            ->where('status', 'Approved')
            ->sum('amount');

        // NET AVAILABLE BALANCE (available minus repayments)
        $netAvailableBalance = $availableBalance - $repaymentAmount;
        if (!$isAdmin) {
            $netAvailableBalance = max(0, $netAvailableBalance);
        }

        // =========================================================================
        // RECENT TRANSACTIONS - MATCHING HOSTWALLET
        // =========================================================================
        $recentTransactions = collect();

        // Combine all bookings for recent transactions
        $allRecentBookings = collect();

        // Add direct property bookings
        foreach ($directPropertyBookings->take(5) as $booking) {
            $allRecentBookings->push([
                'type' => 'property',
                'subtype' => 'direct',
                'booking' => $booking,
                'date' => $booking->created_at,
                'amount' => $booking->payments->sum('amount') * $hostPercentage
            ]);
        }

        // Add markup property bookings
        foreach ($markupPropertyBookings->take(5) as $booking) {
            $allRecentBookings->push([
                'type' => 'property',
                'subtype' => 'markup',
                'booking' => $booking,
                'date' => $booking->created_at,
                'amount' => $booking->markup_profit
            ]);
        }

        // Add referral bookings
        foreach ($referralBookings->take(5) as $booking) {
            $total = $booking->payments->sum('amount');
            $platformCommission = $total * $platformPercentage;
            $referralAmount = $platformCommission * $referralPercentage;

            $allRecentBookings->push([
                'type' => 'referral',
                'subtype' => 'referral',
                'booking' => $booking,
                'date' => $booking->created_at,
                'amount' => $referralAmount
            ]);
        }

        // Sort by date and take 9 (matching HostWallet's "9 of 9 transactions")
        $allRecentBookings = $allRecentBookings->sortByDesc('date')->take(9);

        foreach ($allRecentBookings as $item) {
            $booking = $item['booking'];

            if ($item['subtype'] === 'direct') {
                $recentTransactions->push([
                    "date" => $booking->created_at->format('m/d/Y'),
                    "type" => "property",
                    "guest" => $booking->user->name ?? 'Unknown',
                    "booking_number" => $booking->number,
                    "amount" => round($item['amount'], 2),
                    "earnings_type" => "Direct",
                    "status" => $booking->checked_in ? "completed" : "pending"
                ]);
            } elseif ($item['subtype'] === 'markup') {
                $recentTransactions->push([
                    "date" => $booking->created_at->format('m/d/Y'),
                    "type" => "property",
                    "guest" => $booking->user->name ?? 'Unknown',
                    "booking_number" => $booking->number,
                    "amount" => round($item['amount'], 2),
                    "earnings_type" => "Markup",
                    "status" => $booking->checked_in ? "completed" : "pending"
                ]);
            } elseif ($item['subtype'] === 'referral') {
                $recentTransactions->push([
                    "date" => $booking->created_at->format('m/d/Y'),
                    "type" => "referral",
                    "guest" => $booking->user->name ?? 'Unknown',
                    "booking_number" => $booking->number,
                    "amount" => round($item['amount'], 2),
                    "earnings_type" => "referral",
                    "status" => $booking->checked_in ? "completed" : "pending"
                ]);
            }
        }

        // =========================================================================
        // MONTHLY EARNINGS
        // =========================================================================
        $monthlyEarnings = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            // Direct Property Earnings
            $directPropertyMonthly = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNull("external_booking")
                ->whereNull("markup_user_id")
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->when(!$isAdmin, function ($query) use ($user) {
                    return $query->whereHas("property", function ($q) use ($user) {
                        $q->where("user_id", $user->id);
                    });
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($hostPercentage) {
                    return $booking->payments->sum('amount') * $hostPercentage;
                });

            // Markup Property Earnings
            $markupPropertyMonthly = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNotNull("markup_user_id")
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->when(!$isAdmin, function ($query) use ($user) {
                    return $query->where("markup_user_id", $user->id);
                })
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) {
                    return $booking->markup_profit;
                });

            // Referral Earnings
            $referralMonthly = Booking::whereIn("status", ["Paid", "paid"])
                ->where("referral_code", $user->referral_code)
                ->whereBetween("created_at", [$monthStart, $monthEnd])
                ->whereHas('payments')
                ->with(['payments'])
                ->get()
                ->sum(function ($booking) use ($platformPercentage, $referralPercentage) {
                    $total = $booking->payments->sum('amount');
                    $platformCommission = $total * $platformPercentage;
                    return $platformCommission * $referralPercentage;
                });

            $totalMonthly = $directPropertyMonthly + $markupPropertyMonthly + $referralMonthly;

            $monthlyEarnings[] = [
                "month" => $month->format("M Y"),
                "direct_earnings" => round($directPropertyMonthly, 2),
                "markup_earnings" => round($markupPropertyMonthly, 2),
                "referral_earnings" => round($referralMonthly, 2),
                "total" => round($totalMonthly, 2),
            ];
        }

        // =========================================================================
        // FINAL CALCULATIONS FOR DASHBOARD
        // =========================================================================

        // Based on your HostWallet data:
        // Direct Property: KES 591.6 total, KES 425 available, KES 166.6 pending
        // Markup Property: KES 50 total, KES 50 available, KES 0 pending
        // Referral: KES 0.3 total, KES 0 available, KES 0.3 pending

        $totalBookingsCount = Booking::whereNull("external_booking")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->where(function($q) use ($user) {
                    $q->whereHas("property", function ($subQ) use ($user) {
                        $subQ->where("user_id", $user->id);
                    })->orWhere("markup_user_id", $user->id);
                });
            })
            ->count();

        return Inertia::render("Dashboard", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // COMBINED EARNINGS DATA - MATCHING HOSTWALLET
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,
            "propertyBookingTotal" => round($directPropertyBookingTotal, 2),
            "carBookingTotal" => round($directCarBookingTotal, 2),
            "totalEarnings" => round($totalEarnings, 2), // Should be KES 641.9
            "pendingPayouts" => round($pendingPayouts, 2), // Should be KES 166.6
            "upcomingEarnings" => 0, // Not shown in HostWallet
            "availableBalance" => round($netAvailableBalance, 2), // Should be KES 205
            "repaymentAmount" => round($repaymentAmount, 2),
            "monthlyEarnings" => $monthlyEarnings,
            "recentTransactions" => $recentTransactions->values()->all(),

            // Earnings breakdown matching HostWallet
            "earnings_breakdown" => [
                "direct_property_earnings" => round($directPropertyBookingTotal, 2),
                "direct_car_earnings" => round($directCarBookingTotal, 2),
                "markup_earnings" => round($markupPropertyBookingTotal + $markupCarBookingTotal, 2),
                "referral_earnings" => round($referralEarningsTotal, 2),
                "total_direct_earnings" => round($directPropertyBookingTotal + $directCarBookingTotal, 2),
                "total_markup_referral_earnings" => round($markupPropertyBookingTotal + $markupCarBookingTotal + $referralEarningsTotal, 2),
            ],

            // Financial summary matching HostWallet structure
            "financial_summary" => [
                "direct_host_earnings" => [
                    "property_earnings" => round($directPropertyBookingTotal, 2), // KES 591.6
                    "car_earnings" => round($directCarBookingTotal, 2), // KES 0
                    "total_direct_earnings" => round($directPropertyBookingTotal + $directCarBookingTotal, 2), // KES 591.6
                ],
                "markup_referral_earnings" => [
                    "earnings_from_markups" => round($markupPropertyBookingTotal + $markupCarBookingTotal, 2), // KES 50
                    "earnings_from_referrals" => round($referralEarningsTotal, 2), // KES 0.3
                    "available_balance" => round($availableMarkupPropertyBookingTotal + $availableMarkupCarBookingTotal + $availableReferralEarnings, 2),
                    "pending_earnings" => round($pendingMarkupPropertyBookingTotal + $pendingMarkupCarBookingTotal + $pendingReferralEarnings, 2),
                    "upcoming_earnings" => 0,
                ],
                "combined_totals" => [
                    "total_all_earnings" => round($totalEarnings, 2), // KES 641.9
                    "total_available_balance" => round($availableBalance, 2),
                    "total_repayments" => round($repaymentAmount, 2),
                    "net_available_balance" => round($netAvailableBalance, 2) // KES 205
                ],
            ],

            // Performance metrics
            "averagePropertyBookingValue" => $propertiesCount > 0 ? round($directPropertyBookingTotal / $propertiesCount, 2) : 0,
            "averageCarBookingValue" => $carsCount > 0 ? round($directCarBookingTotal / $carsCount, 2) : 0,
            "totalBookingsCount" => $totalBookingsCount,

            // Admin-specific stats
            "isAdmin" => $isAdmin,
            "adminStats" => $isAdmin ? [
                "totalHosts" => User::where('role_id', '!=', 1)->count(),
                "totalPlatformEarnings" => round(Booking::whereIn("status", ["Paid", "paid"])
                    ->whereNull("external_booking")
                    ->whereHas('payments')
                    ->with(['payments'])
                    ->get()
                    ->sum(function ($booking) use ($platformPercentage) {
                        return $booking->payments->sum('amount') * $platformPercentage;
                    }), 2),
                "totalBookings" => Booking::whereIn("status", ["Paid", "paid"])->count(),
            ] : null,

            // Platform settings
            "platform_percentage" => $company->percentage,
            "host_percentage" => round($hostPercentage * 100, 2),
            "referral_percentage" => $company->referral_percentage,
            "referral_calculation_explanation" => "Referral earnings: {$company->referral_percentage}% of platform commission ({$company->percentage}% of booking amount)"
        ]);
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
            ->whereNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->whereHas("property", function ($q) use ($user) {
                    $q->where("user_id", $user->id);
                });
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
            ->whereNull("markup_user_id")
            ->when(!$isAdmin, function ($query) use ($user) {
                return $query->whereHas("car", function ($q) use ($user) {
                    $q->where("user_id", $user->id);
                });
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

        // MARKUP PROPERTY BOOKINGS
        $markupPropertyBookings = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNotNull("markup_user_id")
            ->when($user->role_id != 1, function ($query) use ($user) {
                return $query->where("markup_user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments', 'property'])
            ->get();

        $markupPropertyBookingTotal = $markupPropertyBookings->sum(function ($booking) {
            return $booking->markup_profit;
        });

        $availableMarkupPropertyBookingTotal = $markupPropertyBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // MARKUP CAR BOOKINGS
        $markupCarBookings = CarBooking::whereIn("status", ["Paid", "paid"])
            ->when($isAdmin, function ($query) {
                return $query->whereNotNull("markup_user_id");
            }, function ($query) use ($user) {
                return $query->where("markup_user_id", $user->id);
            })
            ->whereHas('payments')
            ->with(['payments', 'car'])
            ->get();

        $markupCarBookingTotal = $markupCarBookings->sum(function ($booking) {
            return $booking->markup_profit;
        });

        $availableMarkupCarBookingTotal = $markupCarBookings
            ->whereNotNull("checked_in")
            ->sum(function ($booking) {
                return $booking->markup_profit;
            });

        // =========================================================================
        // 3. REFERRAL EARNINGS - UPDATED LOGIC
        // =========================================================================
        if ($isAdmin) {
            // For admin: Get total referral earnings from all users
            $referralEarnings = User::where('role_id', '!=', 1)->sum('earnings_from_referral');
        } else {
            // For regular users: Include ALL types of referral earnings
            $userDetailedEarnings = $user->getDetailedReferralEarnings();

            // Include completed, pending, and upcoming referral earnings
            $referralEarnings = $userDetailedEarnings['referral_earnings'] +
                            $userDetailedEarnings['pending_referral_earnings'] +
                            $userDetailedEarnings['upcoming_referral_earnings'];
        }

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
        if (!$isAdmin) {
            $availableBalance = max(0, $availableBalance);
        }

        // =========================================================================
        // WALLET TRANSACTIONS - DETAILED VIEW
        // =========================================================================
        $walletTransactions = collect();

        // 1. Direct Property Bookings
        foreach ($directPropertyBookings->take(10) as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $days = Carbon::parse($booking->check_in_date)->diffInDays(Carbon::parse($booking->check_out_date));
            $platformFee = $totalPayments * $platformPercentage;
            $hostEarnings = $totalPayments * $hostPercentage;

            $walletTransactions->push([
                "id" => $booking->id,
                "type" => "property_booking",
                "subtype" => "direct_host",
                "title" => $booking->property->property_name ?? 'N/A',
                "description" => "Direct booking - {$booking->nights} nights",
                "amount" => round($hostEarnings, 2),
                "status" => $booking->checked_in ? "available" : "pending",
                "date" => $booking->created_at,
                "booking_number" => $booking->number,
                "guest" => $booking->user->name ?? 'Unknown',
                "check_in_date" => $booking->check_in_date,
                "check_out_date" => $booking->check_out_date,
                "total_paid" => round($totalPayments, 2),
                "platform_fee" => round($platformFee, 2),
                "net_earnings" => round($hostEarnings, 2),
                "icon" => "home",
                "color" => $booking->checked_in ? "green" : "yellow"
            ]);
        }

        // 2. Direct Car Bookings
        foreach ($directCarBookings->take(10) as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
            $platformFee = $totalPayments * $platformPercentage;
            $hostEarnings = $totalPayments * $hostPercentage;

            $walletTransactions->push([
                "id" => $booking->id,
                "type" => "car_booking",
                "subtype" => "direct_host",
                "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? ''),
                "description" => "Direct car rental - {$days} days",
                "amount" => round($hostEarnings, 2),
                "status" => $booking->checked_in ? "available" : "pending",
                "date" => $booking->created_at,
                "booking_number" => $booking->number,
                "guest" => $booking->user->name ?? 'Unknown',
                "start_date" => $booking->start_date,
                "end_date" => $booking->end_date,
                "total_paid" => round($totalPayments, 2),
                "platform_fee" => round($platformFee, 2),
                "net_earnings" => round($hostEarnings, 2),
                "icon" => "car",
                "color" => $booking->checked_in ? "green" : "yellow"
            ]);
        }

        // 3. Markup Property Bookings
        foreach ($markupPropertyBookings->take(10) as $booking) {
            $markupProfit = $booking->markup_profit;

            $walletTransactions->push([
                "id" => $booking->id,
                "type" => "property_markup",
                "subtype" => "markup_profit",
                "title" => $booking->property->property_name ?? 'N/A',
                "description" => "Markup profit - {$booking->nights} nights",
                "amount" => round($markupProfit, 2),
                "status" => $booking->checked_in ? "available" : "pending",
                "date" => $booking->created_at,
                "booking_number" => $booking->number,
                "guest" => $booking->user->name ?? 'Unknown',
                "original_host" => $booking->property->user->name ?? 'N/A',
                "original_price" => $booking->property->platform_price,
                "markup_price" => $booking->total_price,
                "markup_profit" => round($markupProfit, 2),
                "icon" => "trending-up",
                "color" => $booking->checked_in ? "blue" : "yellow"
            ]);
        }

        // 4. Markup Car Bookings
        foreach ($markupCarBookings->take(10) as $booking) {
            $markupProfit = $booking->markup_profit;

            $walletTransactions->push([
                "id" => $booking->id,
                "type" => "car_markup",
                "subtype" => "markup_profit",
                "title" => ($booking->car->make ?? '') . " " . ($booking->car->model ?? ''),
                "description" => "Car markup profit",
                "amount" => round($markupProfit, 2),
                "status" => $booking->checked_in ? "available" : "pending",
                "date" => $booking->created_at,
                "booking_number" => $booking->number,
                "guest" => $booking->user->name ?? 'Unknown',
                "original_host" => $booking->car->user->name ?? 'N/A',
                "original_price" => $booking->car->platform_price ?? $booking->car->price_per_day,
                "markup_price" => $booking->total_price,
                "markup_profit" => round($markupProfit, 2),
                "icon" => "trending-up",
                "color" => $booking->checked_in ? "blue" : "yellow"
            ]);
        }

        // 5. Referral Earnings
        if ($isAdmin) {
            $recentReferrals = Booking::whereIn("status", ["Paid", "paid"])
                ->whereNotNull("referral_code")
                ->whereNotNull("checked_in")
                ->with(['user', 'property', 'payments'])
                ->latest()
                ->limit(10)
                ->get();

            foreach ($recentReferrals as $booking) {
                $referralAmount = $this->calculateReferralEarnings(
                    $booking->payments->sum('amount'),
                    $referralPercentage * 100,
                    $platformPercentage * 100
                );

                $walletTransactions->push([
                    "id" => $booking->id,
                    "type" => "referral",
                    "subtype" => "referral_commission",
                    "title" => "Referral Commission",
                    "description" => "Referral from booking #{$booking->number}",
                    "amount" => round($referralAmount, 2),
                    "status" => "available",
                    "date" => $booking->created_at,
                    "booking_number" => $booking->number,
                    "guest" => $booking->user->name ?? 'Unknown',
                    "referrer" => User::where('referral_code', $booking->referral_code)->first()->name ?? 'Unknown',
                    "commission_rate" => $company->referral_percentage,
                    "icon" => "users",
                    "color" => "purple"
                ]);
            }
        } else {
            // For regular users, get ALL their referral earnings
            $userReferrals = Booking::whereIn("status", ["Paid", "paid"])
                ->where("referral_code", $user->referral_code)
                ->with(['user', 'property', 'payments'])
                ->latest()
                ->limit(10)
                ->get();

            foreach ($userReferrals as $booking) {
                $referralAmount = $this->calculateReferralEarnings(
                    $booking->payments->sum('amount'),
                    $referralPercentage * 100,
                    $platformPercentage * 100
                );

                $status = "pending";
                if ($booking->checked_in) {
                    $status = "available";
                }

                $walletTransactions->push([
                    "id" => $booking->id,
                    "type" => "referral",
                    "subtype" => "referral_commission",
                    "title" => "Referral Commission",
                    "description" => "Referral from your code - Booking #{$booking->number}",
                    "amount" => round($referralAmount, 2),
                    "status" => $status,
                    "date" => $booking->created_at,
                    "booking_number" => $booking->number,
                    "guest" => $booking->user->name ?? 'Unknown',
                    "property" => $booking->property->property_name ?? 'N/A',
                    "commission_rate" => $company->referral_percentage,
                    "icon" => "users",
                    "color" => $status === "available" ? "purple" : "yellow"
                ]);
            }
        }

        // Sort all transactions by date
        $walletTransactions = $walletTransactions
            ->sortByDesc("date")
            ->values()
            ->all();

        // Calculate totals by type
        $totalsByType = [
            'direct_property' => round($directPropertyBookingTotal, 2),
            'direct_car' => round($directCarBookingTotal, 2),
            'markup_property' => round($markupPropertyBookingTotal, 2),
            'markup_car' => round($markupCarBookingTotal, 2),
            'referral' => round($referralEarnings, 2),
            'total' => round($totalEarnings, 2)
        ];

        return Inertia::render("Wallet/Wallet", [
            "canLogin" => Route::has("login"),
            "canRegister" => Route::has("register"),
            "laravelVersion" => Application::VERSION,
            "phpVersion" => PHP_VERSION,
            "flash" => session("flash"),

            // WALLET SUMMARY
            "summary" => [
                "totalEarnings" => round($totalEarnings, 2),
                "availableBalance" => round($availableBalance, 2),
                "pendingPayouts" => round($pendingPayouts, 2),
                "repaymentAmount" => round($repaymentAmount, 2),
                "directEarnings" => round($totalDirectEarnings, 2),
                "markupEarnings" => round($totalMarkupEarnings, 2),
                "referralEarnings" => round($referralEarnings, 2),
            ],

            // EARNINGS BREAKDOWN
            "breakdown" => [
                "direct_property" => [
                    "total" => round($directPropertyBookingTotal, 2),
                    "available" => round($availableDirectPropertyBookingTotal, 2),
                    "pending" => round($directPropertyBookingTotal - $availableDirectPropertyBookingTotal, 2)
                ],
                "direct_car" => [
                    "total" => round($directCarBookingTotal, 2),
                    "available" => round($availableDirectCarBookingTotal, 2),
                    "pending" => round($directCarBookingTotal - $availableDirectCarBookingTotal, 2)
                ],
                "markup_property" => [
                    "total" => round($markupPropertyBookingTotal, 2),
                    "available" => round($availableMarkupPropertyBookingTotal, 2),
                    "pending" => round($markupPropertyBookingTotal - $availableMarkupPropertyBookingTotal, 2)
                ],
                "markup_car" => [
                    "total" => round($markupCarBookingTotal, 2),
                    "available" => round($availableMarkupCarBookingTotal, 2),
                    "pending" => round($markupCarBookingTotal - $availableMarkupCarBookingTotal, 2)
                ],
                "referral" => [
                    "total" => round($referralEarnings, 2),
                    "available" => round($userDetailedEarnings['referral_earnings'] ?? 0, 2), // Only completed
                    "pending" => round(($userDetailedEarnings['pending_referral_earnings'] ?? 0) + ($userDetailedEarnings['upcoming_referral_earnings'] ?? 0), 2)
                ]
            ],

            // TRANSACTIONS
            "transactions" => $walletTransactions,
            "totalTransactions" => count($walletTransactions),

            // STATS
            "carsCount" => $carsCount,
            "propertiesCount" => $propertiesCount,

            // SETTINGS
            "isAdmin" => $isAdmin,
            "platform_percentage" => $company->percentage,
            "host_percentage" => round($hostPercentage * 100, 2),
            "referral_percentage" => $company->referral_percentage,
            "referral_calculation" => "You earn {$company->referral_percentage}% of the platform commission ({$company->percentage}% of booking amount)"
        ]);
    }
    /**
     * Get detailed earnings report for export
     */
    public function getEarningsReport(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->role_id === 1 || $user->role_id === "1";

        $company = Company::first();
        $platformPercentage = $company->percentage / 100;
        $referralPercentage = $company->referral_percentage / 100;
        $hostPercentage = 1 - $platformPercentage;

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $type = $request->input('type', 'all');

        // Base queries with date filters
        $directPropertyQuery = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id");

        $markupPropertyQuery = Booking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNotNull("markup_user_id");

        $directCarQuery = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNull("markup_user_id");

        $markupCarQuery = CarBooking::whereIn("status", ["Paid", "paid"])
            ->whereNull("external_booking")
            ->whereNotNull("markup_user_id");

        // Apply user filters
        if (!$isAdmin) {
            $directPropertyQuery->whereHas("property", function ($q) use ($user) {
                $q->where("user_id", $user->id);
            });
            $directCarQuery->whereHas("car", function ($q) use ($user) {
                $q->where("user_id", $user->id);
            });
            $markupPropertyQuery->where("markup_user_id", $user->id);
            $markupCarQuery->where("markup_user_id", $user->id);
        }

        // Apply date filters
        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();

            $directPropertyQuery->whereBetween('created_at', [$start, $end]);
            $markupPropertyQuery->whereBetween('created_at', [$start, $end]);
            $directCarQuery->whereBetween('created_at', [$start, $end]);
            $markupCarQuery->whereBetween('created_at', [$start, $end]);
        }

        // Apply type filter
        if ($type !== 'all') {
            switch ($type) {
                case 'direct_property':
                    $markupPropertyQuery = Booking::whereRaw('1=0');
                    $directCarQuery = CarBooking::whereRaw('1=0');
                    $markupCarQuery = CarBooking::whereRaw('1=0');
                    break;
                case 'direct_car':
                    $directPropertyQuery = Booking::whereRaw('1=0');
                    $markupPropertyQuery = Booking::whereRaw('1=0');
                    $markupCarQuery = CarBooking::whereRaw('1=0');
                    break;
                case 'markup_property':
                    $directPropertyQuery = Booking::whereRaw('1=0');
                    $directCarQuery = CarBooking::whereRaw('1=0');
                    $markupCarQuery = CarBooking::whereRaw('1=0');
                    break;
                case 'markup_car':
                    $directPropertyQuery = Booking::whereRaw('1=0');
                    $markupPropertyQuery = Booking::whereRaw('1=0');
                    $directCarQuery = CarBooking::whereRaw('1=0');
                    break;
                case 'referral':
                    $directPropertyQuery = Booking::whereRaw('1=0');
                    $markupPropertyQuery = Booking::whereRaw('1=0');
                    $directCarQuery = CarBooking::whereRaw('1=0');
                    $markupCarQuery = CarBooking::whereRaw('1=0');
                    break;
            }
        }

        // Get data
        $directPropertyBookings = $directPropertyQuery->with(['payments', 'property', 'user'])->get();
        $markupPropertyBookings = $markupPropertyQuery->with(['payments', 'property', 'user', 'markupUser'])->get();
        $directCarBookings = $directCarQuery->with(['payments', 'car', 'user'])->get();
        $markupCarBookings = $markupCarQuery->with(['payments', 'car', 'user', 'markupUser'])->get();

        // Compile report data
        $reportData = [];

        // Direct Property Bookings
        foreach ($directPropertyBookings as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $hostEarnings = $totalPayments * $hostPercentage;
            $platformFee = $totalPayments * $platformPercentage;

            $reportData[] = [
                'date' => $booking->created_at->format('Y-m-d H:i:s'),
                'type' => 'Direct Property Booking',
                'booking_number' => $booking->number,
                'property_name' => $booking->property->property_name ?? 'N/A',
                'guest' => $booking->user->name ?? 'Unknown',
                'check_in' => $booking->check_in_date,
                'check_out' => $booking->check_out_date,
                'nights' => $booking->nights,
                'total_amount' => round($totalPayments, 2),
                'platform_fee' => round($platformFee, 2),
                'net_earnings' => round($hostEarnings, 2),
                'status' => $booking->checked_in ? 'Available' : 'Pending',
                'earnings_type' => 'direct_host'
            ];
        }

        // Direct Car Bookings
        foreach ($directCarBookings as $booking) {
            $totalPayments = $booking->payments->sum('amount');
            $hostEarnings = $totalPayments * $hostPercentage;
            $platformFee = $totalPayments * $platformPercentage;
            $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));

            $reportData[] = [
                'date' => $booking->created_at->format('Y-m-d H:i:s'),
                'type' => 'Direct Car Booking',
                'booking_number' => $booking->number,
                'car_name' => ($booking->car->make ?? '') . ' ' . ($booking->car->model ?? ''),
                'guest' => $booking->user->name ?? 'Unknown',
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'days' => $days,
                'total_amount' => round($totalPayments, 2),
                'platform_fee' => round($platformFee, 2),
                'net_earnings' => round($hostEarnings, 2),
                'status' => $booking->checked_in ? 'Available' : 'Pending',
                'earnings_type' => 'direct_host'
            ];
        }

        // Markup Property Bookings
        foreach ($markupPropertyBookings as $booking) {
            $markupProfit = $booking->markup_profit;

            $reportData[] = [
                'date' => $booking->created_at->format('Y-m-d H:i:s'),
                'type' => 'Markup Property Booking',
                'booking_number' => $booking->number,
                'property_name' => $booking->property->property_name ?? 'N/A',
                'guest' => $booking->user->name ?? 'Unknown',
                'original_host' => $booking->property->user->name ?? 'N/A',
                'markup_host' => $booking->markupUser->name ?? 'N/A',
                'check_in' => $booking->check_in_date,
                'check_out' => $booking->check_out_date,
                'nights' => $booking->nights,
                'original_price' => $booking->property->platform_price,
                'markup_price' => $booking->total_price,
                'markup_profit' => round($markupProfit, 2),
                'status' => $booking->checked_in ? 'Available' : 'Pending',
                'earnings_type' => 'markup_profit'
            ];
        }

        // Markup Car Bookings
        foreach ($markupCarBookings as $booking) {
            $markupProfit = $booking->markup_profit;
            $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));

            $reportData[] = [
                'date' => $booking->created_at->format('Y-m-d H:i:s'),
                'type' => 'Markup Car Booking',
                'booking_number' => $booking->number,
                'car_name' => ($booking->car->make ?? '') . ' ' . ($booking->car->model ?? ''),
                'guest' => $booking->user->name ?? 'Unknown',
                'original_host' => $booking->car->user->name ?? 'N/A',
                'markup_host' => $booking->markupUser->name ?? 'N/A',
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'days' => $days,
                'original_price' => $booking->car->platform_price ?? $booking->car->price_per_day,
                'markup_price' => $booking->total_price,
                'markup_profit' => round($markupProfit, 2),
                'status' => $booking->checked_in ? 'Available' : 'Pending',
                'earnings_type' => 'markup_profit'
            ];
        }

        // Sort by date
        usort($reportData, function($a, $b) {
            return strtotime($b['date']) <=> strtotime($a['date']);
        });

        return response()->json([
            'success' => true,
            'data' => $reportData,
            'summary' => [
                'total_entries' => count($reportData),
                'total_earnings' => array_sum(array_column($reportData, 'net_earnings')),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'generated_at' => now()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Helper method to calculate referral earnings
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

            $query->whereDoesntHave("bookings", function ($bookingQuery) use ($checkIn, $checkOut) {
                $bookingQuery->where(function ($q) use ($checkIn, $checkOut) {
                    $q->where("check_in_date", "<", $checkOut)
                    ->where("check_out_date", ">", $checkIn)
                    ->whereIn('status', ['Paid', 'paid']); 
                });
            });
        }

        if ($request->filled(["adults", "children"])) {
            $adults = (int) $input["adults"];
            $children = (int) $input["children"];
            $totalGuests = $adults + $children;

            $query->where(function ($q) use ($adults, $children, $totalGuests) {
                $q->where(function ($subQ) use ($adults, $children, $totalGuests) {
                    $subQ->where('max_adults', '>=', $adults)
                        ->where('max_children', '>=', $children);
                });
            });
        }

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

        $properties->transform(function ($property) {
            if ($property->relationLoaded('initialGallery') && $property->initialGallery) {
                $validGallery = collect($property->initialGallery)->filter(function ($image) {
                    if (empty($image['path']) && empty($image['image'])) {
                        return false;
                    }

                    $imagePath = $image['path'] ?? $image['image'];
                    if (empty($imagePath)) {
                        return false;
                    }

                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        return true;
                    }

                    $storagePath = str_starts_with($imagePath, 'public/')
                        ? storage_path('app/' . $imagePath)
                        : storage_path('app/public/' . $imagePath);

                    return file_exists($storagePath) && is_file($storagePath);
                })->values();

                $property->first_image = $validGallery->first();
                
                $property->gallery_image_count = $validGallery->count();
                
                $property->unsetRelation('initialGallery');
            } else {
                $property->first_image = null;
                $property->gallery_image_count = 0;
            }

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
