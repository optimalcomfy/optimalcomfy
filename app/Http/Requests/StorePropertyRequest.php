<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
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
            'price_per_night' => 'nullable',
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
            'key_location' => 'nullable'
        ];
    }
}
