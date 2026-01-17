<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Property;
use App\Models\Car;
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
use App\Mail\PendingVerificationMail;
use App\Mail\AdminUserRegistrationMail;
use Illuminate\Support\Facades\Mail;

use Spatie\Permission\Models\Role;

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
     * Ristay verification email
     */
    const RISTAY_PROFILES_EMAIL = 'profiles@ristay.co.ke';

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

    public function customerCreate(Request $request): Response
    {
        $notification = Notification::orderBy('created_at', 'desc')->first();

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
        
        return Inertia::render('Auth/CustomerRegistration', [
            'notification'=> $notification,
            'property'=>$property
        ]);
    }

    public function customerRideCreate(Request $request): Response
    {
        $notification = Notification::orderBy('created_at', 'desc')->first();

        $input = $request->all();

        $car = Car::with(["bookings", "initialGallery", "carFeatures"])
        ->where("id", "=", $input["car_id"])
        ->first();
        
        return Inertia::render('Auth/CRRegistration', [
            'notification'=> $notification,
            'car'=>$car
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

            // Check if user already exists
            $existingUser = User::where('email', $validated['email'])->first();

            if ($existingUser) {
                // Attempt to login the user (you can decide to check password if needed)
                Auth::login($existingUser);
                return redirect()->intended(RouteServiceProvider::HOME);
            }

            // Handle profile picture upload
            if ($request->hasFile('profile_picture')) {
                $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            // Handle ID verification upload - front
            if ($request->hasFile('id_front')) {
                $validated['id_front'] = $request->file('id_front')->store('id_fronts', 'public');
            }

            // Handle ID verification upload - back (NEW)
            if ($request->hasFile('id_back')) {
                $validated['id_back'] = $request->file('id_back')->store('id_backs', 'public');
            }

            // Hash the password if provided
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            // Set role_id based on user_type
            if (!empty($validated['user_type'])) {
                $validated['role_id'] = $validated['user_type'] === 'guest' ? 3 : 2;
            }

            // Set default profile status
            $validated['profile_status'] = 'pending'; // Default status for new users

            // Create the user
            $user = User::create($validated);

            // Log the user in immediately
            Auth::login($user);

            // Send verification emails
            $this->sendRegistrationNotifications($user);

            // Redirect to the intended or home page
            return redirect()->intended(RouteServiceProvider::HOME);

        } catch (\Exception $e) {
            Log::error('User creation failed: ' . $e->getMessage());

            return back()->withErrors([
                'message' => 'An unexpected error occurred. Please try again later.'
            ])->withInput();
        }
    }


    public function customerStore(StoreUserRequest $request)
    {
        try {
            $validated = $request->validated();

            // Check if user already exists
            $existingUser = User::where('email', $validated['email'])->first();

            if ($existingUser) {
                Auth::login($existingUser);
                return response()->json(['success' => true]);
            }

            // Handle file uploads
            if ($request->hasFile('profile_picture')) {
                $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            if ($request->hasFile('id_front')) {
                $validated['id_front'] = $request->file('id_front')->store('id_fronts', 'public');
            }

            // Handle ID back upload (NEW)
            if ($request->hasFile('id_back')) {
                $validated['id_back'] = $request->file('id_back')->store('id_backs', 'public');
            }

            // Hash password if provided
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            // Set role
            $validated['role_id'] = $validated['user_type'] === 'guest' ? 3 : 2;

            // Set default profile status
            $validated['profile_status'] = 'pending';

            // Create user
            $user = User::create($validated);

            // Log in the new user
            Auth::login($user);

            // Send verification emails
            $this->sendRegistrationNotifications($user);

            return Inertia::render('Auth/CustomerRegistration', ['success' => true]);

        } catch (\Exception $e) {
            Log::error('User creation failed: ' . $e->getMessage());
            return response()->json([
                'errors' => [
                    'message' => ['An unexpected error occurred. Please try again later.']
                ]
            ], 500);
        }
    }

    public function customerRideStore(StoreUserRequest $request)
    {
        try {
            $validated = $request->validated();

            // Check if user already exists
            $existingUser = User::where('email', $validated['email'])->first();

            if ($existingUser) {
                Auth::login($existingUser);
                return response()->json(['success' => true]);
            }

            // Handle file uploads
            if ($request->hasFile('profile_picture')) {
                $validated['profile_picture'] = $request->file('profile_picture')->store('profile_pictures', 'public');
            }

            if ($request->hasFile('id_front')) {
                $validated['id_front'] = $request->file('id_front')->store('id_fronts', 'public');
            }

            // Handle ID back upload (NEW)
            if ($request->hasFile('id_back')) {
                $validated['id_back'] = $request->file('id_back')->store('id_backs', 'public');
            }

            // Hash password if provided
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            // Set role
            $validated['role_id'] = $validated['user_type'] === 'guest' ? 3 : 2;

            // Set default profile status
            $validated['profile_status'] = 'pending';

            // Create user
            $user = User::create($validated);

            // Log in the new user
            Auth::login($user);

            // Send verification emails
            $this->sendRegistrationNotifications($user);

            return Inertia::render('Auth/CRRegistration', ['success' => true]);

        } catch (\Exception $e) {
            Log::error('User creation failed: ' . $e->getMessage());
            return response()->json([
                'errors' => [
                    'message' => ['An unexpected error occurred. Please try again later.']
                ]
            ], 500);
        }
    }

    /**
     * Send registration notifications to user and admin
     */
    private function sendRegistrationNotifications(User $user): void
    {
        try {
            // Send pending verification email to user
            Mail::to($user->email)->send(new PendingVerificationMail($user));
            
            Log::info('Pending verification email sent to user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => 'pending_verification'
            ]);

            // Send welcome email (optional)
            Mail::to($user->email)->send(new WelcomeMail($user));
            
            Log::info('Welcome email sent to user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => 'welcome'
            ]);

            // Send notification to Ristay admin about new user registration
            $this->sendAdminRegistrationNotification($user);
            
            Log::info('Admin notification sent for new user registration', [
                'user_id' => $user->id,
                'admin_email' => self::RISTAY_PROFILES_EMAIL
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send registration notifications: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
        }
    }

    /**
     * Send admin notification about new user registration
     */
    private function sendAdminRegistrationNotification(User $user): void
    {
        try {
            // Create a virtual user for the Ristay admin email
            $adminUser = new User;
            $adminUser->email = self::RISTAY_PROFILES_EMAIL;
            $adminUser->name = 'Ristay Admin';
            
            // Send admin notification email
            Mail::to($adminUser)->send(new AdminUserRegistrationMail($user));
            
        } catch (\Exception $e) {
            Log::error('Failed to send admin registration notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => self::RISTAY_PROFILES_EMAIL
            ]);
            throw $e;
        }
    }
}