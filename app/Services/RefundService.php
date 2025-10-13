<?php
// app/Services/RefundService.php

namespace App\Services;

use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function createRefundRequest(
        Booking $booking,
        float $amount,
        string $reason,
        string $initiatedBy = 'system',
        array $metadata = []
    ): Refund {
        return DB::transaction(function () use ($booking, $amount, $reason, $initiatedBy, $metadata) {
            // Cancel any existing pending refunds
            $booking->refunds()
                ->where('status', 'pending')
                ->update(['status' => 'rejected', 'rejection_reason' => 'Superseded by new refund request']);

            $refund = Refund::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->user_id,
                'amount' => $amount,
                'original_amount' => $booking->total_price,
                'currency' => 'KES',
                'status' => 'pending',
                'type' => $amount >= $booking->total_price ? 'full' : 'partial',
                'initiated_by' => $initiatedBy,
                'refund_reason' => $reason,
                'requested_at' => now(),
                'metadata' => $metadata,
            ]);

            // Notify admin about new refund request
            // You can implement your notification system here

            return $refund;
        });
    }

    public function approveRefund(Refund $refund, User $processor, string $notes = null): Refund
    {
        return DB::transaction(function () use ($refund, $processor, $notes) {
            $refund->markAsApproved($processor->id, $notes);

            // Notify user about refund approval
            // Implement notification

            return $refund->fresh();
        });
    }

    public function rejectRefund(Refund $refund, User $processor, string $reason): Refund
    {
        return DB::transaction(function () use ($refund, $processor, $reason) {
            $refund->markAsRejected($reason, $processor->id);

            // Notify user about refund rejection
            // Implement notification

            return $refund->fresh();
        });
    }

    public function processRefund(Refund $refund, string $transactionId = null, string $method = null): Refund
    {
        return DB::transaction(function () use ($refund, $transactionId, $method) {
            try {
                // Here you would integrate with your payment processor
                // For example: Stripe, M-Pesa, etc.
                $success = $this->processPaymentRefund($refund);

                if ($success) {
                    $refund->markAsProcessed($transactionId, $method);

                    // Update booking status if needed
                    $refund->booking->update([
                        'refund_processed' => true,
                        'refund_amount' => $refund->amount,
                    ]);

                    // Notify user about successful refund
                    // Implement notification

                    return $refund->fresh();
                } else {
                    $refund->markAsFailed('Payment processor failed to process refund');
                    throw new \Exception('Failed to process refund with payment processor');
                }
            } catch (\Exception $e) {
                $refund->markAsFailed($e->getMessage());
                throw $e;
            }
        });
    }

    private function processPaymentRefund(Refund $refund): bool
    {
        // Implement your payment processor logic here
        // This is a placeholder - implement based on your payment gateway

        // Example for Stripe:
        // return $this->stripeService->createRefund($refund);

        // For now, return true to simulate success
        return true;
    }

    public function calculateRefundAmount(Booking $booking, string $cancellationTime = null): float
    {
        $totalAmount = $booking->total_price;
        $checkInDate = $booking->check_in_date;
        $now = $cancellationTime ? strtotime($cancellationTime) : time();

        $daysUntilCheckIn = ceil((strtotime($checkInDate) - $now) / (60 * 60 * 24));

        // Refund policy logic
        if ($daysUntilCheckIn >= 14) {
            // Full refund if cancelled 14+ days before check-in
            return $totalAmount;
        } elseif ($daysUntilCheckIn >= 7) {
            // 50% refund if cancelled 7-13 days before check-in
            return $totalAmount * 0.5;
        } elseif ($daysUntilCheckIn >= 2) {
            // 25% refund if cancelled 2-6 days before check-in
            return $totalAmount * 0.25;
        } else {
            // No refund if cancelled less than 2 days before check-in
            return 0;
        }
    }

    public function getRefundStatistics(): array
    {
        return [
            'total_refunds' => Refund::count(),
            'total_amount' => Refund::where('status', 'processed')->sum('amount'),
            'pending_count' => Refund::pending()->count(),
            'approved_count' => Refund::approved()->count(),
            'processed_count' => Refund::processed()->count(),
            'rejected_count' => Refund::rejected()->count(),
        ];
    }
}
