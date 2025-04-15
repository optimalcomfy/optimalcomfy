<!DOCTYPE html>
<html>
<head>
    <title>New Comment Received</title>
</head>
<body>
    <h2>New Comment from {{ $commentData['name'] }}</h2>
    <p>Email: {{ $commentData['email'] }}</p>
    <p>Comment:</p>
    <p>{{ $commentData['comment'] }}</p>
</body>
</html>
