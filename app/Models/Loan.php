<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount',
        'status',
        'disbursed_at',
        'employee_id',
        'loan_provider_id',
        'loan',
        'otp'
    ];

    protected $appends = ['eventualPay', 'currentBalance'];

    // Relationship with Employee
    public function employee()
    {
        return $this->hasOne('App\Models\Employee', 'id', 'employee_id');
    }

    // Relationship with LoanProvider
    public function loanProvider()
    {
        return $this->hasOne('App\Models\LoanProvider', 'id', 'loan_provider_id');
    }

    // Relationship with Repayment
    public function repayments()
    {
        return $this->hasMany('App\Models\Repayment', 'loan_id');
    }

    public function getEventualPayAttribute()
    {
        $employee = $this->employee;
        if ($employee && $employee->company) {
            $percentage = $employee->company->percentage;
            return round($this->amount + ($this->amount * $percentage / 100), 2);
        }
    
        return round($this->amount, 2);
    }
    
    public function getCurrentBalanceAttribute()
    {
        $totalRepayments = $this->repayments()->sum('amount');
    
        return round($this->eventualPay - $totalRepayments, 2);
    }
    

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($loan) {
            $latestLoan = static::latest('id')->first();
            $nextNumber = $latestLoan ? ((int) substr($latestLoan->number, strrpos($latestLoan->number, '-') + 1)) + 1 : 1;

            $loan->number = '4hB-L-' . $nextNumber;
        });
    }
}