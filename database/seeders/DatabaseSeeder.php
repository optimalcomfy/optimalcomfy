<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            UserSeeder::class,
            EmployeeSeeder::class,
            LoanProviderSeeder::class,
            LoanSeeder::class,
            NotificationSeeder::class,
            PropertiesSeeder::class,
            AmenitySeeder::class,
            PropertyAmenitySeeder::class,
            BookingSeeder::class,
            ServiceSeeder::class,
            FoodSeeder::class,
            ServiceBookingSeeder::class,
            FoodOrderSeeder::class,
            FoodOrderItemSeeder::class,
            PaymentSeeder::class,
            ReviewSeeder::class,
            CarCategorySeeder::class,
            FeatureSeeder::class,
            CarFeatureSeeder::class,
            ChecklistTemplatesSeeder::class
        ]);
    }
}