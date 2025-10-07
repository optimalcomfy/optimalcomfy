<?php

namespace App\Http\Controllers;

use App\Models\CarBooking;
use App\Models\Car;
use App\Models\User;
use App\Models\Payment;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Mail\CarBookingConfirmed;
use App\Mail\CarCheckInVerification;
use App\Mail\CarCheckOutVerification;
use App\Mail\CarBookingCancelled;
use App\Traits\Mpesa;

class CarBookingController extends Controller
{
    use Mpesa;

    /**
     * List all car bookings with filtering.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $status = $request->input('status');
        $search = $request->input('search');

        $query = CarBooking::with(['user', 'car.user']);

        // Role-based filtering
        if ($user->role_id == 2) {
            $query->whereHas('car', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        // Status filter
        if ($status) {
            $query->where('status', $status);
        }

        // Search by name or car
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%$search%"))
                  ->orWhereHas('car', fn($c) => $c->where('name', 'like', "%$search%"))
                  ->orWhere('number', 'like', "%$search%");
            });
        }

        $bookings = $query->orderByDesc('created_at')->paginate(10);

        return Inertia::render('Admin/CarBookings/Index', [
            'bookings' => $bookings,
            'filters' => ['status' => $status, 'search' => $search],
        ]);
    }

    /**
     * Create car booking form.
     */
    public function create()
    {
        $cars = Car::with('user')->get();
        $users = User::all();

        return Inertia::render('Admin/CarBookings/Create', [
            'cars' => $cars,
            'users' => $users,
        ]);
    }

    /**
     * Store and initiate payment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'required|numeric|min:100',
            'phone' => 'required|string',
        ]);

        $user = Auth::user();

        $booking = CarBooking::create([
            'user_id' => $user->id,
            'car_id' => $request->car_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'price' => $request->price,
            'status' => 'pending',
        ]);

        try {
            $callbackBase = config('services.mpesa.callback_url') ?? secure_url('/api/mpesa/stk/callback');

            $callbackData = [
                'phone' => $request->phone,
                'amount' => $booking->price,
                'booking_id' => $booking->id,
                'booking_type' => 'car'
            ];

            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode($callbackData));

            $this->STKPush('Paybill', $booking->price, $request->phone, $callbackUrl, 'CarBooking', 'Ristay Car Booking');

            return redirect()->route('car-booking.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment initiated. Please complete the M-Pesa payment on your phone.'
            ]);
        } catch (\Exception $e) {
            \Log::error('M-Pesa STK Push failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);
            return back()->withErrors(['payment' => 'Payment initiation failed. Try again.']);
        }
    }

    /**
     * M-Pesa callback.
     */
    public function handleCallback(Request $request)
    {
        try {
            $callbackData = $request->json()->all();
            $resultCode = $callbackData['Body']['stkCallback']['ResultCode'] ?? null;
            $resultDesc = $callbackData['Body']['stkCallback']['ResultDesc'] ?? null;
            $checkoutRequestID = $callbackData['Body']['stkCallback']['CheckoutRequestID'] ?? null;
            $merchantRequestID = $callbackData['Body']['stkCallback']['MerchantRequestID'] ?? null;

            $params = json_decode($request->query('data'), true);
            $booking = CarBooking::with(['user', 'car.user'])->find($params['booking_id'] ?? null);

            if (!$booking) {
                \Log::error('Car booking not found for callback', ['id' => $params['booking_id'] ?? null]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            $paymentData = [
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'amount' => $params['amount'] ?? $booking->price,
                'method' => 'mpesa',
                'phone' => $params['phone'] ?? null,
                'checkout_request_id' => $checkoutRequestID,
                'merchant_request_id' => $merchantRequestID,
                'booking_type' => 'car',
                'status' => $resultCode === 0 ? 'completed' : 'failed',
                'failure_reason' => $resultCode !== 0 ? $resultDesc : null,
            ];

            if ($resultCode === 0) {
                $metadata = $callbackData['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];

                foreach ($metadata as $item) {
                    switch ($item['Name']) {
                        case 'MpesaReceiptNumber':
                            $paymentData['mpesa_receipt'] = $item['Value'];
                            break;
                        case 'TransactionDate':
                            $paymentData['transaction_date'] = date('Y-m-d H:i:s', strtotime($item['Value']));
                            break;
                        case 'PhoneNumber':
                            $paymentData['phone'] = $item['Value'];
                            break;
                        case 'Amount':
                            $paymentData['amount'] = $item['Value'];
                            break;
                    }
                }

                $booking->update(['status' => 'paid']);
                Mail::to($booking->user->email)->send(new CarBookingConfirmed($booking));
                if ($booking->car->user) {
                    Mail::to($booking->car->user->email)->send(new CarBookingConfirmed($booking));
                }
            } else {
                $booking->update(['status' => 'failed']);
            }

            Payment::create($paymentData);

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Callback handled']);
        } catch (\Exception $e) {
            \Log::error('Car booking callback error: ' . $e->getMessage());
            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Callback failed'], 500);
        }
    }

    /**
     * Payment pending view.
     */
    public function paymentPending($id, Request $request)
    {
        try {
            $booking = CarBooking::with('car')->findOrFail($id);
            $message = $request->query('message', 'Please complete payment on your phone.');

            return Inertia::render('CarBookings/PaymentPending', [
                'booking' => $booking,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment pending page error: ' . $e->getMessage());
            return redirect()->route('home')->with('error', 'Unable to load payment page.');
        }
    }

    /**
     * Check-in/out logic with SMS and email OTPs.
     */
    public function update(Request $request, CarBooking $booking, SmsService $sms)
    {
        $request->validate([
            'verification_code' => 'nullable|string',
        ]);

        if ($request->has('checked_in')) {
            if ($booking->checked_in) return back()->with('error', 'Already checked in.');

            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckInVerification($booking));
                $sms->sendSms($booking->user->phone, "Your car check-in OTP: {$booking->checkin_verification_code}");
                return back()->with('success', 'Verification code sent to your email/phone.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update(['checked_in' => now(), 'checkin_verification_code' => null]);
            return back()->with('success', 'Check-in successful.');
        }

        if ($request->has('checked_out')) {
            if ($booking->checked_out) return back()->with('error', 'Already checked out.');
            if (!$booking->checked_in) return back()->with('error', 'You must check in first.');

            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = CarBooking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CarCheckOutVerification($booking));
                $sms->sendSms($booking->user->phone, "Your car checkout OTP: {$booking->checkout_verification_code}");
                return back()->with('success', 'Checkout code sent.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid checkout code.');
            }

            $booking->update(['checked_out' => now(), 'checkout_verification_code' => null]);
            return back()->with('success', 'Checked out successfully.');
        }

        return back()->with('error', 'Invalid action.');
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:car_bookings,id',
            'cancel_reason' => 'required|string|min:10|max:255',
        ]);

        $booking = CarBooking::with('car.user')->find($request->id);

        if ($booking->status === 'Cancelled') {
            return back()->with('error', 'Already cancelled.');
        }

        $booking->update([
            'status' => 'Cancelled',
            'cancel_reason' => $request->cancel_reason,
            'cancelled_at' => now(),
        ]);

        Mail::to($booking->user->email)->send(new CarBookingCancelled($booking, 'customer'));
        Mail::to($booking->car->user->email)->send(new CarBookingCancelled($booking, 'host'));

        return back()->with('success', 'Booking cancelled.');
    }

    public function destroy(CarBooking $booking)
    {
        $booking->delete();
        return back()->with('success', 'Booking deleted.');
    }
}
