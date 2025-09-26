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
            'phone' => 'nullable',
            'role_id' => 'nullable',
            'position' => 'nullable',
            'email' => 'nullable',
            'password' => 'nullable',
            'company_id' => 'nullable',
            'date_of_birth' => 'nullable',
            'nationality' => 'nullable',
            'current_location' => 'nullable',
            'preferred_countries' => 'nullable',
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
            'id_verification' => 'nullable',
            'bio' => 'nullable',
            'preferred_payment_method' => 'nullable',
            'emergency_contact' => 'nullable',
            'contact_phone' => 'nullable',
            'user_type' => 'nullable',
            'host_id' => 'nullable',
            'property_id'=> 'nullable',
            'car_id'=> 'nullable',
            'check_in_date'=> 'nullable',
            'check_out_date'=> 'nullable',
            'variation_id'=> 'nullable',

            'withdrawal_code'=> 'nullable',
            'Phone_verification_code'=> 'nullable',
            'referral_code'=> 'nullable',
            'ristay_verified'=> 'nullable'
        ];
    }

}
