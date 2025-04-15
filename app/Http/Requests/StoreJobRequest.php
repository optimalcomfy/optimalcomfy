<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
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
            'title' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:255',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0|gte:salary_min',
            'description' => 'nullable|string',
            'required_qualifications' => 'nullable|string',
            'preferred_qualifications' => 'nullable|string',
            'application_deadline' => 'nullable|date',
            'application_method' => 'nullable|string|max:255',
            'company_website' => 'nullable|url|max:255',
            'benefits' => 'nullable|string',
            'industry' => 'nullable|string|max:255',
            'experience_level' => 'nullable|string|max:255',
            'work_schedule' => 'nullable|string|max:255',
            'hiring_manager_contact' => 'nullable|string|max:255',
            'company_culture' => 'nullable|string',
            'interview_process' => 'nullable|string',
            'posting_date' => 'nullable|date',
            'job_reference' => 'nullable|string|max:255',
            'image' => 'nullable'
        ];
    }
}
