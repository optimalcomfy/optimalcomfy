<?php

namespace App\Mail;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoanDeclinedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $loan;

    /**
     * Create a new message instance.
     */
    public function __construct(Loan $loan)
    {
        $this->loan = $loan;
    }

    /**
     * Get the message content definition.
     */
    public function build()
    {
        return $this->subject('Loan Application Status: Declined')
                    ->view('emails.loan_declined')
                    ->with([
                        'loan' => $this->loan,
                    ]);
    }
}
