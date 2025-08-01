<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use App\Services\MpesaRefundService;
use App\Mail\RefundNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RefundController extends Controller
{
    protected $mpesaRefundService;

    public function __construct(MpesaRefundService $mpesaRefundService)
    {
        $this->mpesaRefundService = $mpesaRefundService;
    }

    public function handleRefund(Request $request, Booking $booking)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|max:255',
            'refund_amount' => 'required_if:action,approve|numeric|min:0|max:'.$booking->total_price,
        ]);

        DB::beginTransaction();
        try {
            if ($request->action === 'approve') {
                $phone = $booking->user->phone;
                $amount = $request->refund_amount;
                $reference = $booking->id . '_' . now()->timestamp;
                
                $response = $this->mpesaRefundService->processRefund(
                    $phone, 
                    $amount, 
                    $reference
                );
                
                if (isset($response['error'])) {
                    throw new \Exception($response['error']);
                }

                $booking->update([
                    'refund_approval' => 'approved',
                    'refund_amount' => $amount,
                    'refund_reference' => $reference,
                    'non_refund_reason' => null,
                    'refund_status' => 'processing',
                ]);
                
                // Notify user
                Mail::to($booking->user->email)
                    ->send(new RefundNotification($booking, 'approved'));
                
                DB::commit();
                
                return redirect()->back()->with('success', 'Refund approved and processing initiated.');
            } else {
                $booking->update([
                    'refund_approval' => 'rejected',
                    'non_refund_reason' => $request->reason,
                    'refund_amount' => 0,
                    'refund_status' => null,
                ]);

                // Notify user
                Mail::to($booking->user->email)
                    ->send(new RefundNotification($booking, 'rejected', $request->reason));
                
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
    
        $reference = $request->input('reference');
        if (!$reference) {
            return response()->json(['message' => 'Reference missing'], 400);
        }
    
        // Extract booking ID from reference (bookingid_timestamp)
        $parts = explode('_', $reference);
        if (count($parts) < 2) {
            return response()->json(['message' => 'Invalid reference'], 400);
        }
        
        $bookingId = $parts[0];
        $booking = Booking::find($bookingId);
        
        if (!$booking) {
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
            
        } else {
            $booking->update([
                'refund_status' => 'failed',
                'refund_failed_reason' => $resultDesc,
            ]);
        
        }
    
        return response()->json(['message' => 'Callback processed'], 200);
    }
}