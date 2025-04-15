<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'type',
        'price_per_night',
        'max_adults',
        'max_children',
        'status'
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function initialGallery()
    {
        return $this->hasMany(RoomGallery::class);
    }

    public function roomAmenities()
    {
        return $this->hasMany(RoomAmenity::class);
    }

    public function roomFeatures()
    {
        return $this->hasMany(RoomFeature::class);
    }

    public function roomServices()
    {
        return $this->hasMany(RoomService::class);
    }
}
