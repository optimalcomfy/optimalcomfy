<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'booking_id',
        'food_order_id',
        'service_booking_id',
        'amount',
        'method',
        'status',
        'car_booking_id',
        'booking_type'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relatedBooking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function carBooking()
    {
        return $this->belongsTo(CarBooking::class, 'booking_id');
    }

    /**
     * Return the related booking instance depending on booking_type
     */
    public function booking()
    {
        if ($this->booking_type === 'property') {
            return $this->relatedBooking;
        } elseif ($this->booking_type === 'car') {
            return $this->carBooking;
        }
        return null;
    }


    public function foodOrder()
    {
        return $this->belongsTo(FoodOrder::class);
    }

    public function serviceBooking()
    {
        return $this->belongsTo(ServiceBooking::class);
    }
}
