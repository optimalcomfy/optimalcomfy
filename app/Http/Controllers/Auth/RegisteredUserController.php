<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use App\Models\Notification;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

use App\Mail\AdminUserRegistrationMail;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;


class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $notification = Notification::orderBy('created_at', 'desc')->first();
        
        return Inertia::render('Auth/Register', [
            'notification'=> $notification
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */

     public function store(Request $request)
    {
        try {
            // Validate the request data. On failure, a ValidationException is thrown.
            $validated = $request->validate([
                'name'               => 'required|string|max:255',
                'role_id'            => 'nullable',
                'phone'              => 'required',
                'email'              => 'required|string|lowercase|email|max:255|unique:' . User::class,
                'password'           => ['nullable'],
                'date_of_birth'      => 'nullable|date',
                'nationality'        => 'nullable|string',
                'current_location'   => 'nullable|string',
                'preferred_countries'=> 'nullable|array',
                'position'           => 'nullable',
                'education'          => 'nullable|string',
                'languages'          => 'nullable|string',
                'passport_number'    => 'nullable|string',
                'cv'                 => 'nullable|file|mimes:pdf,doc,docx|max:2048',
                'cover_letter'       => 'nullable|file|mimes:pdf,doc,docx|max:2048',
                'references'         => 'nullable|string',
                'job_id'             => 'nullable|string',
            ]);

            // Store uploaded files if provided.
            $cvPath = $request->file('cv')
                ? $request->file('cv')->store('cvs', 'public')
                : null;
            $coverLetterPath = $request->file('cover_letter')
                ? $request->file('cover_letter')->store('cover_letters', 'public')
                : null;

            $job = Job::find($validated['job_id']);

            // Create the user.
            $user = User::create([
                'name'               => $validated['name'],
                'email'              => $validated['email'],
                'phone'              => $validated['phone'],
                'role_id'            => 3,
                'password'           => Hash::make($validated['password']),
                'date_of_birth'      => $validated['date_of_birth'] ?? null,
                'nationality'        => $validated['nationality'] ?? null,
                'current_location'   => $validated['current_location'] ?? null,
                'preferred_countries'=> $validated['preferred_countries'] ?? null,
                'education'          => $validated['education'] ?? null,
                'languages'          => $validated['languages'] ?? null,
                'passport_number'    => $validated['passport_number'] ?? null,
                'cv'                 => $cvPath,
                'cover_letter'       => $coverLetterPath,
                'references'         => $validated['references'] ?? null,
            ]);

            Application::create([
                'job_id' => $validated['job_id'],
                'user_id' => $user->id
            ]);

            // Fire the Registered event and log the user in.
            event(new Registered($user));
            Auth::login($user);

            // Notify admin by email.
            Mail::to('info@emiratesedgecareers.agency')
                ->send(new AdminUserRegistrationMail(
                    $user,
                    $cvPath ? storage_path('app/public/' . $cvPath) : null,
                    $coverLetterPath ? storage_path('app/public/' . $coverLetterPath) : null
                ));

            // Retrieve the latest notification.
            $notification = Notification::orderBy('created_at', 'desc')->first();

            // Return an Inertia response on success.
            return Inertia::render('Employees/ProcessedRequest', [
                'user'         => $user,
                'notification' => $notification,
            ]);

        } catch (ValidationException $e) {
            // If this is an Inertia request, rethrow the exception so that Inertia's middleware can handle it.
            if ($request->header('X-Inertia')) {
                throw $e;
            }
            // Otherwise, return a JSON response.
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log the error.
            Log::error('Registration Error: ' . $e->getMessage());
            if ($request->header('X-Inertia')) {
                throw $e;
            }
            return response()->json(['message' => 'An unexpected error occurred. Please try again later.'], 500);
        }
    }
     
    
}
