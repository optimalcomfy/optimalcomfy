<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyGallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'property_id'
    ];

    public function property()
    {
        return $this->hasOne('App\Models\Property', 'id', 'property_id');
    }
}
