<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Property;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\MpesaStkController;
use App\Services\PesapalService;
use App\Traits\Mpesa;

// Email imports
use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use App\Mail\BookingRequestNotification;
use App\Mail\BookingRequestConfirmation;
use App\Mail\NewBookingNotification;
use App\Mail\PaymentInstructions;
use App\Mail\BookingRejected;
use App\Mail\RefundNotification;
use App\Mail\CheckInVerification;
use App\Mail\CheckOutVerification;
use App\Mail\BookingCancelled;

use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Services\SmsService;

class BookingController extends Controller
{
    use Mpesa;

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Booking::with('user', 'property');

        // Role-based filtering
        if ($user->role_id == 2) {
            // Host - filter bookings for their properties
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            // Guest - filter only their own bookings
            $query->where('user_id', $user->id);
        }

        // Status filtering via translated logic for stay_status
        if ($request->has('status') && $request->input('status') != null) {
            $status = $request->input('status');

            $query->where(function ($q) use ($status) {
                if ($status === 'checked_out') {
                    $q->whereNotNull('checked_out');
                } elseif ($status === 'checked_in') {
                    $q->whereNull('checked_out')->whereNotNull('checked_in');
                } elseif ($status === 'upcoming_stay') {
                    $q->where('status', 'paid')->whereNull('checked_in');
                } else {
                    $q->where('status', $status);
                }
            });
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhere('status', 'LIKE', "%$search%")
                ->orWhere('external_booking', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });
        }

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });

        // Sort by newest
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $bookings = $query->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'flash' => session('flash'),
        ]);
    }


    public function markupBookings(Request $request)
    {
        $user = Auth::user();

        // Get property bookings
        $propertyQuery = Booking::with(['user', 'property.user', 'payments'])
            ->where('markup_user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Get car bookings
        $carQuery = CarBooking::with(['user', 'car.user', 'payments'])
            ->where('markup_user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Apply status filter
        if ($request->has('status') && $request->status != 'all') {
            $propertyQuery->where('status', $request->status);
            $carQuery->where('status', $request->status);
        }

        // Apply date filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $propertyQuery->whereBetween('created_at', [$startDate, $endDate]);
            $carQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;

            $propertyQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });

            $carQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('car', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        $perPage = $request->get('per_page', 10);

        // Get paginated results
        $propertyBookings = $propertyQuery->paginate($perPage);
        $carBookings = $carQuery->paginate($perPage);

        // Transform property bookings data - FIXED
        $transformedPropertyBookings = $propertyBookings->map(function ($booking) {
            $nights = $booking->nights;
            $markupProfit = $booking->markup_profit; // This is already TOTAL profit for entire stay

            // FIX: markup_profit is already the total, don't multiply by nights
            $totalEarnings = $markupProfit;

            return [
                'id' => $booking->id,
                'type' => 'property',
                'booking_type' => 'property',
                'number' => $booking->number,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                ] : null,
                'property' => $booking->property ? [
                    'property_name' => $booking->property->property_name,
                    'platform_price' => $booking->property->platform_price,
                    'amount' => $booking->property->amount,
                    'user' => $booking->property->user ? [
                        'name' => $booking->property->user->name,
                    ] : null,
                ] : null,
                'car' => null,
                'check_in_date' => $booking->check_in_date,
                'check_out_date' => $booking->check_out_date,
                'start_date' => $booking->check_in_date,
                'end_date' => $booking->check_out_date,
                'duration' => $nights,
                'duration_type' => 'nights',
                'markup_profit' => $markupProfit,
                'total_earnings' => $totalEarnings, // Fixed
                'total_price' => $booking->total_price,
                'host_price' => $booking->host_price,
                'platform_fee' => $booking->platform_fee,
                'status' => $booking->status,
                'stay_status' => $booking->stay_status,
                'external_booking' => $booking->external_booking,
                'created_at' => $booking->created_at,
                'payment' => $booking->payment,
            ];
        });

        // Transform car bookings data - FIXED
        $transformedCarBookings = $carBookings->map(function ($booking) {
            // Calculate days for car bookings
            $startDate = Carbon::parse($booking->start_date);
            $endDate = Carbon::parse($booking->end_date);
            $days = max(1, $endDate->diffInDays($startDate));

            $markupProfit = $booking->markup_profit; // This is already TOTAL profit for entire rental

            // FIX: markup_profit is already the total, don't multiply by days
            $totalEarnings = $markupProfit;

            return [
                'id' => $booking->id,
                'type' => 'car',
                'booking_type' => 'car',
                'number' => $booking->number,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                ] : null,
                'property' => null,
                'car' => $booking->car ? [
                    'name' => $booking->car->name,
                    'platform_price' => $booking->car->platform_price ?? $booking->car->price_per_day ?? 0,
                    'amount' => $booking->car->amount ?? $booking->car->price_per_day ?? 0,
                    'user' => $booking->car->user ? [
                        'name' => $booking->car->user->name,
                    ] : null,
                ] : null,
                'check_in_date' => $booking->start_date,
                'check_out_date' => $booking->end_date,
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'duration' => $days,
                'duration_type' => 'days',
                'markup_profit' => $markupProfit,
                'total_earnings' => $totalEarnings, // Fixed
                'total_price' => $booking->total_price,
                'host_price' => $booking->host_price,
                'platform_fee' => $booking->platform_fee,
                'status' => $booking->status,
                'ride_status' => $booking->ride_status,
                'external_booking' => $booking->external_booking,
                'created_at' => $booking->created_at,
                'payment' => $booking->payment,
            ];
        });

        // Combine all bookings
        $allBookings = $transformedPropertyBookings->concat($transformedCarBookings)
            ->sortByDesc('created_at')
            ->values();

        // Create paginator
        $currentPage = $propertyBookings->currentPage();
        $perPage = $propertyBookings->perPage();
        $total = $propertyBookings->total() + $carBookings->total();

        $paginatedBookings = new \Illuminate\Pagination\LengthAwarePaginator(
            $allBookings,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(),
                'pageName' => 'page',
            ]
        );

        return Inertia::render('Bookings/Markups', [
            'bookings' => $paginatedBookings->items(),
            'pagination' => $paginatedBookings,
            'flash' => session('flash'),
        ]);
    }

    public function exportMarkupBookings(Request $request)
    {
        $user = Auth::user();

        // Get property bookings
        $propertyQuery = Booking::with(['user', 'property.user', 'payments'])
            ->where('markup_user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Get car bookings
        $carQuery = CarBooking::with(['user', 'car.user', 'payments'])
            ->where('markup_user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('status') && $request->status != 'all') {
            $propertyQuery->where('status', $request->status);
            $carQuery->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $propertyQuery->whereBetween('created_at', [$startDate, $endDate]);
            $carQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        if ($request->has('search')) {
            $search = $request->search;

            $propertyQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });

            $carQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('car', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        $propertyBookings = $propertyQuery->get();
        $carBookings = $carQuery->get();

        // Process property bookings - FIXED
        $propertyExportData = $propertyBookings->map(function ($booking) {
            $nights = $booking->nights;
            $markupProfit = $booking->markup_profit;

            // FIX: markup_profit is already total, don't multiply by nights
            $totalEarnings = $markupProfit;

            return [
                'id' => $booking->id,
                'type' => 'Property Stay',
                'booking_type' => 'property',
                'booking_number' => $booking->number,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'property_name' => $booking->property->property_name ?? 'N/A',
                'host_name' => $booking->property->user->name ?? 'N/A',
                'check_in_date' => Carbon::parse($booking->check_in_date)->format('Y-m-d'),
                'check_out_date' => Carbon::parse($booking->check_out_date)->format('Y-m-d'),
                'duration' => $nights,
                'duration_unit' => 'nights',
                'markup_profit' => $markupProfit, // This is total markup profit
                'total_earnings' => $totalEarnings, // Fixed - same as markup_profit
                'total_price' => $booking->total_price,
                'host_price' => $booking->host_price,
                'platform_fee' => $booking->platform_fee,
                'status' => $booking->status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'booking_date' => $booking->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Process car bookings - FIXED
        $carExportData = $carBookings->map(function ($booking) {
            $startDate = Carbon::parse($booking->start_date);
            $endDate = Carbon::parse($booking->end_date);
            $days = max(1, $endDate->diffInDays($startDate));

            $markupProfit = $booking->markup_profit;

            // FIX: markup_profit is already total, don't multiply by days
            $totalEarnings = $markupProfit;

            return [
                'id' => $booking->id,
                'type' => 'Car Rental',
                'booking_type' => 'car',
                'booking_number' => $booking->number,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'car_name' => $booking->car->name ?? 'N/A',
                'host_name' => $booking->car->user->name ?? 'N/A',
                'start_date' => Carbon::parse($booking->start_date)->format('Y-m-d'),
                'end_date' => Carbon::parse($booking->end_date)->format('Y-m-d'),
                'duration' => $days,
                'duration_unit' => 'days',
                'markup_profit' => $markupProfit, // This is total markup profit
                'total_earnings' => $totalEarnings, // Fixed - same as markup_profit
                'total_price' => $booking->total_price,
                'host_price' => $booking->host_price,
                'platform_fee' => $booking->platform_fee,
                'status' => $booking->status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'booking_date' => $booking->created_at->format('Y-m-d H:i:s'),
            ];
        });

        // Combine data
        $exportData = $propertyExportData->concat($carExportData);

        // Calculate summary
        $totalEarnings = $exportData->sum('total_earnings');
        $totalBookings = $exportData->count();
        $averageEarnings = $totalBookings > 0 ? $totalEarnings / $totalBookings : 0;

        return response()->json([
            'data' => $exportData,
            'summary' => [
                'totalEarnings' => $totalEarnings,
                'totalBookings' => $totalBookings,
                'averageEarnings' => $averageEarnings,
            ]
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Booking::with(['user', 'property']);

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                });

        // Stay status filtering - matches the accessor logic
        if ($request->has('status') && $request->input('status') != null) {
            $status = $request->input('status');

            $query->where(function($q) use ($status) {
                switch ($status) {
                    case 'checked_out':
                        $q->whereNotNull('checked_out');
                        break;
                    case 'checked_in':
                        $q->whereNotNull('checked_in')
                        ->whereNull('checked_out');
                        break;
                    case 'upcoming_stay':
                        $q->where('status', 'paid')
                        ->whereNull('checked_in');
                        break;
                    default:
                        $q->where('status', $status)
                        ->whereNull('checked_in')
                        ->whereNull('checked_out');
                }
            });
        }

        // Search functionality
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhere('status', 'LIKE', "%$search%")
                ->orWhere('external_booking', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });
        }

        // Role-based filtering
        if ($user->role_id == 2) {
            $query->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        $exportData = $bookings->map(function ($booking) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = $checkOut->diffInDays($checkIn);
            $totalPrice = optional($booking->property)->platform_price * $nights;

            return [
                'number' => $booking->number,
                'guest_name' => optional($booking->user)->name,
                'host_price'=> $booking->host_price,
                'property_name' => optional($booking->property)->property_name,
                'check_in_date' => $booking->check_in_date,
                'check_out_date' => $booking->check_out_date,
                'nights' => $nights,
                'total_price' => 'KES ' . number_format($totalPrice, 2),
                'status' => $booking->status,
                'stay_status' => $booking->stay_status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'created_at' => $booking->created_at->toDateTimeString(),
            ];
        });

        return response()->json($exportData);
    }


    /**
     * Show referral earnings for the logged-in user
     */
    public function referralEarnings(Request $request)
    {
        $user = Auth::user();
        $company = Company::first();

        // Platform commission percentage
        $platformPercentage = $company->percentage ?? 10;

        // Referrer gets X% of the platform commission (percentage of percentage)
        $referralPercentage = $company->referral_percentage ?? 20;

        // Guest discount percentage (for those using referral codes)
        $guestDiscountPercentage = $company->booking_referral_percentage ?? 2;

        // Get bookings where this user's referral code was used
        $propertyQuery = Booking::with(['user', 'property.user', 'payments'])
            ->where('referral_code', $user->referral_code)
            ->whereNotNull('referral_code')
            ->where('status', 'paid') // Only paid bookings count for earnings
            ->orderBy('created_at', 'desc');

        // Get car bookings where this user's referral code was used
        $carQuery = CarBooking::with(['user', 'car.user', 'payments'])
            ->where('referral_code', $user->referral_code)
            ->whereNotNull('referral_code')
            ->where('status', 'paid') // Only paid bookings count for earnings
            ->orderBy('created_at', 'desc');


        // Apply date filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $propertyQuery->whereBetween('created_at', [$startDate, $endDate]);
            $carQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;

            $propertyQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });

            $carQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('car', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        $perPage = $request->get('per_page', 10);

        // Get paginated results
        $propertyBookings = $propertyQuery->paginate($perPage);
        $carBookings = $carQuery->paginate($perPage);

        // Transform property bookings data with referral profit
        $transformedPropertyBookings = $propertyBookings->map(function ($booking) use ($user, $platformPercentage, $referralPercentage) {
            // Calculate platform commission
            $platformFee = ($booking->total_price * $platformPercentage) / 100;

            // Calculate referrer earnings (percentage of platform commission)
            $referralProfit = ($platformFee * $referralPercentage) / 100;

            return [
                'booking_type' => 'property',
                'booking_id' => $booking->id,
                'booking_number' => $booking->number,
                'referrer_name' => $user->name,
                'referrer_email' => $user->email,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'item_name' => $booking->property->property_name ?? 'N/A',
                'host_name' => $booking->property->user->name ?? 'N/A',
                'start_date' => $booking->check_in_date,
                'end_date' => $booking->check_out_date,
                'duration' => $booking->nights,
                'booking_amount' => $booking->total_price,
                'platform_percentage' => $platformPercentage,
                'platform_fee' => $platformFee,
                'referral_percentage' => $referralPercentage,
                'referral_profit' => $referralProfit,
                'booking_status' => $booking->status,
                'stay_status' => $booking->stay_status,
                'booking_date' => $booking->created_at,
                'calculation_method' => 'percentage_of_platform_commission'
            ];
        });

        // Transform car bookings data with referral profit
        $transformedCarBookings = $carBookings->map(function ($booking) use ($user, $platformPercentage, $referralPercentage) {
            // Calculate platform commission
            $platformFee = ($booking->total_price * $platformPercentage) / 100;

            // Calculate referrer earnings (percentage of platform commission)
            $referralProfit = ($platformFee * $referralPercentage) / 100;

            return [
                'booking_type' => 'car',
                'booking_id' => $booking->id,
                'booking_number' => $booking->number,
                'referrer_name' => $user->name,
                'referrer_email' => $user->email,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'item_name' => $booking->car->name ?? 'N/A',
                'host_name' => $booking->car->user->name ?? 'N/A',
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'duration' => max(1, Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date))),
                'booking_amount' => $booking->total_price,
                'platform_percentage' => $platformPercentage,
                'platform_fee' => $platformFee,
                'referral_percentage' => $referralPercentage,
                'referral_profit' => $referralProfit,
                'booking_status' => $booking->status,
                'ride_status' => $booking->ride_status,
                'booking_date' => $booking->created_at,
                'calculation_method' => 'percentage_of_platform_commission'
            ];
        });

        // Combine all bookings
        $allReferrals = $transformedPropertyBookings->concat($transformedCarBookings)
            ->sortByDesc('booking_date')
            ->values();

        // Create paginator
        $currentPage = $propertyBookings->currentPage();
        $perPage = $propertyBookings->perPage();
        $total = $propertyBookings->total() + $carBookings->total();

        $paginatedReferrals = new \Illuminate\Pagination\LengthAwarePaginator(
            $allReferrals,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(),
                'pageName' => 'page',
            ]
        );

        return Inertia::render('Bookings/ReferralEarnings', [
            'referrals' => $paginatedReferrals->items(),
            'pagination' => $paginatedReferrals,
            'flash' => session('flash'),
            'auth' => ['user' => $user],
            'company_settings' => [
                'platform_percentage' => $platformPercentage,
                'referral_percentage' => $referralPercentage,
                'guest_discount_percentage' => $guestDiscountPercentage,
            ]
        ]);
    }

    /**
     * Export referral earnings data
     */
    public function exportReferralEarnings(Request $request)
    {
        $user = Auth::user();
        $company = Company::first();

        // Platform commission percentage
        $platformPercentage = $company->percentage ?? 10;

        // Referrer gets X% of the platform commission
        $referralPercentage = $company->referral_percentage ?? 20;

        // Get property bookings with this user's referral code
        $propertyQuery = Booking::with(['user', 'property.user'])
            ->where('referral_code', $user->referral_code)
            ->whereNotNull('referral_code')
            ->where('status', 'paid') // Only paid bookings
            ->orderBy('created_at', 'desc');

        // Get car bookings with this user's referral code
        $carQuery = CarBooking::with(['user', 'car.user'])
            ->where('referral_code', $user->referral_code)
            ->whereNotNull('referral_code')
            ->where('status', 'paid') // Only paid bookings
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('type') && $request->type != 'all') {
            if ($request->type === 'property') {
                $carQuery = CarBooking::whereRaw('1=0');
            } else {
                $propertyQuery = Booking::whereRaw('1=0');
            }
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $propertyQuery->whereBetween('created_at', [$startDate, $endDate]);
            $carQuery->whereBetween('created_at', [$startDate, $endDate]);
        }

        if ($request->has('search')) {
            $search = $request->search;

            $propertyQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });

            $carQuery->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('car', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                });
            });
        }

        $propertyBookings = $propertyQuery->get();
        $carBookings = $carQuery->get();

        // Process property bookings
        $propertyExportData = $propertyBookings->map(function ($booking) use ($platformPercentage, $referralPercentage, $user) {
            // Calculate platform commission
            $platformFee = ($booking->total_price * $platformPercentage) / 100;

            // Calculate referrer earnings (percentage of platform commission)
            $referralProfit = ($platformFee * $referralPercentage) / 100;

            return [
                'type' => 'Property Booking',
                'booking_type' => 'property',
                'booking_id' => $booking->id,
                'booking_number' => $booking->number,
                'referrer_name' => $user->name,
                'referrer_email' => $user->email,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'item_name' => $booking->property->property_name ?? 'N/A',
                'host_name' => $booking->property->user->name ?? 'N/A',
                'check_in_date' => Carbon::parse($booking->check_in_date)->format('Y-m-d'),
                'check_out_date' => Carbon::parse($booking->check_out_date)->format('Y-m-d'),
                'duration' => $booking->nights,
                'duration_unit' => 'nights',
                'booking_amount' => $booking->total_price,
                'platform_percentage' => $platformPercentage,
                'platform_fee' => $platformFee,
                'referral_percentage' => $referralPercentage,
                'referral_profit' => $referralProfit,
                'booking_status' => $booking->status,
                'stay_status' => $booking->stay_status,
                'booking_date' => $booking->created_at->format('Y-m-d H:i:s'),
                'calculation_explanation' => "Referrer gets {$referralPercentage}% of platform commission ({$platformPercentage}% of booking amount)"
            ];
        });

        // Process car bookings
        $carExportData = $carBookings->map(function ($booking) use ($platformPercentage, $referralPercentage, $user) {
            // Calculate platform commission
            $platformFee = ($booking->total_price * $platformPercentage) / 100;

            // Calculate referrer earnings (percentage of platform commission)
            $referralProfit = ($platformFee * $referralPercentage) / 100;

            $days = max(1, Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date)));

            return [
                'type' => 'Car Rental',
                'booking_type' => 'car',
                'booking_id' => $booking->id,
                'booking_number' => $booking->number,
                'referrer_name' => $user->name,
                'referrer_email' => $user->email,
                'guest_name' => $booking->user->name ?? 'N/A',
                'guest_email' => $booking->user->email ?? 'N/A',
                'item_name' => $booking->car->name ?? 'N/A',
                'host_name' => $booking->car->user->name ?? 'N/A',
                'start_date' => Carbon::parse($booking->start_date)->format('Y-m-d'),
                'end_date' => Carbon::parse($booking->end_date)->format('Y-m-d'),
                'duration' => $days,
                'duration_unit' => 'days',
                'booking_amount' => $booking->total_price,
                'platform_percentage' => $platformPercentage,
                'platform_fee' => $platformFee,
                'referral_percentage' => $referralPercentage,
                'referral_profit' => $referralProfit,
                'booking_status' => $booking->status,
                'ride_status' => $booking->ride_status,
                'booking_date' => $booking->created_at->format('Y-m-d H:i:s'),
                'calculation_explanation' => "Referrer gets {$referralPercentage}% of platform commission ({$platformPercentage}% of booking amount)"
            ];
        });

        // Combine data
        $exportData = $propertyExportData->concat($carExportData);

        // Calculate summary
        $totalEarnings = $exportData->sum('referral_profit');
        $totalReferrals = $exportData->count();
        $averageEarnings = $totalReferrals > 0 ? $totalEarnings / $totalReferrals : 0;

        return response()->json([
            'data' => $exportData,
            'summary' => [
                'totalEarnings' => $totalEarnings,
                'totalReferrals' => $totalReferrals,
                'averageEarnings' => $averageEarnings,
                'platform_percentage' => $platformPercentage,
                'referral_percentage' => $referralPercentage,
            ]
        ]);
    }

    public function create()
    {
        $users = User::all();
        $user = Auth::user();

        $query = Property::with(['bookings', 'variations']);

        if ($user->role_id == 2) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Bookings/Create', [
            'users' => $users,
            'properties' => $query->get(),
        ]);
    }

    public function handleRefund(Request $request, Booking $booking, SmsService $smsService)
    {
        // Load payment and refund relationships
        $booking->load(['payment', 'refunds']);

        // Calculate maximum refundable amount based on actual payments
        $maxRefundable = $booking->max_refundable_amount;

        // Get payment summary for validation
        $paymentSummary = $booking->payment_summary;
        $actualAmountPaid = $paymentSummary['actual_amount_paid'];
        $totalRefunded = $paymentSummary['total_refunded'];
        $remainingRefundable = $paymentSummary['remaining_refundable'];

        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:500',
            'refund_amount' => [
                'required_if:action,approve',
                'numeric',
                'min:0.01',
                'max:' . $maxRefundable,
            ],
        ], [
            'refund_amount.max' => 'Refund amount cannot exceed the remaining refundable amount of KES ' . number_format($maxRefundable, 2),
            'refund_amount.min' => 'Refund amount must be at least KES 0.01',
        ]);

        // Additional server-side validation
        if ($request->action === 'approve') {
            // Check if any payment was actually made
            if ($actualAmountPaid <= 0) {
                return redirect()->back()->withErrors([
                    'refund_amount' => 'Cannot process refund - no successful payment was made for this booking.'
                ]);
            }

            // Check if refund amount exceeds remaining refundable amount
            if ($request->refund_amount > $remainingRefundable) {
                return redirect()->back()->withErrors([
                    'refund_amount' => 'Refund amount cannot exceed the remaining refundable amount of KES ' . number_format($remainingRefundable, 2)
                ]);
            }

            // Final security check
            $newTotalRefunded = $totalRefunded + $request->refund_amount;
            if ($newTotalRefunded > $actualAmountPaid) {
                return redirect()->back()->withErrors([
                    'refund_amount' => 'This refund would exceed the total amount paid. Maximum additional refund: KES ' . number_format($remainingRefundable, 2)
                ]);
            }
        }

        if ($request->action === 'approve') {
            $booking->update([
                'refund_approval' => 'approved',
                'refund_amount' => $request->refund_amount,
                'non_refund_reason' => null,
            ]);

            Refund::create([
                "amount" => $request->refund_amount,
                "booking_id" => $booking->id,
                "car_booking_id" => null,
            ]);

            // Send SMS notification for refund approval
            $this->sendRefundSms($booking, 'approved', $request->refund_amount, $smsService);

            Mail::to($booking->user->email)
                ->send(new RefundNotification($booking, 'approved'));

            return redirect()->back()->with('success', 'Refund approved successfully.');
        } else {
            $booking->update([
                'refund_approval' => 'rejected',
                'non_refund_reason' => $request->reason,
                'refund_amount' => 0,
            ]);

            // Send SMS notification for refund rejection
            $this->sendRefundSms($booking, 'rejected', 0, $smsService, $request->reason);

            Mail::to($booking->user->email)
                ->send(new RefundNotification($booking, 'rejected', $request->reason));

            return redirect()->back()->with('success', 'Refund rejected successfully.');
        }
    }

   public function store(Request $request, SmsService $smsService, PesapalService $pesapalService)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'variation_id' => 'nullable',
            'referral_code' => 'nullable',
            'payment_method' => 'required|in:mpesa,pesapal',
            'phone' => 'required',
            'status' => 'nullable|string',
            'message' => 'nullable|string|max:1000'
        ]);

        $user = Auth::user();
        
        // Get the property to check default_availability
        $property = Property::with('user')->find($request->property_id);
        
        // Determine booking status based on property settings
        $bookingStatus = 'pending';
        $shouldProcessPayment = false;
        
        if ($property->default_available == 1 || $property->default_available === true) {
            // Instant booking - confirm immediately
            $bookingStatus = 'Booked';
            $shouldProcessPayment = true;
        } else {
            // Request-to-book - needs host confirmation
            $bookingStatus = 'pending';
            $shouldProcessPayment = false;
        }

        // Check for booking conflicts
        $conflictingBooking = Booking::where('property_id', $request->property_id)
            ->where('variation_id', $request->variation_id)
            ->where(function($query) use ($request) {
                $query->whereBetween('check_in_date', [$request->check_in_date, $request->check_out_date])
                    ->orWhereBetween('check_out_date', [$request->check_in_date, $request->check_out_date])
                    ->orWhere(function($q) use ($request) {
                        $q->where('check_in_date', '<=', $request->check_in_date)
                            ->where('check_out_date', '>=', $request->check_out_date);
                    });
            })
            ->whereIn('status', ['Booked', 'confirmed', 'pending'])
            ->first();

        if ($conflictingBooking) {
            // Return Inertia error response instead of JSON
            return back()->withErrors([
                'dates' => 'These dates are already booked. Please select different dates.'
            ]);
        }

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'checked_in' => null,
            'status' => $bookingStatus,
            'variation_id' => $request->variation_id,
            'referral_code' => $request->referral_code,
            'payment_method' => $request->payment_method,
            'guest_message' => $request->message,
            'guest_phone' => $request->phone
        ]);

        try {
            if ($property->default_available == 1) {
                $this->sendBookingConfirmationSms($booking, 'Booked', $smsService);
                $this->sendBookingEmailToGuest($booking);
                
                // Also notify host about the new booking
                $this->sendNewBookingNotificationToHost($booking);
                
                // Process payment for instant bookings
                if ($shouldProcessPayment) {
                    $company = Company::first();

                    $finalAmount = $request->referral_code ? 
                        ($booking->total_price - (($booking->total_price * $company->booking_referral_percentage) / 100)) : 
                        $booking->total_price;
                    $finalAmount = ceil($finalAmount);

                    // Handle different payment methods
                    if ($request->payment_method === 'mpesa') {
                        return $this->processMpesaPayment($booking, $request->phone, $finalAmount);
                    } elseif ($request->payment_method === 'pesapal') {
                        return $this->processPesapalPayment($booking, $user, $finalAmount, $pesapalService);
                    }
                }
            } else {
                $this->sendBookingRequestToHost($booking);
                
                // Send pending confirmation to guest
                $this->sendBookingConfirmationSms($booking, 'pending', $smsService);
                $this->sendBookingRequestConfirmationToGuest($booking);
                
                // Return Inertia response for request-to-book
                return redirect()->route('bookings.index')->with([
                    'success' => 'Booking request sent successfully. Please wait for host confirmation.',
                    'booking' => $booking,
                    'requires_confirmation' => true
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Booking creation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            return back()
                ->withInput()
                ->withErrors(['booking' => 'Booking creation failed due to a system error.']);
        }
    }


    // Add these helper methods to the BookingController:

    private function sendBookingRequestToHost($booking)
    {
        try {
            $host = $booking->property->user;
            
            Mail::to($host->email)->send(new BookingRequestNotification($booking));
            
            // Also send SMS if host has phone
            if ($host->phone) {
                $smsService = new SmsService();
                $message = "New booking request for {$booking->property->property_name} from {$booking->user->name}. Check your email or dashboard to confirm.";
                $smsService->sendSms($host->phone, $message);
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking request to host: ' . $e->getMessage());
        }
    }

    private function sendBookingEmailToGuest($booking)
    {
        try {
            $user = $booking->user;
            
            Mail::to($user->email)->send(new BookingConfirmation($booking));
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation to guest: ' . $e->getMessage());
        }
    }

    private function sendBookingRequestConfirmationToGuest($booking)
    {
        try {
            $user = $booking->user;
            
            Mail::to($user->email)->send(new \App\Mail\BookingRequestConfirmation($booking));
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking request confirmation to guest: ' . $e->getMessage());
        }
    }

    private function sendNewBookingNotificationToHost($booking)
    {
        try {
            $host = $booking->property->user;
            
            Mail::to($host->email)->send(new NewBookingNotification($booking));
            
        } catch (\Exception $e) {
            Log::error('Failed to send new booking notification to host: ' . $e->getMessage());
        }
    }

    /**
     * Process M-Pesa payment
     */
    private function processMpesaPayment($booking, $phone, $amount)
    {
        $callbackBase = config('services.mpesa.callback_url') ?? secure_url('/api/mpesa/stk/callback');

        $callbackData = [
            'phone' => $phone,
            'amount' => $amount,
            'booking_id' => $booking->id,
            'booking_type' => 'property'
        ];

        $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

        $this->STKPush(
            'Paybill',
            $amount,
            $phone,
            $callbackUrl,
            'reference',
            'Book Ristay'
        );

        return redirect()->route('booking.payment.pending', [
            'booking' => $booking->id,
            'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
        ]);
    }

    /**
     * Process Pesapal payment
     */
    private function processPesapalPayment($booking, $user, $amount, $pesapalService)
    {
        try {
            // Prepare order data
            $orderData = [
                'id' => $booking->number,
                'currency' => 'KES',
                'amount' => $amount,
                'description' => 'Booking for ' . $booking->property->property_name,
                'callback_url' => route('pesapal.callback'),
                'cancellation_url' => route('booking.payment.cancelled', ['booking' => $booking->id]),
                'notification_id' => config('services.pesapal.ipn_id'),
                'billing_address' => [
                    'email_address' => $user->email,
                    'phone_number' => $user->phone ?? '254700000000',
                    'country_code' => 'KE',
                    'first_name' => $user->name,
                    'middle_name' => '',
                    'last_name' => '',
                    'line_1' => 'Nairobi',
                    'line_2' => '',
                    'city' => 'Nairobi',
                    'state' => 'Nairobi',
                    'postal_code' => '00100',
                    'zip_code' => '00100'
                ]
            ];

            Log::info('Submitting Pesapal order', [
                'booking_id' => $booking->id,
                'order_data' => $orderData
            ]);

            $orderResponse = $pesapalService->createOrderDirect($orderData);

            Log::info('Pesapal Order Response', [
                'booking_id' => $booking->id,
                'order_response' => $orderResponse
            ]);

            if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                // Store Pesapal tracking ID in booking
                $booking->update([
                    'pesapal_tracking_id' => $orderResponse['order_tracking_id']
                ]);

                Log::info('Pesapal payment initiated successfully', [
                    'booking_id' => $booking->id,
                    'tracking_id' => $orderResponse['order_tracking_id'],
                    'redirect_url' => $orderResponse['redirect_url']
                ]);

                // Return Inertia response instead of JSON
                return Inertia::render('PaymentRedirect', [
                    'success' => true,
                    'redirect_url' => $orderResponse['redirect_url'],
                    'booking_id' => $booking->id,
                    'message' => 'Payment initiated successfully',
                    'payment_method' => 'pesapal'
                ]);

            } else {
                $errorType = $orderResponse['error']['error_type'] ?? 'unknown_error';
                $errorCode = $orderResponse['error']['code'] ?? 'unknown_code';
                $errorMessage = $orderResponse['error']['message'] ?? 'Unknown error occurred';

                Log::error('Pesapal order creation failed', [
                    'error_type' => $errorType,
                    'error_code' => $errorCode,
                    'error_message' => $errorMessage,
                    'full_response' => $orderResponse
                ]);

                $booking->update([
                    'checked_in' => null
                ]);

                // Return Inertia response for error
                return back()->withErrors([
                    'payment' => "Pesapal Error [$errorCode]: $errorMessage"
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Pesapal payment initiation failed: ' . $e->getMessage());

            $booking->update([
                'status' => 'failed',
                'checked_in' => null
            ]);

            return back()->withErrors([
                'payment' => 'Payment initiation failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Calculate display amount for booking
     */
    private function calculateDisplayAmount($booking)
    {
        // If displayAmount is provided from backend (for markup bookings), use it
        if (isset($booking->display_amount)) {
            return $booking->display_amount;
        }

        // Otherwise, calculate based on referral discount for regular bookings
        if ($booking->referral_code) {
            $company = \App\Models\Company::first();
            $totalPrice = floatval($booking->total_price);
            $referralPercentage = floatval($company->booking_referral_percentage ?? 0);
            $discountAmount = $totalPrice * ($referralPercentage / 100);
            return $totalPrice - $discountAmount;
        }

        return floatval($booking->total_price);
    }

    /**
     * Handle Pesapal callback - Combined approach with immediate status check
     */
    public function handlePesapalCallback(Request $request)
    {
        try {
            $orderTrackingId = $request->input('OrderTrackingId');
            $orderMerchantReference = $request->input('OrderMerchantReference');

            Log::info('Pesapal Callback Received', [
                'order_tracking_id' => $orderTrackingId,
                'order_merchant_reference' => $orderMerchantReference,
                'all_params' => $request->all()
            ]);

            // Find booking by tracking ID or merchant reference
            $booking = Booking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->with(['property', 'user'])
                            ->first();

            if (!$booking) {
                Log::error('Booking not found for Pesapal callback', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference
                ]);

                return Inertia::render('PesapalPaymentFailed', [
                    'error' => 'Booking not found.',
                    'company' => \App\Models\Company::first()
                ]);
            }

            // Update booking status based on callback data
            $booking->status = 'paid';
            $booking->save();

            Log::info('Booking status updated to paid', [
                'booking_id' => $booking->id,
                'tracking_id' => $orderTrackingId
            ]);

            return Inertia::render('PesapalPaymentSuccess', [
                'booking' => $booking,
                'company' => \App\Models\Company::first()
            ]);

        } catch (\Exception $e) {
            Log::error('Pesapal callback processing error: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            return Inertia::render('PesapalPaymentFailed', [
                'error' => 'Error processing payment.',
                'company' => \App\Models\Company::first()
            ]);
        }
    }

    public function extend(Request $request, Booking $booking)
    {

        // Load the property with all necessary relationships
        $property = Property::with([
            'propertyAmenities',
            'propertyFeatures',
            'initialGallery',
            'PropertyServices',
            'user',
            'bookings',
            'variations'
        ])->findOrFail($booking->property_id);

        // Get the original booking's check_out_date for extension start
        $extensionStartDate = $booking->check_out_date;

        return Inertia::render('PropertyExtendBooking', [
            'property' => $property,
            'auth' => ['user' => Auth::user()],
            'company' => Company::first(),
            // Pass the extension parameters to pre-fill the form
            'extension_data' => [
                'booking_id' => $booking->id,
                'check_in_date' => $extensionStartDate, // Use check_out_date as the start for extension
                'check_out_date' => $request->check_out_date ?? '', // Allow empty for user to select
                'variation_id' => $request->variation_id ?? $booking->variation_id,
                'is_extension' => true
            ]
        ]);
    }

    /**
     * Handle Pesapal IPN (Instant Payment Notification) - This is the reliable status update
     */
    public function handlePesapalNotification(Request $request, SmsService $smsService, PesapalService $pesapalService)
    {
        try {
            // Get the raw input for logging
            $rawInput = $request->getContent();
            $ipnData = $request->all();

            Log::info('Pesapal IPN Received - Raw', ['raw_data' => $rawInput]);
            Log::info('Pesapal IPN Received - Parsed', $ipnData);

            // Validate IPN data
            if (!$pesapalService->validateIPN($ipnData)) {
                Log::error('Pesapal IPN validation failed', $ipnData);
                return response()->json(['error' => 'Invalid IPN data'], 400);
            }

            // Extract important fields from IPN
            $orderTrackingId = $ipnData['OrderTrackingId'] ?? null;
            $orderNotificationType = $ipnData['OrderNotificationType'] ?? null;
            $orderMerchantReference = $ipnData['OrderMerchantReference'] ?? null;

            // Find booking
            $booking = Booking::where('pesapal_tracking_id', $orderTrackingId)
                            ->orWhere('number', $orderMerchantReference)
                            ->with(['user', 'property.user'])
                            ->first();

            if (!$booking) {
                Log::error('Booking not found for Pesapal IPN', [
                    'tracking_id' => $orderTrackingId,
                    'merchant_reference' => $orderMerchantReference
                ]);
                return response()->json(['error' => 'Booking not found'], 404);
            }

            // Handle different notification types
            switch ($orderNotificationType) {
                case 'CHANGE':
                    $status = $ipnData['Status'] ?? null;
                    $this->handlePaymentStatus($booking, $status, $ipnData, $smsService);
                    break;

                case 'CONFIRMED':
                    $this->handleConfirmedPayment($booking, $ipnData, $smsService);
                    break;

                default:
                    Log::warning('Unknown Pesapal notification type', [
                        'type' => $orderNotificationType,
                        'booking_id' => $booking->id
                    ]);
            }

            // Always return success to Pesapal
            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Pesapal IPN processing error: ' . $e->getMessage(), [
                'exception' => $e,
                'ipn_data' => $ipnData ?? []
            ]);
            return response()->json(['error' => 'IPN processing failed'], 500);
        }
    }

    /**
     * Handle payment status changes
     */
    private function handlePaymentStatus($booking, $status, $ipnData, $smsService)
    {
        Log::info('Handling Pesapal payment status', [
            'booking_id' => $booking->id,
            'status' => $status,
            'previous_status' => $booking->status
        ]);

        switch ($status) {
            case 'COMPLETED':
            case 'SUCCESS':
                $this->handleSuccessfulPayment($booking, $ipnData, $smsService);
                break;

            case 'FAILED':
            case 'INVALID':
                $this->handleFailedPayment($booking, $ipnData, $smsService);
                break;

            case 'PENDING':
                // Keep as pending, no action needed
                Log::info('Payment still pending', ['booking_id' => $booking->id]);
                break;

            default:
                Log::warning('Unknown payment status', [
                    'booking_id' => $booking->id,
                    'status' => $status
                ]);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'paid') {
            Log::info('Payment already processed', ['booking_id' => $booking->id]);
            return;
        }

        // Update booking status
        $booking->update(['status' => 'paid']);

        // Create payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'completed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'transaction_reference' => $ipnData['PaymentMethodReference'] ?? null,
            'booking_type' => 'property',
            'transaction_date' => now()
        ]);

        // Send confirmation emails and SMS
        $this->sendConfirmationEmails($booking);
        $this->sendBookingConfirmationSms($booking, 'confirmed', $smsService);

        Log::info('Pesapal payment completed successfully', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    /**
     * Handle confirmed payment (alternative to status change)
     */
    private function handleConfirmedPayment($booking, $ipnData, $smsService)
    {
        $this->handleSuccessfulPayment($booking, $ipnData, $smsService);
    }

    /**
     * Handle failed payment
     */
    private function handleFailedPayment($booking, $ipnData, $smsService)
    {
        if ($booking->status === 'failed') {
            return;
        }

        $booking->update(['status' => 'failed']);

        // Create failed payment record
        Payment::create([
            'user_id' => $booking->user_id,
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'method' => 'pesapal',
            'status' => 'failed',
            'pesapal_tracking_id' => $booking->pesapal_tracking_id,
            'failure_reason' => $ipnData['Description'] ?? 'Payment failed',
            'booking_type' => 'property'
        ]);

        // Send failure notification
        $this->sendPaymentFailureSms($booking, 'Payment failed via Pesapal', $smsService);

        Log::warning('Pesapal payment failed', [
            'booking_id' => $booking->id,
            'tracking_id' => $booking->pesapal_tracking_id
        ]);
    }

    public function paymentPending(Booking $booking, Request $request)
    {
        $company = Company::first();

        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = max(1, $checkOut->diffInDays($checkIn));
            $displayAmount = $booking->markup->final_amount * $nights;
        }

        return Inertia::render('PaymentPending', [
            'booking' => $booking,
            'company' => $company,
            'displayAmount' => $displayAmount,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }

    public function paymentSuccess(Booking $booking)
    {
        return Inertia::render('PaymentSuccess', [
            'booking' => $booking,
            'message' => 'Payment completed successfully!'
        ]);
    }

    public function paymentCancelled(Booking $booking)
    {
        $booking->update(['status' => 'cancelled']);

        return Inertia::render('PaymentCancelled', [
            'booking' => $booking,
            'message' => 'Payment was cancelled. You can try again.'
        ]);
    }

    public function paymentStatus(Booking $booking)
    {
        // Check if this is a markup booking and calculate the correct display amount
        $displayAmount = $booking->total_price;

        // If it's a markup booking, use the markup final amount
        if ($booking->markup_id && $booking->markup) {
            $checkIn = Carbon::parse($booking->check_in_date);
            $checkOut = Carbon::parse($booking->check_out_date);
            $nights = max(1, $checkOut->diffInDays($checkIn));
            $displayAmount = $booking->markup->final_amount * $nights;
        }

        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $displayAmount,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }

    public function add(Request $request, SmsService $smsService)
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'variation_id' => 'nullable',
        ]);

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'external_booking' => 'Yes',
            'status' => 'paid',
            'variation_id'=>$request->variation_id
        ]);

        // Send SMS for external booking
        $this->sendBookingConfirmationSms($booking, 'external', $smsService);

        return redirect()->route('bookings.index')->with('success', 'Booking added successfully.');
    }

    public function lookup(Request $request)
    {
        $request->validate([
            'type' => 'required|in:car,property',
            'number' => 'required|string',
        ]);

        if ($request->type === 'car') {
            $booking = CarBooking::where('number', $request->number)->first();
            return redirect()->route('car-bookings.show', $booking->id);
        } else {
            $booking = Booking::where('number', $request->number)->first();

            if (!$booking) {
                return back()->withErrors(['number' => 'Booking not found.']);
            }

            return Inertia::render('RistayPass', [
                'booking' => $booking->load([
                    'user',
                    'property.propertyAmenities',
                    'property.propertyFeatures',
                    'property.initialGallery',
                    'property.PropertyServices',
                    'property.user',
                ]),
            ]);
        }
    }

    public function show(Booking $booking)
    {
        $booking->load([
            'user',
            'property.propertyAmenities',
            'property.propertyFeatures',
            'property.initialGallery',
            'property.PropertyServices',
            'property.user',
            'refunds',
            'payment' // Load the payment relationship
        ]);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking,
            'max_refundable_amount' => $booking->max_refundable_amount,
            'payment_summary' => $booking->payment_summary, // Pass payment summary to frontend
        ]);
    }

    public function edit(Booking $booking)
    {
        $users = User::all();
        $properties = Property::where('status', 'available')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking,
            'users' => $users,
            'properties' => $properties,
        ]);
    }

    public function update(Request $request, Booking $booking, SmsService $smsService)
    {
        $validated = $request->validate([
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'verification_code' => 'nullable|string',
        ]);

        // Handle check-in with verification
        if ($request->has('checked_in')) {
            if ($booking->checked_in) {
                return back()->with('error', 'This booking is already checked in.');
            }

            // Generate and send verification code if not already set
            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckInVerification($booking));

                $user = User::find($booking->user_id);

                // Send check-in verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for check-in verification is: {$booking->checkin_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-in.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_in = now();
            $booking->checkin_verification_code = null;
            $booking->save();

            // Send check-in confirmation SMS
            $this->sendCheckInConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked in!');
        }

        // Handle check-out with verification
        if ($request->has('checked_out')) {
            if ($booking->checked_out) {
                return back()->with('error', 'This booking is already checked out.');
            }

            if (!$booking->checked_in) {
                return back()->with('error', 'Cannot check out before checking in.');
            }

            // Generate and send verification code if not already set
            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckOutVerification($booking));

                $user = User::find($booking->user_id);

                // Send check-out verification SMS
                $smsService->sendSms(
                    $user->phone,
                    "Hello {$user->name}, Your OTP for check-out verification is: {$booking->checkout_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Please enter it to complete check-out.');
            }

            // Verify the code
            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->checked_out = now();
            $booking->checkout_verification_code = null;
            $booking->save();

            // Send check-out confirmation SMS
            $this->sendCheckOutConfirmationSms($booking, $smsService);

            return back()->with('success', 'Successfully checked out!');
        }

        return back()->with('error', 'No valid action performed.');
    }

    public function cancel(Request $request, SmsService $smsService)
    {
        $input = $request->all();

        $booking = Booking::with('property.user')->find($input['id']);

        $request->validate([
            'cancel_reason' => 'required|string|min:10|max:500',
        ]);

        if ($booking->checked_in || $booking->status === 'Cancelled') {
            return back()->with('error', 'Booking cannot be cancelled at this stage.');
        }

        $booking->update([
            'status' => 'Cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by_id' => auth()->id(),
        ]);

        $booking->check_in_date = Carbon::parse($booking->check_in_date);
        $booking->check_out_date = Carbon::parse($booking->check_out_date);

        try {
            Mail::to($booking->user->email)->send(new BookingCancelled($booking, 'guest'));
            Mail::to($booking->property->user->email)->send(new BookingCancelled($booking, 'host'));

            // Send cancellation SMS to guest
            $this->sendCancellationSms($booking, $smsService);

        } catch (\Exception $e) {
            Log::error('Cancellation email/SMS error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();

        return redirect()->route('bookings.index')->with('success', 'Booking deleted successfully.');
    }

    /**
     * SMS Notification Methods
     */

    private function sendBookingConfirmationSms(Booking $booking, string $type = 'confirmed', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $checkIn = Carbon::parse($booking->check_in_date)->format('M j, Y');
            $checkOut = Carbon::parse($booking->check_out_date)->format('M j, Y');

            switch ($type) {
                case 'pending':
                    $message = "Hello {$user->name}, your booking request at {$property->property_name} has been sent to the host. You'll be notified once they confirm. Amount: KES {$booking->total_price}. Check-in: {$checkIn}";
                    break;

                case 'Booked':
                    $message = "Hello {$user->name}, your booking at {$property->property_name} is confirmed! Booking #{$booking->number}. Check-in: {$checkIn}, Check-out: {$checkOut}. Thank you for choosing Ristay!";
                    break;

                case 'confirmed':
                    $message = "Hello {$user->name}, your booking request for {$property->property_name} has been approved! Please complete payment to confirm your booking.";
                    break;

                case 'external':
                    $message = "Hello {$user->name}, your external booking at {$property->property_name} has been added. Check-in: {$checkIn}, Check-out: {$checkOut}";
                    break;

                default:
                    $message = "Hello {$user->name}, your booking at {$property->property_name} has been updated. Status: {$booking->status}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Booking confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendBookingRequestSmsToHost(Booking $booking, SmsService $smsService)
    {
        try {
            $host = $booking->property->user;
            
            if ($host->phone) {
                $guestName = $booking->user->name;
                $propertyName = $booking->property->property_name;
                $checkIn = Carbon::parse($booking->check_in_date)->format('M j, Y');
                $checkOut = Carbon::parse($booking->check_out_date)->format('M j, Y');
                
                $message = "Hello {$host->name}, you have a new booking request from {$guestName} for {$propertyName}. Dates: {$checkIn} to {$checkOut}. Please check your email to approve or reject.";
                
                $smsService->sendSms($host->phone, $message);
            }
            
        } catch (\Exception $e) {
            Log::error('Booking request SMS to host failed: ' . $e->getMessage());
        }
    }

    private function sendCheckInConfirmationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, you have successfully checked in to {$property->property_name}. We hope you enjoy your stay!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Check-in confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCheckOutConfirmationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, thank you for staying at {$property->property_name}. We hope to see you again soon!";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Check-out confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCancellationSms(Booking $booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $message = "Hello {$user->name}, your booking at {$property->property_name} has been cancelled. We hope to host you in the future.";

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Cancellation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendRefundSms(Booking $booking, string $status, float $amount = 0, SmsService $smsService, string $reason = '')
    {
        try {
            $user = $booking->user;

            if ($status === 'approved') {
                $message = "Hello {$user->name}, your refund request for booking #{$booking->number} has been approved. Amount: KES {$amount}. Refund will be processed within 3-5 business days.";
            } else {
                $message = "Hello {$user->name}, your refund request for booking #{$booking->number} has been rejected.";
                if (!empty($reason)) {
                    $message .= " Reason: {$reason}";
                }
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            Log::error('Refund SMS failed: ' . $e->getMessage());
        }
    }

    protected function sendConfirmationEmails(Booking $booking)
    {
        try {
            if (is_string($booking->check_in_date)) {
                $booking->check_in_date = \Carbon\Carbon::parse($booking->check_in_date);
            }
            if (is_string($booking->check_out_date)) {
                $booking->check_out_date = \Carbon\Carbon::parse($booking->check_out_date);
            }

            Mail::to($booking->user->email)
                ->send(new BookingConfirmation($booking, 'customer'));

            // Send to host
            if ($booking->property->user) {
                Mail::to($booking->property->user->email)
                    ->send(new BookingConfirmation($booking, 'host'));
            }

        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
                'error' => $e
            ]);
        }
    }

    /**
     * Handle M-Pesa STK Push callback
     */
    public function handleCallback(Request $request, SmsService $smsService)
    {
        try {
            // Parse callback data
            $callbackData = $request->json()->all();

             Log::info('MPesa Callback Received - Parsed', [
                'callback_data' => $callbackData,
                'full_request' => $request->all()
            ]);

            // Extract transaction details
            $resultCode = $callbackData['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'] ?? null;
            $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'] ?? null;
            $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'] ?? null;

            // Get additional callback parameters
            $callbackParams = json_decode($request->query('data'), true);

            // Find the booking with all necessary relationships
            $booking = Booking::with(['user', 'property.user', 'payments'])
                            ->find($callbackParams['booking_id'] ?? null);

            if (!$booking) {
                Log::error('Booking not found', ['booking_id' => $callbackParams['booking_id'] ?? null]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Prepare payment data
            $paymentData = [
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'amount' => $callbackParams['amount'] ?? $booking->total_price,
                'method' => 'mpesa',
                'phone' => $callbackParams['phone'] ?? null,
                'checkout_request_id' => $checkoutRequestID,
                'merchant_request_id' => $merchantRequestID,
                'booking_type' => $callbackParams['booking_type'] ?? 'property',
                'status' => $resultCode === 0 ? 'completed' : 'failed',
                'failure_reason' => $resultCode !== 0 ? $resultDesc : null,
            ];

            // Process successful payment
            if ($resultCode === 0) {
                $callbackMetadata = $callbackData['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];

                foreach ($callbackMetadata as $item) {
                    switch ($item['Name']) {
                        case 'MpesaReceiptNumber':
                            $paymentData['mpesa_receipt'] = $item['Value'];
                            break;
                        case 'TransactionDate':
                            $paymentData['transaction_date'] = date('Y-m-d H:i:s', strtotime($item['Value']));
                            break;
                        case 'Amount':
                            $paymentData['amount'] = $item['Value'];
                            break;
                        case 'PhoneNumber':
                            $paymentData['phone'] = $item['Value'];
                            break;
                    }
                }

                $booking->update(['status' => 'paid']);

                // Send confirmation emails and SMS
                $this->sendConfirmationEmails($booking);
                $this->sendBookingConfirmationSms($booking, 'confirmed', $smsService);

            } else {
                $booking->update([
                    'status' => 'failed',
                    'checked_in'=> null
                ]);
                // Send payment failure SMS
                $this->sendPaymentFailureSms($booking, $resultDesc, $smsService);
                Log::error('Payment failed', [
                    'booking_id' => $booking->id,
                    'error' => $resultDesc
                ]);
            }

            // Create payment record
            Payment::create($paymentData);

            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Callback processing error: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return response()->json([
                'ResultCode' => 1,
                'ResultDesc' => 'Error processing callback'
            ], 500);
        }
    }


    public function hostBookings(Request $request)
    {
        $user = Auth::user();
        
        // Only hosts can access this
        if ($user->role_id != 2) {
            abort(403, 'Unauthorized');
        }
        
        $query = Booking::with(['user', 'property'])
            ->whereHas('property', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc');
        
        // Search functionality
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('property', function ($q) use ($search) {
                    $q->where('property_name', 'LIKE', "%$search%");
                });
            });
        }
        
        $bookings = $query->paginate(10);
        
        return Inertia::render('Bookings/HostRequests', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Confirm booking request (for host)
     */

    public function confirmBooking(Request $request, $id, SmsService $smsService)
    {
        $booking = Booking::with(['user', 'property.user'])->findOrFail($id);
        $user = Auth::user();
        
        // Check if user is the property owner
        if ($user->id !== $booking->property->user_id) {
            abort(403, 'Unauthorized');
        }
        
        // Check if booking is still pending
        if ($booking->status !== 'pending') {
            return redirect()->back()->with('error', 'This booking is no longer pending.');
        }
        
        // Update booking status
        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now()
        ]);
        
        // Send payment instructions to guest
        $this->sendPaymentInstructions($booking);
        
        // Send confirmation SMS to guest
        $this->sendBookingConfirmationSms($booking, 'confirmed', $smsService);
        
        return redirect()->back()->with('success', 'Booking confirmed successfully. Guest has been notified to complete payment.');
    }

    /**
     * Reject booking request (for host)
     */
    public function rejectBooking(Request $request, $id, SmsService $smsService)
    {
        $booking = Booking::with(['user', 'property.user'])->findOrFail($id);
        $user = Auth::user();
        
        // Check if user is the property owner
        if ($user->id !== $booking->property->user_id) {
            abort(403, 'Unauthorized');
        }
        
        // Check if booking is still pending
        if ($booking->status !== 'pending') {
            return redirect()->back()->with('error', 'This booking is no longer pending.');
        }
        
        $request->validate([
            'reason' => 'required|string|min:10|max:500'
        ]);
        
        // Update booking status
        $booking->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'rejected_at' => now()
        ]);
        
        // Send rejection notification to guest
        $this->sendBookingRejectionNotification($booking, $smsService);
        
        return redirect()->back()->with('success', 'Booking request rejected successfully.');
    }

    private function sendPaymentInstructions($booking)
    {
        try {
            $user = $booking->user;
            
            Mail::to($user->email)->send(new \App\Mail\PaymentInstructions($booking));
            
            // Also send SMS with payment instructions
            $smsService = new SmsService();
            $message = "Hello {$user->name}, your booking request for {$booking->property->property_name} has been approved! Please login to complete payment and confirm your booking.";
            $smsService->sendSms($user->phone, $message);
            
        } catch (\Exception $e) {
            Log::error('Failed to send payment instructions: ' . $e->getMessage());
        }
    }

    private function sendBookingRejectionNotification($booking, SmsService $smsService)
    {
        try {
            $user = $booking->user;
            
            Mail::to($user->email)->send(new \App\Mail\BookingRejected($booking));
            
            // Send rejection SMS
            $message = "Hello {$user->name}, your booking request for {$booking->property->property_name} has been declined by the host. Reason: {$booking->rejection_reason}";
            $smsService->sendSms($user->phone, $message);
            
        } catch (\Exception $e) {
            Log::error('Failed to send booking rejection notification: ' . $e->getMessage());
        }
    }


    /**
     * Show payment page for confirmed booking
     */
    public function showPayBooking(Booking $booking)
    {
        // Only allow payment for bookings that are confirmed but not paid
        if ($booking->status !== 'confirmed') {
            return redirect()->back()->with('error', 'This booking cannot be paid.');
        }
        
        $booking->load(['user', 'property']);
        $company = Company::first();
        
        return Inertia::render('Bookings/PayBooking', [
            'booking' => $booking,
            'auth' => ['user' => Auth::user()],
            'company' => $company,
        ]);
    }

    /**
     * Process payment for confirmed booking
     */
    public function processPayment(Request $request, Booking $booking, SmsService $smsService, PesapalService $pesapalService)
    {
        // Validate
        if ($booking->status !== 'confirmed') {
            return back()->withErrors(['payment' => 'This booking cannot be paid.']);
        }
        
        $request->validate([
            'payment_method' => 'required|in:mpesa,pesapal',
            'phone' => 'required_if:payment_method,mpesa'
        ]);
        
        $user = Auth::user();
        $company = Company::first();
        
        // Calculate final amount with referral discount if applicable
        $finalAmount = $booking->total_price;
        
        if ($booking->referral_code && $company) {
            $discount = ($booking->total_price * $company->booking_referral_percentage) / 100;
            $finalAmount = $booking->total_price - $discount;
        }
        
        $finalAmount = ceil($finalAmount);
        
        // Update booking with payment method
        $booking->update([
            'payment_method' => $request->payment_method,
            'guest_phone' => $request->phone
        ]);
        
        // Process payment based on method
        if ($request->payment_method === 'mpesa') {
            return $this->processMpesaPayment($booking, $request->phone, $finalAmount);
        } elseif ($request->payment_method === 'pesapal') {
            return $this->processPesapalPayment($booking, $user, $finalAmount, $pesapalService);
        }
        
        return back()->withErrors(['payment' => 'Invalid payment method.']);
    }
}
