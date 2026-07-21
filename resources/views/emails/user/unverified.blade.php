<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Verification Update - Ristay</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .header { 
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); 
            padding: 40px 30px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            text-align: center; 
            color: white;
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15);
        }
        .notification-badge { 
            display: inline-flex; 
            align-items: center; 
            padding: 12px 24px; 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%); 
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
            border-bottom: 2px solid #f59e0b; 
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
        .warning-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            border-left: 5px solid #f59e0b;
        }
        .action-card {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .btn { 
            display: inline-flex; 
            align-items: center; 
            justify-content: center;
            padding: 14px 28px; 
            background: linear-gradient(135deg, #d15623 0%, #e67e51 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            font-size: 1em;
            transition: all 0.3s;
            border: none;
            box-shadow: 0 4px 6px rgba(209, 86, 35, 0.25);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(209, 86, 35, 0.3);
        }
        .btn-profile {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }
        .btn-profile:hover {
            box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
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
        .profile-url-box {
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0 0 15px 0; font-size: 2em;">⚠️ Account Verification Update</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.1em; opacity: 0.9;">
            Important update regarding your Ristay account verification
        </p>
        
        <div class="notification-badge">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            VERIFICATION STATUS UPDATED
        </div>
    </div>

    <!-- Status Update -->
    <div class="section">
        <h2 class="section-title">Your Account Status</h2>
        
        <div class="warning-box">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <svg style="width: 24px; height: 24px; color: #d97706; margin-right: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span style="font-weight: 600; color: #92400e;">Verification Status: Not Verified</span>
            </div>
            <p style="color: #92400e; margin: 0;">
                Your Ristay account verification status has been updated. Some features may be limited until verification is completed.
            </p>
        </div>
        
        <div class="info-row">
            <span class="info-label">Account Name:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->email }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Status Updated:</span>
            <span style="font-weight: 600; color: #111827;">{{ now()->format('F j, Y \a\t g:i A') }}</span>
        </div>
        
        @if($reason)
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Reason:</span>
            <span style="color: #dc2626; font-weight: 500;">{{ $reason }}</span>
        </div>
        @endif
    </div>

    <!-- Profile Update Section -->
    <div class="section">
        <h2 class="section-title">📝 Update Your Profile</h2>
        
        <div class="profile-url-box">
            <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 1.3em;">
                ✨ Complete Your Profile
            </h3>
            <p style="color: #4b5563; margin: 0 0 20px 0;">
                To complete verification, please update your profile information by clicking the button below:
            </p>
            
            <a href="{{ url('/profile') }}" class="btn btn-profile" style="margin-bottom: 15px;">
                🏠 Go to Profile Settings
            </a>
            
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 0; font-size: 0.9em; color: #6b7280;">
                    Or copy this URL:
                </p>
                <div style="background: white; padding: 10px; border-radius: 6px; margin-top: 8px; border: 1px solid #e5e7eb;">
                    <code style="font-family: monospace; color: #3b82f6; word-break: break-all;">
                        {{ url('/profile') }}
                    </code>
                </div>
            </div>
        </div>
        
        <div class="action-card">
            <h3 style="margin: 0 0 10px 0; color: #0369a1;">Required Updates:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;">✅ Upload clear ID verification document</li>
                <li style="margin-bottom: 8px;">✅ Verify your phone number</li>
                <li style="margin-bottom: 8px;">✅ Complete your profile information</li>
                <li style="margin-bottom: 8px;">✅ Add a profile picture</li>
                <li>✅ Provide accurate personal details</li>
            </ul>
        </div>
    </div>

    <!-- Impact -->
    <div class="section">
        <h2 class="section-title">📋 What This Means</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Limited Features:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;">❌ Cannot list properties or cars as a host</li>
                <li style="margin-bottom: 8px;">❌ Limited booking capabilities</li>
                <li style="margin-bottom: 8px;">❌ Restricted access to referral earnings</li>
                <li style="margin-bottom: 8px;">❌ Reduced withdrawal limits</li>
            </ul>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 12px;">
            <h3 style="margin: 0 0 10px 0; color: #0369a1;">Available Features:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;">✅ Browse properties and cars</li>
                <li style="margin-bottom: 8px;">✅ View property details</li>
                <li style="margin-bottom: 8px;">✅ Contact customer support</li>
                <li>✅ Update your account information</li>
            </ul>
        </div>
    </div>

    <!-- Support Information -->
    <div class="section">
        <h2 class="section-title">💬 Need Help?</h2>
        
        <p style="margin: 0 0 20px 0; color: #4b5563;">
            Our support team is here to help you complete verification:
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
            Complete your profile to regain full access! 🔄
        </p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 0.9em;">
            Once you update your profile, our team will review your information and restore your verification status.
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #9ca3af;">
            <em>This is an automated message. Please don't reply directly to this email.</em>
        </p>
    </div>
</body>
</html>