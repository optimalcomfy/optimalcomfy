<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('bookings')->insert([
            [
                'user_id' => 1, // Ensure this user exists in the users table
                'property_id' => 1, // Ensure this property exists in the properties table
                'check_in_date' => Carbon::now()->addDays(2)->toDateString(),
                'check_out_date' => Carbon::now()->addDays(5)->toDateString(),
                'total_price' => 360.00,
                'status' => 'confirmed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'property_id' => 2,
                'check_in_date' => Carbon::now()->addDays(3)->toDateString(),
                'check_out_date' => Carbon::now()->addDays(7)->toDateString(),
                'total_price' => 320.00,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'property_id' => 3,
                'check_in_date' => Carbon::now()->subDays(10)->toDateString(),
                'check_out_date' => Carbon::now()->subDays(5)->toDateString(),
                'total_price' => 1000.00,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'property_id' => 4,
                'check_in_date' => Carbon::now()->addDays(1)->toDateString(),
                'check_out_date' => Carbon::now()->addDays(4)->toDateString(),
                'total_price' => 180.00,
                'status' => 'canceled',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
