<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'food_order_id',
        'food_id',
        'quantity',
        'price',
        'total_price'
    ];

    public function foodOrder()
    {
        return $this->belongsTo(FoodOrder::class);
    }

    public function food()
    {
        return $this->belongsTo(Food::class);
    }
}
