<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rooms')->insert([
            [
                'room_number' => '101',
                'type' => 'Deluxe',
                'price_per_night' => 120.00,
                'max_guests' => 2,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_number' => '102',
                'type' => 'Standard',
                'price_per_night' => 80.00,
                'max_guests' => 2,
                'status' => 'booked',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_number' => '103',
                'type' => 'Suite',
                'price_per_night' => 200.00,
                'max_guests' => 4,
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'room_number' => '104',
                'type' => 'Economy',
                'price_per_night' => 60.00,
                'max_guests' => 1,
                'status' => 'maintenance',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
