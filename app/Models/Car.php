<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Company;
use App\Models\User;
use App\Models\CarCategory;
use App\Models\CarMedia;
use App\Models\CarFeature;
use App\Models\CarBooking;

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
        'amount',
        'description',
        'is_available',
        'location_address',
        'latitude',
        'longitude',
        'user_id',
        'license_plate'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
    ];

    protected $appends = ['platform_price', 'platform_charges', 'amount'];

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
        return $this->hasMany(CarBooking::class)->where('status', 'Paid');
    }

    public function initialGallery()
    {
        return $this->hasMany(CarMedia::class);
    }

    public function carFeatures()
    {
        return $this->hasMany(CarFeature::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor: Platform price (Guest Price)
     * Formula: Guest Price = Host Amount / (1 - Platform Percentage)
     * Example: If host amount is 5500 and platform takes 15%, guest price = 5500 / (1 - 0.15) = 6470.59
     */
    public function getPlatformPriceAttribute()
    {
        $company = Company::first();

        if (!$company || !$company->percentage) {
            return round($this->amount, 2); // Return host price if no platform fee
        }

        $platformPercentage = $company->percentage / 100;
        $guestPrice = $this->amount / (1 - $platformPercentage);

        return round($guestPrice, 2); // Round to 2 decimal places
    }

    /**
     * Accessor: Platform charges (Guest Price - Host Amount)
     * Example: If guest price is 6470.59 and host amount is 5500, charges = 6470.59 - 5500 = 970.59
     */
    public function getPlatformChargesAttribute()
    {
        return round($this->platform_price - $this->amount, 2);
    }

    /**
     * Accessor: Ensure amount is returned as-is (no rounding to nearest 100)
     */
    public function getAmountAttribute($value)
    {
        return $value ?? $this->attributes['amount'] ?? 0;
    }
}