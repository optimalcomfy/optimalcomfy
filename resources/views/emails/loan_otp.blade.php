
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            margin-top: 20px;
        }
    </style>

    <title>Your Loan OTP</title>
</head>
<body>

    <h2>Hello,</h2>
    <p>Your OTP for loan verification is: <strong>{{ $otp }}</strong></p>
    <p>For this loan number <strong>{{ $number }}</strong></p>
    <p>This OTP is valid for a limited time. Do not share it with anyone.</p>
    <p>Thank you for using our services.</p>
    
    <p>Thank you for choosing Centiflow!</p>

    <p>Best regards,</p>
    <p><strong>The Centiflow Team</strong></p>
</body>
</html>

