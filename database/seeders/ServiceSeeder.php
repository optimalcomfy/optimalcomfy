<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('services')->insert([
            [
                'name' => 'Property Cleaning',
                'image' => 'images/services/cleaning.jpg',
                'description' => 'Daily property cleaning service to keep your stay comfortable.',
                'price' => 15.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Laundry Service',
                'image' => 'images/services/laundry.jpg',
                'description' => 'Fast and efficient laundry service available upon request.',
                'price' => 25.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Spa & Massage',
                'image' => 'images/services/spa.jpg',
                'description' => 'Relaxing spa treatments and professional massages.',
                'price' => 50.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Airport Shuttle',
                'image' => 'images/services/shuttle.jpg',
                'description' => 'Convenient airport pickup and drop-off service.',
                'price' => 30.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Breakfast Buffet',
                'image' => 'images/services/breakfast.jpg',
                'description' => 'A delicious and diverse breakfast buffet every morning.',
                'price' => 20.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
