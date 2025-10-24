<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CarBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'start_date',
        'end_date',
        'total_price',
        'pickup_location',
        'dropoff_location',
        'status',
        'special_requests',
        'checked_in',
        'checked_out',
        'number',
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
        'referral_code'
    ];

    protected $appends = [
        'ride_status',
        'platform_fee',
        'host_price',
        'refund_platform_fee',
        'host_refund_amount',
        'max_refundable_amount'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'checked_in' => 'datetime',
        'checked_out' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_price' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($carBooking) {
            $carBooking->number = self::generateUniqueNumber();
        });
    }

    // Accessor for ride_status
    public function getRideStatusAttribute()
    {
        if ($this->checked_out) {
            return 'checked_out';
        }

        if ($this->checked_in) {
            return 'checked_in';
        }

        if ($this->status === 'paid' && !$this->checked_in) {
            return 'upcoming_ride';
        }

        return $this->status;
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
     * Calculate maximum refundable amount for car bookings
     */
    public function getMaxRefundableAmountAttribute()
    {
        // If booking is already checked out, no refund
        if ($this->checked_out) {
            return 0;
        }

        // If booking is cancelled but was already checked in
        if ($this->status === 'Cancelled' && $this->checked_in) {
            return 0;
        }

        // If checked in, calculate based on time used
        if ($this->checked_in) {
            $startDate = Carbon::parse($this->start_date);
            $endDate = Carbon::parse($this->end_date);
            $today = Carbon::now();

            $totalHours = $endDate->diffInHours($startDate);
            $hoursUsed = $today->diffInHours($startDate);

            // If more than 50% completed, no refund
            if ($hoursUsed >= ceil($totalHours / 2)) {
                return 0;
            }

            // Calculate refund for remaining time
            $hourlyRate = $this->total_price / $totalHours;
            $remainingHours = $totalHours - $hoursUsed;

            return max(0, $remainingHours * $hourlyRate);
        }

        // If not checked in yet, check cancellation time
        $startDate = Carbon::parse($this->start_date);
        $hoursUntilStart = Carbon::now()->diffInHours($startDate, false);

        // If cancellation is within 2 hours of start time, no refund
        if ($hoursUntilStart <= 2) {
            return 0;
        }

        // Full refund available for cancelled bookings that haven't started
        return $this->total_price;
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
            'max_refundable_amount' => $this->max_refundable_amount,
        ];
    }

    /**
     * Helper method to check if refund can be processed
     */
    public function canProcessRefund()
    {
        return $this->status === 'Cancelled' &&
               $this->refund_approval === null &&
               $this->max_refundable_amount > 0;
    }

    /**
     * Get total rental hours
     */
    public function getRentalHoursAttribute()
    {
        $startDate = Carbon::parse($this->start_date);
        $endDate = Carbon::parse($this->end_date);
        return $endDate->diffInHours($startDate);
    }

    public static function generateUniqueNumber()
    {
        do {
            $number = 'CAR-' . strtoupper(Str::random(8));
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

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id')
                    ->where('booking_type', 'car');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id')
                    ->where('booking_type', 'car');
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by_id');
    }

    public function markup()
    {
        return $this->belongsTo(Markup::class);
    }

    public function getMarkupProfitAttribute()
    {
        if (!$this->markup_id) {
            return 0;
        }

        $platformFeePercentage = $this->getPlatformFeePercentage();
        $markupProfit = $this->markup->profit;
        $platformFeeOnMarkup = ($markupProfit * $platformFeePercentage) / 100;

        return $markupProfit - $platformFeeOnMarkup;
    }
}
