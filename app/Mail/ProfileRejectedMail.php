<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProfileRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $rejectionReason;
    public $rejectedAt;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, string $rejectionReason)
    {
        $this->user = $user;
        $this->rejectionReason = $rejectionReason;
        $this->rejectedAt = now()->format('F j, Y \a\t g:i A');
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Profile Changes Require Modification - Ristay')
                    ->markdown('emails.profile.rejected')
                    ->with([
                        'user' => $this->user,
                        'rejectionReason' => $this->rejectionReason,
                        'rejectedAt' => $this->rejectedAt,
                    ]);
    }
}