<?php

namespace App\Http\Controllers;

use App\Models\CarBooking;
use Illuminate\Http\Request;
use App\Services\MpesaRefundService;
use App\Mail\CarRefundNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
                // Process the refund via M-Pesa
                $phone = $carBooking->user->phone;
                $amount = $request->refund_amount;
                $reference = (string)$carBooking->id; // Simplified reference
                
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
                    'refund_reference' => $reference,
                    'non_refund_reason' => null,
                    'refund_status' => 'processing',
                ]);
                
                // Notify user
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

                // Notify user
                Mail::to($carBooking->user->email)
                    ->send(new CarRefundNotification($carBooking, 'rejected', $request->reason));
                
                DB::commit();
                
                return redirect()->back()->with('success', 'Refund rejected successfully.');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('car_refunds')->error('Car refund processing failed: ' . $e->getMessage());
            
            return redirect()->back()
                ->withErrors(['error' => 'Refund processing failed: ' . $e->getMessage()]);
        }
    }

    public function handleRefundCallback(Request $request)
    {
        try {
            // Log incoming request
            \Log::info('MPesa Refund Callback Received', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            // Get reference (which is now just the booking ID)
            $bookingId = $request->input('reference');
            
            if (empty($bookingId)) {
                \Log::error('Missing booking ID in callback');
                return response()->json(['message' => 'Booking ID is required'], 400);
            }

            // Find the booking
            $booking = CarBooking::with(['user', 'vehicle'])
                ->where('id', $bookingId)
                ->first();

            if (!$booking) {
                \Log::error('Booking not found', ['booking_id' => $bookingId]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Process the refund result
            $result = $request->json('Result');
            if (empty($result)) {
                \Log::error('Missing result data in callback');
                return response()->json(['message' => 'Result data is required'], 400);
            }

            $resultCode = $result['ResultCode'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? 'No description provided';

            // Update booking based on result
            if ($resultCode == 0 || $resultCode == '0') {
                $updateData = [
                    'refund_status' => 'completed',
                    'refund_completed_at' => now(),
                    'transaction_receipt' => $result['TransactionID'] ?? null
                ];

                $booking->update($updateData);

                \Log::info('Refund successfully processed', [
                    'booking_id' => $bookingId,
                    'transaction_id' => $updateData['transaction_receipt'],
                    'amount_refunded' => $booking->refund_amount
                ]);
            } else {
                $updateData = [
                    'refund_status' => 'failed',
                    'refund_failed_reason' => $resultDesc,
                    'transaction_receipt' => $result['TransactionID'] ?? null
                ];

                $booking->update($updateData);

                \Log::error('Refund processing failed', [
                    'booking_id' => $bookingId,
                    'mpesa_result_code' => $resultCode,
                    'failure_reason' => $resultDesc
                ]);
            }

            return response()->json([
                'message' => 'Callback processed successfully',
                'booking_id' => $bookingId,
                'status' => $booking->refresh()->refund_status
            ], 200);

        } catch (\Exception $e) {
            \Log::critical('Unhandled exception in refund callback', [
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'message' => 'An internal server error occurred',
                'error_reference' => 'REF_' . uniqid()
            ], 500);
        }
    }
}