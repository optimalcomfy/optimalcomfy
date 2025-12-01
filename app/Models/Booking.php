<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_id',
        'check_in_date',
        'check_out_date',
        'total_price',
        'status',
        'checked_in',
        'checked_out',
        'number',
        'variation_id',
        'external_booking',
        'checkin_verification_code',
        'checkout_verification_code',
        'failed_reason',
        'cancelled_at',
        'cancel_reason',
        'refund_approval',
        'non_refund_reason',
        'refund_amount',
        'cancelled_by_id',
        'referral_code',
        'pesapal_tracking_id',
        'markup_user_id'
    ];

    protected $appends = [
        'stay_status',
        'max_refundable_amount',
        'platform_fee',
        'host_price',
        'refund_platform_fee',
        'host_refund_amount'
    ];

    protected $casts = [
        'check_in_date' => 'datetime',
        'check_out_date' => 'datetime',
        'checked_in' => 'datetime',
        'checked_out' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_price' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            $booking->number = self::generateUniqueNumber();
        });
    }

    public function markupUser()
    {
        return $this->belongsTo(User::class, 'markup_user_id');
    }

    public function getStayStatusAttribute()
    {
        if ($this->checked_out) {
            return 'checked_out';
        }

        if ($this->checked_in) {
            return 'checked_in';
        }

        if ($this->status === 'paid' && !$this->checked_in) {
            return 'upcoming_stay';
        }

        return $this->status;
    }

    public function getMaxRefundableAmountAttribute()
    {
        // If booking is already checked out, no refund
        if ($this->checked_out) {
            return 0;
        }

        // Get the actual payment record
        $payment = $this->payment;

        // If no payment was made or payment failed, no refund possible
        if (!$payment || $payment->status !== 'completed') {
            return 0;
        }

        $actualAmountPaid = $payment->amount;

        // Get total amount already refunded
        $totalRefunded = $this->refunds()->sum('amount');

        // Calculate remaining refundable amount
        $remainingRefundable = $actualAmountPaid - $totalRefunded;

        // If already fully refunded, no more refunds
        if ($remainingRefundable <= 0) {
            return 0;
        }

        // If booking was never checked in (cancelled before check-in)
        if (!$this->checked_in) {
            $checkIn = Carbon::parse($this->check_in_date);
            $cancelledAt = $this->cancelled_at ? Carbon::parse($this->cancelled_at) : Carbon::now();

            // Calculate hours between cancellation and check-in
            $hoursUntilCheckIn = $checkIn->diffInHours($cancelledAt, false);

            // If cancelled AFTER check-in time, allow full refund (guest never showed up)
            if ($hoursUntilCheckIn > 0) {
                return $remainingRefundable;
            }

            // If cancellation is within 24 hours BEFORE check-in, no refund
            if ($hoursUntilCheckIn >= -24) {
                return 0;
            }

            // Full refund available for cancellations more than 24 hours before check-in
            return $remainingRefundable;
        }

        // If booking was checked in but then cancelled
        if ($this->checked_in && $this->status === 'Cancelled') {
            $checkIn = Carbon::parse($this->check_in_date);
            $checkOut = Carbon::parse($this->check_out_date);
            $cancelledAt = $this->cancelled_at ? Carbon::parse($this->cancelled_at) : Carbon::now();

            $totalNights = $checkOut->diffInDays($checkIn);
            $nightsStayed = $cancelledAt->diffInDays($checkIn);

            // If more than 50% completed, no refund
            if ($nightsStayed >= ceil($totalNights / 2)) {
                return 0;
            }

            // Calculate refund based on unused nights
            $unusedNights = $totalNights - $nightsStayed;
            $refundPercentage = $unusedNights / $totalNights;

            return round($remainingRefundable * $refundPercentage, 2);
        }

        // Default case - return remaining refundable amount
        return $remainingRefundable;
    }

    // Helper method to get payment summary
    public function getPaymentSummaryAttribute()
    {
        $payment = $this->payment;
        $actualAmountPaid = $payment && $payment->status === 'completed' ? $payment->amount : 0;
        $totalRefunded = $this->refunds()->sum('amount');
        $remainingRefundable = max(0, $actualAmountPaid - $totalRefunded);

        return [
            'actual_amount_paid' => $actualAmountPaid,
            'total_refunded' => $totalRefunded,
            'remaining_refundable' => $remainingRefundable,
            'payment_status' => $payment ? $payment->status : 'no_payment',
            'payment_method' => $payment ? $payment->method : null,
            'payment_date' => $payment ? $payment->created_at : null,
            'refunds' => $this->refunds()->get(['amount', 'created_at'])
        ];
    }

    /**
     * Get platform fee percentage from company settings
     */
    public function getPlatformFeePercentage()
    {
        $company = Company::first();
        return $company ? ($company->percentage ?? 10) : 10; // Default to 10% if not set
    }

    /**
     * Calculate platform fee amount
     */
    public function getPlatformFeeAttribute()
    {
        $feePercentage = $this->getPlatformFeePercentage();
        return round(($this->total_price * $feePercentage) / 100, 2);
    }

    /**
     * Calculate host price after platform fee deduction
     */
    public function getHostPriceAttribute()
    {
        return round($this->total_price - $this->platform_fee, 2);
    }

    /**
     * Calculate platform fee for refund amount
     */
    public function getRefundPlatformFeeAttribute()
    {
        if (!$this->refund_amount || $this->refund_amount <= 0) {
            return 0;
        }

        $feePercentage = $this->getPlatformFeePercentage();
        return round(($this->refund_amount * $feePercentage) / 100, 2);
    }

    /**
     * Calculate host refund amount after platform fee deduction
     */
    public function getHostRefundAmountAttribute()
    {
        if (!$this->refund_amount || $this->refund_amount <= 0) {
            return 0;
        }

        return round($this->refund_amount - $this->refund_platform_fee, 2);
    }

    /**
     * Calculate host price for a specific amount (useful for partial calculations)
     */
    public function calculateHostPriceForAmount($amount)
    {
        $feePercentage = $this->getPlatformFeePercentage();
        $platformFee = round(($amount * $feePercentage) / 100, 2);
        return round($amount - $platformFee, 2);
    }

    /**
     * Get detailed price breakdown
     */
    public function getPriceBreakdownAttribute()
    {
        return [
            'total_price' => $this->total_price,
            'platform_fee_percentage' => $this->getPlatformFeePercentage(),
            'platform_fee' => $this->platform_fee,
            'host_price' => $this->host_price,
            'refund_amount' => $this->refund_amount,
            'refund_platform_fee' => $this->refund_platform_fee,
            'host_refund_amount' => $this->host_refund_amount,
        ];
    }

    public static function generateUniqueNumber()
    {
        do {
            $number = 'BKG-' . strtoupper(Str::random(8));
        } while (self::where('number', $number)->exists());

        return $number;
    }

    public static function generateVerificationCode()
    {
        return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id')
                    ->where('booking_type', 'property');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id')
                    ->where('booking_type', 'property');
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by_id');
    }

    public function variation()
    {
        return $this->belongsTo(PropertyVariation::class, 'variation_id');
    }

    // Helper method to check if refund can be processed
    public function canProcessRefund()
    {
        return $this->status === 'Cancelled' &&
               $this->refund_approval === null &&
               $this->max_refundable_amount > 0;
    }

    // Helper method to get total nights
    public function getNightsAttribute()
    {
        $checkIn = Carbon::parse($this->check_in_date);
        $checkOut = Carbon::parse($this->check_out_date);
        return $checkOut->diffInDays($checkIn);
    }


    public function markup()
    {
        return $this->belongsTo(Markup::class);
    }

    public function getMarkupProfitAttribute()
    {
        // If we have an active markup, use it
        if ($this->markup && $this->markup->is_active) {
            $platformFeePercentage = $this->getPlatformFeePercentage();
            $markupProfit = $this->markup->profit;
            $platformFeeOnMarkup = ($markupProfit * $platformFeePercentage) / 100;
            return $markupProfit - $platformFeeOnMarkup;
        }

        if ($this->markup_user_id) {
            $platformFeePercentage = $this->getPlatformFeePercentage();
            $platformFee = ($this->total_price * $platformFeePercentage) / 100;

            $propertyBasePrice = round($this->property->amount ?? 0, -2);

            $nights = $this->nights;
            $totalBasePrice = $propertyBasePrice * $nights;

            return max(0, $this->total_price - $platformFee - $totalBasePrice);
        }

        return 0;
    }
}
