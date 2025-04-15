<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoodOrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('food_order_items')->insert([
            [
                'food_order_id' => 1, // Ensure this order exists in the food_orders table
                'food_id' => 1, // Ensure this food exists in the foods table
                'quantity' => 2,
                'price' => 12.50,
                'total_price' => 25.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'food_order_id' => 2,
                'food_id' => 3,
                'quantity' => 1,
                'price' => 14.00,
                'total_price' => 14.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'food_order_id' => 3,
                'food_id' => 2,
                'quantity' => 3,
                'price' => 8.50,
                'total_price' => 25.50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'food_order_id' => 4,
                'food_id' => 4,
                'quantity' => 1,
                'price' => 13.50,
                'total_price' => 13.50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
