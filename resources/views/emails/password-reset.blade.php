@component('mail::layout')
@slot('header')
    @component('mail::header', ['url' => config('app.url')])
        <img src="{{ asset('image/logo/logo.png') }}" alt="OptimalComfy Logo" style="height: 50px;">
    @endcomponent
@endslot

# Password Reset Request

Hello {{ $user->name }},

We received a request to reset your OptimalComfy password.

**Click below to reset your password:**
(This link expires in {{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} minutes)

@component('mail::button', ['url' => $actionUrl, 'color' => 'primary'])
Reset My Password
@endcomponent

If you didn't request this, please ignore this email - your account is secure.

For security questions, contact us at [support@optimalcomfy.com](mailto:support@optimalcomfy.com).

@slot('footer')
    @component('mail::footer')
        © {{ date('Y') }} OptimalComfy. All rights reserved.<br>
        123 Company Address, City, State ZIP
    @endcomponent
@endslot
@endcomponent