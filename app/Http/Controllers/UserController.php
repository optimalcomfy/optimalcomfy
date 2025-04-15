<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function index(Request $request)
    {
        // Start the query with eager loading
        $query = User::query(); // Eager-load company, whether it exists or not
    
        if ($request->has('search')) {
            $search = $request->input('search');
    
            // Apply search conditions to the existing query
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }
    
        $query->orderBy('created_at', 'desc');
        
        // Paginate the query
        $users = $query->paginate(10);
    
        return Inertia::render('Users/Index', [
            'users' => $users->items(),
            'pagination' => $users,
            'flash' => session('flash'),
        ]);
    }
    
    


    public function create()
    {
        $users = User::all();

        $companies = Company::all();
        return Inertia::render('Users/Create', [
            'users' => $users,
            'companies' => $companies,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        User::create($request->validated());

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }


    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $users = User::all();
        $companies = Company::all();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'users' => $users,
            'companies' => $companies,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }


    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
