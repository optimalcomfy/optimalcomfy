<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarBookingCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $recipientType;

    public function __construct(CarBooking $booking, $recipientType = 'guest')
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
    }

    public function build()
    {
        $subject = $this->recipientType === 'guest' 
            ? 'Your Car Booking Has Been Cancelled'
            : 'Car Booking Cancellation Notification';

        return $this->subject($subject)
                    ->view('emails.car-booking-cancelled');
    }
}