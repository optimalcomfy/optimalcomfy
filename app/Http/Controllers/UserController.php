<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\Company;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\VerifiedNotification;
use App\Mail\UnverifiedNotification;
use App\Services\SmsService;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();

        // Start the query with eager loading of company if needed
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->input('search');

            // Apply search conditions to the existing query
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                ->orWhere('referral_code', 'LIKE', "%$search%")
                ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        if ($user->role_id == 2) { // Removed the string comparison as it's redundant
            $query->where('host_id', $user->id); // Simplified the where clause
        }

        $query->orderBy('created_at', 'desc');

        // Paginate the query
        $users = $query->paginate(10);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'pagination' => $users,
            'flash' => session('flash'),
        ]);
    }

    public function create()
    {
        $users = User::all();

        $companies = Company::all();
        return Inertia::render('Users/Create', [
            'users' => $users,
            'companies' => $companies,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = Auth::user();
        $input = $request->validated();

        $input['host_id'] = $user->id;

        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        }

        User::create($input);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }



    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $users = User::all();
        $companies = Company::all();

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'users' => $users,
            'companies' => $companies,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }



    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function verify(User $user, SmsService $smsService)
    {
        // Store the old verification status
        $oldStatus = $user->ristay_verified;
        
        // Update user verification
        $user->update([
            'ristay_verified' => true
        ]);

        // Only send notifications if status changed
        if ($oldStatus != true) {
            try {
                // Send verification email
                Mail::to($user->email)
                    ->send(new VerifiedNotification($user, 'verified'));

                // Send verification SMS
                $this->sendVerificationSms($user, 'verified', $smsService);

                // Log the verification
                Log::info('User verified', [
                    'user_id' => $user->id,
                    'verified_by' => Auth::id(),
                    'timestamp' => now(),
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to send verification notification: ' . $e->getMessage());
                // Continue execution even if notification fails
            }
        }

        return redirect()->back()->with('success', 'User verified successfully!');
    }

    /**
     * Unverify a user
     */
    
    public function unverify(Request $request, User $user, SmsService $smsService)
    {
        // Validate request for unverification reason
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        // Store the old verification status
        $oldStatus = $user->ristay_verified;
        
        // Update user verification
        $user->update([
            'ristay_verified' => false,
            'unverified_reason' => $request->reason, // Optional: store reason for unverification
        ]);

        // Only send notifications if status changed
        if ($oldStatus != false) {
            try {
                // Send unverification email
                Mail::to($user->email)
                    ->send(new UnverifiedNotification($user, $request->reason));

                // Send unverification SMS
                $this->sendVerificationSms($user, 'unverified', $smsService, $request->reason);

                // Log the unverification
                Log::info('User unverified', [
                    'user_id' => $user->id,
                    'unverified_by' => Auth::id(),
                    'reason' => $request->reason,
                    'timestamp' => now(),
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to send unverification notification: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'User verification removed!');
    }

    /**
     * Send verification SMS notification
     */

    private function sendVerificationSms(User $user, string $type, SmsService $smsService, string $reason = null)
    {
        try {
            switch ($type) {
                case 'verified':
                    $message = "Hello {$user->name}, your Ristay account has been verified successfully! You now have full access to all platform features. Thank you!";
                    break;
                    
                case 'unverified':
                    $defaultMessage = "Hello {$user->name}, your Ristay account verification status has been updated. Some features may be limited.";
                    
                    if ($reason) {
                        $message = "Hello {$user->name}, your Ristay verification status has been updated. Reason: {$reason}. Contact support for more details.";
                    } else {
                        $message = $defaultMessage;
                    }
                    break;
                    
                default:
                    return; 
            }

            $smsService->sendSms($user->phone, $message);
            
            Log::info("Verification SMS sent to user {$user->id}", [
                'type' => $type,
                'phone' => $user->phone
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send verification SMS: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'type' => $type
            ]);
        }
    }
}
