<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Request Update - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #dc3545; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; background-color: #dc3545; color: white; }
        .reason-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .action-buttons { text-align: center; margin: 25px 0; }
        .btn { display: inline-block; padding: 12px 25px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; }
        .btn:hover { background-color: #0b5ed7; }
        .btn-alt { background-color: #6c757d; }
        .btn-alt:hover { background-color: #5c636a; }
        .explore-box { background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0d6efd; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .support { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>❌ Booking Request Update</h1>
        <p>The host has declined your booking request for the dates selected.</p>
        <span class="status">REQUEST DECLINED</span>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>
        <div class="info-row">
            <span class="info-label">Booking ID:</span>
            <span><strong>{{ $booking->number }}</strong></span>
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
            <span class="info-label">Host:</span>
            <span>{{ $booking->property->user->name }}</span>
        </div>
    </div>

    @if($booking->decline_reason)
    <div class="reason-box">
        <h2 class="section-title">Reason for Decline</h2>
        <p style="padding: 10px; background-color: white; border-radius: 5px;">
            {{ $booking->decline_reason }}
        </p>
        <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">
            <em>Note from the host</em>
        </p>
    </div>
    @endif

    <div class="explore-box">
        <h2 style="color: #0d6efd; margin-top: 0;">Don't Worry! Explore Other Options</h2>
        <p>We have many other amazing properties available for your selected dates. You can:</p>
        <ul style="padding-left: 20px;">
            <li>Search for similar properties in the same area</li>
            <li>Adjust your dates slightly for better availability</li>
            <li>Explore different types of accommodations</li>
            <li>Check properties with instant booking available</li>
        </ul>
    </div>

    <div class="action-buttons">
        <a href="{{ route('properties.search') }}" class="btn">
            🔍 Search Other Properties
        </a>
        <a href="{{ route('dashboard') }}" class="btn btn-alt">
            📋 View All Bookings
        </a>
    </div>

    <div class="support">
        <h3 style="margin-top: 0;">Need Assistance?</h3>
        <p>Our support team is here to help you find the perfect accommodation:</p>
        <div class="info-row">
            <span class="info-label">Support Email:</span>
            <span>support@ristay.co.ke</span>
        </div>
        <div class="info-row">
            <span class="info-label">Support Phone:</span>
            <span>+254 769 88 00 88</span>
        </div>
    </div>

    <div class="footer">
        <p>We're sorry this booking didn't work out. We hope you'll find the perfect place for your stay!</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>
