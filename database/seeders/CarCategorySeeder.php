<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CarCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Sedan',
            'Hatchback',
            'SUV',
            'Crossover',
            'Coupe',
            'Convertible',
            'Wagon',
            'Van',
            'Pickup Truck',
            'Minivan',
            'Electric',
            'Hybrid',
            'Luxury',
            'Sports Car',
            'Off-Road'
        ];

        foreach ($categories as $category) {
            DB::table('car_categories')->insert([
                'name' => $category,
                'slug' => Str::slug($category),
                'description' => $category . ' category of vehicles.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
