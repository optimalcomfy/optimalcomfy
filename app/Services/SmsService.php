<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SmsService
{
    protected string $apiUrl;
    protected string $apiKey;
    protected string $senderId;

    public function __construct()
    {
        $this->apiUrl = config('services.bulk_sms.api_url');
        $this->apiKey = config('services.bulk_sms.api_key');
        $this->senderId = config('services.bulk_sms.sender_id', 'CENTIFLOW');
    }

    public function sendSms($mobile, $message, $senderName = null, $serviceId = 0)
    {
        $response = Http::withHeaders([
            'h_api_key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post($this->apiUrl, [
            'mobile' => $mobile,
            'response_type' => 'json',
            'sender_name' => $senderName ?? $this->senderId,
            'service_id' => $serviceId,
            'message' => $message,
        ]);

        return $response->json();
    }
}
