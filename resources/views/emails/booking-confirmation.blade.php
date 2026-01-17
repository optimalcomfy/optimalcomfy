<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Confirmed - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #17a2b8; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #17a2b8; border-bottom: 2px solid #17a2b8; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; background-color: #28a745; color: white; }
        .qr-code { text-align: center; margin: 20px 0; }
        .instructions { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your booking is now confirmed. Here are all the details you need.</p>
        <span class="status">PAID & CONFIRMED</span>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Information</h2>
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
            <span class="info-label">Total Paid:</span>
            <span style="font-weight: bold; color: #28a745;">KES {{ number_format($booking->total_price, 2) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Host:</span>
            <span>{{ $booking->property->user->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Host Contact:</span>
            <span>{{ $booking->property->user->phone ?? 'Will be provided at check-in' }}</span>
        </div>
    </div>

    <div class="qr-code">
        <h3>Your Booking QR Code</h3>
        <p>Show this QR code at check-in:</p>
        <!-- QR Code would be generated here -->
        <div style="background-color: #f8f9fa; padding: 20px; display: inline-block; border-radius: 8px;">
            [QR CODE FOR BOOKING #{{ $booking->number }}]
        </div>
        <p style="color: #6c757d; font-size: 0.9em; margin-top: 10px;">
            Or use booking ID: <strong>{{ $booking->number }}</strong>
        </p>
    </div>

    <div class="instructions">
        <h3>📋 Check-in Instructions</h3>
        <p><strong>1. Arrival Time:</strong> Check-in is from 2:00 PM onwards</p>
        <p><strong>2. What to bring:</strong> Government ID and this confirmation</p>
        <p><strong>3. Contact host:</strong> 1 hour before arrival</p>
        <p><strong>4. Early check-in:</strong> Subject to availability, contact host</p>
        
        <h3 style="margin-top: 20px;">📍 Property Address</h3>
        <p>{{ $booking->property->location ?? 'Address will be shared by host' }}</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Need Help?</h2>
        <p>Our support team is available 24/7 to assist you:</p>
        <div class="info-row">
            <span class="info-label">Support Email:</span>
            <span>support@ristay.co.ke</span>
        </div>
        <div class="info-row">
            <span class="info-label">Support Phone:</span>
            <span>+254 769 88 00 88</span>
        </div>
        <div class="info-row">
            <span class="info-label">WhatsApp:</span>
            <span>+254 769 88 00 88</span>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for booking with Ristay! We hope you have a wonderful stay.</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>