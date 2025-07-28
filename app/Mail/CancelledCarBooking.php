<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\CarBooking;

class CancelledCarBooking extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $recipientType;
    public $subject;

    /**
     * Create a new message instance.
     *
     * @param CarBooking $booking
     * @param string $recipientType ('guest' or 'host')
     */
    public function __construct(CarBooking $booking, $recipientType)
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
        $this->subject = $recipientType === 'guest'
            ? 'Your Car Booking #' . $booking->number . ' Has Been Cancelled'
            : 'Car Booking #' . $booking->number . ' Has Been Cancelled';
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject($this->subject)
                   ->markdown('emails.car-booking-cancelled')
                   ->with([
                       'booking' => $this->booking,
                       'recipientType' => $this->recipientType
                   ]);
    }
}