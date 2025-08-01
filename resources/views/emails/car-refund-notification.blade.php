<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Car Rental Refund Status Update - Ristay</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .email-container {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 30px 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-approved {
            background-color: rgba(16, 185, 129, 0.1);
            color: #047857;
            border: 2px solid #10b981;
        }
        .status-rejected {
            background-color: rgba(239, 68, 68, 0.1);
            color: #dc2626;
            border: 2px solid #ef4444;
        }
        .content {
            padding: 30px 25px;
        }
        .booking-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #3b82f6;
        }
        .booking-number {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .booking-details {
            font-size: 14px;
            color: #64748b;
        }
        .refund-amount {
            font-size: 32px;
            font-weight: 700;
            color: #047857;
            margin: 25px 0;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
            border-radius: 8px;
            border: 2px solid #10b981;
        }
        .description {
            margin: 20px 0;
            color: #4b5563;
            font-size: 16px;
        }
        .reason-box {
            border-left: 4px solid #dc2626;
            padding: 20px;
            background: linear-gradient(135deg, #fef2f2, #fef7f7);
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .reason-label {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .reason-text {
            color: #4b5563;
            font-size: 15px;
        }
        .contact-info {
            background: linear-gradient(135deg, #eff6ff, #f0f9ff);
            padding: 25px;
            border-radius: 8px;
            margin-top: 30px;
            border: 1px solid #bfdbfe;
        }
        .contact-info-title {
            font-weight: 600;
            margin-bottom: 15px;
            color: #1e40af;
            font-size: 18px;
        }
        .contact-item {
            margin-bottom: 8px;
            font-size: 15px;
        }
        .footer {
            padding: 25px;
            text-align: center;
            background-color: #f1f5f9;
            color: #64748b;
        }
        .footer-message {
            margin-bottom: 20px;
            font-size: 15px;
        }
        .signature {
            margin-top: 20px;
        }
        .team-name {
            font-weight: 600;
            color: #1e40af;
            font-size: 16px;
        }
        a {
            color: #0284c7;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content, .header, .footer {
                padding: 20px 15px;
            }
            .refund-amount {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Refund Status Update</h1>
            <div class="status-badge {{ $status === 'approved' ? 'status-approved' : 'status-rejected' }}">
                {{ $status === 'approved' ? 'Approved' : 'Rejected' }}
            </div>
        </div>
        
        <div class="content">
            <div class="booking-info">
                <div class="booking-number">
                    🚗 Booking Reference: #{{ $booking->number }}
                </div>
                <div class="booking-details">
                    Customer: {{ $booking->user->name ?? 'Valued Customer' }}<br>
                    Request Date: {{ $booking->created_at->format('M d, Y') }}
                </div>
            </div>
            
            @if($status === 'approved')
                <div class="refund-amount">
                    KES {{ number_format($booking->refund_amount, 2) }}
                </div>
                
                <p class="description">
                    🎉 <strong>Great news!</strong> We've approved your car rental refund request. The amount shown above will be processed and returned to your original payment method within <strong>5-7 business days</strong>.
                </p>
                
                <div class="divider"></div>
                
                <p class="description">
                    <strong>What happens next?</strong><br>
                    • Your refund is now in processing<br>
                    • You'll receive a confirmation email once the transaction is complete<br>
                    • Processing times may vary depending on your financial institution<br>
                    • Keep this email for your records
                </p>
            @else
                <div class="reason-box">
                    <div class="reason-label">
                        📋 Refund Decision Details
                    </div>
                    <div class="reason-text">
                        {{ $reason ?? $booking->non_refund_reason ?? 'We were unable to process your car rental refund request at this time due to our refund policy terms.' }}
                    </div>
                </div>
                
                <p class="description">
                    We understand this may not be the outcome you were hoping for. If you have questions about this decision or would like to discuss your refund request further, our support team is ready to assist you.
                </p>
                
                <p class="description">
                    <strong>You can also:</strong><br>
                    • Review our refund policy on our website<br>
                    • Submit additional documentation if applicable<br>
                    • Contact our support team for clarification
                </p>
            @endif
            
            <div class="contact-info">
                <div class="contact-info-title">
                    💬 Need Help? We're Here for You!
                </div>
                <div class="contact-item">
                    ✉️ Email: <a href="mailto:support@ristay.co.ke">support@ristay.co.ke</a>
                </div>
                <div class="contact-item">
                    📞 Phone: <a href="tel:+254769880088">+254 769 88 00 88</a>
                </div>
                <div class="contact-item">
                    🕒 Hours: Monday-Friday, 8:00 AM - 5:00 PM EAT
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-message">
                Thank you for choosing Ristay for your car rental needs. We appreciate your business and trust in our services.
            </p>
            
            <div class="signature">
                <p>Best regards,</p>
                <p class="team-name">The Ristay Team</p>
                <p style="font-size: 14px; color: #9ca3af; margin-top: 10px;">
                    Making car rentals simple and reliable
                </p>
            </div>
        </div>
    </div>
</body>
</html>