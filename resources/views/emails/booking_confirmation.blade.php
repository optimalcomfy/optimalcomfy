<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $recipientType === 'customer' ? 'New Booking Notification' : 'New Booking Notification' }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; }
        .amount { font-size: 1.2em; font-weight: bold; color: #28a745; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; }
        .status.completed { background-color: #28a745; }
        .status.paid { background-color: #28a745; }
        .status.failed { background-color: #dc3545; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .host-notes { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #ffc107; }
        .checklist-reminder { background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #0dcaf0; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .btn:hover { background-color: #0056b3; }
        .btn-checklist { background-color: #198754; }
        .btn-checklist:hover { background-color: #157347; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $recipientType === 'customer' ? 'New Booking Notification' : 'New Booking Notification' }}</h1>
        <p>
            @if($recipientType === 'customer')
             You have made a new booking with Ristay.
            @else
            You have a new booking for your property.
            @endif
        </p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>
        <div class="info-row">
            <span class="info-label">Reference:</span>
            <span>{{ $booking->number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Property:</span>
            <span>{{ $booking->property->property_name }}</span>
        </div>
        @if($booking->property->apartment_name)
        <div class="info-row">
            <span class="info-label">Apartment:</span>
            <span>{{ $booking->property->apartment_name }}</span>
        </div>
        @endif
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

    @if($recipientType === 'host')
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
        @if($booking->user->phone)
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span>{{ $booking->user->phone }}</span>
        </div>
        @endif
    </div>
    @endif

    <div class="booking-details">
        <h2 class="section-title">Payment Information</h2>
        @if($payment && $payment->mpesa_receipt)
            <div class="info-row">
                <span class="info-label">MPesa Receipt:</span>
                <span>{{ $payment->mpesa_receipt }}</span>
            </div>
        @endif
    </div>

    @if($recipientType === 'host')
    <!-- CHECKLIST REMINDER FOR HOST -->
    <div class="checklist-reminder">
        <h3>✅ Important: Property Setup Checklist Required</h3>
        <p><strong>Please complete the property setup checklist before guest arrival:</strong></p>
        
        <div style="margin: 15px 0;">
            <a href="{{ route('bookings.checklist', $booking->id) }}" class="btn btn-checklist">
                🗒️ Open & Complete Property Checklist
            </a>
        </div>
        
        <p><strong>Checklist includes:</strong></p>
        <ul>
            <li>Property cleanliness and readiness verification</li>
            <li>Amenities check (electricity, water, WiFi)</li>
            <li>Safety equipment verification (fire extinguisher, first aid)</li>
            <li>Key handover arrangements confirmation</li>
            <li>Emergency contact information review</li>
            <li>Required services setup (cleaner, cook if applicable)</li>
        </ul>
        
        <p style="margin-top: 10px; font-weight: bold; color: #0a58ca;">
            📋 <strong>Important:</strong> The checklist must be completed and marked as "Done" before the guest's check-in time.
        </p>
    </div>

    <div class="host-notes">
        <h3>Host Reminders</h3>
        <ul>
            <li>Ensure property is clean and ready before check-in</li>
            <li>Confirm key handover arrangements</li>
            @if($booking->property->cleaner)
            <li>Cleaner service required</li>
            @endif
            @if($booking->property->cook)
            <li>Cook service required</li>
            @endif
            <li><strong>Complete the property checklist (link above)</strong></li>
        </ul>
    </div>
    @else
    <div class="booking-details">
        <h2 class="section-title">Access Information</h2>
        @if($booking->property->key_location)
        <div class="info-row">
            <span class="info-label">Key Location:</span>
            <span>{{ $booking->property->key_location }}</span>
        </div>
        @endif
        @if($booking->property->emergency_contact)
        <div class="info-row">
            <span class="info-label">Emergency Contact:</span>
            <span>{{ $booking->property->emergency_contact }}</span>
        </div>
        @endif
    </div>
    @endif

    <div class="footer">
        <p>For assistance, contact our support team:</p>
        <p>Email: support@ristay.co.ke | Phone: +254 769 88 00 88</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
    </div>
</body>
</html>