<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Http\Requests\UpdateCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use App\Models\User;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Services\SmsService;
use App\Traits\Mpesa;
use App\Mail\CancelledCarBooking;
use App\Mail\CarBookingConfirmation;
use App\Mail\CarCheckInVerification;
use App\Mail\CarCheckOutVerification;

class CarBookingController extends Controller
{
    use Mpesa;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CarBooking::with(['car', 'user'])->orderBy('created_at', 'desc');
        $user = Auth::user();

        if ($user->role_id == 2) {
            $query->whereHas('car', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        if ($status = $request->input('status')) {
            $query->where(function ($q) use ($status) {
                if ($status === 'checked_out') $q->whereNotNull('checked_out');
                elseif ($status === 'checked_in') $q->whereNull('checked_out')->whereNotNull('checked_in');
                elseif ($status === 'upcoming_stay') $q->where('status', 'paid')->whereNull('checked_in');
                else $q->where('status', $status);
            });
        }

        if ($search = $request->input('search')) {
            $query->whereHas('user', fn($q) => $q->where('name', 'LIKE', "%$search%")->orWhere('email', 'LIKE', "%$search%"));
        }

        if ($startDate = $request->query('start_date')) {
            $endDate = $request->query('end_date');
            $query->when($endDate, fn($q) => $q->whereBetween('created_at', [$startDate, $endDate]));
        }

        $carBookings = $query->paginate(10);

        return Inertia::render('CarBookings/Index', [
            'carBookings' => $carBookings->items(),
            'pagination' => $carBookings,
            'flash' => session('flash'),
        ]);
    }

    public function exportData(Request $request)
    {
        $user = Auth::user();
        $query = CarBooking::with(['user', 'car']);

        if ($startDate = $request->query('start_date')) {
            $endDate = $request->query('end_date');
            $query->when($endDate, fn($q) => $q->whereBetween('created_at', [$startDate, $endDate]));
        }

        if ($status = $request->query('status')) {
            $query->where(function ($q) use ($status) {
                switch ($status) {
                    case 'checked_out': $q->whereNotNull('checked_out'); break;
                    case 'checked_in': $q->whereNotNull('checked_in')->whereNull('checked_out'); break;
                    case 'upcoming_stay': $q->where('status', 'paid')->whereNull('checked_in'); break;
                    default: $q->where('status', $status)->whereNull('checked_in')->whereNull('checked_out');
                }
            });
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%")
                  ->orWhere('status', 'LIKE', "%$search%")
                  ->orWhere('external_booking', 'LIKE', "%$search%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'LIKE', "%$search%"))
                  ->orWhereHas('car', fn($q2) => $q2->where('name', 'LIKE', "%$search%")->orWhere('license_plate', 'LIKE', "%$search%"));
            });
        }

        if ($user->role_id == 2) {
            $query->whereHas('car', fn($q) => $q->where('company_id', $user->company_id));
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        $carBookings = $query->orderBy('created_at', 'desc')->get();

        $exportData = $carBookings->map(function ($booking) {
            $days = Carbon::parse($booking->start_date)->diffInDays(Carbon::parse($booking->end_date));
            $totalPrice = optional($booking->car)->platform_price * max($days, 1);

            return [
                'number' => $booking->number,
                'guest_name' => optional($booking->user)->name,
                'car_name' => optional($booking->car)->name,
                'license_plate' => optional($booking->car)->license_plate,
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'days' => $days,
                'total_price' => 'KES ' . number_format($totalPrice, 2),
                'pickup_location' => $booking->pickup_location,
                'dropoff_location' => $booking->dropoff_location,
                'status' => $booking->status,
                'external_booking' => $booking->external_booking ? 'Yes' : 'No',
                'created_at' => $booking->created_at->toDateTimeString(),
            ];
        });

        return response()->json($exportData);
    }

    public function cancel(Request $request)
    {
        $booking = CarBooking::findOrFail($request->id);

        $request->validate(['cancel_reason' => 'required|string|min:10|max:500']);

        if ($booking->checked_in || $booking->status === 'Cancelled') {
            return back()->with('error', 'Booking cannot be cancelled at this stage.');
        }

        $booking->update([
            'status' => 'Cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by_id' => auth()->id(),
        ]);

        try {
            Mail::to($booking->user->email)->send(new CancelledCarBooking($booking, 'guest'));
            Mail::to($booking->car->user->email)->send(new CancelledCarBooking($booking, 'host'));
        } catch (\Exception $e) {
            \Log::error('Cancellation email error: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking has been cancelled successfully.');
    }

    public function create()
    {
        $user = Auth::user();
        $query = Car::with('bookings');

        if ($user->role_id == 2) $query->where('user_id', $user->id);

        return Inertia::render('CarBookings/Create', ['cars' => $query->get()]);
    }

    public function store(StoreCarBookingRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::user();
        $validated['user_id'] = $user->id;

        $car = Car::findOrFail($request->car_id);
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $days = max($startDate->diffInDays($endDate), 1);
        $totalPrice = $car->price_per_day * $days;

        $booking = CarBooking::create(array_merge($validated, [
            'user_id' => $user->id,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'dropoff_location' => $request->pickup_location
        ]));

        try {
            $callbackBase = env('MPESA_RIDE_CALLBACK_URL') ?? secure_url('/api/mpesa/ride/stk/callback');

            $callbackData = [
                'phone' => $request->phone,
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'car'
            ];

            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

            $this->STKPush('Paybill', $booking->total_price, $request->phone, $callbackUrl, 'reference', 'Book Ristay');

            return redirect()->route('ride.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
            ]);
        } catch (\Exception $e) {
            \Log::error('M-Pesa payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);

            return back()->withInput()->withErrors(['payment' => 'Payment initiation failed due to a system error.']);
        }
    }

    public function handleCallback(Request $request)
    {
        try {
            $callbackData = $request->json()->all();
            $callbackParams = json_decode($request->query('data'), true);
            $booking = CarBooking::with('car.user')->findOrFail($callbackParams['booking_id'] ?? null);

            $stkCallback = $callbackData['Body']['stkCallback'] ?? [];
            $resultCode = $stkCallback['ResultCode'] ?? null;
            $resultDesc = $stkCallback['ResultDesc'] ?? null;
            $merchantRequestID = $stkCallback['MerchantRequestID'] ?? null;
            $checkoutRequestID = $stkCallback['CheckoutRequestID'] ?? null;

            $paymentData = [
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'amount' => $callbackParams['amount'] ?? $booking->total_price,
                'method' => 'mpesa',
                'phone' => $callbackParams['phone'] ?? null,
                'checkout_request_id' => $checkoutRequestID,
                'merchant_request_id' => $merchantRequestID,
                'booking_type' => $callbackParams['booking_type'] ?? 'car',
                'status' => $resultCode === 0 ? 'completed' : 'failed',
                'failure_reason' => $resultCode !== 0 ? $resultDesc : null,
            ];

            if ($resultCode === 0) {
                foreach ($stkCallback['CallbackMetadata']['Item'] ?? [] as $item) {
                    match($item['Name']) {
                        'MpesaReceiptNumber' => $paymentData['mpesa_receipt'] = $item['Value'],
                        'TransactionDate' => $paymentData['transaction_date'] = date('Y-m-d H:i:s', strtotime($item['Value'])),
                        'Amount' => $paymentData['amount'] = $item['Value'],
                        'PhoneNumber' => $paymentData['phone'] = $item['Value'],
                        default => null
                    };
                }

                $booking->update(['status' => 'paid']);
            } else {
                $booking->update(['status' => 'failed']);
            }

            $payment = Payment::create($paymentData);

            if ($resultCode === 0) {
                Mail::to($booking->user->email)->send(new CarBookingConfirmation($booking, 'customer'));
                Mail::to($booking->car->user->email)->send(new CarBookingConfirmation($booking, 'host'));
            }

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Callback processed successfully']);
        } catch (\Exception $e) {
            \Log::error('M-Pesa callback error: ' . $e->getMessage());
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Error processing callback'], 500);
        }
    }

    public function paymentPending(CarBooking $booking, Request $request)
    {
        return Inertia::render('RidePaymentPending', [
            'booking' => $booking,
            'message' => $request->message ?? 'Payment is being processed.'
        ]);
    }

    public function paymentStatus(CarBooking $booking)
    {
        return response()->json([
            'status' => $booking->status,
            'paid' => $booking->status === 'paid',
            'amount' => $booking->total_price,
            'last_updated' => $booking->updated_at->toISOString()
        ]);
    }

    public function add(StoreCarBookingRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::user();
        $validated['user_id'] = $user->id;

        $car = Car::findOrFail($request->car_id);
        $days = max(Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)), 1);
        $totalPrice = $car->price_per_day * $days;

        $booking = CarBooking::create(array_merge($validated, [
            'user_id' => $user->id,
            'total_price' => $totalPrice,
            'external_booking' => 'Yes',
            'status' => 'Paid',
            'dropoff_location' => $request->pickup_location
        ]));

        return redirect()->route('car-bookings.index')->with('success', 'Car booking added successfully.');
    }

    public function show(CarBooking $carBooking)
    {
        return Inertia::render('CarBookings/Show', [
            'carBooking' => $carBooking->load(['car', 'user', 'car.category','car.initialGallery','car.carFeatures.feature','car.user']),
        ]);
    }

    public function edit(CarBooking $carBooking)
    {
        $cars = Car::all();
        return Inertia::render('CarBookings/Edit', ['carBooking' => $carBooking, 'cars' => $cars]);
    }

    public function update(Request $request, SmsService $smsService)
    {
        $booking = CarBooking::findOrFail($request->id);

        $validated = $request->validate([
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'verification_code' => 'nullable|string',
        ]);

        if ($request->has('checked_in')) {
            if ($booking->checked_in) return back()->with('error', 'This car booking is already checked in.');

            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckInVerification($booking));

                $smsService->sendSms(
                    $booking->user->phone,
                    "Hello {$booking->user->name}, Your OTP for car pick up verification is: {$booking->checkin_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Enter it to complete check-in.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update(['checked_in' => now(), 'checkin_verification_code' => null]);

            return back()->with('success', 'Successfully checked in!');
        }

        if ($request->has('checked_out')) {
            if ($booking->checked_out) return back()->with('error', 'This car booking is already checked out.');
            if (!$booking->checked_in) return back()->with('error', 'Cannot check out before checking in.');

            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckOutVerification($booking));

                $smsService->sendSms(
                    $booking->user->phone,
                    "Hello {$booking->user->name}, Your OTP for drop off verification is: {$booking->checkout_verification_code}"
                );

                return back()->with('success', 'Verification code sent to your email and phone. Enter it to complete check-out.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update(['checked_out' => now(), 'checkout_verification_code' => null]);

            return back()->with('success', 'Successfully checked out!');
        }

        return back()->with('error', 'No valid action performed.');
    }

    public function destroy(CarBooking $carBooking)
    {
        $carBooking->delete();
        return redirect()->route('car-bookings.index')->with('success', 'Car booking deleted successfully.');
    }
}
