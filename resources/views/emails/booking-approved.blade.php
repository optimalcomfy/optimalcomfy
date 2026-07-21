<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Approved - Complete Payment - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #28a745; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #198754; border-bottom: 2px solid #198754; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; }
        .status.approved { background-color: #28a745; color: white; }
        .payment-box { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107; text-align: center; }
        .amount { font-size: 2em; font-weight: bold; color: #28a745; margin: 10px 0; }
        .timer { background-color: #dc3545; color: white; padding: 10px; border-radius: 5px; font-weight: bold; text-align: center; margin: 15px 0; }
        .btn { display: inline-block; padding: 15px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em; }
        .btn:hover { background-color: #218838; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .warning { background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Booking Approved!</h1>
        <p>Great news! The host has approved your booking request. Complete payment to confirm your booking.</p>
        <span class="status approved">HOST APPROVED</span>
    </div>

    <div class="timer">
        <h3 style="margin: 0;">⏰ URGENT: Complete Payment Within 24 Hours</h3>
        <p style="margin: 5px 0 0 0; font-size: 0.9em;">Your booking will expire if payment is not completed</p>
    </div>

    <div class="payment-box">
        <h2>Complete Payment Now</h2>
        <p>Total Amount Due:</p>
        <div class="amount">KES {{ number_format($booking->total_price, 2) }}</div>
        
        <div style="margin: 25px 0;">
            <a href="{{ route('bookings.show', $booking->id) }}" class="btn">
                💳 Complete Payment Now
            </a>
        </div>
        
        <p style="color: #6c757d; font-size: 0.9em;">You will be redirected to our secure payment page</p>
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
            <span class="info-label">Host:</span>
            <span>{{ $booking->property->user->name }}</span>
        </div>
    </div>

    <div class="warning">
        <h3>⚠️ Important Notice</h3>
        <p><strong>Your booking is NOT confirmed yet.</strong> The host has approved your dates, but you must complete payment to secure the booking.</p>
        <p>If payment is not completed within 24 hours, the booking request will expire and the dates will become available for other guests.</p>
    </div>

    <div style="text-align: center; margin: 25px 0;">
        <a href="{{ route('bookings.show', $booking->id) }}" class="btn">
            💳 Complete Payment Now
        </a>
        <p style="margin-top: 10px; color: #6c757d;">
            Or view all your bookings: <a href="{{ route('dashboard') }}" style="color: #0d6efd;">Dashboard</a>
        </p>
    </div>

    <div class="footer">
        <p>Once payment is completed, you'll receive a booking confirmation email with all the details.</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>