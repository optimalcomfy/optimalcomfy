<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'role_id' => rand(1, 3),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password101'),
            'company_id' => rand(1, 10),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'nationality' => fake()->country(),
            'current_location' => fake()->city(),
            'preferred_countries' => json_encode([fake()->country(), fake()->country()]),
            'education' => fake()->sentence(6),
            'languages' => json_encode([fake()->languageCode(), fake()->languageCode()]),
            'passport_number' => strtoupper(fake()->bothify('??######')),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'postal_code' => fake()->postcode(),
            'profile_picture' => 'uploads/profile_pictures/default.jpg',
            'id_front' => 'uploads/id_fronts/sample_id.jpg',
            'bio' => fake()->paragraph(),
            'preferred_payment_method' => fake()->randomElement(['paypal', 'bank_transfer', 'crypto']),
            'emergency_contact' => fake()->name(),
            'contact_phone' => fake()->phoneNumber(),
            'user_type' => fake()->randomElement(['guest', 'host']),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
