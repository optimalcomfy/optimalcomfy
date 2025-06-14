<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Employee;
use App\Mail\ContactMail;
use App\Mail\ConfirmMail;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Validation\Rules\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = Auth::user();
    
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'employee' => $user,
        ]);
    }


    public function sendComment(Request $request)
    {
        // Validate the incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'comment' => 'required|string',
        ]);


        // Create virtualUser for contact email
        $virtualUser = new User;
        $virtualUser->email = 'info@Friend corner hoteltravel.agency';

        // Send ContactMail
        Mail::to($virtualUser)->send(new ContactMail($validated));

        // Create virtualUser2 for the validated email
        $virtualUser2 = new User;
        $virtualUser2->email = $validated['email'];

        // Send ConfirmMail
        Mail::to($virtualUser2)->send(new ConfirmMail($validated));

        // Return the response for the user
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    
    

    /**
     * Update the user's profile information.
     */

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Handle profile picture upload (consistent with store method)
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $validated['profile_picture'] = $request->file('profile_picture')
                    ->store('profile_pictures', 'public');
            } else {
                // Keep existing picture if not updating
                $validated['profile_picture'] = $user->profile_picture;
            }

            // Handle ID verification upload (consistent with store method)
            if ($request->hasFile('id_verification')) {
                // Delete old ID verification if exists
                if ($user->id_verification) {
                    Storage::disk('public')->delete($user->id_verification);
                }
                $validated['id_verification'] = $request->file('id_verification')
                    ->store('id_verifications', 'public');
            } else {
                // Keep existing ID verification if not updating
                $validated['id_verification'] = $user->id_verification;
            }

            // Check if email was changed
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
                // Consider adding email verification here if needed
                // $user->sendEmailVerificationNotification();
            }

            // Update user data
            $user->update($validated);

            return redirect()->route('profile.edit')
                ->with('success', 'Profile updated successfully!');

        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            
            return back()->withErrors([
                'message' => 'An error occurred while updating your profile. Please try again.'
            ])->withInput();
        }
    }

    public function reload(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Handle profile picture upload (consistent with store method)
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $validated['profile_picture'] = $request->file('profile_picture')
                    ->store('profile_pictures', 'public');
            } else {
                // Keep existing picture if not updating
                $validated['profile_picture'] = $user->profile_picture;
            }

            // Handle ID verification upload (consistent with store method)
            if ($request->hasFile('id_verification')) {
                // Delete old ID verification if exists
                if ($user->id_verification) {
                    Storage::disk('public')->delete($user->id_verification);
                }
                $validated['id_verification'] = $request->file('id_verification')
                    ->store('id_verifications', 'public');
            } else {
                // Keep existing ID verification if not updating
                $validated['id_verification'] = $user->id_verification;
            }

            // Check if email was changed
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
                // Consider adding email verification here if needed
                // $user->sendEmailVerificationNotification();
            }

            // Update user data
            $user->update($validated);

            return redirect()->route('profile.edit')
                ->with('success', 'Profile updated successfully!');

        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            
            return back()->withErrors([
                'message' => 'An error occurred while updating your profile. Please try again.'
            ])->withInput();
        }
    }


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
