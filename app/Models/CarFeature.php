<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'feature_id',
        'car_id'
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function feature()
    {
        return $this->belongsTo(Feature::class);
    }
}
