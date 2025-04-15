<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'salary' => rand(2, 100099),
            'loan_limit' => rand(2,  10099),
            'user_id' => rand(1, 9),
            'company_id' => rand(1, 9)
        ];
    }
}
