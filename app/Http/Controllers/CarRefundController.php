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
                    'refund_reference' => $reference,
                    'non_refund_reason' => null,
                    'refund_status' => 'processing',
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
            Log::channel('car_refunds')->error('Refund processing failed: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Refund processing failed: ' . $e->getMessage()]);
        }
    }

    public function handleRefundCallback(Request $request)
    {
        try {
            \Log::info('MPesa Refund Callback Received', [
                'raw_request' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            // Extract reference from different possible locations
            $reference = $request->input('reference') 
                    ?? $request->json('reference')
                    ?? $request->json('Result.ReferenceData.ReferenceItem.Value');

            if (empty($reference)) {
                \Log::error('Missing reference in callback', ['request' => $request->all()]);
                return response()->json(['message' => 'Reference parameter is required'], 400);
            }

            // Ensure reference is a string and clean it
            $reference = (string)$reference;
            $bookingId = preg_replace('/[^0-9]/', '', $reference); // Extract only numbers

            if (empty($bookingId)) {
                \Log::error('Invalid reference format - no numeric ID found', [
                    'original_reference' => $reference,
                    'processed_reference' => $bookingId
                ]);
                return response()->json(['message' => 'Invalid reference format'], 400);
            }

            // Find the booking with additional validation
            $booking = CarBooking::with(['user', 'vehicle'])
                ->where('id', $bookingId)
                ->whereNotNull('refund_reference')
                ->first();

            if (!$booking) {
                \Log::error('Booking not found or not eligible for refund', [
                    'booking_id' => $bookingId,
                    'reference_used' => $reference,
                    'existing_refund_references' => CarBooking::whereNotNull('refund_reference')
                        ->orderBy('id', 'desc')
                        ->limit(5)
                        ->pluck('refund_reference', 'id')
                ]);
                return response()->json(['message' => 'Booking not found or not eligible for refund'], 404);
            }

            // Process the refund result
            $result = $request->json('Result') ?? $request->all();
            $resultCode = $result['ResultCode'] ?? null;
            $resultDesc = $result['ResultDesc'] ?? 'No description provided';

            if ($resultCode == 0 || $resultCode == '0') {
                $updateData = [
                    'refund_status' => 'completed',
                    'refund_completed_at' => now(),
                    'transaction_receipt' => $result['TransactionID'] ?? null
                ];
                \Log::info('Refund completed successfully', $updateData);
            } else {
                $updateData = [
                    'refund_status' => 'failed',
                    'refund_failed_reason' => $resultDesc,
                    'transaction_receipt' => $result['TransactionID'] ?? null
                ];
                \Log::error('Refund failed', $updateData);
            }

            $booking->update($updateData);

            return response()->json([
                'message' => 'Callback processed successfully',
                'booking_id' => $bookingId,
                'status' => $booking->refresh()->refund_status
            ], 200);

        } catch (\Exception $e) {
            \Log::critical('Refund callback processing failed', [
                'error' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'An internal server error occurred',
                'error_reference' => 'REF_' . uniqid()
            ], 500);
        }
    }
}