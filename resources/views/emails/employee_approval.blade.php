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
</head>
<body>
    <h2>Congratulations, {{ $employee->user->name ?? '' }}!</h2>
    <p>We are pleased to inform you that your details have been successfully approved.</p>
    <p>Your account is now active, and you can proceed with using the full range of our services. If you have any questions or need assistance, feel free to reach out to us.</p>
    <p>Thank you for choosing Vermsol!</p>
    <p>Best regards,</p>
    <p><strong>The Vermsol Team</strong></p>
</body>
</html>
