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
        'booking_type',
        'phone',
        'checkout_request_id',
        'merchant_request_id',
        'mpesa_receipt',
        'transaction_date',
        'transaction_id',
        'failure_reason'
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
            return $this->relatedBooking();
        } elseif ($this->booking_type === 'car') {
            return $this->carBooking();
        }
        // fallback to a dummy relation to avoid errors
        return $this->belongsTo(Booking::class, 'booking_id')->whereRaw('1=0'); // empty relation
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
