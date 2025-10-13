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
        'referral_code'
    ];

    protected $appends = ['stay_status', 'max_refundable_amount'];

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

        // If booking is cancelled but was already checked in
        if ($this->status === 'Cancelled' && $this->checked_in) {
            return 0;
        }

        // If checked in, calculate based on nights stayed
        if ($this->checked_in) {
            $checkIn = Carbon::parse($this->check_in_date);
            $checkOut = Carbon::parse($this->check_out_date);
            $today = Carbon::now();

            $totalNights = $checkOut->diffInDays($checkIn);
            $nightsStayed = $today->diffInDays($checkIn);

            // If more than 50% completed, no refund
            if ($nightsStayed >= ceil($totalNights / 2)) {
                return 0;
            }

            // Calculate refund for remaining nights
            $nightlyRate = $this->total_price / $totalNights;
            $remainingNights = $totalNights - $nightsStayed;

            return max(0, $remainingNights * $nightlyRate);
        }

        // If not checked in yet, check cancellation time
        $checkIn = Carbon::parse($this->check_in_date);
        $daysUntilCheckIn = Carbon::now()->diffInDays($checkIn, false);

        // If cancellation is within 24 hours of check-in, no refund
        if ($daysUntilCheckIn <= 1) {
            return 0;
        }

        // Full refund available for cancelled bookings that haven't started
        return $this->total_price;
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
}
