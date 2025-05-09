<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_category_id',
        'name',
        'brand',
        'model',
        'year',
        'mileage',
        'body_type',
        'seats',
        'doors',
        'luggage_capacity',
        'fuel_type',
        'engine_capacity',
        'transmission',
        'drive_type',
        'fuel_economy',
        'exterior_color',
        'interior_color',
        'price_per_day',
        'description',
        'is_available',
        'location_address',
        'latitude',
        'longitude',
    ];

    /**
     * Relationships
     */

    public function category()
    {
        return $this->belongsTo(CarCategory::class, 'car_category_id');
    }

    public function media()
    {
        return $this->hasMany(CarMedia::class);
    }

    public function features()
    {
        return $this->belongsToMany(CarFeature::class, 'car_feature_car', 'car_id', 'car_feature_id');
    }

    public function bookings()
    {
        return $this->hasMany(CarBooking::class);
    }

    public function initialGallery()
    {
        return $this->hasMany(CarMedia::class);
    }

    public function carFeatures()
    {
        return $this->hasMany(CarFeature::class);
    }
}
