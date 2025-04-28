<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarRequest extends FormRequest
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
     * @return array<string,
     */

    public function rules(): array
    {
        return [
            'car_category_id'   => 'nullable|exists:car_categories,id',
            'name'              => 'required|string|max:255',
            'brand'             => 'required|string|max:255',
            'model'             => 'required|string|max:255',
            'year'              => 'nullable|digits:4|integer|min:1900|max:' . date('Y'),
            'mileage'           => 'nullable|numeric|min:0',
            'body_type'         => 'nullable|string|max:255',
            'seats'             => 'nullable|integer|min:1|max:15', // Adjust based on seating capacity
            'doors'             => 'nullable|integer|min:1|max:5',  // Adjust based on typical number of doors
            'luggage_capacity'  => 'nullable|integer|min:0',
            'fuel_type'         => 'nullable|string|max:255',
            'engine_capacity'   => 'nullable|integer|min:0',
            'transmission'      => 'nullable|string|max:255',
            'drive_type'        => 'nullable|string|max:255',
            'fuel_economy'      => 'nullable|numeric|min:0',
            'exterior_color'    => 'nullable|string|max:255',
            'interior_color'    => 'nullable|string|max:255',
            'price_per_day'     => 'required|numeric|min:0',
            'description'       => 'nullable|string|max:1000',
            'is_available'      => 'nullable|boolean',
            'location_address'  => 'nullable|string|max:255',
            'latitude'          => 'nullable|numeric|between:-90,90',
            'longitude'         => 'nullable|numeric|between:-180,180',
        ];
    }
}
