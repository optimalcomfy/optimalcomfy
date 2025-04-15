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
    </style>
</head>
<body>
    <h2>Dear {{ $employee->user->name }},</h2>
    <p>We wanted to inform you that your loan application is currently under review.</p>
    <p>We will notify you once your loan has been approved. Thank you for your patience, and we appreciate your trust in Centiflow.</p>
    <p>If you have any questions in the meantime, feel free to reach out to us.</p>
    <p>Best regards,</p>
    <p><strong>The Centiflow Team</strong></p>
</body>
</html>
