<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Booking Cancellation Notification</title>
    <style type="text/css">
        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Reset styles */
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* Main styles */
        body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #333333;
            line-height: 1.5;
        }
        .header {
            color: #2d3748;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
        }
        .booking-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #e53e3e;
        }
        .detail-row {
            display: flex;
            margin-bottom: 12px;
        }
        .detail-label {
            font-weight: 600;
            color: #4a5568;
            width: 140px;
        }
        .detail-value {
            color: #2d3748;
            flex: 1;
        }
        .button {
            background-color: #3182ce;
            color: white !important;
            display: inline-block;
            padding: 12px 24px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            margin: 16px 0;
        }
        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }
        .highlight {
            color: #e53e3e;
            font-weight: 600;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <!-- Email container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding: 24px 0;">
                <!-- Main content -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 16px; text-align: left;">
                            <h1 class="header">
                                @if($recipientType === 'guest')
                                Your Car Booking Has Been Cancelled
                                @else
                                Car Booking Cancellation Notification
                                @endif
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Booking details -->
                    <tr>
                        <td style="padding: 0 32px;">
                            <div class="booking-card">
                                <div class="detail-row">
                                    <div class="detail-label">Booking Reference:</div>
                                    <div class="detail-value">#{{ $booking->number }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Vehicle:</div>
                                    <div class="detail-value">{{ $booking->car->make }} {{ $booking->car->model }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Pickup Date:</div>
                                    <div class="detail-value">{{ $booking->start_date->format('M j, Y H:i') }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Dropoff Date:</div>
                                    <div class="detail-value">{{ $booking->end_date->format('M j, Y H:i') }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Pickup Location:</div>
                                    <div class="detail-value">{{ $booking->pickup_location }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Dropoff Location:</div>
                                    <div class="detail-value">{{ $booking->dropoff_location }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Cancellation Reason:</div>
                                    <div class="detail-value">{{ $booking->cancel_reason }}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Cancelled On:</div>
                                    <div class="detail-value">{{ $booking->cancelled_at->format('M j, Y H:i') }}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Message content -->
                    <tr>
                        <td style="padding: 16px 32px; text-align: left;">
                            @if($recipientType === 'guest')
                            <p style="margin: 0 0 16px;">We're sorry to see your booking was cancelled. If you need assistance or would like to book a different vehicle, please don't hesitate to contact us.</p>
                            
                            <p style="margin: 16px 0;">You may be eligible for a refund depending on our cancellation policy.</p>
                            @else
                            <p style="margin: 0 0 16px;">This booking has been cancelled. Please update your vehicle's availability if needed.</p>
                            @endif
                            
                            <p style="margin: 16px 0;">If you have any questions, please contact our support team.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 16px 32px 32px;">
                            <div class="footer">
                                <p style="margin: 0;">Thanks,<br>{{ config('app.name') }}</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>