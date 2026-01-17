<!DOCTYPE html>
<html>
<head>
    <title>New Car Booking Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #10b981, #34d399); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .status-confirmed { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #10b981, #34d399); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Car Booking Confirmed!</h1>
        </div>
        <div class="content">
            <p>Hello {{ $booking->car->user->name }},</p>
            
            <p>A new booking for your car <strong>{{ $booking->car->name }}</strong> has been confirmed!</p>
            
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
                <p><strong>Payment Status:</strong> {{ $booking->status === 'paid' ? 'Paid' : 'Pending Payment' }}</p>
                
                @if($booking->guest_message)
                <p><strong>Guest Message:</strong><br>{{ $booking->guest_message }}</p>
                @endif
                
                <div style="margin: 20px 0;">
                    <span class="status-confirmed">Status: Booked</span>
                </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Prepare the car for pickup on {{ \Carbon\Carbon::parse($booking->start_date)->format('M j, Y') }}</li>
                <li>Ensure all necessary documents are ready</li>
                <li>Clean and inspect the car before pickup</li>
                <li>Be available to hand over the car at the agreed pickup location</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('dashboard') }}" class="button">View Booking Details</a>
            </div>
            
            <p><strong>Important Reminders:</strong></p>
            <ul>
                <li>Please verify the guest's identity during pickup</li>
                <li>Complete the check-in process in your dashboard</li>
                <li>Document any pre-existing damage</li>
                <li>Ensure the car has sufficient fuel</li>
            </ul>
            
            <p>You can manage this booking from your Ristay dashboard.</p>
            
            <p>Best regards,<br>The Ristay Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Ristay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>