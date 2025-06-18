<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_name',
        'type',
        'price_per_night',
        'amount',
        'max_adults',
        'max_children',
        'status',
        'location',
        'latitude',
        'longitude',
        'user_id',
        'wifi_password',
        'cook',
        'cleaner',
        'emergency_contact',
        'key_location'
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function initialGallery()
    {
        return $this->hasMany(PropertyGallery::class);
    }

    public function propertyAmenities()
    {
        return $this->hasMany(PropertyAmenity::class);
    }

    public function propertyFeatures()
    {
        return $this->hasMany(PropertyFeature::class);
    }

    public function PropertyServices()
    {
        return $this->hasMany(PropertyService::class);
    }
    
}
