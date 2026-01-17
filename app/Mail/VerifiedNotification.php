<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifiedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $subject;
    public $verificationType;

    /**
     * Create a new message instance.
     *
     * @param User $user
     * @param string $verificationType ('verified' or 'unverified')
     */
    public function __construct(User $user, $verificationType = 'verified')
    {
        $this->user = $user;
        $this->verificationType = $verificationType;
        $this->subject = $verificationType === 'verified' 
            ? 'Your Account Has Been Verified - Ristay'
            : 'Your Account Verification Has Been Updated - Ristay';
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $viewName = $this->verificationType === 'verified' 
            ? 'emails.user.verified'
            : 'emails.user.unverified';

        return $this->subject($this->subject)
                    ->markdown($viewName)
                    ->with([
                        'user' => $this->user,
                        'verificationType' => $this->verificationType,
                    ]);
    }
}