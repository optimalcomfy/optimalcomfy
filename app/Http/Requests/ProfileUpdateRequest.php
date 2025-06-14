<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProfileUpdateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable'],
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id)
            ],
            'address' => ['nullable'],
            'city' => ['nullable'],
            'country' => ['nullable'],
            'postal_code' => ['nullable'],
            'bio' => ['nullable'],
            'preferred_payment_method' => ['nullable'],
            'emergency_contact' => ['nullable'],
            'contact_phone' => ['nullable'],
            'profile_picture' =>['nullable'],
            'id_verification' => ['nullable'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'profile_picture' => 'profile picture',
            'id_verification' => 'ID verification',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'profile_picture.max' => 'The profile picture must not exceed 2MB.',
            'profile_picture.dimensions' => 'The profile picture must be less than 1000px in width and height.',
            'id_verification.max' => 'The ID verification file must not exceed 5MB.',
            'id_verification.mimes' => 'The ID verification must be a JPG, PNG, or PDF file.',
        ];
    }
}