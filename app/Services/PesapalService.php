<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PesapalService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $baseUrl;

    public function __construct()
    {
        $this->consumerKey = config('services.pesapal.key');
        $this->consumerSecret = config('services.pesapal.secret');
        $this->baseUrl = 'https://pay.pesapal.com/v3'; // Sandbox: https://cybqa.pesapal.com
    }

    public function getToken()
    {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->withBasicAuth($this->consumerKey, $this->consumerSecret)
          ->post($this->baseUrl . '/api/Auth/RequestToken');

        return $response->json()['token'];
    }

    public function makeOrder($token, $data)
    {
        return Http::withToken($token)
            ->post($this->baseUrl . '/api/Transactions/SubmitOrderRequest', $data)
            ->json();
    }
}
