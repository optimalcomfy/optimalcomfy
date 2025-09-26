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
            'name' => 'nullable',
            'phone' => 'nullable',
            'role_id' => 'nullable',
            'position' => 'nullable',
            'email' => 'nullable|email',
            'password' => 'nullable',
            'company_id' => 'nullable|integer',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable',
            'current_location' => 'nullable',
            'preferred_countries' => 'nullable|array',
            'work_experience' => 'nullable|integer',
            'education' => 'nullable',
            'languages' => 'nullable',
            'passport_number' => 'nullable',
            'cv' => 'nullable',
            'cover_letter' => 'nullable',
            'references' => 'nullable',

            // Additional fields from registration form
            'address' => 'nullable',
            'city' => 'nullable',
            'country' => 'nullable',
            'postal_code' => 'nullable',
            'profile_picture' => 'nullable|file',
            'id_verification' => 'nullable|file',
            'bio' => 'nullable',
            'preferred_payment_method' => 'nullable',
            'emergency_contact' => 'nullable',
            'contact_phone' => 'nullable',
            'user_type' => 'nullable',
            'host_id' => 'nullable',

            'withdrawal_code'=> 'nullable',
            'Phone_verification_code'=> 'nullable',
            'referral_code'=> 'nullable',
            'ristay_verified'=> 'nullable'
        ];
    }
}
