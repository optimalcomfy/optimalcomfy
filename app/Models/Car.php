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
     * Special case: Returns 6400 when host amount is 5500
     * Otherwise calculates: Guest Price = Host Amount / (1 - Platform Percentage)
     */

    public function getPlatformPriceAttribute()
    {

        $company = Company::first();

        $platformPercentage = $company->percentage / 100;


        $guestPrice = $this->amount * (1 + $platformPercentage);

        return round($guestPrice, -2); // Round to 2 decimal places (currency format)
    }
    /**
     * Accessor: Platform charges (Guest Price - Host Amount)
     * Example: For 5500→6400, charges = 900
     */
    public function getPlatformChargesAttribute()
    {
        return round($this->platform_price - $this->amount, -2);
    }

    /**
     * Accessor: Ensure amount is returned as-is (no rounding to nearest 100)
     */
    public function getAmountAttribute($value)
    {
        return $value ?? $this->attributes['amount'] ?? 0;
    }
}