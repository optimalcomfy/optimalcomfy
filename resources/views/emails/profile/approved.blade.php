<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Profile Changes Approved - Ristay</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .header { 
            background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
            padding: 40px 30px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            text-align: center; 
            color: white;
            box-shadow: 0 10px 25px rgba(5, 150, 105, 0.15);
        }
        .approval-badge { 
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
            border-bottom: 2px solid #059669; 
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
            background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            font-size: 1em;
            transition: all 0.3s;
            border: none;
            box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(5, 150, 105, 0.3);
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
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .benefit-title {
            color: #065f46;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .benefit-title::before {
            content: "✓";
            margin-right: 8px;
            background: #059669;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        .update-card {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .update-title {
            color: #92400e;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .update-title::before {
            content: "📝";
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0 0 15px 0; font-size: 2em;">✅ Profile Changes Approved!</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.1em; opacity: 0.9;">
            Hello {{ $user->name }}, your profile updates have been verified and approved.
        </p>
        
        <div class="approval-badge">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            PROFILE UPDATED & VERIFIED
        </div>
    </div>

    <!-- Approval Details -->
    <div class="section">
        <h2 class="section-title">Approval Details</h2>
        
        <div class="info-row">
            <span class="info-label">Approved For:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Approval Date:</span>
            <span style="font-weight: 600; color: #111827;">{{ $approvedAt }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="font-weight: 600; color: #059669;">✅ Approved and Active</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Profile Status:</span>
            <span style="font-weight: 600; color: #111827;">Fully Verified</span>
        </div>
    </div>

    <!-- What's Been Updated -->
    <div class="section">
        <h2 class="section-title">📝 What's Been Updated</h2>
        
        <div class="update-card">
            <div class="update-title">Profile Information Updated</div>
            <div style="color: #374151;">
                <p style="margin: 0;">Your profile changes have been successfully applied:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">✅ Personal details verified</li>
                    <li style="margin-bottom: 5px;">✅ Contact information updated</li>
                    <li style="margin-bottom: 5px;">✅ Identification documents verified</li>
                    <li>✅ Profile picture approved</li>
                </ul>
            </div>
        </div>
        
        <div class="benefit-card">
            <div class="benefit-title">Benefits of Verified Profile</div>
            <div style="color: #374151;">
                <p style="margin: 0;">Your verified profile gives you:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">🔒 Enhanced account security</li>
                    <li style="margin-bottom: 5px;">🚀 Faster booking approvals</li>
                    <li style="margin-bottom: 5px;">🏠 Higher trust level with hosts</li>
                    <li>💳 Priority payment processing</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Next Steps -->
    <div class="section">
        <h2 class="section-title">🚀 Next Steps</h2>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{ route('profile.edit') }}" class="btn">
                👤 View My Updated Profile
            </a>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 25px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">🏡</div>
                <div style="font-weight: 600; margin: 8px 0;">Book Properties</div>
                <a href="{{ route('all-properties') }}" style="color: #059669; font-size: 0.9em;">Browse Properties →</a>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">🚗</div>
                <div style="font-weight: 600; margin: 8px 0;">Rent Cars</div>
                <a href="{{ route('all-cars') }}" style="color: #059669; font-size: 0.9em;">Browse Cars →</a>
            </div>
        </div>
    </div>

    <!-- Support Information -->
    <div class="section">
        <h2 class="section-title">💬 Need Help?</h2>
        
        <p style="margin: 0 0 20px 0; color: #4b5563;">
            Our support team is here to help you with your updated profile:
        </p>
        
        <div class="info-row">
            <span class="info-label">Support Email:</span>
            <span style="font-weight: 600; color: #059669;">support@ristay.co.ke</span>
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
            Thank you for keeping your profile up to date! 🎉
        </p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 0.9em;">
            Your verified profile helps us provide you with the best possible experience on Ristay.
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #9ca3af;">
            <em>This is an automated message. Please don't reply directly to this email.</em>
        </p>
    </div>
</body>
</html>