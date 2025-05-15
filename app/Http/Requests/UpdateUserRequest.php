<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => 'nullable|string',
            'phone' => 'nullable|string',
            'role_id' => 'nullable|integer',
            'position' => 'nullable|string',
            'email' => 'nullable|email',
            'password' => 'nullable|string',
            'company_id' => 'nullable|integer',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable|string',
            'current_location' => 'nullable|string',
            'preferred_countries' => 'nullable|array',
            'work_experience' => 'nullable|integer',
            'education' => 'nullable|string',
            'languages' => 'nullable|string',
            'passport_number' => 'nullable|string',
            'cv' => 'nullable|file',
            'cover_letter' => 'nullable|file',
            'references' => 'nullable|string',

            // Additional fields from registration form
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'profile_picture' => 'nullable|file',
            'id_verification' => 'nullable|file',
            'bio' => 'nullable|string',
            'preferred_payment_method' => 'nullable|string',
            'emergency_contact' => 'nullable|string',
            'user_type' => 'nullable|string',
        ];
    }
}
