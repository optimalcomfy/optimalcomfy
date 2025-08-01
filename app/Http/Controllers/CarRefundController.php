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
                $reference = 'CAR_' . $carBooking->id . '_' . now()->timestamp;
                
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
            \Log::info('Car Refund Callback Received', $request->all());

            // Validate reference exists
            $reference = $request->input('reference');
            if (!$reference) {
                \Log::warning('No reference in callback');
                return response()->json(['message' => 'Reference missing'], 400);
            }

            // Parse reference with validation
            if (!preg_match('/^CAR_(\d+)_/', $reference, $matches)) {
                \Log::error('Invalid reference format', compact('reference'));
                return response()->json(['message' => 'Invalid reference format'], 400);
            }

            $bookingId = (int)$matches[1];
            \Log::debug('Parsed booking ID', compact('bookingId'));

            // Find booking with debug
            $booking = CarBooking::find($bookingId);
            if (!$booking) {
                \Log::error('Booking not found', [
                    'booking_id' => $bookingId,
                    'all_bookings' => CarBooking::pluck('id')->toArray()
                ]);
                return response()->json(['message' => 'Booking not found'], 404);
            }

            // Validate and process result
            $result = $request->json('Result');
            if (!$result) {
                \Log::error('Missing result in callback', $request->all());
                return response()->json(['message' => 'Result missing'], 400);
            }

            $resultCode = $result['ResultCode'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? 'No description';

            if ($resultCode == 0 || $resultCode == '0') {
                $booking->update([
                    'refund_status' => 'completed',
                    'refund_completed_at' => now(),
                ]);

                \Log::info('Refund completed successfully', [
                    'booking_id' => $bookingId,
                    'reference' => $reference
                ]);
            } else {
                $booking->update([
                    'refund_status' => 'failed',
                    'refund_failed_reason' => $resultDesc,
                ]);

                \Log::error('Refund failed', [
                    'booking_id' => $bookingId,
                    'reference' => $reference,
                    'result_code' => $resultCode,
                    'result_desc' => $resultDesc
                ]);
            }

            return response()->json(['message' => 'Callback processed'], 200);

        } catch (\Exception $e) {
            \Log::error('Callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}