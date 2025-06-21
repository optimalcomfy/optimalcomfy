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
        'number'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            $booking->number = self::generateUniqueNumber();
        });
    }

    public static function generateUniqueNumber()
    {
        do {
            $number = 'BKG-' . strtoupper(Str::random(8));
        } while (self::where('number', $number)->exists());

        return $number;
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
        return $this->hasMany(Payment::class);
    }
}

