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
            'profile_picture' => ['nullable'],
            'id_front' => ['nullable'],
            'id_back' => ['nullable'],
            'pending_profile_picture' => ['nullable'],
            'pending_id_front' => ['nullable'],
            'pending_id_back' => ['nullable'],
            'pending_data' => ['nullable', 'array'],
            'profile_status' => ['nullable', 'in:active,pending,rejected'],
            'profile_verified_at' => ['nullable', 'date'],
            'rejection_reason' => ['nullable', 'string'],
            'display_name' => ['nullable'],
            'phone' => ['nullable'],
            'role_id' => ['nullable'],
            'company_id' => ['nullable'],
            'date_of_birth' => ['nullable', 'date'],
            'nationality' => ['nullable'],
            'current_location' => ['nullable'],
            'preferred_countries' => ['nullable', 'array'],
            'work_experience' => ['nullable'],
            'education' => ['nullable'],
            'languages' => ['nullable'],
            'passport_number' => ['nullable'],
            'cv' => ['nullable'],
            'cover_letter' => ['nullable'],
            'references' => ['nullable'],
            'position' => ['nullable'],
            'user_type' => ['nullable'],
            'host_id' => ['nullable'],
            'withdrawal_code' => ['nullable'],
            'Phone_verification_code' => ['nullable'],
            'referral_code' => ['nullable'],
            'ristay_verified' => ['nullable'],
            'unverified_reason' => ['nullable'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'profile_picture' => 'profile picture',
            'id_front' => 'ID front',
            'id_back' => 'ID back',
            'pending_profile_picture' => 'pending profile picture',
            'pending_id_front' => 'pending ID front',
            'pending_id_back' => 'pending ID back',
            'pending_data' => 'pending data',
            'profile_status' => 'profile status',
            'profile_verified_at' => 'profile verified at',
            'rejection_reason' => 'rejection reason',
            'display_name' => 'display name',
            'phone' => 'phone number',
            'role_id' => 'role',
            'company_id' => 'company',
            'date_of_birth' => 'date of birth',
            'current_location' => 'current location',
            'preferred_countries' => 'preferred countries',
            'work_experience' => 'work experience',
            'passport_number' => 'passport number',
            'cv' => 'CV',
            'cover_letter' => 'cover letter',
            'user_type' => 'user type',
            'host_id' => 'host',
            'withdrawal_code' => 'withdrawal code',
            'Phone_verification_code' => 'phone verification code',
            'referral_code' => 'referral code',
            'ristay_verified' => 'Ristay verified',
            'unverified_reason' => 'unverified reason',
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
            'id_front.max' => 'The ID verification file must not exceed 5MB.',
            'id_front.mimes' => 'The ID verification must be a JPG, PNG, or PDF file.',
            'id_back.max' => 'The ID back verification file must not exceed 5MB.',
            'id_back.mimes' => 'The ID back verification must be a JPG, PNG, or PDF file.',
            'pending_profile_picture.max' => 'The pending profile picture must not exceed 2MB.',
            'pending_id_front.max' => 'The pending ID front file must not exceed 5MB.',
            'pending_id_front.mimes' => 'The pending ID front must be a JPG, PNG, or PDF file.',
            'pending_id_back.max' => 'The pending ID back file must not exceed 5MB.',
            'pending_id_back.mimes' => 'The pending ID back must be a JPG, PNG, or PDF file.',
            'profile_status.in' => 'The profile status must be one of: active, pending, or rejected.',
            'date_of_birth.date' => 'The date of birth must be a valid date.',
            'preferred_countries.array' => 'The preferred countries must be an array.',
        ];
    }
}