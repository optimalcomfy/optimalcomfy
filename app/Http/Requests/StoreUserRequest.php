<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'display_name' => 'nullable',
            'emergency_contact_phone' => 'nullable',
            'phone' => 'nullable',
            'role_id' => 'nullable',
            'position' => 'nullable',
            'email' => 'nullable',
            'password' => 'nullable',
            'company_id' => 'nullable',
            'date_of_birth' => 'nullable|date',
            'nationality' => 'nullable',
            'current_location' => 'nullable',
            'preferred_countries' => 'nullable|array',
            'work_experience' => 'nullable',
            'education' => 'nullable',
            'languages' => 'nullable',
            'passport_number' => 'nullable',
            'cv' => 'nullable',
            'cover_letter' => 'nullable',
            'references' => 'nullable',

            'address' => 'nullable',
            'city' => 'nullable',
            'country' => 'nullable',
            'postal_code' => 'nullable',
            'profile_picture' => 'nullable',
            'id_front' => 'nullable',
            'bio' => 'nullable',
            'preferred_payment_method' => 'nullable',
            'emergency_contact' => 'nullable',
            'contact_phone' => 'nullable',
            'user_type' => 'nullable',
            'host_id' => 'nullable',
            'property_id' => 'nullable',
            'car_id' => 'nullable',
            'check_in_date' => 'nullable|date',
            'check_out_date' => 'nullable|date',
            'variation_id' => 'nullable',

            'withdrawal_code' => 'nullable',
            'Phone_verification_code' => 'nullable',
            'referral_code' => 'nullable',
            'ristay_verified' => 'nullable|boolean',
            'unverified_reason' => 'nullable',
            
            // New fields from migration
            'id_back' => 'nullable',
            'pending_profile_picture' => 'nullable',
            'pending_id_front' => 'nullable',
            'pending_id_back' => 'nullable',
            'pending_data' => 'nullable|array',
            'profile_status' => 'nullable|in:active,pending,rejected',
            'profile_verified_at' => 'nullable|date',
            'rejection_reason' => 'nullable|string',
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
            'date_of_birth.date' => 'The date of birth must be a valid date.',
            'preferred_countries.array' => 'The preferred countries must be an array.',
            'check_in_date.date' => 'The check-in date must be a valid date.',
            'check_out_date.date' => 'The check-out date must be a valid date.',
            'profile_status.in' => 'The profile status must be one of: active, pending, or rejected.',
            'profile_verified_at.date' => 'The profile verified at must be a valid date.',
            'ristay_verified.boolean' => 'The Ristay verified field must be true or false.',
            'pending_data.array' => 'The pending data must be an array.',
        ];
    }
}