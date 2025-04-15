<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
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
            'room_number' => 'nullable',
            'type' => 'nullable',
            'gallery' => 'nullable',
            'price_per_night' => 'nullable',
            'max_adults' => 'nullable',
            'max_children' => 'nullable',
            'status' => 'nullable'         
        ];
    }
}
