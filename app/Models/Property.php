<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Company;
use App\Models\User;
use App\Models\Booking;
use App\Models\PropertyGallery;
use App\Models\PropertyAmenity;
use App\Models\PropertyFeature;
use App\Models\PropertyService;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_name',
        'apartment_name',
        'block',
        'house_number',
        'lock_box_location',
        'wifi_name',
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

    protected $appends = ['platform_price', 'platform_charges'];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
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

    /**
     * Accessor: Platform price (price + platform charges)
     */
    public function getPlatformPriceAttribute()
    {
        $company = Company::first();

        if (!$company || !$company->percentage) {
            return $this->price_per_night;
        }

        $base = $this->price_per_night;
        $charges = $base * $company->percentage / 100;

        return round($base + $charges, 2);
    }

    /**
     * Accessor: Platform charges (commission only)
     */
    public function getPlatformChargesAttribute()
    {
        $company = Company::first();

        if (!$company || !$company->percentage) {
            return 0;
        }

        return round($this->price_per_night * $company->percentage / 100, 2);
    }
}
