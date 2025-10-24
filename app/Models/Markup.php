<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Markup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'markupable_id',
        'markupable_type',
        'markup_percentage',
        'markup_amount',
        'original_amount',
        'final_amount',
        'markup_token',
        'is_active'
    ];

    protected $casts = [
        'markup_percentage' => 'decimal:2',
        'markup_amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($markup) {
            $markup->markup_token = \Illuminate\Support\Str::random(32);
        });
    }

    public function markupable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function carBookings()
    {
        return $this->hasMany(CarBooking::class);
    }

    public function calculateFinalAmount()
    {
        if ($this->markup_amount) {
            return $this->original_amount + $this->markup_amount;
        } elseif ($this->markup_percentage) {
            return $this->original_amount * (1 + ($this->markup_percentage / 100));
        }

        return $this->original_amount;
    }

    public function getProfitAttribute()
    {
        return $this->final_amount - $this->original_amount;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function deactivate()
    {
        $this->is_active = false;
        return $this->save();
    }
}
