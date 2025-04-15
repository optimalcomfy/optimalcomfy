<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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
            'service_id' => 'nullable',
            'food_id' => 'nullable',
            'room_id' => 'nullable',
            'rating' => 'nullable',
            'comment' => 'nullable'
        ];
    }
}
