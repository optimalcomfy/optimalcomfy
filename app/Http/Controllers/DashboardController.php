<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Loan;
use App\Models\Job;
use App\Models\Application;
use App\Models\Notification;
use App\Models\User;
use App\Models\Employee;
use App\Models\Repayment;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        // Fetching basic statistics
        $userCount = User::count();


        $jobCount = Job::count();

        $applicationCount = Application::count();

        $user = Auth::user();

        $activeLoansQuery = Loan::with(['loanProvider', 'employee.user', 'employee.company'])
        ->where('status', '=', 'Approved');
    
        if ($user->role_id == 2) {
            $activeLoansQuery->whereHas('employee.user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $activeLoansQuery->whereHas('employee.user', function ($q) use ($user) {
                $q->where('id', '=', $user->id);
            });
        }
        
        // Fetch the loans and append the currentBalance
    
        $inactiveLoansQuery = Loan::where('status', '=', 'Declined');

        if ($user->role_id == 2) {
            $inactiveLoansQuery->whereHas('employee.user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $inactiveLoansQuery->whereHas('employee.user', function ($q) use ($user) {
                $q->where('id', '=', $user->id);
            });
        }
        

        $repaidLoansQuery = Repayment::with([
            'loan',
            'loan.loanProvider',
            'loan.employee.user',
            'loan.employee.company',
        ]);
        
        if ($user->role_id == 2) {
            $repaidLoansQuery->whereHas('loan.employee.user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $repaidLoansQuery->whereHas('loan.employee.user', function ($q) use ($user) {
                $q->where('id', '=', $user->id);
            });
        }

        $employee = Employee::where('user_id', '=', $user->id)->first();


        
        return Inertia::render('Dashboard', [
            'userCount' => $userCount,
            'applicationCount'=> $applicationCount,
            'jobCount'=> $jobCount,
            'employee'=>$employee
        ]);
    }
}