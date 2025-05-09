<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class CarFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            'Bluetooth',
            'Sunroof',
            'Navigation System',
            'Backup Camera',
            'Heated Seats',
            'Cruise Control',
            'Alloy Wheels',
            'Keyless Entry',
            'Blind Spot Monitoring',
            'Apple CarPlay',
            'Android Auto',
            'Leather Seats',
            'Remote Start',
            'Automatic Emergency Braking',
            'Lane Departure Warning'
        ];

        // Fetch all existing car IDs
        $carIds = DB::table('cars')->pluck('id')->toArray();

        foreach ($carIds as $carId) {
            // Assign 3 to 6 random features per car
            $randomFeatures = Arr::random($features, rand(3, 6));

            foreach ($randomFeatures as $feature) {
                DB::table('car_features')->insert([
                    'car_id' => $carId,
                    'feature_name' => $feature,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
