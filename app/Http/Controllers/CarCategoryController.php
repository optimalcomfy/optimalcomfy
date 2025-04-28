<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarCategoryRequest;
use App\Http\Requests\UpdateCarCategoryRequest;
use App\Models\CarCategory;
use Inertia\Inertia;

class CarCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = CarCategory::orderBy('name', 'asc')->paginate(10);
        return Inertia::render('CarCategories/Index', [
            'categories' => $categories->items(),
            'pagination' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CarCategories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarCategoryRequest $request)
    {
        CarCategory::create([
            'name'        => $request->name,
            'slug'        => $request->slug,
            'description' => $request->description,
        ]);

        return redirect()->route('CarCategories.index')->with('success', 'Car Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CarCategory $carCategory)
    {
        return Inertia::render('CarCategories/Show', [
            'category' => $carCategory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarCategory $carCategory)
    {
        return Inertia::render('CarCategories/Edit', [
            'category' => $carCategory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarCategoryRequest $request, CarCategory $carCategory)
    {
        $carCategory->update([
            'name'        => $request->name,
            'slug'        => $request->slug,
            'description' => $request->description,
        ]);

        return redirect()->route('CarCategories.index')->with('success', 'Car Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarCategory $carCategory)
    {
        $carCategory->delete();
        return redirect()->route('CarCategories.index')->with('success', 'Car Category deleted successfully.');
    }
}
