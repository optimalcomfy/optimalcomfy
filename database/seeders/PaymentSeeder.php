<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('payments')->insert([
            [
                'user_id' => 1, // Ensure user exists in users table
                'booking_id' => 1, // Ensure booking exists in bookings table
                'food_order_id' => null,
                'service_booking_id' => null,
                'amount' => 150.00,
                'method' => 'mpesa',
                'status' => 'successful',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'booking_id' => null,
                'food_order_id' => 1,
                'service_booking_id' => null,
                'amount' => 30.00,
                'method' => 'card',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'booking_id' => null,
                'food_order_id' => null,
                'service_booking_id' => 2,
                'amount' => 45.00,
                'method' => 'paypal',
                'status' => 'failed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'booking_id' => 2,
                'food_order_id' => null,
                'service_booking_id' => null,
                'amount' => 220.00,
                'method' => 'cash',
                'status' => 'successful',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
