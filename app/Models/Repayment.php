<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Repayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount',
        'payment_date',
        'user_id',
        'number',
        'status'
    ];

    public function user(){
        return $this->hasOne('App\Models\User', 'id', 'user_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($repayment) {
            // Generate the loan number
            $latestRepayment = static::latest('id')->first();
            $nextNumber = $latestRepayment ? ((int) substr($latestRepayment->number, strrpos($latestRepayment->number, '-') + 1)) + 1 : 1;

            $repayment->number = '4hB-P-' . $nextNumber;
        });
    }
}
