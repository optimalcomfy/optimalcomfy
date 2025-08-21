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


class HomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with([
            "bookings",
            "variations",
            "initialGallery",
            "propertyAmenities",
            "propertyFeatures",
            "PropertyServices",
        ])->orderBy("created_at", "desc");

        if ($request->has("search")) {
            $search = $request->input("search");
            $query
                ->where("name", "LIKE", "%$search%")
                ->orWhere("type", "LIKE", "%$search%")
                ->orWhere("price", "LIKE", "%$search%");
        }

        $properties = $query->get();

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
        $cars = Car::with(["bookings", "initialGallery", "carFeatures"])->get();

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

        if ($input["location"]) {
            $location = $input["location"];
            $query->where(function ($q) use ($location) {
                $q->where("location_address", "LIKE", "%$location%");
            });
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
                    $q->where("start_date", "<", $checkOut)->where(
                        "end_date",
                        ">",
                        $checkIn
                    );
                });
            });
        }

        $cars = $query->get();

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

        $similarProperties = [];
        if ($property) {
            $similarProperties = Property::with("initialGallery")
                ->where("type", $property->type)
                ->where("id", "!=", $property->id)
                ->orderBy("created_at", "desc")
                ->limit(4)
                ->get();
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
            "PropertyServices",
        ])->orderBy("created_at", "desc");

        $input = $request->all();

        // Search by name/type/price
        if ($input["location"]) {
            $location = $input["location"];
            $query->where(function ($q) use ($location) {
                $q->where("location", "LIKE", "%$location%");
            });
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
                    $q->where("check_in_date", "<", $checkOut)->where(
                        "check_out_date",
                        ">",
                        $checkIn
                    );
                });
            });
        }

        $properties = $query->get();

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

