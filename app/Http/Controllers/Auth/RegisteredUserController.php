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

use Spatie\Permission\Models\Role;

use App\Mail\AdminUserRegistrationMail;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Support\Facades\DB;

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

        public function store(StoreUserRequest $request)
        {
            try {
                $validated = $request->validated();

                // Handle profile picture upload
                if ($request->hasFile('profile_picture')) {
                    $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
                }

                // Handle ID verification upload
                if ($request->hasFile('id_verification')) {
                    $validated['id_verification'] = $request->file('id_verification')->store('id_verifications', 'public');
                }

                // Hash the password if provided
                if (!empty($validated['password'])) {
                    $validated['password'] = Hash::make($validated['password']);
                }

                // Create the user
                $user = User::create($validated);

                 if ($user->role_id) {
                    $role = Role::find($user->role_id);


                    if ($role) {
                        $user->assignRole($role);
                        
                        DB::table('model_has_roles')->where('model_id', $user->id)->update([
                            'model_type' => User::class
                        ]);
                    
                        $user->syncPermissions($role->permissions);
                    
                        DB::table('model_has_permissions')->where('model_id', $user->id)->update([
                            'model_type' => User::class
                        ]);
                    }
                    
                }

                // Optional: Redirect to login page with a success message
                return Inertia::render('Auth/Login', [
                    'user'         => $user,
                    'notification' => 'Account created successfully. Please login.',
                ]);

            } catch (\Exception $e) {
                Log::error('User creation failed: ' . $e->getMessage());

                // Return an Inertia-friendly error response
                return back()->withErrors([
                    'message' => 'An unexpected error occurred. Please try again later.'
                ])->withInput();
            }
        }
     
    
}
