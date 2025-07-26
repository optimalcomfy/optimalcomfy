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
        'failed_reason'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($carBooking) {
            $carBooking->number = self::generateUniqueNumber();
        });
    }

    public static function generateUniqueNumber()
    {
        do {
            $number = 'CAR-' . strtoupper(Str::random(8));
        } while (self::where('number', $number)->exists());

        return $number;
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
