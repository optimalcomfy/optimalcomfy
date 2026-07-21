<!DOCTYPE html>
<html>
<head>
    <title>New Car Booking Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #f97316, #fb923c); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Car Booking Request</h1>
        </div>
        <div class="content">
            <p>Hello {{ $booking->car->user->name }},</p>
            
            <p>You have a new booking request for your car <strong>{{ $booking->car->name }}</strong> ({{ $booking->car->license_plate }}).</p>
            
            <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Booking #:</strong> {{ $booking->number }}</p>
                <p><strong>Guest:</strong> {{ $booking->user->name }}</p>
                <p><strong>Email:</strong> {{ $booking->user->email }}</p>
                <p><strong>Phone:</strong> {{ $booking->guest_phone ?? 'Not provided' }}</p>
                <p><strong>Pickup Date:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->format('M j, Y') }}</p>
                <p><strong>Return Date:</strong> {{ \Carbon\Carbon::parse($booking->end_date)->format('M j, Y') }}</p>
                <p><strong>Duration:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date)) }} days</p>
                <p><strong>Pickup Location:</strong> {{ $booking->pickup_location }}</p>
                <p><strong>Total Amount:</strong> KES {{ number_format($booking->total_price, 2) }}</p>
                
                @if($booking->guest_message)
                <p><strong>Guest Message:</strong><br>{{ $booking->guest_message }}</p>
                @endif
            </div>
            
            <p>Please review this request and either approve or reject it within 24 hours.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('dashboard') }}" class="button">View Booking in Dashboard</a>
            </div>
            
            <p>You can also respond to this request by:</p>
            <ul>
                <li>Logging into your Ristay dashboard</li>
                <li>Going to "Car Bookings" → "Host Requests"</li>
                <li>Clicking on this booking and choosing to approve or reject</li>
            </ul>
            
            <p>If you approve the booking, the guest will be notified to complete payment.</p>
            
            <p>Best regards,<br>The Ristay Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Ristay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>