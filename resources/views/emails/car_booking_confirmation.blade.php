<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@if($recipientType === 'customer') Your Car Booking Confirmation @else New Booking for Your Car @endif</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .booking-details {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section-title {
            color: #007bff;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #f8f9fa;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        .amount {
            font-size: 1.2em;
            font-weight: bold;
            color: #28a745;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            color: white;
            font-size: 0.9em;
        }
        .status.confirmed {
            background-color: #28a745;
        }
        .status.pending {
            background-color: #ffc107;
            color: #212529;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn-host {
            background-color: #28a745;
        }
        .car-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 0.9em;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        @if($recipientType === 'customer')
            <h1>Your Car Booking Confirmation</h1>
            <p>Thank you for your booking! We're excited to confirm your car rental reservation.</p>
        @else
            <h1>New Booking for Your Car</h1>
            <p>You've received a new booking for your vehicle. Please review the details below.</p>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>

        <div class="info-row">
            <span class="info-label">Booking number:</span>
            <span>{{ $booking->number ?? 'N/A' }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Car:</span>
            <span>{{ $booking->car->name ?? ($booking->car->make . ' ' . $booking->car->model) ?? 'N/A' }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Start Date:</span>
            <span>{{ $booking->start_date ? \Carbon\Carbon::parse($booking->start_date)->format('l, F j, Y g:i A') : 'Not specified' }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">End Date:</span>
            <span>{{ $booking->end_date ? \Carbon\Carbon::parse($booking->end_date)->format('l, F j, Y g:i A') : 'Not specified' }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span>
                @if($booking->start_date && $booking->end_date)
                    {{ \Carbon\Carbon::parse($booking->start_date)->diffInDays($booking->end_date) }} days
                @else
                    N/A
                @endif
            </span>
        </div>

        @if($recipientType === 'customer' && $booking->car->user)
            <div class="info-row">
                <span class="info-label">Host Name:</span>
                <span>{{ $booking->car->user->name ?? 'N/A' }}</span>
            </div>
        @endif
    </div>

    @if($recipientType === 'customer')
        <!-- CUSTOMER-SPECIFIC CONTENT -->
        <div class="booking-details">
            <h2 class="section-title">Pickup Instructions</h2>

            <p><strong>Pickup Location:</strong> {{ $booking->pickup_location ?? 'To be confirmed' }}</p>
            <p><strong>Required Documents:</strong></p>
            <ul>
                <li>Valid driver's license</li>
                <li>National ID or Passport</li>
                <li>Credit/Debit card for security deposit</li>
            </ul>

            @if(Route::has('bookings.show'))
            <a href="{{ route('bookings.show', $booking->id) }}" class="btn">
                View Your Booking Details
            </a>
            @endif
        </div>
    @else
        <!-- HOST-SPECIFIC CONTENT -->
        <div class="booking-details">
            <h2 class="section-title">Customer Information</h2>

            <div class="info-row">
                <span class="info-label">Name:</span>
                <span>{{ $booking->user->name ?? 'N/A' }}</span>
            </div>

            <div class="info-row">
                <span class="info-label">Email:</span>
                <span>{{ $booking->user->email ?? 'N/A' }}</span>
            </div>

            @if($booking->user->phone ?? false)
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span>{{ $booking->user->phone }}</span>
            </div>
            @endif

            @if($booking->special_requests ?? false)
            <div class="info-row">
                <span class="info-label">Special Requests:</span>
                <span>{{ $booking->special_requests }}</span>
            </div>
            @endif

            @if(Route::has('host.bookings.show'))
            <a href="{{ route('host.bookings.show', $booking->id) }}" class="btn btn-host">
                Manage This Booking
            </a>
            @endif
        </div>
    @endif

    <div class="booking-details">
        <div class="info-row">
            <span class="info-label">Booking Status:</span>
            <span class="status {{ strtolower($booking->status ?? 'pending') }}">{{ ucfirst($booking->status ?? 'Pending') }}</span>
        </div>
    </div>

    @if($recipientType === 'customer')
    <div class="booking-details">
        <h2 class="section-title">Cancellation Policy</h2>
        <ul>
            <li>Free cancellation up to 24 hours before pickup</li>
            <li>50% refund for cancellations made 12-24 hours before pickup</li>
            <li>No refund for cancellations made less than 12 hours before pickup</li>
        </ul>
    </div>
    @endif

    <div class="footer">
        @if($recipientType === 'customer')
            <p>We hope you enjoy your trip with {{ $booking->car->name ?? ($booking->car->make . ' ' . $booking->car->model) ?? 'your vehicle' }}!</p>
            <p>Need help? Contact our support team at support@example.com or call +254 700 000000</p>
        @else
            <p>Please prepare the vehicle for pickup at the scheduled time.</p>
            <p>For any questions, contact our host support at hosts@example.com</p>
        @endif

        <p><em>This is an automated email. Please do not reply directly to this message.</em></p>
    </div>
</body>
</html>
