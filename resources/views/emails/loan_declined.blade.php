<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Application Status: Declined</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #888;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>

<div class="container">

    <div class="content">
        <h2>Dear {{ $loan->employee->user->name }},</h2>

        <p>We regret to inform you that your loan application has been declined after review.</p>

        <p>If you would like to discuss the details or have any questions regarding this decision, feel free to reach out to us.</p>

        <p>We appreciate your understanding, and thank you for your time and effort.</p>
    </div>

    <div class="footer">
        <p>Best regards,</p>
        <p><strong>The Centiflow Team</strong></p>
        <p><a href="mailto:info@Centiflow.co.ke">Contact Support</a></p>
    </div>
</div>

</body>
</html>
