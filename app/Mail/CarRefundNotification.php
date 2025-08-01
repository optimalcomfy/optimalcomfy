<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarRefundNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $status;
    public $reason;

    public function __construct(CarBooking $booking, $status, $reason = null)
    {
        $this->booking = $booking;
        $this->status = $status;
        $this->reason = $reason;
    }

    public function build()
    {
        $subject = $this->status === 'approved' 
            ? 'Your Car Rental Refund Has Been Approved' 
            : 'Your Car Rental Refund Request Has Been Rejected';

        return $this->subject($subject)
            ->markdown('emails.car-refund-notification');
    }
}