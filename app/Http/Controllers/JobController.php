<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Models\Job;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JobController extends Controller
{

    public function index(Request $request)
    {
        $query = Job::query();
    
        if ($request->has('search')) {
            $search = trim($request->input('search'));
    
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%$search%")
                  ->orWhere('company_name', 'LIKE', "%$search%")
                  ->orWhere('location', 'LIKE', "%$search%")
                  ->orWhere('job_type', 'LIKE', "%$search%")
                  ->orWhere('salary_min', 'LIKE', "%$search%")
                  ->orWhere('salary_max', 'LIKE', "%$search%");
            });
        }
    
        $query->orderBy('created_at', 'desc');
    
        $jobs = $query->paginate(10);
    
        return Inertia::render('Jobs/Index', [
            'jobs' => $jobs->items(),
            'pagination' => $jobs,
            'flash' => session('flash'),
        ]);
    }    
    

    public function create()
    {
        $jobs = Job::all();

        return Inertia::render('Jobs/Create', [
            'jobs' => $jobs
        ]);
    }

    public function store(StoreJobRequest $request)
    {
        $validated = $request->validated();
    
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }
    
        Job::create($validated);
    
        return redirect()->route('jobs.index')->with('success', 'Job created successfully.');
    }
    


    public function show(Job $job)
    {
        return Inertia::render('Jobs/Show', [
            'job' => $job,
        ]);
    }

    public function edit(Job $job)
    {
        $jobs = Job::all();

        return Inertia::render('Jobs/Edit', [
            'job' => $job,
            'jobs' => $jobs
        ]);
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $job->update($request->validated());

        return redirect()->route('jobs.index')->with('success', 'Job updated successfully.');
    }


    public function destroy(Job $job)
    {
        $job->delete();

        return redirect()->route('jobs.index')->with('success', 'Job deleted successfully.');
    }
}
