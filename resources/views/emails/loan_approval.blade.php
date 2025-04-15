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

    <h2>Congratulations, {{ $loan->employee->user->name }}!</h2>
    <p>We are excited to inform you that your loan application has been approved.</p>
    
    <p>Details of your loan:</p>
    <ul>
        <li><strong>Loan Number:</strong> {{ $loan->number }}</li>
        <li><strong>Principle:</strong> {{ $loan->amount }}</li>
        <li><strong>Amount due:</strong> {{ $loan->eventualPay }}</li>
    </ul>

    <p>Your loan is now in process. You will receive further instructions shortly.</p>
    <p>If you have any questions or concerns, please don't hesitate to reach out to us.</p>
    
    <p>Thank you for choosing Centiflow!</p>

    <p>Best regards,</p>
    <p><strong>The Centiflow Team</strong></p>
</body>
</html>
