<!DOCTYPE html>
<html>
<head>
    <title>Account Verification Pending - Ristay</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #fc8f72;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #fc8f72;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .status {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info-box {
            background-color: #e8f4fd;
            border: 1px solid #b6d4fe;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Ristay!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }},</h2>
            
            <p>Thank you for registering with Ristay! Your account has been created successfully.</p>
            
            <div class="status">
                <h3>📋 Account Verification Status: <strong>Pending</strong></h3>
                <p>Your account is currently pending verification. Our team is reviewing your registration details and documents.</p>
            </div>
            
            <div class="info-box">
                <h4>What's Next?</h4>
                <ul>
                    <li>Our verification team will review your submitted documents</li>
                    <li>You'll receive another email once your account is verified</li>
                    <li>This process typically takes <strong>{{ $verificationTime }}</strong></li>
                    <li>You can still log in and browse, but some features may be limited until verification</li>
                </ul>
            </div>
            
            <h4>Documents Under Review:</h4>
            <ul>
                <li>Profile Information</li>
                <li>ID Verification (Front & Back)</li>
                @if($user->role_id == 2) {{-- Host --}}
                <li>Host Credentials</li>
                @endif
            </ul>
            
            <p><strong>Important:</strong> Make sure all uploaded documents are clear and readable. If there are any issues, our team will contact you for clarification.</p>
            
            <p>If you need to update any information or have questions, please contact our support team:</p>
            <p>📧 Email: support@ristay.co.ke</p>
            <p>📞 Phone: +254 769 88 00 88</p>
            
            <a href="{{ url('/login') }}" class="button">Log In to Your Account</a>
            
            <div class="footer">
                <p>Thank you for choosing Ristay!</p>
                <p>The Ristay Team</p>
                <p>📍 Ristay Headquarters</p>
                <p>© {{ date('Y') }} Ristay. All rights reserved.</p>
                <p><small>This is an automated message. Please do not reply to this email.</small></p>
            </div>
        </div>
    </div>
</body>
</html>