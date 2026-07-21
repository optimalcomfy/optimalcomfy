<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarBookingRequestConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(CarBooking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Your Car Booking Request Has Been Sent')
                    ->view('emails.car-booking-request-confirmation');
    }
}