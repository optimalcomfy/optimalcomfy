<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarMediaRequest;
use App\Http\Requests\UpdateCarMediaRequest;
use App\Models\CarMedia;
use Illuminate\Support\Facades\Storage;

class CarMediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $carMedias = CarMedia::orderBy('created_at', 'desc')->paginate(10);

        return view('carMedias.index', [
            'carMedias' => $carMedias,
            'pagination' => $carMedias,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('carMedias.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCarMediaRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('media_url')) {
            $validated['media_url'] = $request->file('media_url')->store('car_media', 'public');
        }

        CarMedia::create($validated);

        return redirect()->route('carMedias.index')->with('success', 'Car media created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CarMedia $carMedia)
    {
        return view('carMedias.show', [
            'carMedia' => $carMedia,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CarMedia $carMedia)
    {
        return view('carMedias.edit', [
            'carMedia' => $carMedia,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCarMediaRequest $request, CarMedia $carMedia)
    {
        $validated = $request->validated();

        if ($request->hasFile('media_url')) {
            // Delete old media file if it exists
            if ($carMedia->media_url) {
                Storage::disk('public')->delete($carMedia->media_url);
            }
            // Store new media file
            $validated['media_url'] = $request->file('media_url')->store('car_media', 'public');
        }

        $carMedia->update($validated);

        return redirect()->route('carMedias.index')->with('success', 'Car media updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CarMedia $carMedia)
    {
        // Delete media file from storage if it exists
        if ($carMedia->media_url) {
            Storage::disk('public')->delete($carMedia->media_url);
        }

        $carMedia->delete();

        return redirect()->route('carMedias.index')->with('success', 'Car media deleted successfully.');
    }
}
