<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $rejection_reason;

    public function __construct(Booking $booking, $rejection_reason = null)
    {
        $this->booking = $booking;
        $this->rejection_reason = $rejection_reason;
    }

    public function build()
    {
        return $this->subject('Booking Request Rejected - ' . $this->booking->property->property_name)
                    ->markdown('emails.booking-rejected')
                    ->with([
                        'booking' => $this->booking,
                        'rejection_reason' => $this->rejection_reason,
                    ]);
    }
}