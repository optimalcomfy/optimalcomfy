<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Booking - {{ $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e7f5ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #0d6efd; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; background-color: #28a745; color: white; }
        .amount-box { background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
    </style>
</head>
<body>

    <div class="amount-box">
        <h2 style="margin: 0;">Earnings for this booking:</h2>
        <div style="font-size: 2em; font-weight: bold; color: #28a745; margin: 10px 0;">
            KES {{ number_format($booking->host_price, 2) }}
        </div>
        <p style="color: #6c757d;">Will be disbursed after guest check-out</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>
        <div class="info-row">
            <span class="info-label">Booking ID:</span>
            <span><strong>{{ $booking->number }}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Guest:</span>
            <span>{{ $booking->user->name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Guest Email:</span>
            <span>{{ $booking->user->email }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Guest Phone:</span>
            <span>{{ $booking->guest_phone ?? 'Not provided' }}</span>
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

    <div class="booking-details">
        <h2 class="section-title">Next Steps</h2>
        <p><strong>1. Prepare the Property</strong> - Ensure everything is ready for guest arrival</p>
        <p><strong>2. Contact Guest</strong> - Reach out 1-2 days before check-in to coordinate arrival</p>
        <p><strong>3. Check-in</strong> - Verify guest identity and provide access</p>
        <p><strong>4. Payment</strong> - Your earnings will be disbursed 24 hours after check-out</p>
    </div>

    <div class="footer">
        <p>You can manage this booking from your dashboard: 
            <a href="{{ route('dashboard') }}" style="color: #0d6efd; font-weight: bold;">View Dashboard</a>
        </p>
        <p><em>This is an automated notification. Please don't reply directly.</em></p>
    </div>
</body>
</html>