<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProfileUpdateSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $pendingData;
    public $submittedAt;
    public $pendingFiles;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, array $pendingData)
    {
        $this->user = $user;
        $this->pendingData = $pendingData;
        $this->submittedAt = now()->format('F j, Y \a\t g:i A');
        
        // Check for pending files
        $this->pendingFiles = [];
        if ($user->pending_profile_picture) {
            $this->pendingFiles[] = 'Profile Picture';
        }
        if ($user->pending_id_front) {
            $this->pendingFiles[] = 'ID Front';
        }
        if ($user->pending_id_back) {
            $this->pendingFiles[] = 'ID Back';
        }
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New Profile Update Submission - Requires Verification')
                    ->markdown('emails.profile.update-submitted')
                    ->with([
                        'user' => $this->user,
                        'pendingData' => $this->pendingData,
                        'submittedAt' => $this->submittedAt,
                        'pendingFiles' => $this->pendingFiles,
                    ]);
    }
}