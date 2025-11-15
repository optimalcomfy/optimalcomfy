<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Markup;
use App\Models\Car;
use App\Models\Property;
use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use App\Services\SmsService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Services\PesapalService;

class MarkupBookingController extends Controller
{
    use \App\Traits\Mpesa;

    /**
     * Display user's markups - Main index page
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            return redirect()->route('dashboard')
                ->with('error', 'Only hosts can manage markups.');
        }

        $markups = $this->getUserMarkupsData($request);
        $stats = $this->getMarkupStatsData($user);

        return Inertia::render('Markup/Index', [
            'markups' => $markups,
            'stats' => $stats,
            'filters' => $request->only(['type']),
        ]);
    }

    /**
     * API endpoint to get user's markups (for React components)
     */
    public function getUserMarkups(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            return response()->json(['error' => 'Only hosts can manage markups.'], 403);
        }

        $markups = $this->getUserMarkupsData($request);
        $stats = $this->getMarkupStatsData($user);

        return response()->json([
            'markups' => $markups,
            'stats' => $stats
        ]);
    }

    /**
     * Get user markups data
     */
    private function getUserMarkupsData(Request $request)
    {
        $user = Auth::user();

        $query = Markup::with(['markupable', 'user'])
            ->where('user_id', $user->id)
            ->active()
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type')) {
            $type = $request->input('type');
            if ($type === 'cars') {
                $query->where('markupable_type', 'App\Models\Car');
            } elseif ($type === 'properties') {
                $query->where('markupable_type', 'App\Models\Property');
            }
        }

        return $query->get()->map(function($markup) {
            $item = $markup->markupable;
            return [
                'id' => $markup->id,
                'type' => $markup->markupable_type,
                'item' => [
                    'id' => $item->id,
                    'name' => $item->name ?? $item->property_name,
                    'original_amount' => $markup->original_amount,
                    'image' => $this->getItemImage($item),
                ],
                'markup_percentage' => $markup->markup_percentage,
                'markup_amount' => $markup->markup_amount,
                'final_amount' => $markup->final_amount,
                'profit' => $markup->profit,
                'markup_link' => $this->generateMarkupLink($markup),
                'created_at' => $markup->created_at->format('Y-m-d H:i:s'),
            ];
        });
    }

    /**
     * Get markup stats data
     */
    private function getMarkupStatsData($user)
    {
        $totalMarkups = Markup::where('user_id', $user->id)
            ->active()
            ->count();

        $totalProfit = Markup::where('user_id', $user->id)
            ->active()
            ->get()
            ->sum('profit');

        $bookingsThroughMarkup = Booking::whereHas('markup', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'paid')->count();

        $carBookingsThroughMarkup = CarBooking::whereHas('markup', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', 'paid')->count();

        return [
            'total_markups' => $totalMarkups,
            'total_profit' => $totalProfit,
            'total_bookings' => $bookingsThroughMarkup + $carBookingsThroughMarkup,
        ];
    }

    /**
     * Check if user exists by email
     */
    public function checkUserExists(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            return response()->json([
                'exists' => true,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }

    /**
     * Show markup booking page
     */
    public function showMarkupBooking($token)
    {
        $markupData = Cache::get("markup_link_{$token}");

        if (!$markupData) {
            abort(404, 'Booking link expired or invalid');
        }

        $markup = Markup::with([
            'markupable.user',
            'markupable.initialGallery'
        ])->find($markupData['markup_id']);

        if (!$markup || !$markup->is_active) {
            abort(404, 'Markup no longer available');
        }

        $item = $markup->markupable;
        $type = $markupData['type'];

        // Use conditional relationships based on model type
        if ($markup->markupable_type === 'App\Models\Car') {
            $item->load('media');
        }

        return Inertia::render('MarkupBooking/Show', [
            'item' => $item,
            'markup' => $markup,
            'markupToken' => $token,
            'type' => $type
        ]);
    }

    /**
     * Process markup booking - UPDATED with Pesapal support
     */
    public function processMarkupBooking(Request $request, $token, SmsService $smsService, PesapalService $pesapalService)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'special_requests' => 'nullable|string|max:500',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required_if:payment_method,mpesa|string',
            'payment_method' => 'required|in:mpesa,pesapal',
        ]);

        $markupData = Cache::get("markup_link_{$token}");

        if (!$markupData) {
            return redirect()->back()->with('error', 'Booking link expired or invalid');
        }

        $markup = Markup::find($markupData['markup_id']);

        if (!$markup || !$markup->is_active) {
            return redirect()->back()->with('error', 'Markup no longer available');
        }

        DB::beginTransaction();

        try {
            // Find or create user
            $user = $this->findOrCreateUser($request->only(['name', 'email', 'phone']));

            // Log in the user for this request
            Auth::login($user);

            if ($markupData['type'] === 'cars') {
                $booking = $this->processCarBooking($request, $markup, $markupData, $user);
                $bookingType = 'car';
            } else {
                $booking = $this->processPropertyBooking($request, $markup, $markupData, $user);
                $bookingType = 'property';
            }

            DB::commit();

            // Handle different payment methods
            if ($request->payment_method === 'mpesa') {
                return $this->initiateMarkupPayment($booking, $request->phone, $bookingType, $smsService);
            } elseif ($request->payment_method === 'pesapal') {
                return $this->initiateMarkupPesapalPayment($booking, $user, $bookingType, $pesapalService);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Markup booking failed: " . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to create booking. Please try again.')
                ->withInput();
        }
    }

    /**
     * Find or create user for markup booking
     */
    private function findOrCreateUser(array $userData)
    {
        // Check if user exists
        $user = User::where('email', $userData['email'])->first();

        if ($user) {
            // Update user information if needed
            $updates = [];
            if (empty($user->name) || $user->name !== $userData['name']) {
                $updates['name'] = $userData['name'];
            }
            if (empty($user->phone) || $user->phone !== $userData['phone']) {
                $updates['phone'] = $userData['phone'];
            }

            if (!empty($updates)) {
                $user->update($updates);
            }

            return $user;
        }

        // Create new user
        return User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'phone' => $userData['phone'],
            'password' => Hash::make(uniqid()), // Random password for external bookings
            'role_id' => 3, // Guest role
            'email_verified_at' => now(), // Auto-verify for bookings
        ]);
    }

    /**
     * Process property booking through markup - UPDATED with user parameter
     */
    private function processPropertyBooking($request, $markup, $markupData, $user)
    {
        $property = $markup->markupable;
        $nights = Carbon::parse($request->end_date)->diffInDays(Carbon::parse($request->start_date));

        // Calculate total using markup final amount
        $totalPrice = $markup->final_amount * $nights;

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $property->id,
            'markup_id' => $markup->id,
            'check_in_date' => $request->start_date,
            'check_out_date' => $request->end_date,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'external_booking' => true,
            'special_requests' => $request->special_requests,
        ]);

        return $booking;
    }

    /**
     * Process car booking through markup - UPDATED with user parameter
     */
    private function processCarBooking($request, $markup, $markupData, $user)
    {
        $car = $markup->markupable;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        // Calculate days (minimum 1 day) - FIXED: Use days instead of hours
        $days = max(1, $endDate->diffInDays($startDate));

        // Calculate total using markup final amount per DAY
        $totalPrice = $markup->final_amount * $days;

        $booking = CarBooking::create([
            'user_id' => $user->id,
            'car_id' => $car->id,
            'markup_id' => $markup->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'external_booking' => true,
            'special_requests' => $request->special_requests,
            'pickup_location' => $car->location_address,
            'dropoff_location' => $car->location_address,
        ]);

        return $booking;
    }

    /**
     * Initiate M-Pesa payment for markup booking
     */
    private function initiateMarkupPayment($booking, $phone, $bookingType, SmsService $smsService)
    {
        try {
            // Send booking confirmation SMS
            if ($bookingType === 'car') {
                $this->sendCarBookingConfirmationSms($booking, 'pending', $smsService);
            } else {
                $this->sendBookingConfirmationSms($booking, 'pending', $smsService);
            }

            $callbackBase = $bookingType === 'car'
                ? (env('MPESA_RIDE_CALLBACK_URL') ?? secure_url('/api/mpesa/ride/stk/callback'))
                : (config('services.mpesa.callback_url') ?? secure_url('/api/mpesa/stk/callback'));

            $company = Company::first();
            $finalAmount = ceil($booking->total_price);

            $callbackData = [
                'phone' => $phone,
                'amount' => $finalAmount,
                'booking_id' => $booking->id,
                'booking_type' => $bookingType
            ];

            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

            // Use your existing M-Pesa STK push
            $this->STKPush(
                'Paybill',
                $finalAmount,
                $phone,
                $callbackUrl,
                'reference',
                'Book Ristay'
            );

            // Redirect to pending payment page based on booking type
            if ($bookingType === 'car') {
                return redirect()->route('ride.payment.pending', [
                    'booking' => $booking->id,
                    'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
                ]);
            } else {
                return redirect()->route('booking.payment.pending', [
                    'booking' => $booking->id,
                    'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('M-Pesa payment initiation failed for markup booking: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            return back()
                ->withInput()
                ->withErrors(['payment' => 'Payment initiation failed due to a system error.']);
        }
    }

    /**
     * Initiate Pesapal payment for markup booking
     */
    private function initiateMarkupPesapalPayment($booking, $user, $bookingType, $pesapalService)
    {
        try {
            $company = Company::first();
            $finalAmount = ceil($booking->total_price);

            // Prepare order data
            $orderData = [
                'id' => $booking->number,
                'currency' => 'KES',
                'amount' => $finalAmount,
                'description' => $bookingType === 'car'
                    ? 'Car booking for ' . $booking->car->name
                    : 'Booking for ' . $booking->property->property_name,
                'callback_url' => $bookingType === 'car'
                    ? route('pesapal.car.callback')
                    : route('pesapal.callback'),
                'cancellation_url' => $bookingType === 'car'
                    ? route('ride.payment.cancelled', ['booking' => $booking->id])
                    : route('booking.payment.cancelled', ['booking' => $booking->id]),
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

            \Log::info('Submitting Pesapal markup order', [
                'booking_id' => $booking->id,
                'booking_type' => $bookingType,
                'order_data' => $orderData
            ]);

            $orderResponse = $pesapalService->createOrderDirect($orderData);

            \Log::info('Pesapal Markup Order Response', [
                'booking_id' => $booking->id,
                'order_response' => $orderResponse
            ]);

            if (isset($orderResponse['order_tracking_id']) && isset($orderResponse['redirect_url'])) {
                // Store Pesapal tracking ID in booking
                $booking->update([
                    'pesapal_tracking_id' => $orderResponse['order_tracking_id']
                ]);

                \Log::info('Pesapal markup payment initiated successfully', [
                    'booking_id' => $booking->id,
                    'tracking_id' => $orderResponse['order_tracking_id'],
                    'redirect_url' => $orderResponse['redirect_url']
                ]);

                // Return Inertia response for redirect
                return Inertia::render('PaymentRedirect', [
                    'success' => true,
                    'redirect_url' => $orderResponse['redirect_url'],
                    'booking_id' => $booking->id,
                    'message' => 'Payment initiated successfully',
                    'payment_method' => 'pesapal',
                    'booking_type' => $bookingType
                ]);

            } else {
                $errorType = $orderResponse['error']['error_type'] ?? 'unknown_error';
                $errorCode = $orderResponse['error']['code'] ?? 'unknown_code';
                $errorMessage = $orderResponse['error']['message'] ?? 'Unknown error occurred';

                \Log::error('Pesapal markup order creation failed', [
                    'error_type' => $errorType,
                    'error_code' => $errorCode,
                    'error_message' => $errorMessage,
                    'full_response' => $orderResponse
                ]);

                $booking->update([
                    'status' => 'failed'
                ]);

                return back()->withErrors([
                    'payment' => "Pesapal Error [$errorCode]: $errorMessage"
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('Pesapal markup payment initiation failed: ' . $e->getMessage());

            $booking->update([
                'status' => 'failed'
            ]);

            return back()->withErrors([
                'payment' => 'Payment initiation failed: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * SMS methods for markup bookings
     */
    private function sendBookingConfirmationSms($booking, string $type = 'confirmed', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $property = $booking->property;

            $checkIn = Carbon::parse($booking->check_in_date)->format('M j, Y');
            $checkOut = Carbon::parse($booking->check_out_date)->format('M j, Y');

            switch ($type) {
                case 'pending':
                    $message = "Hello {$user->name}, your booking at {$property->property_name} is pending payment. Amount: KES {$booking->total_price}. Check-in: {$checkIn}";
                    break;
                case 'confirmed':
                    $message = "Hello {$user->name}, your booking at {$property->property_name} is confirmed! Booking #{$booking->number}. Check-in: {$checkIn}, Check-out: {$checkOut}. Thank you for choosing Ristay!";
                    break;
                default:
                    $message = "Hello {$user->name}, your booking at {$property->property_name} has been updated. Status: {$booking->status}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Booking confirmation SMS failed: ' . $e->getMessage());
        }
    }

    private function sendCarBookingConfirmationSms($booking, string $type = 'confirmed', SmsService $smsService)
    {
        try {
            $user = $booking->user;
            $car = $booking->car;

            $startDate = Carbon::parse($booking->start_date)->format('M j, Y');
            $endDate = Carbon::parse($booking->end_date)->format('M j, Y');

            switch ($type) {
                case 'pending':
                    $message = "Hello {$user->name}, your car booking for {$car->name} is pending payment. Amount: KES {$booking->total_price}. Pickup: {$startDate}";
                    break;
                case 'confirmed':
                    $message = "Hello {$user->name}, your car booking for {$car->name} ({$car->license_plate}) is confirmed! Booking #{$booking->number}. Pickup: {$startDate}, Return: {$endDate}.";
                    break;
                default:
                    $message = "Hello {$user->name}, your car booking for {$car->name} has been updated. Status: {$booking->status}";
            }

            $smsService->sendSms($user->phone, $message);

        } catch (\Exception $e) {
            \Log::error('Car booking confirmation SMS failed: ' . $e->getMessage());
        }
    }

    /**
     * Add markup to a property/car
     */
    public function addMarkup(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Error', [
                    'error' => 'Only hosts can add markups'
                ])->withStatus(403);
            }
            return response()->json(['error' => 'Only hosts can add markups'], 403);
        }

        $request->validate([
            'item_id' => 'required|integer',
            'item_type' => 'required|in:cars,properties',
            'markup_value' => 'required|numeric|min:0',
            'is_percentage' => 'required|boolean',
        ]);

        DB::beginTransaction();

        try {
            if ($request->item_type === 'cars') {
                $item = Car::findOrFail($request->item_id);
            } else {
                $item = Property::findOrFail($request->item_id);
            }

            // Deactivate any existing markup for this user and item
            Markup::where('user_id', $user->id)
                ->where('markupable_id', $item->id)
                ->where('markupable_type', get_class($item))
                ->update(['is_active' => false]);

            // Create new markup
            $markup = new Markup([
                'user_id' => $user->id,
                'markup_percentage' => $request->is_percentage ? $request->markup_value : null,
                'markup_amount' => $request->is_percentage ? null : $request->markup_value,
                'original_amount' => $item->amount,
                'is_active' => true,
            ]);

            $markup->final_amount = $markup->calculateFinalAmount();
            $item->markups()->save($markup);

            DB::commit();

            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with([
                    'success' => 'Markup added successfully',
                    'markup_data' => [
                        'markup_link' => $this->generateMarkupLink($markup),
                        'markup' => [
                            'id' => $markup->id,
                            'base_amount' => $markup->original_amount,
                            'markup_percentage' => $markup->markup_percentage,
                            'markup_amount' => $markup->markup_amount,
                            'final_amount' => $markup->final_amount,
                            'your_profit' => $markup->profit,
                        ]
                    ]
                ]);
            }

            // For API requests, return JSON
            return response()->json([
                'message' => 'Markup added successfully',
                'markup_link' => $this->generateMarkupLink($markup),
                'markup' => [
                    'id' => $markup->id,
                    'base_amount' => $markup->original_amount,
                    'markup_percentage' => $markup->markup_percentage,
                    'markup_amount' => $markup->markup_amount,
                    'final_amount' => $markup->final_amount,
                    'your_profit' => $markup->profit,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Markup creation failed: " . $e->getMessage());

            $errorMessage = 'Failed to add markup. Please try again.';

            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', $errorMessage);
            }

            return response()->json([
                'error' => $errorMessage
            ], 400);
        }
    }

    /**
     * Remove markup
     */
    public function removeMarkup($markupId)
    {
        $user = Auth::user();

        $markup = Markup::where('user_id', $user->id)->findOrFail($markupId);

        DB::beginTransaction();

        try {
            $markup->deactivate();

            DB::commit();

            return response()->json(['message' => 'Markup removed successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error("Markup removal failed: " . $e->getMessage());

            return response()->json([
                'error' => 'Failed to remove markup. Please try again.'
            ], 400);
        }
    }

    /**
     * Get markup stats - API endpoint
     */
    public function getMarkupStats(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            return response()->json(['error' => 'Only hosts can access markup stats'], 403);
        }

        $stats = $this->getMarkupStatsData($user);

        return response()->json($stats);
    }

    /**
     * Export markup data
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Markup::with(['markupable', 'user'])
            ->where('user_id', $user->id)
            ->active();

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $filterByDate = !empty($startDate) && !empty($endDate);

        $query->when($filterByDate, function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        });

        // Type filter
        if ($type = $request->query('type')) {
            if ($type === 'cars') {
                $query->where('markupable_type', 'App\Models\Car');
            } elseif ($type === 'properties') {
                $query->where('markupable_type', 'App\Models\Property');
            }
        }

        $markups = $query->orderBy('created_at', 'desc')->get();

        $exportData = $markups->map(function ($markup) {
            $item = $markup->markupable;

            return [
                'id' => $markup->id,
                'item_type' => $markup->markupable_type === 'App\Models\Car' ? 'Car' : 'Property',
                'item_name' => $item->name ?? $item->property_name,
                'base_price' => 'KES ' . number_format($markup->original_amount, 2),
                'markup_type' => $markup->markup_percentage ? 'Percentage' : 'Fixed',
                'markup_value' => $markup->markup_percentage ?
                    $markup->markup_percentage . '%' :
                    'KES ' . number_format($markup->markup_amount, 2),
                'final_price' => 'KES ' . number_format($markup->final_amount, 2),
                'your_profit' => 'KES ' . number_format($markup->profit, 2),
                'markup_link' => $this->generateMarkupLink($markup),
                'created_at' => $markup->created_at->format('M d, Y H:i'),
                'status' => $markup->is_active ? 'Active' : 'Inactive',
            ];
        });

        return response()->json($exportData);
    }

    /**
     * Get item image URL
     */
    private function getItemImage($item)
    {
        // For cars
        if (isset($item->media) && $item->media->isNotEmpty()) {
            $firstMedia = $item->media->first();
            if (isset($firstMedia->url)) {
                return Storage::url($firstMedia->url);
            }
        }

        // For properties
        if (isset($item->initialGallery) && $item->initialGallery->isNotEmpty()) {
            $firstGallery = $item->initialGallery->first();
            if (isset($firstGallery->image)) {
                return Storage::url($firstGallery->image);
            }
        }

        return '/images/placeholder.jpg';
    }

    /**
     * Generate markup link
     */
    private function generateMarkupLink($markup)
    {
        $item = $markup->markupable;
        $type = $markup->markupable_type === 'App\Models\Car' ? 'cars' : 'properties';

        Cache::put(
            "markup_link_{$markup->markup_token}",
            [
                'markup_id' => $markup->id,
                'user_id' => $markup->user_id,
                'type' => $type,
                'id' => $item->id,
                'final_amount' => $markup->final_amount
            ],
            now()->addDays(30)
        );

        return url("/mrk-booking/{$markup->markup_token}");
    }

    // App\Http\Controllers\MarkupBookingController.php

    /**
     * Show host catalog page
     */
    public function showCatalog(User $user)
    {
        // Get active markups for this host
        $markups = Markup::with(['markupable'])
            ->where('user_id', $user->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($markup) {
                $item = $markup->markupable;

                return [
                    'id' => $markup->id,
                    'type' => $markup->markupable_type,
                    'item' => [
                        'id' => $item->id,
                        'name' => $item->name ?? $item->property_name,
                        'original_amount' => $markup->original_amount,
                        'final_amount' => $markup->final_amount,
                        'image' => $this->getItemImage($item),
                        'location' => $item->location ?? $item->location_address,
                        'features' => $this->getItemFeatures($item),
                        'rating' => $item->rating ?? null,
                    ],
                    'markup_link' => $this->generateMarkupLink($markup),
                    'created_at' => $markup->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Markup/MarkupCatalog', [
            'host' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_picture' => $user->profile_picture,
                'bio' => $user->bio,
                'ristay_verified' => $user->ristay_verified,
            ],
            'markups' => $markups,
        ]);
    }

    /**
     * Get item features for display
     */
    private function getItemFeatures($item)
    {
        $features = [];

        if ($item instanceof \App\Models\Car) {
            if ($item->seats) $features[] = $item->seats . ' seats';
            if ($item->transmission) $features[] = $item->transmission;
            if ($item->fuel_type) $features[] = $item->fuel_type;
        } elseif ($item instanceof \App\Models\Property) {
            if ($item->type) $features[] = $item->type;
            if ($item->bedrooms) $features[] = $item->bedrooms . ' bedrooms';
            if ($item->bathrooms) $features[] = $item->bathrooms . ' bathrooms';
        }

        return $features;
    }

    /**
     * Browse properties for markup
     */
    public function browseProperties(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Only hosts can browse properties for markup'], 403);
            }
            return redirect()->route('dashboard')
                ->with('error', 'Only hosts can browse properties for markup.');
        }

        \Log::info('Browse Properties Request:', $request->all());

        $query = Property::with(['user', 'initialGallery'])
            ->orderBy('created_at', 'desc');

        // Search filtering
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('property_name', 'LIKE', "%{$search}%")
                ->orWhere('type', 'LIKE', "%{$search}%")
                ->orWhere('location', 'LIKE', "%{$search}%")
                ->orWhere('apartment_name', 'LIKE', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Location filter
        if ($request->filled('location')) {
            $query->where('location', 'LIKE', "%{$request->input('location')}%");
        }

        // Price range filter
        if ($request->filled('minPrice')) {
            $query->where('amount', '>=', $request->input('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('amount', '<=', $request->input('maxPrice'));
        }

        // Debug: Get total count before pagination
        $totalCount = $query->count();
        \Log::info("Total properties found: {$totalCount}");

        $properties = $query->paginate(12);

        // Check if user has active markup on each property
        $properties->getCollection()->transform(function ($property) use ($user) {
            $property->has_user_markup = $property->userHasMarkup($user->id);
            $property->primary_image = $this->getItemImage($property);
            return $property;
        });

        \Log::info("Properties after transformation: " . $properties->count());

        if ($request->wantsJson()) {
            return response()->json([
                'properties' => $properties->items(),
                'pagination' => $properties,
                'debug' => [
                    'total_count' => $totalCount,
                    'filters_applied' => $request->all()
                ]
            ]);
        }

        return Inertia::render('Markup/BrowseProperties', [
            'properties' => $properties->items(),
            'pagination' => $properties,
            'filters' => $request->only(['search', 'type', 'location', 'minPrice', 'maxPrice']),
        ]);
    }

    /**
     * Browse cars for markup
     */
    public function browseCars(Request $request)
    {
        $user = Auth::user();

        if (!$user->canAddMarkup()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Only hosts can browse cars for markup'], 403);
            }
            return redirect()->route('dashboard')
                ->with('error', 'Only hosts can browse cars for markup.');
        }

        $query = Car::with(['user', 'media'])
            ->where('is_available', true)
            ->orderBy('created_at', 'desc');

        // Search filtering
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('brand', 'LIKE', "%{$search}%")
                ->orWhere('model', 'LIKE', "%{$search}%")
                ->orWhere('license_plate', 'LIKE', "%{$search}%");
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $query->where('brand', $request->input('brand'));
        }

        // Price range filter
        if ($request->filled('minPrice')) {
            $query->where('amount', '>=', $request->input('minPrice'));
        }
        if ($request->filled('maxPrice')) {
            $query->where('amount', '<=', $request->input('maxPrice'));
        }

        $cars = $query->paginate(12);

        // Check if user has active markup on each car
        $cars->getCollection()->transform(function ($car) use ($user) {
            $car->has_user_markup = $car->userHasMarkup($user->id);
            $car->primary_image = $this->getItemImage($car);
            return $car;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'cars' => $cars->items(),
                'pagination' => $cars
            ]);
        }

        return Inertia::render('Markup/BrowseCars', [
            'cars' => $cars->items(),
            'pagination' => $cars,
            'filters' => $request->only(['search', 'brand', 'minPrice', 'maxPrice']),
        ]);
    }
}
