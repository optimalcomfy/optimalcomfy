<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Storage;

class AdminUserRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $cvPath;
    public $coverLetterPath;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $cvPath = null, $coverLetterPath = null)
    {
        $this->user = $user;
        $this->cvPath = $cvPath;
        $this->coverLetterPath = $coverLetterPath;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $email = $this->subject('New User Registration')
            ->view('emails.admin_user_registration')
            ->with([
                'user' => $this->user,
            ]);
    
        // Attach CV if available
        if ($this->cvPath && file_exists($this->cvPath)) {
            $email->attach($this->cvPath, [
                'as' => 'CV_' . $this->user->name . '.' . pathinfo($this->cvPath, PATHINFO_EXTENSION),
                'mime' => mime_content_type($this->cvPath),
            ]);
        }
    
        // Attach Cover Letter if available
        if ($this->coverLetterPath && file_exists($this->coverLetterPath)) {
            $email->attach($this->coverLetterPath, [
                'as' => 'GoodConduct_' . $this->user->name . '.' . pathinfo($this->coverLetterPath, PATHINFO_EXTENSION),
                'mime' => mime_content_type($this->coverLetterPath),
            ]);
        }
    
        return $email;
    }
    
    
}

