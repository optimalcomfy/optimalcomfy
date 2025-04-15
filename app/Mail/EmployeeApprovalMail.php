<?php

namespace App\Mail;

use App\Models\Employee;  // Use the correct namespace
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmployeeApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public $employee;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\Employee  $employee
     * @return void
     */
    public function __construct(Employee $employee)
    {
        $this->employee = $employee;
    }

    /**
     * Build the message.
     *
     * @return \Illuminate\Mail\Mailable
     */
    public function build()
    {
        return $this->subject('Your Vermsol Application Has Been Approved')
                    ->view('emails.employee_approval')
                    ->with([
                        'employee' => $this->employee
                    ]);
    }
}



