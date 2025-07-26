<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancellation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background: #f4f4f4;
            min-height: 100vh;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            animation: slideIn 0.8s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            background: linear-gradient(135deg, #fa6223 0%, #ee5a52 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
            50% { transform: translate(-50%, -50%) rotate(180deg); }
        }

        .logo {
            font-size: 2.5em;
            font-weight: 800;
            color: white;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }

        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1em;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 50px 40px;
            text-align: center;
        }

        .welcome-text {
            font-size: 1.4em;
            color: #1f2937;
            margin-bottom: 30px;
            font-weight: 600;
            line-height: 1.4;
        }

        .property-name {
            background: linear-gradient(135deg, #fa6223, #ee5a52);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }

        .details-box {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            text-align: left;
            font-size: 1em;
            color: #374151;
        }

        .details-box strong {
            display: inline-block;
            min-width: 130px;
            color: #111827;
        }

        .instructions {
            font-size: 1.1em;
            color: #4b5563;
            margin: 30px 0;
            line-height: 1.6;
        }

        .cta-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 30px;
            border-radius: 16px;
            margin: 40px 0;
            border: 1px solid #bae6fd;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fa6223 0%, #ee5a52 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1em;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4);
        }

        .footer {
            background: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-message {
            font-size: 1.1em;
            color: #4b5563;
            margin-bottom: 25px;
            font-style: italic;
        }

        .signature {
            color: #6b7280;
            font-size: 1em;
            margin-top: 20px;
        }

        .team-name {
            font-weight: 700;
            color: #fa6223;
            font-size: 1.2em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                @if($recipientType === 'guest')
                    Booking Cancelled
                @else
                    Booking Cancellation Notice
                @endif
            </div>
            <div class="header-subtitle">
                @if($recipientType === 'guest')
                    Your Booking Has Been Cancelled
                @else
                    A booking for your property has been cancelled
                @endif
            </div>
        </div>

        <div class="content">
            <h2 class="welcome-text">
                @if($recipientType === 'guest')
                    We're sorry to inform you that your booking has been cancelled.
                @else
                    A guest has cancelled a booking for your property.
                @endif
            </h2>

            <div class="details-box">
                <p><strong>Car:</strong> {{ $booking->car->name }}</p>
                <p><strong>Dates:</strong> {{ $booking->check_in_date->format('M j, Y') }} to {{ $booking->check_out_date->format('M j, Y') }}</p>
                <p><strong>Reason:</strong> {{ $booking->cancel_reason }}</p>
            </div>

            <div class="instructions">
                @if($recipientType === 'guest')
                    If you have any questions or believe this was done in error, please contact our support team.
                @else
                    Please update your availability calendar accordingly.
                @endif
            </div>

            <div class="cta-section">
                <a href="{{ route('bookings.show', $booking->id) }}" class="cta-button">
                    View Booking Details
                </a>
            </div>
        </div>

        <div class="footer">
            <p class="footer-message">
                We're committed to giving you the best experience.
            </p>
            <div class="signature">
                <p>Warm regards,</p>
                <p class="team-name">{{ config('app.name') }} Team</p>
            </div>
        </div>
    </div>
</body>
</html>
