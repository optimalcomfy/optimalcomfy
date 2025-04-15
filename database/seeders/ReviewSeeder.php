<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('reviews')->insert([
            [
                'user_id' => 1, // Ensure this user exists
                'booking_id' => 1, // Ensure this booking exists
                'service_id' => null,
                'food_id' => null,
                'rating' => 5,
                'comment' => 'Fantastic stay! The room was clean and cozy.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'booking_id' => null,
                'service_id' => 1,
                'food_id' => null,
                'rating' => 4,
                'comment' => 'Great service, but a bit expensive.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'booking_id' => null,
                'service_id' => null,
                'food_id' => 2,
                'rating' => 3,
                'comment' => 'The food was average. Could be improved.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4,
                'booking_id' => 2,
                'service_id' => null,
                'food_id' => null,
                'rating' => 5,
                'comment' => 'Excellent experience! Would recommend.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
