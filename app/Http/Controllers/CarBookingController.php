<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarBookingRequest;
use App\Models\CarBooking;
use App\Models\Car;
use App\Models\User;
use App\Models\Payment;
use App\Services\SmsService;
use App\Traits\Mpesa;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Mail\CarBookingConfirmation;
use App\Mail\CancelledCarBooking;
use App\Mail\CarCheckInVerification;
use App\Mail\CarCheckOutVerification;

class CarBookingController extends Controller
{
    use Mpesa;

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
                match($status) {
                    'checked_out' => $q->whereNotNull('checked_out'),
                    'checked_in' => $q->whereNull('checked_out')->whereNotNull('checked_in'),
                    'upcoming_stay' => $q->where('status', 'paid')->whereNull('checked_in'),
                    default => $q->where('status', $status)
                };
            });
        }

        if ($search = $request->input('search')) {
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%")
            );
        }

        if ($startDate = $request->query('start_date')) {
            $endDate = $request->query('end_date');
            if ($endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
        }

        $carBookings = $query->paginate(10);

        return Inertia::render('CarBookings/Index', [
            'carBookings' => $carBookings->items(),
            'pagination' => $carBookings,
            'flash' => session('flash'),
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $query = Car::with('bookings');

        if ($user->role_id == 2) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('CarBookings/Create', [
            'cars' => $query->get(),
        ]);
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
            'total_price' => $totalPrice,
            'status' => 'pending',
            'dropoff_location' => $request->pickup_location
        ]));

        try {
            // Prepare callback URL for M-Pesa
            $callbackBase = env('MPESA_RIDE_CALLBACK_URL') ?? secure_url('/api/mpesa/ride/stk/callback');
            $callbackData = [
                'phone' => $request->phone,
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'car'
            ];
            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

            // Initiate M-Pesa STK Push
            $this->STKPush(
                'Paybill',
                $booking->total_price,
                $request->phone,
                $callbackUrl,
                'reference',
                'Book Ristay'
            );

            return redirect()->route('ride.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment initiated. Please complete M-Pesa payment on your phone.'
            ]);

        } catch (\Exception $e) {
            \Log::error('M-Pesa payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);
            return back()->withErrors(['payment' => 'Payment initiation failed.']);
        }
    }

    public function handleCallback(Request $request)
    {
        try {
            $data = $request->json()->all();
            $callbackParams = json_decode($request->query('data'), true);
            $booking = CarBooking::with('car.user')->find($callbackParams['booking_id'] ?? null);

            if (!$booking) return response()->json(['message' => 'Booking not found'], 404);

            $resultCode = $data['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $data['Body']['stkCallback']['ResultDesc'] ?? null;
            $checkoutRequestID = $data['Body']['stkCallback']['CheckoutRequestID'] ?? null;
            $merchantRequestID = $data['Body']['stkCallback']['MerchantRequestID'] ?? null;

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
                $callbackMetadata = $data['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];
                foreach ($callbackMetadata as $item) {
                    match($item['Name']) {
                        'MpesaReceiptNumber' => $paymentData['mpesa_receipt'] = $item['Value'],
                        'TransactionDate' => $paymentData['transaction_date'] = date('Y-m-d H:i:s', strtotime($item['Value'])),
                        'Amount' => $paymentData['amount'] = $item['Value'],
                        'PhoneNumber' => $paymentData['phone'] = $item['Value'],
                        default => null
                    };
                }
                $booking->update(['status' => 'paid']);
                $this->sendCarBookingConfirmationSms($booking, 'confirmed');
            } else {
                $booking->update(['status' => 'failed']);
            }

            Payment::create($paymentData);

            return response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Callback processed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Car booking callback error: ' . $e->getMessage());
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Error processing callback'], 500);
        }
    }

    public function update(Request $request, SmsService $smsService)
    {
        $booking = CarBooking::findOrFail($request->id);
        $validated = $request->validate([
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'verification_code' => 'nullable|string',
        ]);

        // Check-in
        if ($request->has('checked_in')) {
            if ($booking->checked_in) return back()->with('error', 'Already checked in.');

            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckInVerification($booking));

                $smsService->sendSms(
                    $booking->user->phone,
                    "Hello {$booking->user->name}, Your OTP for car pickup is: {$booking->checkin_verification_code}"
                );

                return back()->with('success', 'OTP sent to email & phone.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update([
                'checked_in' => now(),
                'checkin_verification_code' => null
            ]);

            $this->sendCarCheckInConfirmationSms($booking);

            return back()->with('success', 'Checked in successfully.');
        }

        // Check-out
        if ($request->has('checked_out')) {
            if ($booking->checked_out) return back()->with('error', 'Already checked out.');
            if (!$booking->checked_in) return back()->with('error', 'Cannot check out before check-in.');

            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                $smsService->sendSms(
                    $booking->user->phone,
                    "Hello {$booking->user->name}, Your OTP for car drop-off is: {$booking->checkout_verification_code}"
                );

                Mail::to($booking->user->email)->send(new CarCheckOutVerification($booking));

                return back()->with('success', 'OTP sent to email & phone.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update([
                'checked_out' => now(),
                'checkout_verification_code' => null
            ]);

            $this->sendCarCheckOutConfirmationSms($booking);

            return back()->with('success', 'Checked out successfully.');
        }

        return back()->with('error', 'No valid action performed.');
    }

    public function destroy(CarBooking $carBooking)
    {
        $carBooking->delete();
        return redirect()->route('car-bookings.index')->with('success', 'Car booking deleted successfully.');
    }

    public function cancel(Request $request, SmsService $smsService)
    {
        $booking = CarBooking::findOrFail($request->id);

        $request->validate([
            'cancel_reason' => 'required|string|min:10|max:500',
        ]);

        $booking->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->cancel_reason
        ]);

        $smsService->sendSms($booking->user->phone, "Your car booking has been cancelled. Reason: {$request->cancel_reason}");
        Mail::to($booking->user->email)->send(new CancelledCarBooking($booking));

        return back()->with('success', 'Booking cancelled successfully.');
    }

    /** Helper methods for SMS/Email notifications **/

    protected function sendCarBookingConfirmationSms(CarBooking $booking, $status = 'confirmed')
    {
        $sms = new SmsService();
        $message = "Hello {$booking->user->name}, your car booking has been {$status}. Booking ID: {$booking->id}";
        $sms->sendSms($booking->user->phone, $message);

        Mail::to($booking->user->email)->send(new CarBookingConfirmation($booking));
    }

    protected function sendCarCheckInConfirmationSms(CarBooking $booking)
    {
        $sms = new SmsService();
        $message = "Hello {$booking->user->name}, you have successfully checked in. Booking ID: {$booking->id}";
        $sms->sendSms($booking->user->phone, $message);
    }

    protected function sendCarCheckOutConfirmationSms(CarBooking $booking)
    {
        $sms = new SmsService();
        $message = "Hello {$booking->user->name}, you have successfully checked out. Booking ID: {$booking->id}";
        $sms->sendSms($booking->user->phone, $message);
    }
}
