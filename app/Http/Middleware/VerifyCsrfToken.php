<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // M-Pesa Callbacks
        'api/mpesa/stk/callback',
        'api/mpesa/ride/stk/callback',
        'api/mpesa/result',
        'api/mpesa/timeout',
        'api/refund/callback',
        'api/refund/timeout',
        'api/car-refund/callback',
        'api/car-refund/timeout',

        'mpesa/stk/callback',
        'mpesa/ride/stk/callback',
        'mpesa/result',
        'mpesa/timeout',
        'refund/callback',
        'refund/timeout',
        'car-refund/callback',
        'car-refund/timeout',

        // Pesapal Callbacks
        'api/pesapal/callback',
        'pesapal/callback',
        'api/pesapal/notification',
        'pesapal/notification',

        // Other callbacks
        'bookings/store',

        // Add test routes
        'api/mpesa/test-callback',
        'api/mpesa/test-get',
        'api/mpesa/test-any',
    ];
}
