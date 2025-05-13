<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class LocationController extends Controller
{
    //
    public function locations(Request $request)
    {
        $query = $request->input('query');

        if (empty($query)) {
            return response()->json(['error' => 'Query parameter is required'], 400);
        }

        $client = new Client();
        $apiKey = ''; 
        $apiEndpoint = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

        try {
            $response = $client->get($apiEndpoint, [
                'query' => [
                    'input' => $query,
                    'key' => $apiKey,
                ],
            ]);

            // Check if the request was successful
            if ($response->getStatusCode() === 200) {
                // Parse the JSON response
                $data = json_decode($response->getBody(), true);

                // Extract the predictions (location suggestions)
                $predictions = [];
                foreach ($data['predictions'] as $prediction) {
                    $predictions[] = $prediction['description'];
                }

                return response()->json($predictions);
            } else {
                // Handle API request error
                return response()->json(['error' => 'Failed to fetch location data from Google Maps API'], 500);
            }
        } catch (\Exception $e) {
            // Handle any exceptions that occur during the request
            return response()->json(['error' => 'Error occurred while fetching location data: ' . $e->getMessage()], 500);
        }
    }

}
