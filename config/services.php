<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'bulk_sms' => [
        'api_url'   => env('BULK_SMS_API_URL', 'https://api.bulk.ke/sms/sendsms'),
        'api_key'   => env('BULK_SMS_API_KEY'),
        'sender_id' => env('BULK_SMS_SENDER_ID', 'Ristay Connect Limited'),
    ],

    'mpesa' => [
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'passkey' => env('MPESA_PASSKEY'),
        'business_shortcode' => env('MPESA_BUSINESS_SHORTCODE'),
        'callback_url' => env('MPESA_CALLBACK_URL'),
        'ride_callback_url' => env('MPESA_RIDE_CALLBACK_URL'),
        'base_url' => env('MPESA_BASE_URL', 'https://api.safaricom.co.ke'),
        // New Mpesa configuration properties
        'initiator_name' => env('MPESA_INITIATOR_NAME'),
        'security_credential' => env('MPESA_SECURITY_CREDENTIAL'),
        'result_url' => env('MPESA_RESULT_URL'),
        'queue_timeout_url' => env('MPESA_QUEUE_TIMEOUT_URL'),
    ],

];