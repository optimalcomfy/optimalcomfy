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
        'loan_id',
        'number'
    ];

    public function loan(){
        return $this->hasOne('App\Models\Loan', 'id', 'loan_id');
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
