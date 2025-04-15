<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'salary',
        'loan_limit',
        'user_id',
        'company_id',
        'passport_number',
        'id_number',
        'id_front',
        'id_back',
        'passport_front',
        'passport_back',
        'approved',
    ];

    // Relationship with Company
    public function company()
    {
        return $this->hasOne('App\Models\Company', 'id', 'company_id');
    }

    // Relationship with User
    public function user()
    {
        return $this->hasOne('App\Models\User', 'id', 'user_id');
    }

    // Relationship with Loan
    public function loans()
    {
        return $this->hasMany('App\Models\Loan', 'employee_id');
    }

    // Accessor for the number of unpaid loans
    public function getUnpaidLoansCountAttribute()
    {
        return $this->loans()
            ->where('status', '!=', 'paid')
            ->count();
    }

    public function getTotalLoanBalanceAttribute()
    {
        return round(
            $this->loans()
                ->where('status', '!=', 'paid')
                ->get()
                ->sum(function ($loan) {
                    return $loan->currentBalance;
                }),
            2 
        );
    }
    
}
