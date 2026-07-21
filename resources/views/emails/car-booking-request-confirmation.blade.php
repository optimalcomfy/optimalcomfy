<!DOCTYPE html>
<html>
<head>
    <title>Car Booking Request Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #f97316, #fb923c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .status-pending { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #f97316, #fb923c); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Car Booking Request Submitted</h1>
        </div>
        <div class="content">
            <p>Hello {{ $booking->user->name }},</p>
            
            <p>Your booking request has been successfully submitted to the host!</p>
            
            <div class="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Booking #:</strong> {{ $booking->number }}</p>
                <p><strong>Car:</strong> {{ $booking->car->name }} ({{ $booking->car->license_plate }})</p>
                <p><strong>Pickup Date:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->format('M j, Y') }}</p>
                <p><strong>Return Date:</strong> {{ \Carbon\Carbon::parse($booking->end_date)->format('M j, Y') }}</p>
                <p><strong>Duration:</strong> {{ \Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date)) }} days</p>
                <p><strong>Pickup Location:</strong> {{ $booking->pickup_location }}</p>
                <p><strong>Total Amount:</strong> KES {{ number_format($booking->total_price, 2) }}</p>
                
                <div style="margin: 20px 0;">
                    <span class="status-pending">Status: Pending Host Approval</span>
                </div>
            </div>
            
            <p><strong>What happens next:</strong></p>
            <ol>
                <li>The host will review your booking request</li>
                <li>You'll receive an email/SMS once they approve or reject</li>
                <li>If approved, you'll need to complete payment to confirm the booking</li>
                <li>Once payment is complete, your booking will be confirmed</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('dashboard') }}" class="button">View Booking Status</a>
            </div>
            
            <p><strong>Important:</strong> Your booking is not confirmed until the host approves and you complete payment.</p>
            
            <p>You'll be notified by email and SMS of any updates to your booking status.</p>
            
            <p>Best regards,<br>The Ristay Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} Ristay. All rights reserved.</p>
        </div>
    </div>
</body>
</html>