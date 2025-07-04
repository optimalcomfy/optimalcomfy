<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Ristay') }}</title>

        <!-- Meta Description -->
        <meta name="description" content="Ristay is your go-to platform for discovering unique stays and convenient rides. List or book properties and transport effortlessly with elegance and comfort.">

        <!-- Favicon Links -->
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png">
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png">
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png">
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png">
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png">
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png">
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/manifest.json">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <link id="theme-css" href="{{ asset('/themes/tailwind-light/theme.css') }}" rel="stylesheet">

        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

        <!-- FontAwesome CDN -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

        <!-- Google Ads -->
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8596366375869605"
        crossorigin="anonymous"></script>

        <!-- Swiper JS -->
        <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

        <!-- WOW.js -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js"></script>

        <!-- Magnific Popup -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js"></script>

        <!-- Jarallax -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jarallax/1.12.8/jarallax.min.js"></script>

        <!-- Custom Airbnb-like Styles -->
        <link href="/css/airbnb.css" rel="stylesheet" type="text/css">

        <!-- Google Maps Places API -->
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDgiM7ogCAA2Y5pgSk2KXZfxF5S_1jsptA&libraries=places&callback=initPlaces" async defer></script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
