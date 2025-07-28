<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'cancelled_by_id'
    ];

    // Add this to automatically include the accessor in JSON/array outputs
    protected $appends = ['ride_status'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($carBooking) {
            $carBooking->number = self::generateUniqueNumber();
        });
    }

    // Accessor for stay_status
    public function getRideStatusAttribute()
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
}