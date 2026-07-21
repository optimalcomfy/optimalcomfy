<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Car Booking Approved - Complete Payment - {{ $booking->car->name }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 5px solid #28a745; }
        .booking-details { background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .section-title { color: #198754; border-bottom: 2px solid #198754; padding-bottom: 5px; margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        .info-label { font-weight: bold; color: #495057; min-width: 150px; }
        .status { display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; }
        .status.approved { background-color: #28a745; color: white; }
        .status.urgent { background-color: #dc3545; color: white; }
        .payment-box { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ffc107; text-align: center; }
        .amount { font-size: 2em; font-weight: bold; color: #28a745; margin: 10px 0; }
        .timer { background-color: #dc3545; color: white; padding: 10px; border-radius: 5px; font-weight: bold; text-align: center; margin: 15px 0; }
        .btn { display: inline-block; padding: 15px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em; }
        .btn:hover { background-color: #218838; }
        .btn-alt { background-color: #0d6efd; }
        .btn-alt:hover { background-color: #0b5ed7; }
        .payment-methods { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .method { display: flex; align-items: center; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 5px; }
        .method-icon { font-size: 1.5em; margin-right: 15px; }
        .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 0.9em; text-align: center; }
        .warning { background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 5px solid #dc3545; }
        .price-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .price-label { color: #495057; }
        .price-value { font-weight: bold; color: #198754; }
        .price-total { border-top: 2px solid #dee2e6; padding-top: 10px; margin-top: 10px; font-size: 1.2em; }
        .car-icon { font-size: 2em; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="car-icon">🚗</div>
        <h1>✅ Car Booking Approved!</h1>
        <p>Great news! The car owner has approved your booking request. Complete payment to confirm your car rental.</p>
        <span class="status approved">HOST APPROVED</span>
    </div>

    <div class="timer">
        <h3 style="margin: 0;">⏰ URGENT: Complete Payment Within 24 Hours</h3>
        <p style="margin: 5px 0 0 0; font-size: 0.9em;">Your car booking will expire if payment is not completed</p>
    </div>

    <div class="payment-box">
        <h2>Complete Payment Now</h2>
        <p>Total Amount Due:</p>
        <div class="amount">KES {{ number_format($booking->total_price, 2) }}</div>
        
        <div style="margin: 25px 0;">
            <a href="{{ route('car-bookings.pay', $booking->id) }}" class="btn">
                💳 Complete Payment Now
            </a>
        </div>
        
        <p style="color: #6c757d; font-size: 0.9em;">You will be redirected to our secure payment page</p>
    </div>
    

    <div class="booking-details">
        <h2 class="section-title">Car Booking Details</h2>
        <div class="info-row">
            <span class="info-label">Booking ID:</span>
            <span><strong>{{ $booking->number }}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Car:</span>
            <span>{{ $booking->car->name }} ({{ $booking->car->brand }} {{ $booking->car->model }})</span>
        </div>
        <div class="info-row">
            <span class="info-label">License Plate:</span>
            <span>{{ $booking->car->license_plate }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Pick-up Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->start_date)->format('l, F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Return Date:</span>
            <span>{{ \Carbon\Carbon::parse($booking->end_date)->format('l, F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Rental Days:</span>
            <span>{{ \Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date)) }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Car Owner:</span>
            <span>{{ $booking->car->user->name }}</span>
        </div>
        @if($booking->pickup_location)
        <div class="info-row">
            <span class="info-label">Pick-up Location:</span>
            <span>{{ $booking->pickup_location }}</span>
        </div>
        @endif
        @if($booking->dropoff_location)
        <div class="info-row">
            <span class="info-label">Drop-off Location:</span>
            <span>{{ $booking->dropoff_location }}</span>
        </div>
        @endif
    </div>

    <div class="booking-details">
        <h2 class="section-title">Price Breakdown</h2>
        
        @php
            $days = \Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date));
            $dailyRate = $booking->car->price_per_day;
            $subtotal = $dailyRate * $days;
        @endphp
        
        <div class="price-row">
            <span class="price-label">Daily Rate:</span>
            <span class="price-value">KES {{ number_format($dailyRate, 2) }} × {{ $days }} days</span>
        </div>
        
        @if($booking->referral_code && isset($company))
        <div class="price-row">
            <span class="price-label">Referral Discount ({{ $company->booking_referral_percentage ?? 10 }}%):</span>
            <span class="price-value" style="color: #dc3545;">- KES {{ number_format($subtotal * (($company->booking_referral_percentage ?? 10) / 100), 2) }}</span>
        </div>
        @endif
        
        <div class="price-row price-total">
            <span class="price-label">Total Amount:</span>
            <span class="price-value">KES {{ number_format($booking->total_price, 2) }}</span>
        </div>
    </div>

    <div class="payment-methods">
        <h2 class="section-title">Available Payment Methods</h2>
        
        <div class="method">
            <div class="method-icon">📱</div>
            <div>
                <h4 style="margin: 0 0 5px 0;">M-Pesa</h4>
                <p style="margin: 0; color: #6c757d;">Pay via M-Pesa (Lipa Na M-Pesa)</p>
                <small style="color: #6c757d;">Enter your 10-digit phone number (07XXXXXXXX)</small>
            </div>
        </div>
        
        <div class="method">
            <div class="method-icon">💳</div>
            <div>
                <h4 style="margin: 0 0 5px 0;">Pesapal</h4>
                <p style="margin: 0; color: #6c757d;">Pay via Credit/Debit Card, Mobile Money</p>
                <small style="color: #6c757d;">You'll be redirected to Pesapal's secure payment page</small>
            </div>
        </div>
    </div>

    <div class="warning">
        <h3>⚠️ Important Notice</h3>
        <p><strong>Your car booking is NOT confirmed yet.</strong> The car owner has approved your dates, but you must complete payment to secure the booking.</p>
        <p>If payment is not completed within 24 hours, the booking request will expire and the car will become available for other renters.</p>
    </div>

    <div style="text-align: center; margin: 25px 0;">
        <a href="{{ route('car-bookings.pay', $booking->id) }}" class="btn">
            💳 Complete Payment Now
        </a>
        <br>
        <a href="{{ route('dashboard') }}" class="btn btn-alt" style="margin-top: 10px; padding: 10px 20px; font-size: 1em;">
            📋 View All Bookings
        </a>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Car Pick-up Information</h2>
        <p><strong>Before you pick up the car:</strong></p>
        <div class="info-row">
            <span class="info-label">📋 Required Documents:</span>
            <span>Valid Driver's License & National ID/Passport</span>
        </div>
        <div class="info-row">
            <span class="info-label">⏰ Pick-up Time:</span>
            <span>After 10:00 AM on {{ \Carbon\Carbon::parse($booking->start_date)->format('F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">📞 Contact Owner:</span>
            <span>{{ $booking->car->user->phone ?? 'Contact via Ristay platform' }}</span>
        </div>
    </div>

    <div class="booking-details">
        <h2 class="section-title">Need Help?</h2>
        <p>If you encounter any issues with payment, please contact our support team immediately:</p>
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
        <p>Once payment is completed, you'll receive a booking confirmation email with all the car rental details.</p>
        <p><em>This is an automated message. Please don't reply directly.</em></p>
        <p style="font-size: 0.8em; color: #6c757d; margin-top: 10px;">
            Drive safely! 🚗 Remember to follow all traffic rules and return the car in good condition.
        </p>
    </div>
</body>
</html>