<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
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
            'property_name' => 'nullable',
            'type' => 'nullable',
            'gallery' => 'nullable',
            'price_per_night' => 'nullable',
            'amount' => 'nullable',
            'max_adults' => 'nullable',
            'max_children' => 'nullable',
            'status' => 'nullable',
            'location' => 'nullable',
            'latitude' => 'nullable',
            'longitude' => 'nullable',
            'user_id' => 'nullable',
            'wifi_password' => 'nullable',
            'cook' => 'nullable',
            'cleaner' => 'nullable',
            'emergency_contact' => 'nullable',
            'key_location' => 'nullable',
            'apartment_name' => 'nullable',
            'block' => 'nullable',
            'house_number' => 'nullable',
            'lock_box_location' => 'nullable',
            'wifi_name' => 'nullable'
        ];
    }
}
