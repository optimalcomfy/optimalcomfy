<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $recipientType;

    public function __construct(Booking $booking, $recipientType)
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
    }

    public function build()
    {
        $subject = $this->recipientType === 'guest'
            ? 'Your booking has been cancelled'
            : 'A booking has been cancelled';

        return $this->markdown('emails.booking-cancelled')
                   ->subject($subject)
                   ->with([
                       'booking' => $this->booking,
                       'recipientType' => $this->recipientType,
                   ]);
    }
}