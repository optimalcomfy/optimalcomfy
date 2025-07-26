<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarCheckInVerification extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(CarBooking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->markdown('emails.car_checkin_verification')
                    ->subject('Your Car Rental Check-In Verification Code');
    }
}