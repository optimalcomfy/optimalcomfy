<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('foods')->insert([
            [
                'name' => 'Grilled Chicken',
                'description' => 'Juicy grilled chicken served with a side of vegetables.',
                'price' => 12.99,
                'category' => 'Main Course',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Vegetable Salad',
                'description' => 'Fresh mixed greens with a light vinaigrette dressing.',
                'price' => 8.50,
                'category' => 'Salad',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Margherita Pizza',
                'description' => 'Classic pizza with fresh tomatoes, mozzarella, and basil.',
                'price' => 14.00,
                'category' => 'Pizza',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Spaghetti Bolognese',
                'description' => 'Pasta with rich tomato and beef sauce, topped with Parmesan.',
                'price' => 13.50,
                'category' => 'Pasta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Chocolate Cake',
                'description' => 'Rich and moist chocolate cake with creamy frosting.',
                'price' => 6.99,
                'category' => 'Dessert',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
