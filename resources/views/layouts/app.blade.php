<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>@yield('title', 'Optimal Comfy')</title>
    @vite('resources/css/app.css') 
</head>
<body class="antialiased">
    @yield('content')
    @vite('resources/js/app.js')
</body>
</html>