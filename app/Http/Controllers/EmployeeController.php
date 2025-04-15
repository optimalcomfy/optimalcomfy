<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\Company;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Providers\RouteServiceProvider;
use App\Mail\EmployeeApprovalMail;
use App\Mail\EmployeeDeclinedMail;
use Illuminate\Support\Facades\Mail;

class EmployeeController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
    
        // Base query with eager loading
        $query = Employee::with('user', 'loans', 'company');
    
        // Filter by company if the user has role_id 2
        if ($user->role_id == 2) {
            $query->where('company_id', '=', $user->company_id);
        }
    
        // Search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }
    
        $query->orderBy('created_at', 'desc');

        // Paginate the results
        $employees = $query->paginate(10);
    
        // Append computed attributes to each employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->append('unpaid_loans_count', 'total_loan_balance');
            return $employee;
        });
    
        // Return to Inertia view
        return Inertia::render('Employees/Index', [
            'employees' => $employees->items(),
            'pagination' => $employees,
            'flash' => session('flash'),
        ]);
    }
    

    public function getEmployeesByCompany(Request $request, $companyId)
    {
        $user = Auth::user();

        // Ensure the user is authorized to view this data
        if ($user->role_id == 2 && $user->company_id != $companyId) {
            abort(403, 'Unauthorized action.');
        }

        // Query employees belonging to the given company ID
        $query = Employee::with('user', 'loans', 'company')
                        ->where('company_id', $companyId);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');

        // Paginate the results
        $employees = $query->paginate(10);

        // Append computed attributes to each employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->append('unpaid_loans_count', 'total_loan_balance');
            return $employee;
        });

        // Return to Inertia view
        return Inertia::render('Companies/Show', [
            'employees' => $employees->items(),
            'pagination' => $employees,
            'flash' => session('flash'),
        ]);
    }

    
    

    public function create()
    {
        $companies = Company::all();
        $users = User::all();
        return Inertia::render('Employees/Create', [
            'companies' => $companies,
            'users'=>$users
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
       $user = Auth::user();
       $validatedData = $request->validated();
    
       $fileFields = ['id_front', 'id_back', 'passport_front', 'passport_back'];
       
       foreach ($fileFields as $field) {
           if ($request->hasFile($field)) {
               $file = $request->file($field);
               $path = $file->store('employee_documents', 'public');
               $validatedData[$field] = $path;
           }
       }
    
       $employee = Employee::create($validatedData);
    
       if ($user->role_id == "3") {
           $user->update([
               'company_id' => $employee->company_id
           ]);
    
           Auth::login($user);
    
           return redirect(RouteServiceProvider::HOME);
       } else {
           return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
       }
    }

    public function show(Employee $employee)
    {
        // Load related data
        $employee->load('user', 'company', 'loans');
    
        // Return data to the Inertia view
        return Inertia::render('Employees/Show', [
            'employee' => [
                'id' => $employee->id,
                'approved' => $employee->approved,
                'id_number'=>$employee->id_number,
                'id_front'=>$employee->id_front,
                'id_back'=>$employee->id_back,
                'passport_front'=>$employee->passport_front,
                'salary' => $employee->salary,
                'loan_limit' => $employee->loan_limit,
                'unpaid_loans_count' => $employee->unpaid_loans_count, 
                'total_loan_balance' => $employee->total_loan_balance,
            ],
            'user' => $employee->user,
            'company' => $employee->company,
        ]);
    }
    

    public function edit(Employee $employee)
    {
        $companies = Company::all();
        $users = User::all();
        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'companies' => $companies,
            'users'=>$users
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $validatedData = $request->validated();
        $fileFields = ['id_front', 'id_back', 'passport_front', 'passport_back'];
    
        $oldApprovedStatus = $employee->approved;
        $newApprovedStatus = $request->input('approved');
    
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                if ($employee->$field) {
                    \Storage::disk('public')->delete($employee->$field);
                }
                $file = $request->file($field);
                $path = $file->store('employee_documents', 'public');
                $validatedData[$field] = $path;
            }
        }
    
        $employee->update($validatedData);
    
        if ($oldApprovedStatus !== $newApprovedStatus) {
            if ($newApprovedStatus === 'Approved') {
                // Send approval email
                Mail::to($employee->user->email)->send(new EmployeeApprovalMail($employee));
            } elseif ($newApprovedStatus === 'Declined') {
                // Send declined email
                Mail::to($employee->user->email)->send(new EmployeeDeclinedMail($employee));
            }
        }
    
        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }
    


    public function destroy(Employee $employee)
    {
        $fileFields = ['id_front', 'id_back', 'passport_front', 'passport_back'];
    
        // Delete associated files
        foreach ($fileFields as $field) {
            if ($employee->$field) {
                \Storage::disk('public')->delete($employee->$field);
            }
        }
    
        $employee->delete();
    
        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
