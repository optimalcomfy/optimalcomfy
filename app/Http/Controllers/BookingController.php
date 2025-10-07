<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\CarBooking;
use App\Models\User;
use App\Models\Property;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\MpesaStkController;
use App\Services\MpesaStkService;
use App\Traits\Mpesa;

use App\Mail\BookingConfirmation;
use App\Mail\CarBookingConfirmation;
use Illuminate\Support\Facades\Mail;
use App\Mail\RefundNotification;

use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

use App\Mail\CheckInVerification;
use App\Mail\CheckOutVerification;
use App\Mail\BookingCancelled;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Services\SmsService;

class BookingController extends Controller
{
    use Mpesa;

    // 🔹 Removed the constructor injection

    // =============== INDEX & EXPORT ===============
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Booking::with('user', 'property');

        if ($user->role_id == 2) {
            $query->whereHas('property', fn($q) => $q->where('user_id', $user->id));
        } elseif ($user->role_id == 3) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status') && $request->input('status') != null) {
            $status = $request->input('status');
            $query->where(function ($q) use ($status) {
                if ($status === 'checked_out') $q->whereNotNull('checked_out');
                elseif ($status === 'checked_in') $q->whereNull('checked_out')->whereNotNull('checked_in');
                elseif ($status === 'upcoming_stay') $q->where('status', 'paid')->whereNull('checked_in');
                else $q->where('status', $status);
            });
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', fn($q) => $q->where('name', 'LIKE', "%$search%")->orWhere('email', 'LIKE', "%$search%"));
        }

        if ($request->query('start_date') && $request->query('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'flash' => session('flash'),
        ]);
    }

    // =============== REFUND ===============
    public function handleRefund(Request $request, Booking $booking)
    {
        $smsService = app(SmsService::class); // 💬 resolve dynamically

        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:255',
            'refund_amount' => 'required_if:action,approve|numeric|min:0|max:' . $booking->total_price,
        ]);

        if ($request->action === 'approve') {
            $booking->update([
                'refund_approval' => 'approved',
                'refund_amount' => $request->refund_amount,
                'non_refund_reason' => null,
            ]);

            $this->sendRefundSms($booking, 'approved', $request->refund_amount, $smsService);
            Mail::to($booking->user->email)->send(new RefundNotification($booking, 'approved'));

            return back()->with('success', 'Refund approved successfully.');
        }

        $booking->update([
            'refund_approval' => 'rejected',
            'non_refund_reason' => $request->reason,
            'refund_amount' => 0,
        ]);

        $this->sendRefundSms($booking, 'rejected', 0, $smsService, $request->reason);
        Mail::to($booking->user->email)->send(new RefundNotification($booking, 'rejected', $request->reason));

        return back()->with('success', 'Refund rejected successfully.');
    }

    // =============== STORE ===============
    public function store(Request $request)
    {
        $smsService = app(SmsService::class); // 💬 resolve dynamically

        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'total_price' => 'required|numeric|min:1',
            'phone' => 'required|string',
        ]);

        $user = Auth::user();

        $booking = Booking::create([
            'user_id' => $user->id,
            'property_id' => $request->property_id,
            'check_in_date' => $request->check_in_date,
            'check_out_date' => $request->check_out_date,
            'total_price' => $request->total_price,
            'status' => 'pending',
        ]);

        try {
            $this->sendBookingConfirmationSms($booking, 'pending', $smsService);

            $callbackBase = config('services.mpesa.callback_url') ?? secure_url('/api/mpesa/stk/callback');
            $callbackUrl = $callbackBase . '?data=' . urlencode(json_encode([
                'phone' => $request->phone,
                'amount' => $booking->total_price,
                'booking_id' => $booking->id,
                'booking_type' => 'property',
            ]));

            $this->STKPush('Paybill', $booking->total_price, $request->phone, $callbackUrl, 'reference', 'Book Ristay');

            return redirect()->route('booking.payment.pending', [
                'booking' => $booking->id,
                'message' => 'Payment initiated. Please complete M-Pesa payment on your phone.'
            ]);
        } catch (\Exception $e) {
            \Log::error('M-Pesa payment initiation failed: ' . $e->getMessage());
            $booking->update(['status' => 'failed']);
            return back()->withErrors(['payment' => 'Payment initiation failed.']);
        }
    }

    // =============== UPDATE (Check-in / Check-out) ===============
    public function update(Request $request, Booking $booking)
    {
        $smsService = app(SmsService::class);

        if ($request->has('checked_in')) {
            if (!$booking->checkin_verification_code) {
                $booking->checkin_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckInVerification($booking));
                $smsService->sendSms($booking->user->phone, "Hello {$booking->user->name}, your OTP for check-in is: {$booking->checkin_verification_code}");

                return back()->with('success', 'OTP sent to email & phone.');
            }

            if ($request->verification_code !== $booking->checkin_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update(['checked_in' => now(), 'checkin_verification_code' => null]);
            $this->sendCheckInConfirmationSms($booking, $smsService);
            return back()->with('success', 'Checked in successfully!');
        }

        if ($request->has('checked_out')) {
            if (!$booking->checkout_verification_code) {
                $booking->checkout_verification_code = Booking::generateVerificationCode();
                $booking->save();

                Mail::to($booking->user->email)->send(new CheckOutVerification($booking));
                $smsService->sendSms($booking->user->phone, "Hello {$booking->user->name}, your OTP for check-out is: {$booking->checkout_verification_code}");

                return back()->with('success', 'OTP sent to email & phone.');
            }

            if ($request->verification_code !== $booking->checkout_verification_code) {
                return back()->with('error', 'Invalid verification code.');
            }

            $booking->update(['checked_out' => now(), 'checkout_verification_code' => null]);
            $this->sendCheckOutConfirmationSms($booking, $smsService);
            return back()->with('success', 'Checked out successfully!');
        }

        return back()->with('error', 'No valid action performed.');
    }

    // =============== CANCEL ===============
    public function cancel(Request $request)
    {
        $smsService = app(SmsService::class);
        $booking = Booking::with('property.user')->findOrFail($request->id);

        $request->validate(['cancel_reason' => 'required|string|min:10|max:500']);

        if ($booking->checked_in || $booking->status === 'Cancelled') {
            return back()->with('error', 'Booking cannot be cancelled.');
        }

        $booking->update([
            'status' => 'Cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by_id' => auth()->id(),
        ]);

        Mail::to($booking->user->email)->send(new BookingCancelled($booking, 'guest'));
        Mail::to($booking->property->user->email)->send(new BookingCancelled($booking, 'host'));

        $this->sendCancellationSms($booking, $smsService);

        return back()->with('success', 'Booking cancelled successfully.');
    }

    // =============== SMS HELPERS ===============
    private function sendBookingConfirmationSms(Booking $booking, string $type, SmsService $smsService)
    {
        $user = $booking->user;
        $property = $booking->property;
        $checkIn = Carbon::parse($booking->check_in_date)->format('M j, Y');
        $checkOut = Carbon::parse($booking->check_out_date)->format('M j, Y');

        $message = match ($type) {
            'pending' => "Hello {$user->name}, your booking at {$property->property_name} is pending payment. Amount: KES {$booking->total_price}.",
            'confirmed' => "Hello {$user->name}, your booking at {$property->property_name} is confirmed! Booking #{$booking->number}. Check-in: {$checkIn}, Check-out: {$checkOut}.",
            'external' => "Hello {$user->name}, your external booking at {$property->property_name} has been added.",
            default => "Hello {$user->name}, your booking status: {$booking->status}.",
        };

        $smsService->sendSms($user->phone, $message);
    }

    private function sendCheckInConfirmationSms(Booking $booking, SmsService $smsService)
    {
        $smsService->sendSms(
            $booking->user->phone,
            "Hello {$booking->user->name}, you have successfully checked in to {$booking->property->property_name}."
        );
    }

    private function sendCheckOutConfirmationSms(Booking $booking, SmsService $smsService)
    {
        $smsService->sendSms(
            $booking->user->phone,
            "Hello {$booking->user->name}, thank you for staying at {$booking->property->property_name}!"
        );
    }

    private function sendCancellationSms(Booking $booking, SmsService $smsService)
    {
        $smsService->sendSms(
            $booking->user->phone,
            "Hello {$booking->user->name}, your booking at {$booking->property->property_name} has been cancelled."
        );
    }

    private function sendRefundSms(Booking $booking, string $status, float $amount = 0, SmsService $smsService, string $reason = '')
    {
        $message = $status === 'approved'
            ? "Hello {$booking->user->name}, your refund of KES {$amount} for booking #{$booking->number} has been approved."
            : "Hello {$booking->user->name}, your refund for booking #{$booking->number} has been rejected. {$reason}";

        $smsService->sendSms($booking->user->phone, $message);
    }
}
