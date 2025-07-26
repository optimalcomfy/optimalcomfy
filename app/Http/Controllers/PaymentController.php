<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Models\User;
use App\Models\Booking;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['user', 'booking'])->orderBy('created_at', 'desc');

        $user = Auth::user();

        if ($user->role_id == 3) {
            $query->whereHas('booking', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } 

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $payments = $query->paginate(10);

        return Inertia::render('Payments/Index', [
            'payments' => $payments->items(),
            'pagination' => $payments,
            'flash' => session('flash'),
        ]);
    }


    public function exportData(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = Payment::with(['user', 'booking', 'carBooking', 'foodOrder', 'serviceBooking']);

        // Date filtering
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        if (!$startDate || !$endDate) {
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();
        }

        try {
            $validStartDate = Carbon::parse($startDate)->startOfDay();
            $validEndDate = Carbon::parse($endDate)->endOfDay();

            if ($validStartDate->lte($validEndDate)) {
                $query->whereBetween('created_at', [$validStartDate, $validEndDate]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format provided.'], 400);
        }

        // Search functionality
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('amount', 'LIKE', "%$search%")
                ->orWhere('method', 'LIKE', "%$search%")
                ->orWhere('status', 'LIKE', "%$search%")
                ->orWhere('transaction_id', 'LIKE', "%$search%")
                ->orWhere('mpesa_receipt', 'LIKE', "%$search%")
                ->orWhere('phone', 'LIKE', "%$search%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%$search%");
                })
                ->orWhereHas('booking', function ($q) use ($search) {
                    $q->where('number', 'LIKE', "%$search%");
                })
                ->orWhereHas('carBooking', function ($q) use ($search) {
                    $q->where('number', 'LIKE', "%$search%");
                });
            });
        }

        // Status filter
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Method filter
        if ($method = $request->query('method')) {
            $query->where('method', $method);
        }

        // Role-based filtering
        if ($user->role_id == 2) { // Property manager/owner
            $query->whereHas('user', function($q) use ($user) {
                $q->where('company_id', $user->company_id);
            });
        } elseif ($user->role_id == 3) { // Regular user
            $query->where('user_id', $user->id);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $exportData = $payments->map(function ($payment) {
            // Determine booking reference based on type
            $bookingReference = null;
            $bookingType = null;
            
            if ($payment->booking_type === 'property' && $payment->booking) {
                $bookingReference = $payment->booking->number;
                $bookingType = 'Property Booking';
            } elseif ($payment->booking_type === 'car' && $payment->carBooking) {
                $bookingReference = $payment->carBooking->number;
                $bookingType = 'Car Booking';
            } elseif ($payment->foodOrder) {
                $bookingReference = $payment->foodOrder->order_number;
                $bookingType = 'Food Order';
            } elseif ($payment->serviceBooking) {
                $bookingReference = $payment->serviceBooking->booking_reference;
                $bookingType = 'Service Booking';
            }

            return [
                'id' => $payment->id,
                'user_name' => optional($payment->user)->name,
                'amount' => 'KES ' . number_format($payment->amount, 2),
                'method' => ucfirst($payment->method),
                'status' => ucfirst($payment->status),
                'transaction_date' => $payment->transaction_date 
                    ? Carbon::parse($payment->transaction_date)->format('M d, Y H:i') 
                    : null,
                'transaction_id' => $payment->transaction_id,
                'mpesa_receipt' => $payment->mpesa_receipt,
                'phone' => $payment->phone,
                'booking_type' => $bookingType,
                'booking_reference' => $bookingReference,
                'failure_reason' => $payment->failure_reason,
                'created_at' => $payment->created_at->format('M d, Y H:i'),
            ];
        });

        return response()->json($exportData);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all();
        $bookings = Booking::all();

        return Inertia::render('Payments/Create', [
            'users' => $users,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        Payment::create($request->validated());

        return redirect()->route('payments.index')->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        return Inertia::render('Payments/Show', [
            'payment' => $payment->load(['user', 'booking']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        $users = User::all();
        $bookings = Booking::all();

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'users' => $users,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $payment->update($request->validated());

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
