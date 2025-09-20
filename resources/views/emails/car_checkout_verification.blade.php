<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Check-Out Verification Code</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
            background-color: #f4f4f4;
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
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            animation: float 8s ease-in-out infinite;
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
        
        .farewell-text {
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
        
        .checkout-icon {
            font-size: 3em;
            margin: 20px 0;
            color: #fa6223;
            opacity: 0.8;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
        
        .code-container {
            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
            border: 2px solid #feb2b2;
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
            background: linear-gradient(90deg, #fa6223, #ee5a52, #f093fb);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .code-label {
            font-size: 0.9em;
            color: #a0aec0;
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
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-left: 4px solid #f39c12;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
            color: #b7791f;
            font-weight: 500;
        }
        
        .checkout-steps {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8edff 100%);
            padding: 30px;
            border-radius: 16px;
            margin: 40px 0;
            border: 1px solid #c3d9ff;
        }
        
        .step {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
        }
        
        .step:hover {
            transform: translateX(5px);
        }
        
        .step-number {
            background: linear-gradient(135deg, #fa6223, #ee5a52);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            font-size: 0.9em;
        }
        
        .step-text {
            color: #4a5568;
            font-weight: 500;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
            padding: 30px;
            border-radius: 16px;
            margin: 40px 0;
            border: 1px solid #ffb3b3;
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
            box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(255, 107, 107, 0.4);
        }
        
        .feedback-section {
            background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
            border-left: 4px solid #48bb78;
        }
        
        .feedback-text {
            color: #2d3748;
            font-size: 1em;
            margin-bottom: 15px;
        }
        
        .rating-stars {
            font-size: 1.5em;
            color: #ecc94b;
            margin: 10px 0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-message {
            font-size: 1.2em;
            color: #4b5563;
            margin-bottom: 25px;
            font-weight: 500;
        }
        
        .return-message {
            background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #38b2ac;
            color: #234e52;
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
            
            .farewell-text {
                font-size: 1.2em;
            }
            
            .step {
                flex-direction: column;
                text-align: center;
            }
            
            .step-number {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="content">
            <div class="checkout-icon">🛎️</div>
            
            <h2 class="farewell-text">
                Your verification code for dropping off your
                <span class="property-name">{{ $booking->car->name }}</span>
                is ready!
            </h2>
            
            <div class="code-container">
                <div class="code-label">Check-Out Verification Code</div>
                <div class="verification-code">{{ $booking->checkout_verification_code }}</div>
            </div>
            
            <div class="expiry-notice">
                ⏰ This code will expire in 30 minutes
            </div>
            
            <div class="feedback-section">
                <div class="feedback-text">
                    <strong>How was your ride?</strong><br>
                    We'd love to hear about your experience!
                </div>
                <div class="rating-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-message">
                We're delighted to have provided you with an exceptional ride experience.
            </p>
            
            <div class="return-message">
                <strong>Come back soon!</strong> We'd love to welcome you again for another amazing ride.
            </div>
            
            <div class="signature">
                <p>Warm regards,</p>
                <p class="team-name">The Ristay Team</p>
            </div>
        </div>
    </div>
</body>
</html>