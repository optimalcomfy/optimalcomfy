<?php

namespace App\Mail;

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $commentData;

    public function __construct($commentData)
    {
        $this->commentData = $commentData;
    }

    public function build()
    {
        return $this->view('emails.comment')
                    ->with(['commentData' => $this->commentData]);
    }
}


