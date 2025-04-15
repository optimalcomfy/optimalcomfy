<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ServiceBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('service_bookings')->insert([
            [
                'user_id' => 1, // Ensure this user exists in the users table
                'booking_id' => 1, // Ensure this booking exists in the bookings table or set to null
                'service_id' => 1, // Ensure this service exists in the services table
                'quantity' => 2,
                'total_price' => 30.00, // Assuming price per service is 15.00
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'booking_id' => 2,
                'service_id' => 2,
                'quantity' => 1,
                'total_price' => 25.00,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'booking_id' => null, // Can be used for standalone service bookings
                'service_id' => 3,
                'quantity' => 1,
                'total_price' => 50.00,
                'status' => 'canceled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'booking_id' => 3,
                'service_id' => 4,
                'quantity' => 1,
                'total_price' => 30.00,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
