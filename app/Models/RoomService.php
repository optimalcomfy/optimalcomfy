<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomService extends Model
{
    use HasFactory;

    protected $fillable = [
        'icon',
        'name',
        'price',
        'room_id'
    ];

    public function room()
    {
        return $this->hasOne('App\Models\Room', 'id', 'room_id');
    }
}
