@component('mail::message')
# Your Ristay Password Reset Instructions

We received a request to reset the password for your Ristay account.

**To reset your password:**  
1. Click the button below within the next 60 minutes  
2. Create a new secure password  
3. Sign in with your new credentials  

@component('mail::button', ['url' => $actionUrl])
Reset My Password
@endcomponent

<small>This link expires in 60 minutes for your security.</small>

**Didn't request this?**  
If you didn't initiate this password reset:  
1. Ignore this email  
2. Consider changing your password if you're concerned about account security  
3. Contact our support team at support@ristay.com  

**Having trouble?**  
If the button doesn't work, copy this link into your browser:  
{{ $actionUrl }}

Thank you,  
The Ristay Team  
123 Company Address, City, State ZIP  
support@ristay.com | https://ristay.com  

<small>For your security, this email was automatically generated. Please do not reply directly.</small>
@endcomponent