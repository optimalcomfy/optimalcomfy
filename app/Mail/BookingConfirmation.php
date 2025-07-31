<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $recipientType;

    public function __construct(Booking $booking, string $recipientType = 'customer')
    {
        $this->booking = $booking;
        $this->recipientType = $recipientType;
    }

    public function build()
    {
        return $this->subject($this->getSubject())
                   ->view('emails.booking_confirmation')
                   ->with([
                       'booking' => $this->booking,
                       'user' => $this->booking->user,
                       'property' => $this->booking->property,
                       'payment' => $this->booking->payments->first(),
                       'recipientType' => $this->recipientType
                   ]);
    }

    protected function getSubject(): string
    {
        return $this->recipientType === 'customer'
            ? 'Booking Confirmed - ' . $this->booking->property->property_name
            : 'New Booking - ' . $this->booking->property->property_name;
    }
}