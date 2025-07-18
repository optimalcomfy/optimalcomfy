<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarBookingRequest extends FormRequest
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
            'user_id' => 'nullable',
            'car_id' => 'nullable',
            'start_date' => 'nullable',
            'end_date' => 'nullable',
            'total_price' => 'nullable',
            'pickup_location' => 'nullable',
            'dropoff_location' => 'nullable',
            'status' => 'nullable',
            'special_requests' => 'nullable',
            'checked_in' => 'nullable',
            'checked_out' => 'nullable',
            'number' => 'nullable',
            'phone' => 'nullable',
            'external_booking' => 'nullable'
        ];
    }
}
