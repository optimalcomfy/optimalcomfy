<!DOCTYPE html>
<html>
<head>
    <title>New User Registration - Ristay</title>
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
        .user-details {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .action-btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #fc8f72;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .status-pending {
            color: #ff9800;
            font-weight: bold;
        }
        .status-active {
            color: #4caf50;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New User Registration</h1>
        </div>
        
        <div class="content">
            <h2>Hello Admin,</h2>
            
            <p>A new user has registered on Ristay and requires verification.</p>
            
            <div class="user-details">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> {{ $user->name }}</p>
                <p><strong>Email:</strong> {{ $user->email }}</p>
                <p><strong>Phone:</strong> {{ $user->phone ?? 'Not provided' }}</p>
                <p><strong>User Type:</strong> {{ $userType }}</p>
                <p><strong>Registration Date:</strong> {{ $createdAt }}</p>
                <p><strong>Verification Status:</strong> <span class="status-pending">Pending</span></p>
                <p><strong>Profile Status:</strong> <span class="status-pending">{{ ucfirst($user->profile_status) }}</span></p>
                
                @if($user->passport_number)
                <p><strong>Passport/ID Number:</strong> {{ $user->passport_number }}</p>
                @endif
            </div>
            
            <h3>📋 Verification Required</h3>
            <p>The following items need to be verified:</p>
            <ul>
                <li>ID Verification Documents (Front & Back)</li>
                <li>Profile Information</li>
                @if($user->role_id == 2) {{-- Host --}}
                <li>Host Credentials</li>
                @endif
            </ul>
            
            <p><strong>To verify this user:</strong></p>
            <ol>
                <li>Review the uploaded ID documents</li>
                <li>Check profile information for accuracy</li>
                <li>Approve or reject the registration</li>
                <li>User will be notified of the decision</li>
            </ol>
            
            <div class="footer">
                <p>This is an automated notification from Ristay Admin System</p>
                <p>© {{ date('Y') }} Ristay. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>