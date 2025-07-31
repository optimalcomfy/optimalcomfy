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
    public $recipientType;

    /**
     * Create a new message instance.
     *
     * @param CarBooking $booking
     * @param string $recipientType 'customer' or 'host'
     */
    public function __construct(CarBooking $booking, string $recipientType)
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
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
        
        $subject = $this->recipientType === 'customer' 
            ? 'Your Car Booking Confirmation - ' . $carName
            : 'New Booking for Your Car - ' . $carName;
        
        return $this->subject($subject)
                    ->view('emails.car_booking_confirmation')
                    ->with([
                        'booking' => $this->booking,
                        'recipientType' => $this->recipientType,
                        'car' => $this->booking->car
                    ]);
    }
}