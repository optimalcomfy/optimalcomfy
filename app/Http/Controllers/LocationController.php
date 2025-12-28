<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class LocationController extends Controller
{
    //
    public function locations(Request $request)
    {
        \Log::info('=== LOCATIONS API ENDPOINT CALLED ===');
        \Log::info('Request details:', [
            'query' => $request->input('query'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'full_url' => $request->fullUrl(),
            'headers' => $request->headers->all(),
        ]);

        $query = $request->input('query');

        if (empty($query)) {
            \Log::warning('Empty query parameter received');
            return response()->json(['error' => 'Query parameter is required'], 400);
        }

        // Use the API key from env
        $apiKey = env('GOOGLE_MAP_API');
        
        \Log::info('API Key status:', [
            'has_key' => !empty($apiKey),
            'key_length' => strlen($apiKey),
            'key_preview' => $apiKey ? substr($apiKey, 0, 10) . '...' : null,
        ]);

        $client = new Client();
        $apiEndpoint = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

        try {
            \Log::info('Making Google API request', [
                'input' => $query,
                'endpoint' => $apiEndpoint,
            ]);

            $response = $client->get($apiEndpoint, [
                'query' => [
                    'input' => $query,
                    'key' => $apiKey,
                ],
                'timeout' => 10,
            ]);

            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);
            
            \Log::info('Google API response', [
                'http_status' => $statusCode,
                'api_status' => $data['status'] ?? 'unknown',
                'predictions_count' => count($data['predictions'] ?? []),
                'first_prediction' => $data['predictions'][0]['description'] ?? null,
            ]);

            if ($statusCode === 200) {
                $predictions = [];
                foreach ($data['predictions'] as $prediction) {
                    $predictions[] = $prediction['description'];
                }

                \Log::info('Returning predictions', ['count' => count($predictions)]);
                
                return response()->json($predictions)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type');

            } else {
                \Log::error('Google API returned non-200 status', ['status' => $statusCode]);
                return response()->json(['error' => 'Failed to fetch location data'], 500)
                    ->header('Access-Control-Allow-Origin', '*');
            }
        } catch (\Exception $e) {
            \Log::error('Google Maps API exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Error: ' . $e->getMessage()], 500)
                ->header('Access-Control-Allow-Origin', '*');
        }
    }

}
