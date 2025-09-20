<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Check-In Verification Code</title>
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
        
        .code-container {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            margin: 40px 0;
            position: relative;
            overflow: hidden;
        }
        
        .code-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #fa6223, #ee5a52, #ec4899);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .code-label {
            font-size: 0.9em;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .verification-code {
            font-size: 3em;
            font-weight: 800;
            color: #1f2937;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        .verification-code:hover {
            transform: scale(1.05);
            color: #fa6223;
        }
        
        .expiry-notice {
            background: linear-gradient(135deg, #fef3cd 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            color: #92400e;
            font-weight: 500;
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
        
        .decorative-icon {
            font-size: 2em;
            margin: 20px 0;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .content {
                padding: 30px 25px;
            }
            
            .verification-code {
                font-size: 2.2em;
                letter-spacing: 4px;
            }
            
            .welcome-text {
                font-size: 1.2em;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-subtitle">Your Perfect Ride Awaits</div>
        </div>
        
        <div class="content">
            <h2 class="welcome-text">
                Your verification code for pick up
                <span class="property-name">{{ $booking->car->name }}</span>
                is ready!
            </h2>
            
            <div class="code-container">
                <div class="code-label">Verification Code</div>
                <div class="verification-code">{{ $booking->checkin_verification_code }}</div>
            </div>
            
            <div class="expiry-notice">
                ⏰ This code will expire in 30 minutes
            </div>
            
        </div>
        
        <div class="footer">
            <p class="footer-message">
                We're excited to provide you with an exceptional ride experience.
            </p>
            
            <div class="signature">
                <p>Warm regards,</p>
                <p class="team-name">The Ristay Team</p>
            </div>
        </div>
    </div>
</body>
</html>