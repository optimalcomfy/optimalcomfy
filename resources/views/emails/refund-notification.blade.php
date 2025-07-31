<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Status Update</title>
    <style>
        /* Your existing CSS remains the same */
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
                        {{ number_format($booking->refund_amount, 2) }}
                    </div>
                    <p class="description">
                        We've processed your refund request. The amount shown above will be returned to your original payment method within shortly.
                    </p>
                    <p class="description">
                        You'll receive a confirmation once the transaction is complete. Please allow additional processing time depending on your financial institution.
                    </p>
                @else
                    <div class="reason-box">
                        <div class="reason-label">
                            Additional Information
                        </div>
                        <div class="reason-text">
                            {{ $reason ?? $booking->non_refund_reason ?? 'We were unable to process your refund request at this time.' }}
                        </div>
                    </div>
                    <p class="description">
                        For clarification or to discuss alternative options, our support team is available to assist you.
                    </p>
                @endif
            </div>
            
            <div class="contact-info">
                <div class="contact-info-title">
                    Customer Support
                </div>
                <div class="contact-info-text">
                    Email: <a href="mailto:support@ristay.co.ke" style="color: #0284c7;">support@ristay.co.ke</a><br>
                    Phone: +254 769 88 00 88<br>
                    Hours: Monday-Friday, 8:00 AM - 5:00 PM EAT
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-message">
                Thank you for choosing Ristay. We value your business.
            </p>
            
            <div class="signature">
                <p>Best regards,</p>
                <p class="team-name">Ristay Customer Care</p>
            </div>
        </div>
    </div>
</body>
</html>