<?php

namespace App\Mail;

use App\Models\Repayment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoanRepaymentMail extends Mailable
{
    use Queueable, SerializesModels;

    public $repayment;

    /**
     * Create a new message instance.
     */
    public function __construct(Repayment $repayment)
    {
        $this->repayment = $repayment;
    }

    /**
     * Get the message content definition.
     */
    public function build()
    {
        return $this->subject('Loan Repayment Received')
                    ->view('emails.loan_repayment')
                    ->with([
                        'repayment' => $this->repayment,
                    ]);
    }
}
