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
use Illuminate\Validation\Rule;

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
            'user' => $user,
        ]);
    }

    public function sendComment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'comment' => 'required|string',
        ]);

        $virtualUser = new User;
        $virtualUser->email = 'info@Friend corner hoteltravel.agency';
        Mail::to($virtualUser)->send(new ContactMail($validated));

        $virtualUser2 = new User;
        $virtualUser2->email = $validated['email'];
        Mail::to($virtualUser2)->send(new ConfirmMail($validated));

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
    public function update(Request $request): RedirectResponse
    {
        try {
            $user = $request->user();
            
            // Validate the request with all fields
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'display_name' => ['nullable', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => ['nullable', 'string', 'max:20'],
                'date_of_birth' => ['nullable', 'date', 'before:today'],
                'nationality' => ['nullable', 'string', 'max:100'],
                'passport_number' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string', 'max:500'],
                'city' => ['nullable', 'string', 'max:100'],
                'country' => ['nullable', 'string', 'max:2'], // Country code (2 letters)
                'postal_code' => ['nullable', 'string', 'max:20'],
                'bio' => ['nullable', 'string', 'max:2000'],
                'preferred_payment_method' => ['nullable', 'string', 'max:50'],
                'emergency_contact' => ['nullable', 'string', 'max:255'],
                'contact_phone' => ['nullable', 'string', 'max:20'],
                'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
                'id_verification' => ['nullable', 'file', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            ]);

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture if exists
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                }

                // Store new profile picture
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $user->profile_picture = $path;
            } elseif ($request->has('profile_picture') && $request->profile_picture === '') {
                // Handle profile picture removal
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $user->profile_picture = null;
            }

            // Handle ID verification upload
            if ($request->hasFile('id_verification')) {
                // Delete old ID verification if exists
                if ($user->id_verification && Storage::disk('public')->exists($user->id_verification)) {
                    Storage::disk('public')->delete($user->id_verification);
                }

                // Store file with original name
                $fileName = time() . '_' . $request->file('id_verification')->getClientOriginalName();
                $path = $request->file('id_verification')->storeAs('id_verifications', $fileName, 'public');
                $user->id_verification = $path;
            } elseif ($request->has('id_verification') && $request->id_verification === '') {
                // Handle ID verification removal
                if ($user->id_verification && Storage::disk('public')->exists($user->id_verification)) {
                    Storage::disk('public')->delete($user->id_verification);
                }
                $user->id_verification = null;
            }

            // Check if email was changed
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
                // You can add email verification here if needed
                // $user->sendEmailVerificationNotification();
            }

            // Update user data with all fields
            $user->name = $validated['name'];
            $user->display_name = $validated['display_name'] ?? null;
            $user->email = $validated['email'];
            $user->phone = $validated['phone'] ?? null;
            $user->date_of_birth = $validated['date_of_birth'] ?? null;
            $user->nationality = $validated['nationality'] ?? null;
            $user->passport_number = $validated['passport_number'] ?? null;
            $user->address = $validated['address'] ?? null;
            $user->city = $validated['city'] ?? null;
            $user->country = $validated['country'] ?? null;
            $user->postal_code = $validated['postal_code'] ?? null;
            $user->bio = $validated['bio'] ?? null;
            $user->preferred_payment_method = $validated['preferred_payment_method'] ?? null;
            $user->emergency_contact = $validated['emergency_contact'] ?? null;
            $user->contact_phone = $validated['contact_phone'] ?? null;
            
            $user->save();

            return redirect()->route('profile.edit')
                ->with('success', 'Profile updated successfully!')
                ->with('status', 'profile-updated');

        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage(), [
                'user_id' => $request->user()->id,
                'error' => $e->getTraceAsString()
            ]);
            
            return back()
                ->withErrors(['message' => 'An error occurred while updating your profile. Please try again.'])
                ->withInput()
                ->with('status', 'profile-update-failed');
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

        // Delete user's files before deleting account
        if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        
        if ($user->id_verification && Storage::disk('public')->exists($user->id_verification)) {
            Storage::disk('public')->delete($user->id_verification);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/')->with('success', 'Your account has been deleted successfully.');
    }
}