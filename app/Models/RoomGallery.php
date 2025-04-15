<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomGallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'room_id'
    ];

    public function room()
    {
        return $this->hasOne('App\Models\Room', 'id', 'room_id');
    }
}
