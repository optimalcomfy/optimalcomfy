<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all user IDs where role_id = 2
        $userIds = DB::table('users')->where('role_id', 2)->pluck('id')->toArray();

        // Fallback in case there are fewer users than properties
        $userId = $userIds[0] ?? null;

        DB::table('properties')->insert([
            [
                'property_name' => 'Night pride',
                'type' => 'Deluxe',
                'price_per_night' => 120.00,
                'max_guests' => 2,
                'max_adults' => 2,
                'max_children' => 0,
                'status' => 'available',
                'location' => '123 Safari Drive, Nairobi, Kenya',
                'latitude' => -1.2921,
                'longitude' => 36.8219,
                'user_id' => $userIds[0] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'property_name' => 'Rejex Min',
                'type' => 'Standard',
                'price_per_night' => 80.00,
                'max_guests' => 2,
                'max_adults' => 2,
                'max_children' => 0,
                'status' => 'booked',
                'location' => '456 Coastal Road, Mombasa, Kenya',
                'latitude' => -4.0435,
                'longitude' => 39.6682,
                'user_id' => $userIds[1] ?? $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'property_name' => 'Clubb suite',
                'type' => 'Suite',
                'price_per_night' => 200.00,
                'max_guests' => 4,
                'max_adults' => 3,
                'max_children' => 1,
                'status' => 'available',
                'location' => '789 Lakeside Ave, Kisumu, Kenya',
                'latitude' => -0.0917,
                'longitude' => 34.7679,
                'user_id' => $userIds[2] ?? $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'property_name' => 'Choki Rice',
                'type' => 'Economy',
                'price_per_night' => 60.00,
                'max_guests' => 1,
                'max_adults' => 1,
                'max_children' => 0,
                'status' => 'maintenance',
                'location' => '321 Valley Rd, Eldoret, Kenya',
                'latitude' => 0.5204,
                'longitude' => 35.2698,
                'user_id' => $userIds[3] ?? $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
