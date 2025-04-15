<!DOCTYPE html>
<html>
<head>
    <title>Thank You for Your Comment</title>
</head>
<body>
    <h2>Thank You, {{ $userData['name'] }}</h2>
    <p>We have received your comment and will get back to you shortly.</p>
    <p>Your comment:</p>
    <p>{{ $userData['comment'] }}</p>
    <p>If you have any questions, feel free to reply to this email.</p>
</body>
</html>
