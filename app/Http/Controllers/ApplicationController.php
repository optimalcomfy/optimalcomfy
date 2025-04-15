<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
    
        $query = Application::with('user', 'job');
    
        if ($user->role_id == 2) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', '=', $user->id);
        }
    
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');
    
        $applications = $query->paginate(10);
    
        return Inertia::render('Applications/Index', [
            'applications' => $applications->items(),
            'pagination' => $applications,
            'flash' => session('flash'),
        ]);
    }
    

    public function create()
    {
        $applications = Application::all();
        $users = User::all();

        return Inertia::render('Applications/Create', [
            'applications' => $applications,
            'users'=> $users
        ]);
    }

    public function store(StoreApplicationRequest $request)
    {
        Application::create($request->validated());

        return redirect()->route('applications.index')->with('success', 'Application created successfully.');
    }


    public function show(Application $application)
    {
        return Inertia::render('Applications/Show', [
            'application' => $application,
        ]);
    }

    public function edit(Application $application)
    {
        $applications = Application::all();
        $users = User::all();

        return Inertia::render('Applications/Edit', [
            'application' => $application,
            'applications' => $applications,
            'users'=>$users
        ]);
    }

    public function update(UpdateApplicationRequest $request, Application $application)
    {
        $application->update($request->validated());

        return redirect()->route('applications.index')->with('success', 'Application updated successfully.');
    }


    public function destroy(Application $application)
    {
        $application->delete();

        return redirect()->route('applications.index')->with('success', 'Application deleted successfully.');
    }
}
