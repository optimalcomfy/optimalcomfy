<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'cancelled_by_id'
    ];

    protected $appends = ['stay_status'];

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
}