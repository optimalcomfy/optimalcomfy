<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    use HasFactory;

    protected $table = 'foods';
    
    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'image'
    ];

    public function foodOrderItems()
    {
        return $this->hasMany(FoodOrderItem::class);
    }
}
