<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'media_url',
        'media_type',
        'car_id'
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
