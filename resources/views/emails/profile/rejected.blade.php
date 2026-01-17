<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Profile Changes Require Modification - Ristay</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .header { 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
            padding: 40px 30px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            text-align: center; 
            color: white;
            box-shadow: 0 10px 25px rgba(220, 38, 38, 0.15);
        }
        .rejection-badge { 
            display: inline-flex; 
            align-items: center; 
            padding: 12px 24px; 
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%); 
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
            border-bottom: 2px solid #dc2626; 
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
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            font-size: 1em;
            transition: all 0.3s;
            border: none;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);
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
        .reason-card {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .reason-title {
            color: #991b1b;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .reason-title::before {
            content: "⚠";
            margin-right: 8px;
            background: #dc2626;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        .requirement-card {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .requirement-title {
            color: #92400e;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .requirement-title::before {
            content: "📋";
            margin-right: 8px;
        }
        .tip-card {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .tip-title {
            color: #065f46;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .tip-title::before {
            content: "💡";
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0 0 15px 0; font-size: 2em;">📋 Profile Changes Require Modification</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.1em; opacity: 0.9;">
            Hello {{ $user->name }}, we need some additional information to verify your profile updates.
        </p>
        
        <div class="rejection-badge">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            ADDITIONAL INFORMATION REQUIRED
        </div>
    </div>

    <!-- Rejection Details -->
    <div class="section">
        <h2 class="section-title">Review Details</h2>
        
        <div class="info-row">
            <span class="info-label">Review Date:</span>
            <span style="font-weight: 600; color: #111827;">{{ $rejectedAt }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="font-weight: 600; color: #dc2626;">❌ Requires Modification</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Profile Status:</span>
            <span style="font-weight: 600; color: #111827;">Pending Verification</span>
        </div>
    </div>

    <!-- Reason for Rejection -->
    <div class="section">
        <h2 class="section-title">❌ Reason for Rejection</h2>
        
        <div class="reason-card">
            <div class="reason-title">Review Feedback</div>
            <div style="color: #374151;">
                <p style="margin: 0;">Our verification team has reviewed your profile changes and found the following issues:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #7f1d1d; font-style: italic;">
                        "{{ $rejectionReason }}"
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Requirements -->
    <div class="section">
        <h2 class="section-title">📋 What You Need to Do</h2>
        
        <div class="requirement-card">
            <div class="requirement-title">Required Modifications</div>
            <div style="color: #374151;">
                <p style="margin: 0;">Please address the following requirements:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">✅ Update information as per feedback above</li>
                    <li style="margin-bottom: 5px;">✅ Ensure all documents are clear and valid</li>
                    <li style="margin-bottom: 5px;">✅ Confirm personal details are accurate</li>
                    <li>✅ Resubmit for verification</li>
                </ul>
            </div>
        </div>
        
        <div class="tip-card">
            <div class="tip-title">Tips for Success</div>
            <div style="color: #374151;">
                <ul style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 5px;">📷 Use clear, high-quality images for ID documents</li>
                    <li style="margin-bottom: 5px;">📝 Ensure all text is readable and matches your information</li>
                    <li style="margin-bottom: 5px;">🔍 Double-check spellings and dates</li>
                    <li>🕒 Submit during business hours for faster review</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Next Steps -->
    <div class="section">
        <h2 class="section-title">🔄 Next Steps</h2>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{ route('profile.edit') }}" class="btn">
                ✏️ Update My Profile
            </a>
        </div>
        
        <div style="color: #4b5563; font-size: 0.95em;">
            <p style="margin: 0 0 15px 0;">Follow these steps to resubmit:</p>
            <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Click the button above to edit your profile</li>
                <li style="margin-bottom: 8px;">Make the necessary corrections based on the feedback</li>
                <li style="margin-bottom: 8px;">Review all information for accuracy</li>
                <li style="margin-bottom: 8px;">Resubmit for verification</li>
                <li>We'll review your changes within 24-48 hours</li>
            </ol>
        </div>
    </div>

    <!-- Support Information -->
    <div class="section">
        <h2 class="section-title">💬 Need Help?</h2>
        
        <p style="margin: 0 0 20px 0; color: #4b5563;">
            Our verification team is here to help you complete your profile:
        </p>
        
        <div class="info-row">
            <span class="info-label">Verification Support:</span>
            <span style="font-weight: 600; color: #059669;">verification@ristay.co.ke</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Support Phone:</span>
            <span style="font-weight: 600; color: #111827;">+254 769 88 00 88</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">WhatsApp Support:</span>
            <span style="font-weight: 600; color: #111827;">+254 769 88 00 88</span>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <p style="margin: 0; color: #0369a1; font-size: 0.9em;">
                <strong>💡 Tip:</strong> Include your user ID ({{ $user->id }}) when contacting support for faster assistance.
            </p>
        </div>
    </div>

    <div class="footer">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #111827;">
            We're here to help you succeed! 🌟
        </p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 0.9em;">
            Complete your profile verification to unlock all Ristay features and benefits.
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #9ca3af;">
            <em>This is an automated message. Please don't reply directly to this email.</em>
        </p>
    </div>
</body>
</html>