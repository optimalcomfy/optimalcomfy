<?php

namespace App\Http\Controllers;

use App\Models\CarBooking;
use Illuminate\Http\Request;
use App\Services\MpesaRefundService;
use App\Mail\CarRefundNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Refund;

class CarRefundController extends Controller
{
    protected $mpesaRefundService;

    public function __construct(MpesaRefundService $mpesaRefundService)
    {
        $this->mpesaRefundService = $mpesaRefundService;
    }

    public function handleRefund(Request $request, CarBooking $carBooking)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:255',
            'refund_amount' => 'required_if:action,approve|numeric|min:0|max:'.$carBooking->total_price,
        ]);

        DB::beginTransaction();
        try {
            if ($request->action === 'approve') {
                $phone = $carBooking->user->phone;
                $amount = $request->refund_amount;
                $reference = (string)$carBooking->id; // Simple numeric reference

                $response = $this->mpesaRefundService->processRefund(
                    $phone,
                    $amount,
                    $reference
                );

                if (isset($response['error'])) {
                    throw new \Exception($response['error']);
                }

                $carBooking->update([
                    'refund_approval' => 'approved',
                    'refund_amount' => $amount,
                    'non_refund_reason' => null,
                    'refund_status' => 'processing',
                ]);

                Refund::create([
                    "amount" => $amount,
                    "booking_id" => null,
                    "car_booking_id" => $carBooking->id,
                ]);

                Mail::to($carBooking->user->email)
                    ->send(new CarRefundNotification($carBooking, 'approved'));

                DB::commit();
                return redirect()->back()->with('success', 'Refund approved and processing initiated.');
            } else {
                $carBooking->update([
                    'refund_approval' => 'rejected',
                    'non_refund_reason' => $request->reason,
                    'refund_amount' => 0,
                    'refund_status' => null,
                ]);

                Mail::to($carBooking->user->email)
                    ->send(new CarRefundNotification($carBooking, 'rejected', $request->reason));

                DB::commit();
                return redirect()->back()->with('success', 'Refund rejected successfully.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Refund processing failed: ' . $e->getMessage()]);
        }
    }

    public function handleRefundCallback(Request $request)
    {
        try {

            // Get the reference - expecting just the numeric booking ID
            $bookingId = (int)$request->input('reference');

            if ($bookingId <= 0) {
                return response()->json(['message' => 'Invalid booking ID'], 400);
            }

            // Find the booking
            $booking = CarBooking::where('id', $bookingId)
                        ->first();

            if (!$booking) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Process the result
            $result = $request->json('Result') ?? $request->all();
            $success = ($result['ResultCode'] ?? '') == '0';

            $booking->update([
                'refund_status' => $success ? 'completed' : 'failed',
                'refund_completed_at' => $success ? now() : null,
                'transaction_receipt' => $result['TransactionID'] ?? null,
                'refund_failed_reason' => $success ? null : ($result['ResultDesc'] ?? 'Unknown error')
            ]);

            return response()->json([
                'message' => 'Callback processed',
                'status' => $booking->refund_status
            ], 200);

        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Processing error'
            ], 500);
        }
    }
}
