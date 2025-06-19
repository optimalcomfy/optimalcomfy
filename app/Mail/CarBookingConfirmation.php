<?php

namespace App\Mail;

use App\Models\CarBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CarBookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new message instance.
     *
     * @param CarBooking $booking
     */
    public function __construct(CarBooking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $carName = $this->booking->car->name ??
                   ($this->booking->car->make . ' ' . $this->booking->car->model);
                   
        return $this->subject('Car Booking Confirmed - ' . $carName)
                    ->view('emails.car_booking_confirmation')
                    ->with([
                        'booking' => $this->booking,
                        'user' => $this->booking->user,
                        'car' => $this->booking->car
                    ]);
    }
}