<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Booking Request - Action Required</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #ffc107; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .urgent { background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; margin-left: 10px; }
        .btn { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 5px; }
        .btn-approve { background-color: #198754; }
        .btn-approve:hover { background-color: #157347; }
        .btn-reject { background-color: #dc3545; }
        .btn-reject:hover { background-color: #bb2d3b; }
        .btn-view { background-color: #0d6efd; }
        .btn-view:hover { background-color: #0b5ed7; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .message-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #6c757d; }
        .notice { background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #0dcaf0; }
        .warning { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #ffc107; }
        .action-buttons { text-align: center; margin: 25px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 New Booking Request - Action Required</h1>
        <p>A guest has requested to book your property. Please review and respond within 24 hours.</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Request Details</h2>
        <div class="info-row">
            <span class="info-label">Reference:</span>
            <span>{{ $booking->number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Property:</span>
            <span>{{ $booking->property->property_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Check-in:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_in_date)->format('l, F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Check-out:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_out_date)->format('l, F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Nights:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_in_date)->diffInDays(\Carbon\Carbon::parse($booking->check_out_date)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span style="font-weight: bold; color: #28a745;">KES {{ number_format($booking->total_price, 2) }}</span>
        </div>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Guest Information</h2>
        <div class="info-row">
            <span class="info-label">Name:</span>
            <span>{{ $booking->user->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span>{{ $booking->user->email }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>{{ $booking->guest_phone ?? $booking->user->phone }}</span>
        </div>
    </div>

    @if($booking->guest_message)
    <div class="message-box">
        <h3>💬 Message from Guest:</h3>
        <p>{{ $booking->guest_message }}</p>
    </div>
    @endif

    <div class="notice">
        <h3>⏰ Important Notice</h3>
        <p>This is a <strong>booking request</strong>, not a confirmed booking. The guest will only be able to make payment <strong>after you approve</strong> this request.</p>
    </div>

    <div class="warning">
        <h3>⚠️ Please Note</h3>
        <p>You have <strong>24 hours</strong> to respond to this request. If not responded to, the request will automatically expire.</p>
    </div>

    <div class="action-buttons">
        <a href="{{ route('bookings.show', $booking->id) }}" class="btn btn-view">
            📋 View Full Details
        </a>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Next Steps</h2>
        <ol style="padding-left: 20px;">
            <li><strong>Review</strong> the booking details above</li>
            <li><strong>Check your calendar</strong> to ensure availability</li>
            <li><strong>Approve</strong> if you can host the guest</li>
            <li><strong>Reject</strong> with a reason if unavailable</li>
            <li>Guest will complete payment after approval</li>
            <li>Booking will be confirmed after payment</li>
        </ol>
    </div>

    <div class="footer">
        <p>For assistance, contact our support team:</p>
        <p>Email: support@ristay.co.ke | Phone: +254 769 88 00 88</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>