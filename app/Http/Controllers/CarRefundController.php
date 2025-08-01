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
        Log::channel('car_refunds')->info('Car Refund Callback Received: ', $request->all());
    
        $reference = $request->input('reference');
        if (!$reference) {
            Log::channel('car_refunds')->warning('No reference found in callback');
            return response()->json(['message' => 'Reference missing'], 400);
        }
    
        // Extract booking ID from reference (CAR_bookingid_timestamp)
        $parts = explode('_', $reference);
        if (count($parts) < 3) {
            Log::channel('car_refunds')->warning('Invalid reference format: ' . $reference);
            return response()->json(['message' => 'Invalid reference'], 400);
        }
        
        $bookingId = $parts[1];
        $booking = CarBooking::find($bookingId);
        
        if (!$booking) {
            Log::channel('car_refunds')->warning('Car booking not found for ID: ' . $bookingId);
            return response()->json(['message' => 'Booking not found'], 404);
        }
    
        $result = $request->json('Result');
        $resultCode = $result['ResultCode'] ?? null;
        $resultDesc = $result['ResultDesc'] ?? 'No description';
    
        if ($resultCode == 0 || $resultCode == '0') {
            $booking->update([
                'refund_status' => 'completed',
                'refund_completed_at' => now(),
            ]);
            
            Log::channel('car_refunds')->info('Car refund processed successfully for booking: ' . $bookingId);
        } else {
            $booking->update([
                'refund_status' => 'failed',
                'refund_failed_reason' => $resultDesc,
            ]);
            
            Log::channel('car_refunds')->error('Car refund failed for booking: ' . $bookingId, [
                'result_code' => $resultCode,
                'result_desc' => $resultDesc
            ]);
        }
    
        return response()->json(['message' => 'Callback processed'], 200);
    }
}