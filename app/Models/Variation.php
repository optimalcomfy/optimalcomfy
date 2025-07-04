<?php

namespace App\Models;
use App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Variation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'price',
        'property_id'
    ];

    protected $appends = ['platform_price'];

    public function property()
    {
        return $this->hasOne('App\Models\Property', 'id', 'property_id');
    }

    public function getPlatformPriceAttribute()
    {
        $company = Company::first();

        if (!$company || !$company->percentage) {
            return round($this->price, -2);
        }

        $base = $this->price;
        $charges = $base * $company->percentage / 100;
        $total = $base + $charges;

        return round($total, -2);
    }
}
