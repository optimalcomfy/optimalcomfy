
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Confirmation</title>
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
        .status.paid {
            background-color: #28a745;
        }
        .status.pending {
            background-color: #ffc107;
            color: #212529;
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
        <h1>Booking Confirmation</h1>
        <p>Thank you for your booking! We're excited to confirm your property reservation.</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>
        
        <div class="info-row">
            <span class="info-label">Booking Reference:</span>
            <span>#{{ $booking->id }}</span>
        </div>

        <div class="info-row">
            <span class="info-label">Booking Number:</span>
            <span>#{{ $booking->number }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Property:</span>
            <span>{{ $booking->property->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Check-in Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_in_date)->format('l, F j, Y') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Check-out Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_out_date)->format('l, F j, Y') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span>{{ \Carbon\Carbon::parse($booking->check_in_date)->diffInDays($booking->check_out_date) }} nights</span>
        </div>
        
        @if($booking->property->address)
        <div class="info-row">
            <span class="info-label">Property Address:</span>
            <span>{{ $booking->property->address }}</span>
        </div>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Guest Information</h2>
        
        <div class="info-row">
            <span class="info-label">Primary Guest:</span>
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

    <div class="booking-details">
        <h2 class="section-title">Payment Summary</h2>
        
        <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span class="amount">{{ number_format($booking->total_price, 2) }}</span>
        </div>
        
        @if($payment)
        <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span>{{ ucfirst($payment->method) }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Payment Status:</span>
            <span class="status {{ strtolower($booking->status) }}">{{ $booking->status }}</span>
        </div>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Check-in Instructions</h2>
        
        <p><strong>Arrival:</strong> Please arrive after {{ $booking->property->check_in_time ?? '3:00 PM' }} on your check-in date</p>
        
        @if($booking->property->key_instructions)
        <p><strong>Key Collection:</strong> {{ $booking->property->key_instructions }}</p>
        @endif
        
        @if($booking->property->manager_phone)
        <p><strong>Property Manager Contact:</strong> {{ $booking->property->manager_phone }}</p>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Important Policies</h2>
        
        <h4>Cancellation Policy:</h4>
        <ul>
            <li>Cancellations must be made at least 48 hours before check-in</li>
            <li>Full refund available for cancellations made 7 days in advance</li>
            <li>Partial refund (50%) for cancellations made 48-72 hours before check-in</li>
        </ul>

        <h4>House Rules:</h4>
        <ul>
            <li>Check-in: After {{ $booking->property->check_in_time ?? '3:00 PM' }}</li>
            <li>Check-out: Before {{ $booking->property->check_out_time ?? '11:00 AM' }}</li>
            <li>No smoking inside the property</li>
            @if($booking->property->max_guests)
            <li>Maximum occupancy: {{ $booking->property->max_guests }} guests</li>
            @endif
            <li>Quiet hours: 10:00 PM - 8:00 AM</li>
        </ul>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Contact Information</h2>
        
        @if($booking->property->manager_name || $booking->property->manager_phone)
        <p><strong>Property Manager:</strong><br>
        {{ $booking->property->manager_name ?? 'Property Manager' }}<br>
        {{ $booking->property->manager_phone }}<br>
        {{ $booking->property->manager_email }}
        </p>
        @endif

        <p><strong>Customer Support:</strong><br>
        Phone: 254734567834<br>
        Email: info@ristay.co.ke<br>
        </p>
    </div>

    <div class="footer">
        <p>We're excited to host you at {{ $booking->property->name }}! If you have any questions or special requests, please don't hesitate to contact us.</p>
        
        <p><strong>Booking Date:</strong> {{ $booking->created_at->format('F j, Y g:i A') }}</p>
        
        <p><em>This is an automated confirmation email. For assistance, please use the contact information provided above.</em></p>
    </div>
</body>
</html>