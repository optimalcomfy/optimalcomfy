<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Booking;

class RefundNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $action;
    public $reason;

    public function __construct(Booking $booking, string $action, ?string $reason = null)
    {
        $this->booking = $booking;
        $this->action = $action;
        $this->reason = $reason;
    }

    public function build()
    {
        $subject = $this->action === 'approved' 
            ? 'Your Refund for Booking #' . $this->booking->number . ' Has Been Processed'
            : 'Update Regarding Your Refund Request #' . $this->booking->number;

        return $this->subject($subject)
            ->markdown('emails.refund-notification')
            ->with([
                'booking' => $this->booking,
                'action' => $this->action,
                'reason' => $this->reason
            ]);
    }
}