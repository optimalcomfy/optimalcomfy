<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProfileApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $approvedAt;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
        $this->approvedAt = now()->format('F j, Y \a\t g:i A');
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Profile Changes Approved - Ristay')
                    ->markdown('emails.profile.approved')
                    ->with([
                        'user' => $this->user,
                        'approvedAt' => $this->approvedAt,
                    ]);
    }
}