<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Profile Update Submission - Ristay Admin</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
        .header { 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            padding: 40px 30px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            text-align: center; 
            color: white;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
        }
        .alert-badge { 
            display: inline-flex; 
            align-items: center; 
            padding: 12px 24px; 
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(29, 78, 216, 0.9) 100%); 
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
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
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
        .footer { 
            background: linear-gradient(to right, #f8fafc, #f1f5f9); 
            padding: 25px; 
            border-radius: 16px; 
            margin-top: 30px; 
            font-size: 0.9em; 
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .data-card {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .data-title {
            color: #0369a1;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .data-title::before {
            content: "📝";
            margin-right: 8px;
        }
        .file-card {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .file-title {
            color: #92400e;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .file-title::before {
            content: "📎";
            margin-right: 8px;
        }
        .action-card {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
        }
        .action-title {
            color: #065f46;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .action-title::before {
            content: "⚡";
            margin-right: 8px;
        }
        .highlight {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0 0 15px 0; font-size: 2em;">📋 New Profile Update Submission</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.1em; opacity: 0.9;">
            A user has submitted profile changes that require verification.
        </p>
        
        <div class="alert-badge">
            <svg style="width: 20px; height: 20px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.168 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            VERIFICATION REQUIRED
        </div>
    </div>

    <!-- User Information -->
    <div class="section">
        <h2 class="section-title">👤 User Details</h2>
        
        <div class="info-row">
            <span class="info-label">User ID:</span>
            <span style="font-weight: 600; color: #111827;">#{{ $user->id }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span style="font-weight: 600; color: #3b82f6;">{{ $user->email }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span style="font-weight: 600; color: #111827;">{{ $user->phone ?? 'N/A' }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Submitted:</span>
            <span style="font-weight: 600; color: #111827;">{{ $submittedAt }}</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
            <span class="info-label">Current Status:</span>
            <span style="font-weight: 600; color: #f59e0b;">⏳ Pending Review</span>
        </div>
    </div>

    <!-- Pending Changes -->
    <div class="section">
        <h2 class="section-title">📝 Requested Changes</h2>
        
        @if(count($pendingData) > 0)
            <div class="data-card">
                <div class="data-title">Updated Fields</div>
                <div style="color: #374151;">
                    <p style="margin: 0;">The user has requested changes to the following fields:</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #e5e7eb;">
                        <ul style="margin: 0; padding-left: 20px;">
                            @foreach($pendingData as $field => $value)
                                <li style="margin-bottom: 8px;">
                                    <span class="highlight">{{ ucfirst(str_replace('_', ' ', $field)) }}:</span> 
                                    <span style="font-weight: 500;">{{ $value ?? 'Empty' }}</span>
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif
        
        @if(count($pendingFiles) > 0)
            <div class="file-card">
                <div class="file-title">Uploaded Files</div>
                <div style="color: #374151;">
                    <p style="margin: 0;">The user has uploaded the following files for verification:</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #e5e7eb;">
                        <ul style="margin: 0; padding-left: 20px;">
                            @foreach($pendingFiles as $file)
                                <li style="margin-bottom: 8px;">
                                    📎 {{ $file }}
                                </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif
    </div>

    <!-- Admin Actions -->
    <div class="section">
        <h2 class="section-title">⚡ Required Action</h2>
        
        <div class="action-card">
            <div class="action-title">Review & Verify</div>
            <div style="color: #374151;">
                <p style="margin: 0 0 15px 0;">Please review these changes and verify the uploaded documents:</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                    <a href="{{ route('admin.pending-profiles') }}" class="btn" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); box-shadow: 0 4px 6px rgba(5, 150, 105, 0.25);">
                        📋 View All Pending
                    </a>
                    <a href="#" class="btn" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                        🔍 Review This User
                    </a>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #4b5563; font-size: 0.9em;">
                        <strong>💡 Tip:</strong> Review within 24-48 hours to maintain good user experience.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Review Guidelines -->
    <div class="section">
        <h2 class="section-title">📋 Verification Checklist</h2>
        
        <div style="color: #4b5563;">
            <p style="margin: 0 0 15px 0;">Please verify the following before approving:</p>
            <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">✅ Check ID documents for validity and clarity</li>
                <li style="margin-bottom: 10px;">✅ Verify personal information matches ID documents</li>
                <li style="margin-bottom: 10px;">✅ Ensure profile picture is appropriate and clear</li>
                <li style="margin-bottom: 10px;">✅ Confirm contact information is valid</li>
                <li>✅ Review any uploaded documents for completeness</li>
            </ul>
        </div>
    </div>

    <!-- Quick Links -->
    <div class="section">
        <h2 class="section-title">🔗 Quick Links</h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">👤</div>
                <div style="font-weight: 600; margin: 8px 0;">User Profile</div>
                <a href="#" style="color: #3b82f6; font-size: 0.9em;">View Details →</a>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5em;">📊</div>
                <div style="font-weight: 600; margin: 8px 0;">Admin Dashboard</div>
                <a href="#" style="color: #3b82f6; font-size: 0.9em;">Go to Dashboard →</a>
            </div>
        </div>
    </div>

    <div class="footer">
        <p style="margin: 0 0 10px 0; font-weight: 500; color: #111827;">
            ⚡ Action Required - Please review within 24 hours
        </p>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 0.9em;">
            This is an automated notification. Please don't reply directly to this email.
        </p>
        <p style="margin: 0; font-size: 0.85em; color: #9ca3af;">
            Ristay Profile Verification System • {{ date('Y') }}
        </p>
    </div>
</body>
</html>