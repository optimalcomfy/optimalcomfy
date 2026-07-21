<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Verified - Welcome to Ristay!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .header { 
            background: linear-gradient(135deg, #d15623 0%, #e67e51 100%); 
            padding: 40px 30px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            text-align: center; 
            color: white;
            box-shadow: 0 10px 25px rgba(209, 86, 35, 0.15);
        }
        .verification-badge { 
            display: inline-flex; 
            align-items: center; 
            padding: 12px 24px; 
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(21, 128, 61, 0.9) 100%); 
            border-radius: 50px; 
            font-weight: bold; 
            font-size: 1.1em;
            margin: 20px 0;
            border: 2px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }
        .section { 
            background: white; 
            border: 1px solid #e5e7eb; 
            border-radius: 16px; 
            padding: 30px; 
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .section-title { 
            color: #111827; 
            border-bottom: 2px solid #3b82f6; 
            padding-bottom: 12px; 
            margin-bottom: 25px;
            font-size: 1.25em;
            font-weight: 600;
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 12px; 
            padding: 10px 0; 
            border-bottom: 1px solid #f3f4f6; 
        }
        .info-label { 
            font-weight: 500; 
            color: #4b5563; 
            min-width: 150px; 
        }
        .btn { 
            display: inline-flex; 
            align-items: center; 
            justify-content: center;
            padding: 14px 28px; 
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            font-size: 1em;
            transition: all 0.3s;
            border: none;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
        }
        .btn-primary { 
            background: linear-gradient(135deg, #d15623 0%, #e67e51 100%); 
            box-shadow: 0 4px 6px rgba(209, 86, 35, 0.25);
        }
        .btn-primary:hover {
            box-shadow: 0 6px 12px rgba(209, 86, 35, 0.3);
        }
        .footer { 
            background: linear-gradient(to right, #f8fafc, #f1f5f9); 
            padding: 25px; 
            border-radius: 16px; 
            margin-top: 30px; 
            font-size: 0.9em; 
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .benefit-card {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .benefit-title {
            color: #0369a1;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .benefit-title::before {
            content: "✓";
            margin-right: 8px;
            background: #0ea5e9;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0 0 15px 0; font-size: 2em;">🎉 Account Verified!</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.1em; opacity: 0.9;">
            Welcome to Ristay, {{ $user->name }}! Your account has been successfully verified.
        </p>
        
        <div class="verification-badge">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            VERIFIED ACCOUNT
        </div>
    </div>

    <!-- Account Details -->
    <div class="section">
        <h2 class="section-title">Your Verified Account</h2>
        
        <div class="info-row">
            <span class="info-label">Account Name:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->email }}</span>
        </div>
    
        
        @if($notes)
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Verification Notes:</span>
            <span style="color: #6b7280; font-style: italic;">{{ $notes }}</span>
        </div>
        @endif
    </div>

    <!-- Benefits -->
    <div class="section">
        <h2 class="section-title">🎁 Welcome Benefits</h2>
        
        <div class="benefit-card">
            <div class="benefit-title">Full Platform Access</div>
            <div style="color: #374151;">
                <p style="margin: 0;">You now have access to all Ristay features including:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">📱 Book properties and car rentals</li>
                    <li style="margin-bottom: 5px;">🏠 List your own properties as a host</li>
                    <li style="margin-bottom: 5px;">🚗 List cars for rental</li>
                    <li style="margin-bottom: 5px;">🤝 Earn from referrals and markups</li>
                    <li>⭐ Priority customer support</li>
                </ul>
            </div>
        </div>
        
        <div class="benefit-card">
            <div class="benefit-title">Referral Program</div>
            <div style="color: #374151;">
                <p style="margin: 0;">Share your referral code and earn commissions:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; text-align: center; border: 1px solid #e5e7eb;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #d15623; letter-spacing: 2px;">
                        {{ $user->referral_code }}
                    </div>
                    <div style="font-size: 0.9em; color: #6b7280; margin-top: 5px;">
                        Your unique referral code
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Next Steps -->
    <div class="section">
        <h2 class="section-title">🚀 Next Steps</h2>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{ route('dashboard') }}" class="btn btn-primary">
                🏠 Go to Dashboard
            </a>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 25px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">🏡</div>
                <div style="font-weight: 600; margin: 8px 0;">Explore Properties</div>
                <a href="{{ route('properties.index') }}" style="color: #3b82f6; font-size: 0.9em;">Browse & Book →</a>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">🚗</div>
                <div style="font-weight: 600; margin: 8px 0;">Find Cars</div>
                <a href="{{ route('cars.index') }}" style="color: #3b82f6; font-size: 0.9em;">Browse Cars →</a>
            </div>
        </div>
    </div>

    <!-- Support Information -->
    <div class="section">
        <h2 class="section-title">💬 Need Help?</h2>
        
        <p style="margin: 0 0 20px 0; color: #4b5563;">
            Our support team is here to help you get started:
        </p>
        
        <div class="info-row">
            <span class="info-label">Support Email:</span>
            <span style="font-weight: 600; color: #3b82f6;">support@ristay.co.ke</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Support Phone:</span>
            <span style="font-weight: 600; color: #111827;">+254 769 88 00 88</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">WhatsApp Support:</span>
            <span style="font-weight: 600; color: #111827;">+254 769 88 00 88</span>
        </div>
    </div>

    <div class="footer">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #111827;">
            Welcome to the Ristay Community! 🎉
        </p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 0.9em;">
            We're excited to have you on board. Start exploring and make your first booking today!
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #9ca3af;">
            <em>This is an automated message. Please don't reply directly to this email.</em>
        </p>
    </div>
</body>
</html>