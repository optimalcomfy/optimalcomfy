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
use Carbon\Carbon;
use App\Services\SmsService;
use App\Mail\ProfileApprovedMail;
use App\Mail\ProfileRejectedMail;
use App\Mail\ProfileUpdateSubmittedMail;

class ProfileController extends Controller
{
    const RISTAY_PROFILES_EMAIL = 'profiles@ristay.co.ke';

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = Auth::user();
        
        // Parse pending data JSON to array if exists
        if ($user->pending_data) {
            try {
                $user->pending_data = json_decode($user->pending_data, true);
            } catch (\Exception $e) {
                $user->pending_data = null;
            }
        }
    
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
        $virtualUser->email = 'profiles@ristay.co.ke';
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
            
            // Check if user has pending changes
            if ($user->profile_status === 'pending') {
                return back()
                    ->withErrors(['message' => 'You have pending changes that need to be verified before making new changes.'])
                    ->withInput()
                    ->with('status', 'pending-changes-exist');
            }

            // Base validation rules
            $validationRules = [
                'name' => ['required'],
                'display_name' => ['nullable'],
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'phone' => ['nullable'],
                'date_of_birth' => ['nullable', 'date', 'before:today'],
                'nationality' => ['nullable', 'string', 'max:100'],
                'passport_number' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string', 'max:500'],
                'city' => ['nullable', 'string', 'max:100'],
                'country' => ['nullable'],
                'postal_code' => ['nullable', 'string', 'max:20'],
                'bio' => ['nullable', 'string', 'max:2000'],
                'preferred_payment_method' => ['nullable', 'string', 'max:50'],
                'emergency_contact' => ['nullable', 'string', 'max:255'],
                'contact_phone' => ['nullable', 'string', 'max:20'],
                'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
                'id_front' => ['nullable', 'file', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
                'id_back' => ['nullable', 'file', 'mimes:pdf,jpeg,png,jpg', 'max:5120'],
            ];

            // Special handling for file removal
            if ($request->has('remove_pending_profile') || $request->has('remove_pending_id_front') || $request->has('remove_pending_id_back')) {
                $this->handleFileRemoval($user, $request);
                return redirect()->route('profile.edit')->with('status', 'pending-file-removed');
            }

            // Validate the request
            $validated = $request->validate($validationRules);

            // Check if this is a pending update (sensitive information)
            if ($request->has('is_pending_update') && $request->is_pending_update === 'true') {
                return $this->handlePendingUpdate($user, $request, $validated);
            } else {
                // Handle regular (non-sensitive) updates
                return $this->handleImmediateUpdate($user, $request, $validated);
            }

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
     * Handle pending updates (sensitive information)
     */
    private function handlePendingUpdate(User $user, Request $request, array $validated): RedirectResponse
    {
        $pendingData = [];
        
        // Fields that require verification
        $sensitiveFields = [
            'name', 'display_name', 'phone', 'date_of_birth',
            'nationality', 'passport_number', 'address', 'city', 'country',
            'postal_code', 'bio', 'preferred_payment_method', 
            'emergency_contact', 'contact_phone'
        ];
        
        // Collect sensitive field changes
        foreach ($sensitiveFields as $field) {
            if (isset($validated[$field]) && $validated[$field] != $user->$field) {
                $pendingData[$field] = $validated[$field];
            }
        }
        
        // Handle profile picture upload for pending
        if ($request->hasFile('profile_picture')) {
            // Delete old pending profile picture if exists
            if ($user->pending_profile_picture && Storage::disk('public')->exists($user->pending_profile_picture)) {
                Storage::disk('public')->delete($user->pending_profile_picture);
            }
            
            // Store new pending profile picture
            $path = $request->file('profile_picture')->store('pending/profile_pictures', 'public');
            $user->pending_profile_picture = $path;
        }
        
        // Handle ID front upload for pending
        if ($request->hasFile('id_front')) {
            // Delete old pending ID front if exists
            if ($user->pending_id_front && Storage::disk('public')->exists($user->pending_id_front)) {
                Storage::disk('public')->delete($user->pending_id_front);
            }
            
            // Store file with original name
            $fileName = time() . '_front_' . $request->file('id_front')->getClientOriginalName();
            $path = $request->file('id_front')->storeAs('pending/id_documents', $fileName, 'public');
            $user->pending_id_front = $path;
        }
        
        // Handle ID back upload for pending
        if ($request->hasFile('id_back')) {
            // Delete old pending ID back if exists
            if ($user->pending_id_back && Storage::disk('public')->exists($user->pending_id_back)) {
                Storage::disk('public')->delete($user->pending_id_back);
            }
            
            // Store file with original name
            $fileName = time() . '_back_' . $request->file('id_back')->getClientOriginalName();
            $path = $request->file('id_back')->storeAs('pending/id_documents', $fileName, 'public');
            $user->pending_id_back = $path;
        }
        
        // Update email immediately (requires separate verification anyway)
        if ($validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
            // You can add email verification here if needed
            // $user->sendEmailVerificationNotification();
        }
        
        // Save pending data
        if (!empty($pendingData)) {
            $user->pending_data = json_encode($pendingData);
        }
        
        $user->profile_status = 'pending';
        $user->profile_verified_at = null;
        $user->save();
        
        // Log pending update
        Log::info('User submitted pending profile update', [
            'user_id' => $user->id,
            'pending_fields' => array_keys($pendingData)
        ]);
        
        try {
            // Send notification to Ristay profiles email
            $this->sendProfileUpdateNotificationToRistay($user, $pendingData);
            
            Log::info('Profile update notification sent to Ristay', [
                'user_id' => $user->id,
                'ristay_email' => self::RISTAY_PROFILES_EMAIL
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send profile update notification to Ristay: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
        }
        
        return redirect()->route('profile.edit')
            ->with('success', 'Your profile changes have been submitted for verification. They will be reviewed by our team within 24-48 hours.')
            ->with('status', 'profile-update-pending');
    }

    /**
     * Send profile update notification to Ristay admin email
     */
    private function sendProfileUpdateNotificationToRistay(User $user, array $pendingData): void
    {
        try {
            // Create a virtual user for the Ristay email
            $ristayUser = new User;
            $ristayUser->email = self::RISTAY_PROFILES_EMAIL;
            
            // Send the notification email
            Mail::to($ristayUser)->send(new ProfileUpdateSubmittedMail($user, $pendingData));
            
        } catch (\Exception $e) {
            Log::error('Failed to send profile update notification to Ristay: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'email' => self::RISTAY_PROFILES_EMAIL
            ]);
            throw $e; // Re-throw to be caught by the calling method
        }
    }

    /**
     * Handle immediate updates (non-sensitive information)
     */
    private function handleImmediateUpdate(User $user, Request $request, array $validated): RedirectResponse
    {
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

        // Handle ID front upload
        if ($request->hasFile('id_front')) {
            // Delete old ID front if exists
            if ($user->id_front && Storage::disk('public')->exists($user->id_front)) {
                Storage::disk('public')->delete($user->id_front);
            }

            // Store file with original name
            $fileName = time() . '_front_' . $request->file('id_front')->getClientOriginalName();
            $path = $request->file('id_front')->storeAs('id_documents', $fileName, 'public');
            $user->id_front = $path;
        } elseif ($request->has('id_front') && $request->id_front === '') {
            // Handle ID front removal
            if ($user->id_front && Storage::disk('public')->exists($user->id_front)) {
                Storage::disk('public')->delete($user->id_front);
            }
            $user->id_front = null;
        }

        // Handle ID back upload
        if ($request->hasFile('id_back')) {
            // Delete old ID back if exists
            if ($user->id_back && Storage::disk('public')->exists($user->id_back)) {
                Storage::disk('public')->delete($user->id_back);
            }

            // Store file with original name
            $fileName = time() . '_back_' . $request->file('id_back')->getClientOriginalName();
            $path = $request->file('id_back')->storeAs('id_documents', $fileName, 'public');
            $user->id_back = $path;
        } elseif ($request->has('id_back') && $request->id_back === '') {
            // Handle ID back removal
            if ($user->id_back && Storage::disk('public')->exists($user->id_back)) {
                Storage::disk('public')->delete($user->id_back);
            }
            $user->id_back = null;
        }

        // Update non-sensitive fields immediately
        $user->bio = $validated['bio'] ?? null;
        $user->preferred_payment_method = $validated['preferred_payment_method'] ?? null;
        $user->emergency_contact = $validated['emergency_contact'] ?? null;
        $user->contact_phone = $validated['contact_phone'] ?? null;
        
        // Update email if changed
        if ($validated['email'] !== $user->email) {
            $user->email = $validated['email'];
            $user->email_verified_at = null;
        }
        
        $user->save();

        return redirect()->route('profile.edit')
            ->with('success', 'Profile updated successfully!')
            ->with('status', 'profile-updated');
    }

    /**
     * Handle removal of pending files
     */
    private function handleFileRemoval(User $user, Request $request): void
    {
        if ($request->has('remove_pending_profile')) {
            if ($user->pending_profile_picture && Storage::disk('public')->exists($user->pending_profile_picture)) {
                Storage::disk('public')->delete($user->pending_profile_picture);
                $user->pending_profile_picture = null;
            }
        }
        
        if ($request->has('remove_pending_id_front')) {
            if ($user->pending_id_front && Storage::disk('public')->exists($user->pending_id_front)) {
                Storage::disk('public')->delete($user->pending_id_front);
                $user->pending_id_front = null;
            }
        }
        
        if ($request->has('remove_pending_id_back')) {
            if ($user->pending_id_back && Storage::disk('public')->exists($user->pending_id_back)) {
                Storage::disk('public')->delete($user->pending_id_back);
                $user->pending_id_back = null;
            }
        }
        
        // If all pending files are removed and no other pending data, reset status
        if (!$user->pending_profile_picture && !$user->pending_id_front && !$user->pending_id_back && empty($user->pending_data)) {
            $user->profile_status = 'active';
        }
        
        $user->save();
    }

    /**
     * Cancel all pending changes
     */
    public function cancelPending(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Delete pending files
        if ($user->pending_profile_picture && Storage::disk('public')->exists($user->pending_profile_picture)) {
            Storage::disk('public')->delete($user->pending_profile_picture);
        }
        
        if ($user->pending_id_front && Storage::disk('public')->exists($user->pending_id_front)) {
            Storage::disk('public')->delete($user->pending_id_front);
        }
        
        if ($user->pending_id_back && Storage::disk('public')->exists($user->pending_id_back)) {
            Storage::disk('public')->delete($user->pending_id_back);
        }
        
        // Clear all pending data
        $user->pending_data = null;
        $user->pending_profile_picture = null;
        $user->pending_id_front = null;
        $user->pending_id_back = null;
        $user->profile_status = 'active';
        $user->rejection_reason = null;
        $user->save();
        
        Log::info('User cancelled pending changes', ['user_id' => $user->id]);
        
        return redirect()->route('profile.edit')
            ->with('success', 'Pending changes have been cancelled.')
            ->with('status', 'pending-changes-cancelled');
    }

    /**
     * Admin: Approve pending changes
     */
    public function approvePending(Request $request, User $user, SmsService $smsService): RedirectResponse
    {
        // Check if user is admin using isAdmin() method
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }
        
        if ($user->profile_status !== 'pending') {
            return back()->withErrors(['message' => 'No pending changes to approve.']);
        }
        
        // Store old values for logging
        $oldData = [];
        $fieldsToUpdate = ['name', 'display_name', 'phone', 'date_of_birth', 'nationality', 
            'passport_number', 'address', 'city', 'country', 'postal_code'];
        
        foreach ($fieldsToUpdate as $field) {
            $oldData[$field] = $user->$field;
        }
        
        // Apply pending data
        if ($user->pending_data) {
            $pendingData = json_decode($user->pending_data, true);
            
            foreach ($pendingData as $field => $value) {
                if (in_array($field, $fieldsToUpdate)) {
                    $user->$field = $value;
                }
            }
        }
        
        // Move pending files to active
        if ($user->pending_profile_picture) {
            // Delete old profile picture if exists
            if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            
            // Move file
            $newPath = str_replace('pending/', '', $user->pending_profile_picture);
            Storage::disk('public')->move($user->pending_profile_picture, $newPath);
            $user->profile_picture = $newPath;
        }
        
        if ($user->pending_id_front) {
            if ($user->id_front && Storage::disk('public')->exists($user->id_front)) {
                Storage::disk('public')->delete($user->id_front);
            }
            
            $newPath = str_replace('pending/', '', $user->pending_id_front);
            Storage::disk('public')->move($user->pending_id_front, $newPath);
            $user->id_front = $newPath;
        }
        
        if ($user->pending_id_back) {
            if ($user->id_back && Storage::disk('public')->exists($user->id_back)) {
                Storage::disk('public')->delete($user->id_back);
            }
            
            $newPath = str_replace('pending/', '', $user->pending_id_back);
            Storage::disk('public')->move($user->pending_id_back, $newPath);
            $user->id_back = $newPath;
        }
        
        // Clear pending data and update status
        $user->pending_data = null;
        $user->pending_profile_picture = null;
        $user->pending_id_front = null;
        $user->pending_id_back = null;
        $user->profile_status = 'active';
        $user->profile_verified_at = Carbon::now();
        $user->rejection_reason = null;
        $user->save();
        
        // Log approval
        Log::info('Admin approved pending profile changes', [
            'admin_id' => Auth::id(),
            'user_id' => $user->id,
            'old_data' => $oldData,
            'new_data' => $user->only($fieldsToUpdate),
            'approved_at' => now()
        ]);
        
        try {
            // Send approval email notification to user
            Mail::to($user->email)->send(new ProfileApprovedMail($user));
            
            // Send approval SMS notification to user
            $this->sendProfileNotification($user, 'approved', $smsService);
            
            Log::info('Profile approval notifications sent to user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'phone' => $user->phone
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send profile approval notifications to user: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
        }
        
        return back()->with('success', 'Pending changes approved successfully. Notifications sent to user.');
    }

    /**
     * Admin: Reject pending changes
     */
    public function rejectPending(Request $request, User $user, SmsService $smsService): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }
        
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000']
        ]);
        
        // Store pending data for logging before deletion
        $pendingData = $user->pending_data ? json_decode($user->pending_data, true) : [];
        
        // Delete pending files
        if ($user->pending_profile_picture && Storage::disk('public')->exists($user->pending_profile_picture)) {
            Storage::disk('public')->delete($user->pending_profile_picture);
        }
        
        if ($user->pending_id_front && Storage::disk('public')->exists($user->pending_id_front)) {
            Storage::disk('public')->delete($user->pending_id_front);
        }
        
        if ($user->pending_id_back && Storage::disk('public')->exists($user->pending_id_back)) {
            Storage::disk('public')->delete($user->pending_id_back);
        }
        
        // Set rejection reason and reset status
        $user->pending_data = null;
        $user->pending_profile_picture = null;
        $user->pending_id_front = null;
        $user->pending_id_back = null;
        $user->profile_status = 'rejected';
        $user->rejection_reason = $request->rejection_reason;
        $user->save();
        
        // Log rejection
        Log::info('Admin rejected pending profile changes', [
            'admin_id' => Auth::id(),
            'user_id' => $user->id,
            'reason' => $request->rejection_reason,
            'pending_data' => $pendingData,
            'rejected_at' => now()
        ]);
        
        try {
            // Send rejection email notification to user
            Mail::to($user->email)->send(new ProfileRejectedMail($user, $request->rejection_reason));
            
            // Send rejection SMS notification to user
            $this->sendProfileNotification($user, 'rejected', $smsService, $request->rejection_reason);
            
            Log::info('Profile rejection notifications sent to user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'phone' => $user->phone
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send profile rejection notifications to user: ' . $e->getMessage(), [
                'user_id' => $user->id
            ]);
        }
        
        return back()->with('success', 'Pending changes rejected. Notifications sent to user.');
    }

    /**
     * Send profile notification SMS
     */
    private function sendProfileNotification(User $user, string $type, SmsService $smsService, string $reason = null)
    {
        try {
            switch ($type) {
                case 'approved':
                    $message = "Hello {$user->name}, your profile changes have been approved and are now active. Thank you for updating your information with Ristay!";
                    break;
                    
                case 'rejected':
                    $defaultMessage = "Hello {$user->name}, your profile changes require modification. Please review the feedback and submit again.";
                    
                    if ($reason) {
                        $message = "Hello {$user->name}, your profile changes were not approved. Reason: {$reason}. Please update and resubmit.";
                    } else {
                        $message = $defaultMessage;
                    }
                    break;
                    
                case 'pending':
                    $message = "Hello {$user->name}, your profile changes have been submitted for verification. We'll review them within 24-48 hours. Thank you for your patience!";
                    break;
                    
                default:
                    return;
            }

            $smsService->sendSms($user->phone, $message);
            
            Log::info("Profile {$type} SMS sent to user {$user->id}", [
                'type' => $type,
                'phone' => $user->phone
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send profile {$type} SMS: " . $e->getMessage(), [
                'user_id' => $user->id,
                'type' => $type
            ]);
        }
    }

    /**
     * Admin: View pending profile updates
     */
    public function pendingProfiles(Request $request): Response
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }
        
        $pendingUsers = User::where('profile_status', 'pending')
            ->select('id', 'name', 'email', 'profile_status', 'pending_data', 
                     'pending_profile_picture', 'pending_id_front', 'pending_id_back',
                     'created_at', 'profile_verified_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        // Parse pending data for each user
        $pendingUsers->getCollection()->transform(function ($user) {
            if ($user->pending_data) {
                try {
                    $user->pending_data = json_decode($user->pending_data, true);
                } catch (\Exception $e) {
                    $user->pending_data = null;
                }
            }
            return $user;
        });
        
        return Inertia::render('Admin/PendingProfiles', [
            'pendingUsers' => $pendingUsers,
            'status' => session('status'),
        ]);
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

        // Delete all user files before deleting account
        $filesToDelete = [
            'profile_picture', 'id_front', 'id_back',
            'pending_profile_picture', 'pending_id_front', 'pending_id_back'
        ];
        
        foreach ($filesToDelete as $fileField) {
            if ($user->$fileField && Storage::disk('public')->exists($user->$fileField)) {
                Storage::disk('public')->delete($user->$fileField);
            }
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/')->with('success', 'Your account has been deleted successfully.');
    }
}