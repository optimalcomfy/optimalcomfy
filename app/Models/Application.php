<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_id'
    ];

    // Relationship with Job
    public function job()
    {
        return $this->hasOne('App\Models\Job', 'id', 'job_id');
    }

    // Relationship with User
    public function user()
    {
        return $this->hasOne('App\Models\User', 'id', 'user_id');
    }
}
