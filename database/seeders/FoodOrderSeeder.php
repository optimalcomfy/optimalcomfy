<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FoodOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('food_orders')->insert([
            [
                'user_id' => 1, // Ensure this user exists in the users table
                'booking_id' => 1, // Ensure this booking exists in the bookings table or set to null
                'total_price' => 25.00,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'booking_id' => 2,
                'total_price' => 40.50,
                'status' => 'preparing',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'booking_id' => null, // Standalone food order, not tied to a booking
                'total_price' => 18.75,
                'status' => 'delivered',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'booking_id' => 3,
                'total_price' => 32.00,
                'status' => 'canceled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
