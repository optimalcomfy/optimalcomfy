<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class LocationController extends Controller
{
    //
    public function locations(Request $request)
    {
        \Log::info('=== LOCATIONS API CALLED ===');
        \Log::info('Query:', ['query' => $request->input('query')]);
        \Log::info('Full Request:', $request->all());
        
        $query = $request->input('query');

        if (empty($query)) {
            \Log::warning('Empty query parameter');
            return response()->json(['error' => 'Query parameter is required'], 400);
        }

        $client = new Client();
        $apiKey = env('GOOGLE_MAP_API');
        
        \Log::info('API Key check:', [
            'has_api_key' => !empty($apiKey),
            'key_length' => strlen($apiKey),
            'key_preview' => $apiKey ? substr($apiKey, 0, 10) . '...' : null,
        ]);

        if (empty($apiKey)) {
            \Log::error('Google Maps API key is empty in LocationController');
            return response()->json(['error' => 'API configuration error: key not found'], 500);
        }

        $apiEndpoint = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

        try {
            \Log::info('Making Google Maps API request', [
                'endpoint' => $apiEndpoint,
                'query' => $query,
                'full_url' => $apiEndpoint . '?input=' . urlencode($query) . '&key=' . substr($apiKey, 0, 10) . '...',
            ]);

            $response = $client->get($apiEndpoint, [
                'query' => [
                    'input' => $query,
                    'key' => $apiKey,
                ],
                'timeout' => 10,
                'http_errors' => false, // Don't throw exceptions on 4xx/5xx
            ]);

            \Log::info('Google Maps API response status:', [
                'status_code' => $response->getStatusCode(),
                'headers' => $response->getHeaders(),
            ]);

            $body = $response->getBody()->getContents();
            \Log::info('Google Maps API raw response:', ['body' => $body]);
            
            $data = json_decode($body, true);
            
            \Log::info('Google Maps API parsed response:', [
                'status' => $data['status'] ?? 'NO STATUS',
                'error_message' => $data['error_message'] ?? null,
                'predictions_count' => count($data['predictions'] ?? []),
                'first_prediction' => $data['predictions'][0]['description'] ?? null,
            ]);

            // Check Google API status
            if (($data['status'] ?? '') === 'REQUEST_DENIED') {
                \Log::error('Google Maps API Request Denied', [
                    'error_message' => $data['error_message'] ?? 'No error message',
                ]);
                return response()->json([
                    'error' => 'Google Maps API error: ' . ($data['error_message'] ?? 'Request denied'),
                    'details' => $data
                ], 500);
            }

            // Extract the predictions (location suggestions)
            $predictions = [];
            foreach ($data['predictions'] ?? [] as $prediction) {
                $predictions[] = $prediction['description'];
            }

            \Log::info('Returning predictions:', ['count' => count($predictions), 'predictions' => $predictions]);
            
            return response()->json($predictions);

        } catch (\Exception $e) {
            \Log::error('Google Maps API exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Error occurred while fetching location data: ' . $e->getMessage()], 500);
        }
    }

}
