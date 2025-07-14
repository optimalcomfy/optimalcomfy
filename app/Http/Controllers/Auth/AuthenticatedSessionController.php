<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Property;
use App\Models\Car;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function customerRideCreate(Request $request): Response
    {
        $input = $request->all();
        
        $car = Car::with(["bookings", "initialGallery", "carFeatures"])
        ->where("id", "=", $input["car_id"])
        ->first();

        return Inertia::render('Auth/CRLogin', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'car'=> $car
        ]);
    }

    public function customerCreate(Request $request): Response
    {
        $input = $request->all();
        
        $property = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities.amenity",
            "propertyFeatures",
            "PropertyServices",
            "user",
            "variations",
        ])->where('id', '=', $input['property_id'])->first();

        return Inertia::render('Auth/CustomerLogin', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'property'=> $property
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    public function customerStore(LoginRequest $request)
    {
        $input = $request->all();

        $property = Property::with([
            "bookings",
            "initialGallery",
            "propertyAmenities.amenity",
            "propertyFeatures",
            "PropertyServices",
            "user",
            "variations",
        ])->where('id', '=', $input['property_id'])->first();

        $request->authenticate();

        $request->session()->regenerate();

        return Inertia::render('PropertyBooking', [
            'property' => $property,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email
                ] : null
            ]
        ]);
    }

    public function customerRideStore(LoginRequest $request)
    {
        $input = $request->all();

        $car = Car::with(["bookings", "initialGallery", "carFeatures"])
        ->where("id", "=", $input["car_id"])
        ->first();

        $request->authenticate();

        $request->session()->regenerate();

        return Inertia::render('CarBooking', [
            'car' => $car,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email
                ] : null
            ]
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
