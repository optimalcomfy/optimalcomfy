<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
            'user_id' => 'nullable',
            'booking_id' => 'nullable',
            'food_order_id' => 'nullable',
            'service_booking_id' => 'nullable',
            'amount' => 'nullable',
            'method' => 'nullable',
            'status' => 'nullable',
            'car_booking_id' => 'nullable'
        ];
    }
}
