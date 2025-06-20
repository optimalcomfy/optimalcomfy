<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
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
            'property_id' => 'nullable',
            'check_in_date' => 'nullable',
            'check_out_date' => 'nullable',
            'total_price' => 'nullable',
            'status' => 'nullable',
            'checked_in' => 'nullable',
            'checked_out' => 'nullable'
        ];
    }
}
