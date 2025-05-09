<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeatureRequest;
use App\Http\Requests\UpdateFeatureRequest;
use App\Models\Feature;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Feature::orderBy('created_at', 'desc');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'LIKE', "%$search%")
                  ->orWhere('description', 'LIKE', "%$search%");
        }

        $features = $query->paginate(10);

        return Inertia::render('Features/Index', [
            'features' => $features->items(),
            'pagination' => $features,
            'flash' => session('flash'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Features/Create');
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreFeatureRequest $request)
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('features', 'public');
            $data['image'] = $imagePath;
        }
    
        Feature::create($data);
    
        return redirect()->route('features.index')->with('success', 'Feature created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Feature $feature)
    {
        return Inertia::render('Features/Show', [
            'feature' => $feature,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Feature $feature)
    {
        return Inertia::render('Features/Edit', [
            'feature' => $feature,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdateFeatureRequest $request, Feature $feature)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($feature->image) {
                Storage::disk('public')->delete($feature->image);
            }

            // Upload new image
            $imagePath = $request->file('image')->store('features', 'public');
            $data['image'] = $imagePath;
        }

        $feature->update($data);

        return redirect()->route('features.index')->with('success', 'Feature updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    
    public function destroy(Feature $feature)
    {
        if ($feature->image) {
            Storage::disk('public')->delete($feature->image);
        }

        $feature->delete();

        return redirect()->route('features.index')->with('success', 'Feature deleted successfully.');
    }

}
