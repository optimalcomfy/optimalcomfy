<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRepaymentRequest;
use App\Http\Requests\UpdateRepaymentRequest;
use App\Models\Repayment;
use App\Models\Loan;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Mail\LoanRepaymentMail;
use Illuminate\Support\Facades\Mail;

class RepaymentController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
    
        $query = Repayment::with([
            'loan',
            'loan.loanProvider',
            'loan.employee.user',
            'loan.employee.company',
        ]);
    
        // Filter based on role
        if ($user->role_id == 2) {
            $query->whereHas('loan.employee.user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $query->whereHas('loan.employee.user', function ($q) use ($user) {
                $q->where('id', '=', $user->id);
            });
        }
    
        // Search functionality
        if ($request->has('search')) {
            $search = trim($request->input('search'));
    
            $query->where(function ($q) use ($search) {
                $q->where('number', 'LIKE', "%$search%") // Search the 'number' field
                  ->orWhere('amount', 'LIKE', "%$search%") // Repayment amount
                  ->orWhereHas('loan', function ($q) use ($search) { // Loan fields
                      $q->where('amount', 'LIKE', "%$search%")
                        ->orWhere('status', 'LIKE', "%$search%");
                  })
                  ->orWhereHas('loan.employee', function ($q) use ($search) { // Employee and related fields
                      $q->where('loan_limit', 'LIKE', "%$search%")
                        ->orWhereHas('user', function ($q) use ($search) { // User fields
                            $q->where('name', 'LIKE', "%$search%")
                              ->orWhere('email', 'LIKE', "%$search%");
                        })
                        ->orWhereHas('company', function ($q) use ($search) { // Company name
                            $q->where('name', 'LIKE', "%$search%");
                        });
                  });
            });
        }

        $query->orderBy('created_at', 'desc');
    
        $repayments = $query->paginate(10);
    
        return Inertia::render('Repayments/Index', [
            'repayments' => $repayments->items(),
            'pagination' => $repayments,
            'flash' => session('flash'),
        ]);
    }
    
    

    public function create()
    {
        $loans = Loan::all();

        return Inertia::render('Repayments/Create', [
            'loans' => $loans,
        ]);
    }

    public function store(StoreRepaymentRequest $request)
    {
        // Create repayment and load related data
        $repayment = Repayment::create($request->validated());
    
        // Ensure related data is loaded
        $repayment->load([
            'loan',
            'loan.loanProvider',
            'loan.employee.user',
            'loan.employee.company',
        ]);
    
        // Send the repayment email
        Mail::to($repayment->loan->employee->user->email)
            ->send(new LoanRepaymentMail($repayment));
    
        return redirect()->route('repayments.index')->with('success', 'Repayment created successfully.');
    }
    
    


    public function show(Repayment $repayment)
    {
        $repayment->load([
            'loan',
            'loan.loanProvider',
            'loan.employee.user',
            'loan.employee.company'
        ]);

        return Inertia::render('Repayments/Show', [
            'repayment' => $repayment,
        ]);
    }

    public function edit(Repayment $repayment)
    {
        $loans = Loan::all();

        return Inertia::render('Repayments/Edit', [
            'repayment' => $repayment,
            'loans' => $loans,
        ]);
    }

    public function update(UpdateRepaymentRequest $request, Repayment $repayment)
    {
        $repayment->update($request->validated());

        return redirect()->route('repayments.index')->with('success', 'Repayment updated successfully.');
    }


    public function destroy(Repayment $repayment)
    {
        $repayment->delete();

        return redirect()->route('repayments.index')->with('success', 'Repayment deleted successfully.');
    }
}
