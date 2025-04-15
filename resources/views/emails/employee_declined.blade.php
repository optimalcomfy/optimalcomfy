
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
    <h2>Dear {{ $loan->employee->user->name }},</h2>
    <p>We regret to inform you that after a review, your loan request has been declined.</p>
    <p>If you have any questions or need more information regarding this decision, feel free to reach out to us. We are happy to assist you in understanding the reasoning behind our decision.</p>
    <p>We appreciate your understanding and thank you for your time and effort.</p>
    <p>Best regards,</p>
    <p><strong>The Centiflow Team</strong></p>
</body>
</html>
