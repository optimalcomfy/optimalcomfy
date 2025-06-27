{{-- resources/views/emails/car_booking_confirmation.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Car Booking Confirmation</title>
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
        .status.confirmed {
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
        .car-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Car Booking Confirmation</h1>
        <p>Thank you for your booking! We're excited to confirm your car rental reservation.</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Booking Details</h2>

        <div class="info-row">
            <span class="info-label">Booking number:</span>
            <span>{{ $booking->number }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Car:</span>
            <span>{{ $booking->car->name ?? $booking->car->make . ' ' . $booking->car->model }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Start Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->start_date)->format('l, F j, Y g:i A') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">End Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->end_date)->format('l, F j, Y g:i A') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Duration:</span>
            <span>{{ \Carbon\Carbon::parse($booking->start_date)->diffInDays($booking->end_date) }} days</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Pickup Location:</span>
            <span>{{ $booking->pickup_location }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Drop-off Location:</span>
            <span>{{ $booking->dropoff_location }}</span>
        </div>

        @if($booking->special_requests)
        <div class="info-row">
            <span class="info-label">Special Requests:</span>
            <span>{{ $booking->special_requests }}</span>
        </div>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Vehicle Information</h2>
        
        <div class="car-info">
            <div class="info-row">
                <span class="info-label">Vehicle:</span>
                <span>{{ $booking->car->name ?? $booking->car->make . ' ' . $booking->car->model }}</span>
            </div>
            
            @if($booking->car->year)
            <div class="info-row">
                <span class="info-label">Year:</span>
                <span>{{ $booking->car->year }}</span>
            </div>
            @endif
            
            @if($booking->car->color)
            <div class="info-row">
                <span class="info-label">Color:</span>
                <span>{{ $booking->car->color }}</span>
            </div>
            @endif
            
            @if($booking->car->license_plate)
            <div class="info-row">
                <span class="info-label">License Plate:</span>
                <span>{{ $booking->car->license_plate }}</span>
            </div>
            @endif
            
            @if($booking->car->fuel_type)
            <div class="info-row">
                <span class="info-label">Fuel Type:</span>
                <span>{{ ucfirst($booking->car->fuel_type) }}</span>
            </div>
            @endif
            
            @if($booking->car->transmission)
            <div class="info-row">
                <span class="info-label">Transmission:</span>
                <span>{{ ucfirst($booking->car->transmission) }}</span>
            </div>
            @endif
        </div>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Customer Information</h2>
        
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

    <div class="booking-details">
        <h2 class="section-title">Payment Summary</h2>
        
        <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span class="amount">KSh {{ number_format($booking->total_price, 2) }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Booking Status:</span>
            <span class="status {{ strtolower($booking->status) }}">{{ ucfirst($booking->status) }}</span>
        </div>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Pickup Instructions</h2>
        
        <p><strong>Pickup Time:</strong> Please arrive 15 minutes before your scheduled pickup time</p>
        <p><strong>Pickup Location:</strong> {{ $booking->pickup_location }}</p>
        <p><strong>Required Documents:</strong></p>
        <ul>
            <li>Valid driver's license</li>
            <li>National ID or Passport</li>
            <li>Credit/Debit card for security deposit</li>
        </ul>
        
        <p><strong>Contact for Pickup:</strong> Please call 254734567834 when you arrive at the pickup location.</p>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Important Terms & Conditions</h2>
        
        <h4>Rental Policy:</h4>
        <ul>
            <li>Minimum age requirement: 18 years</li>
            <li>Valid driving license required (minimum 2 years)</li>
            <li>Security deposit will be held on your card</li>
            <li>Vehicle must be returned with the same fuel level</li>
        </ul>

        <h4>Cancellation Policy:</h4>
        <ul>
            <li>Free cancellation up to 24 hours before pickup</li>
            <li>50% refund for cancellations made 12-24 hours before pickup</li>
            <li>No refund for cancellations made less than 12 hours before pickup</li>
        </ul>

        <h4>Additional Charges:</h4>
        <ul>
            <li>Late return: KSh 500 per hour after grace period</li>
            <li>Cleaning fee: KSh 2,000 if returned excessively dirty</li>
            <li>Traffic fines and parking tickets are customer's responsibility</li>
        </ul>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Contact Information</h2>
        
        <p><strong>Customer Support:</strong><br>
        Phone: 254734567834<br>
        Email: info@ristay.co.ke<br>
        WhatsApp: 254734567834
        </p>

        <p><strong>Emergency Contact:</strong><br>
        24/7 Support: 254734567834<br>
        In case of breakdown or emergency, call immediately
        </p>
    </div>

    <div class="footer">
        <p>We're excited to provide you with {{ $booking->car->name ?? $booking->car->make . ' ' . $booking->car->model }}! Drive safely and enjoy your journey.</p>
        
        <p><strong>Booking Date:</strong> {{ $booking->created_at->format('F j, Y g:i A') }}</p>
        
        <p><em>This is an automated confirmation email. For assistance, please use the contact information provided above.</em></p>
    </div>
</body>
</html>