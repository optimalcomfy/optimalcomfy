<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Instant Booking - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #28a745; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #198754; border-bottom: 2px solid #198754; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; background-color: #198754; color: white; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.9em; font-weight: bold; margin-left: 10px; }
        .badge.instant { background-color: #198754; color: white; }
        .important-box { background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0dcaf0; }
        .checklist-reminder { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107; }
        .btn { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .btn-primary { background-color: #0d6efd; }
        .btn-primary:hover { background-color: #0b5ed7; }
        .btn-checklist { background-color: #198754; }
        .btn-checklist:hover { background-color: #157347; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .payment-info { background-color: #e7f3e7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
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

    <div class="payment-info">
        <h3>💰 Payment Information</h3>
        <div class="info-row">
            <span class="info-label">Amount Received:</span>
            <span style="font-weight: bold; font-size: 1.1em; color: #198754;">KES {{ number_format($booking->total_price, 2) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Status:</span>
            <span style="color: #198754; font-weight: bold;">✅ PAID</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>{{ $booking->payment_method ? strtoupper($booking->payment_method) : 'M-Pesa' }}</span>
        </div>
    </div>

    <div class="important-box">
        <h3>📋 Important: Property Setup Required</h3>
        <p>Since this was an <strong>instant booking</strong>, the guest has already paid and expects the property to be ready.</p>
        
        <div style="margin: 15px 0; text-align: center;">
            <a href="{{ route('bookings.checklist', $booking->id) }}" class="btn btn-checklist">
                🗒️ Open Property Checklist
            </a>
        </div>
    </div>

    <div class="checklist-reminder">
        <h3>✅ Property Readiness Checklist</h3>
        <p><strong>Please ensure the following is completed before guest arrival:</strong></p>
        <ul>
            <li>Property is clean and ready for check-in</li>
            <li>All amenities are working (electricity, water, WiFi)</li>
            <li>Key handover arrangements are confirmed</li>
            <li>Emergency contact information is available</li>
            @if($booking->property->cleaner)
            <li>Cleaner service is scheduled</li>
            @endif
            @if($booking->property->cook)
            <li>Cook service is arranged (if requested)</li>
            @endif
            <li>Complete the property checklist in your dashboard</li>
        </ul>
        
        <p style="margin-top: 15px; font-weight: bold; color: #0a58ca;">
            ⚡ <strong>Instant Booking Note:</strong> Guest has already paid, so prompt preparation is essential.
        </p>
    </div>

    <div style="text-align: center; margin: 25px 0;">
        <a href="{{ route('bookings.show', $booking->id) }}" class="btn btn-primary">
            🔍 View Full Booking Details
        </a>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Need Help?</h2>
        <p>If you have any questions or need assistance preparing for this booking, please contact our support team:</p>
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
        <p>Thank you for being a valued Ristay host!</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>