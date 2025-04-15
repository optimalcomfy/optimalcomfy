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
            'email' => 'nullable|email',
            'password' => 'nullable',
            'company_id' => 'nullable',
            'date_of_birth' => 'nullable|date',          // Added and made nullable
            'nationality' => 'nullable|string',          // Added and made nullable
            'current_location' => 'nullable|string',     // Added and made nullable
            'preferred_countries' => 'nullable|array',    // Added and made nullable (array validation)
            'work_experience' => 'nullable|integer',      // Added and made nullable
            'education' => 'nullable|string',            // Added and made nullable
            'languages' => 'nullable|string',            // Added and made nullable
            'passport_number' => 'nullable|string',      // Added and made nullable
            'cv' => 'nullable|file',                      // Added and made nullable (file validation)
            'cover_letter' => 'nullable|file',            // Added and made nullable (file validation)
            'references' => 'nullable|string',           // Added and made nullable
        ];
    }
}
