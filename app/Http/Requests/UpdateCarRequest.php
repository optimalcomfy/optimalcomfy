<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'car_category_id'   => 'nullable',
            'name'              => 'nullable',
            'license_plate'     => 'nullable',
            'brand'             => 'nullable',
            'model'             => 'nullable',
            'year'              => 'nullable',
            'mileage'           => 'nullable',
            'body_type'         => 'nullable',
            'seats'             => 'nullable',
            'doors'             => 'nullable', 
            'luggage_capacity'  => 'nullable',
            'fuel_type'         => 'nullable',
            'engine_capacity'   => 'nullable',
            'transmission'      => 'nullable',
            'drive_type'        => 'nullable',
            'fuel_economy'      => 'nullable',
            'exterior_color'    => 'nullable',
            'interior_color'    => 'nullable',
            'price_per_day'     => 'nullable',
            'amount' => 'nullable',
            'description'       => 'nullable',
            'is_available'      => 'nullable',
            'location_address'  => 'nullable',
            'latitude'          => 'nullable',
            'longitude'         => 'nullable',
            'user_id'           => 'nullable',
            'default_available' => 'nullable',

            'minimum_rental_days' => 'nullable',
            'delivery_toggle' => 'boolean',
            'delivery_fee' => 'nullable'
        ];
    }
}
