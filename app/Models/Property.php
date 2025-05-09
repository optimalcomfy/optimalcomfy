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
        'max_adults',
        'max_children',
        'status',
        'location',
        'latitude',
        'longitude'
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
