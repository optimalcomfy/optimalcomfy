<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'amount' => rand(2, 100099),
            'status' => 'Pending',
            'employee_id' => rand(1, 9),
            'disbursed_at' => now(),
            'loan_provider_id' => 1
        ];
    }
}
