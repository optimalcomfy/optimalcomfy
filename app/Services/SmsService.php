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
        $this->apiUrl   = config('services.bulk_sms.api_url');
        $this->apiKey   = config('services.bulk_sms.api_key');
        $this->senderId = config('services.bulk_sms.sender_id', 'BULK_TECHY');
    }

    public function sendSms(string $mobile, string $message, ?string $senderName = null, int $serviceId = 0): array
    {
        $payload = [
            "mobile"        => $mobile,
            "response_type" => "json",
            "sender_name"   => $senderName ?? $this->senderId,
            "service_id"    => $serviceId,
            "message"       => $message,
        ];

        $response = Http::withHeaders([
            "h_api_key"    => $this->apiKey,
            "Content-Type" => "application/json",
        ])->post($this->apiUrl, $payload);

        return $response->json();
    }
}
