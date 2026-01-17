<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Request Received - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #ffc107; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #ffc107; border-bottom: 2px solid #ffc107; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; background-color: #ffc107; color: #212529; }
        .waiting-box { background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0d6efd; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏳ Booking Request Sent</h1>
        <p>Your booking request has been sent to the host. They have 24 hours to respond.</p>
        <span class="status">AWAITING HOST APPROVAL</span>
    </div>

    <div class="waiting-box">
        <h2>What Happens Next?</h2>
        <p><strong>1. Host Review</strong> - The host will review your request (usually within a few hours)</p>
        <p><strong>2. Host Response</strong> - They can either approve or decline your request</p>
        <p><strong>3. Payment</strong> - If approved, you'll receive payment instructions</p>
        <p><strong>4. Confirmation</strong> - Booking is confirmed once payment is complete</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Request Details</h2>
        <div class="info-row">
            <span class="info-label">Request ID:</span>
            <span><strong>{{ $booking->number }}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Property:</span>
            <span>{{ $booking->property->property_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Host:</span>
            <span>{{ $booking->property->user->name }}</span>
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
            <span>KES {{ number_format($booking->total_price, 2) }}</span>
        </div>
    </div>

    @if($booking->guest_message)
    <div class="booking-details">
        <h2 class="section-title">Message to Host</h2>
        <p style="padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
            {{ $booking->guest_message }}
        </p>
    </div>
    @endif

    <div class="booking-details">
        <h2 class="section-title">Next Steps</h2>
        <p>You will receive an email notification when:</p>
        <ul>
            <li>The host approves your request (you'll then complete payment)</li>
            <li>The host declines your request (you can then book other properties)</li>
            <li>24 hours pass without response (request will expire)</li>
        </ul>
        <p style="margin-top: 15px; color: #6c757d;">
            You can also check the status anytime in your dashboard:
            <a href="{{ route('dashboard') }}" style="color: #0d6efd; font-weight: bold;">View My Bookings</a>
        </p>
    </div>

    <div class="footer">
        <p><strong>Need immediate booking?</strong> Look for properties with "Instant Booking" badge for instant confirmation.</p>
        <p>This is an automated message. Please don't reply directly.</p>
    </div>
</body>
</html>