<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Status Update</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .content {
            padding: 25px;
        }
        .booking-info {
            margin-bottom: 25px;
        }
        .booking-number {
            font-size: 16px;
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 15px;
        }
        .refund-amount {
            font-size: 28px;
            font-weight: 700;
            color: #065f46;
            margin: 20px 0;
        }
        .description {
            margin: 15px 0;
            color: #4b5563;
        }
        .reason-box {
            border-left: 4px solid #dc2626;
            padding: 12px 15px;
            background-color: #fef2f2;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .reason-label {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 5px;
        }
        .reason-text {
            color: #4b5563;
        }
        .contact-info {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            margin-top: 30px;
        }
        .contact-info-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e40af;
        }
        .footer {
            padding: 20px;
            text-align: center;
            background-color: #f1f5f9;
            color: #64748b;
        }
        .footer-message {
            margin-bottom: 15px;
        }
        .signature {
            margin-top: 20px;
        }
        .team-name {
            font-weight: 600;
            color: #1e40af;
        }
        a {
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="content">
            <div class="booking-info">
                <div class="booking-number">
                    Booking Reference: #{{ $booking->number }}
                </div>
                
                @if($action === 'approved')
                <div class="refund-amount">
                    KES {{ number_format($booking->refund_amount, 2) }}
                </div>
                <p class="description">
                    We've approved your refund request. The amount shown above will be returned to your original payment method within 5-7 business days.
                </p>
                <p class="description">
                    You'll receive a confirmation email once the transaction is complete. Processing times may vary depending on your financial institution.
                </p>
                @else
                <div class="reason-box">
                    <div class="reason-label">
                        Decision Details
                    </div>
                    <div class="reason-text">
                        {{ $reason ?? $booking->non_refund_reason ?? 'We were unable to process your refund request at this time.' }}
                    </div>
                </div>
                <p class="description">
                    If you have questions or would like to discuss this further, our support team is available to assist you.
                </p>
                @endif
            </div>
            
            <div class="contact-info">
                <div class="contact-info-title">
                    Need Help?
                </div>
                <div class="contact-info-text">
                    ✉️ <a href="mailto:support@ristay.co.ke" style="color: #0284c7;">support@ristay.co.ke</a><br>
                    📞 +254 769 88 00 88<br>
                    🕒 Monday-Friday, 8:00 AM - 5:00 PM EAT
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-message">
                Thank you for choosing Ristay for your travel needs.
            </p>
            
            <div class="signature">
                <p>Best regards,</p>
                <p class="team-name">The Ristay Team</p>
            </div>
        </div>
    </div>
</body>
</html>