<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarBookingRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(CarBooking $booking)
    {
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('New Car Booking Request')
                    ->view('emails.car-booking-request');
    }
}