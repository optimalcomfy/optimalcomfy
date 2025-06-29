<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();

        // Start the query with eager loading of company if needed
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->input('search');

            // Apply search conditions to the existing query
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        if ($user->role_id == 2) { // Removed the string comparison as it's redundant
            $query->where('host_id', $user->id); // Simplified the where clause
        }

        $query->orderBy('created_at', 'desc');

        // Paginate the query
        $users = $query->paginate(10);

        return Inertia::render('Users/Index', [
            'users' => $users,
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
        $user = Auth::user();
        $input = $request->validated();

        $input['host_id'] = $user->id;

        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        }

        User::create($input);

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
        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); 
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }



    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
