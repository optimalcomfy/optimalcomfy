<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GenericEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $toAddress;
    public $subject;
    public $content;

    /**
     * Create a new message instance.
     */
    public function __construct(string $toAddress, string $subject, string $content)
    {
        $this->toAddress = $toAddress;
        $this->subject = $subject;
        $this->content = $content;
    }

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this->to($this->toAddress)
                    ->subject($this->subject)
                    ->html($this->content);
    }
}
