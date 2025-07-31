<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $recipientType === 'customer' ? 'Booking Confirmation' : 'New Booking: ' . $booking->property->property_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; }
        .amount { font-size: 1.2em; font-weight: bold; color: #28a745; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; }
        .status.completed, .status.paid { background-color: #28a745; }
        .status.failed { background-color: #dc3545; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .host-notes { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #ffc107; }
    </style>
</head>
<body>
    <!-- Header (Dynamic for Customer/Host) -->
    <div class="header">
        <h1>
            {{ $recipientType === 'customer' ? 'Your Booking is Confirmed' : 'New Booking: ' . $booking->property->property_name }}
        </h1>
        <p>
            {{ $recipientType === 'customer' 
               ? 'Thank you for your reservation. Details are below.' 
               : 'A guest has booked your property. Review the details below.' }}
        </p>
    </div>

    <!-- Booking Details (Same for Both) -->
    <div class="booking-details">
        <h2 class="section-title">Booking Summary</h2>
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
            <span class="info-label">Unit:</span>
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

    <!-- Guest Info (Host Only) -->
    @if($recipientType === 'host')
    <div class="booking-details">
        <h2 class="section-title">Guest Details</h2>
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

    <!-- Payment Section -->
    <div class="booking-details">
        <h2 class="section-title">Payment</h2>
        @if($recipientType !== 'host')
        <div class="info-row">
            <span class="info-label">Total:</span>
            <span class="amount">KSh {{ number_format($booking->total_price, 2) }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="status {{ $booking->status }}">{{ ucfirst($booking->status) }}</span>
        </div>
        @if($payment && $payment->mpesa_receipt)
        <div class="info-row">
            <span class="info-label">MPesa Receipt:</span>
            <span>{{ $payment->mpesa_receipt }}</span>
        </div>
        @endif
        @if($recipientType === 'host')
        <div class="info-row">
            <span class="info-label">Your Earnings:</span>
            <span class="amount">KSh {{ number_format($booking->total_price * 0.85, 2) }}</span>
        </div>
        @endif
    </div>

    <!-- Host Instructions or Customer Access Info -->
    @if($recipientType === 'host')
    <div class="host-notes">
        <h3>Prepare for the Guest</h3>
        <ul>
            <li>Ensure the property is clean and ready by <strong>{{ \Carbon\Carbon::parse($booking->check_in_date)->format('l, F j') }}</strong>.</li>
            <li>Confirm key exchange or access instructions with the guest.</li>
            @if($booking->property->cleaner)
            <li>Schedule cleaning services before arrival.</li>
            @endif
            @if($booking->property->cook)
            <li>Arrange for cooking services as requested.</li>
            @endif
        </ul>
    </div>
    @else
    <div class="booking-details">
        <h2 class="section-title">Arrival Instructions</h2>
        @if($booking->property->key_location)
        <div class="info-row">
            <span class="info-label">Key Pickup:</span>
            <span>{{ $booking->property->key_location }}</span>
        </div>
        @endif
        @if($booking->property->emergency_contact)
        <div class="info-row">
            <span class="info-label">Host Contact:</span>
            <span>{{ $booking->property->emergency_contact }}</span>
        </div>
        @endif
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Need help? Contact our support team:</p>
        <p>Email: support@ristay.com | Phone: +254 700 123456</p>
        <p><small>This is an automated message. Please do not reply directly.</small></p>
        @if($recipientType === 'host')
        <p><small><a href="{{ route('host.unsubscribe') }}">Unsubscribe from notifications</a></small></p>
        @endif
    </div>
</body>
</html>