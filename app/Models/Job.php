<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'company_name',
        'location',
        'job_type',
        'salary_min',
        'salary_max',
        'description',
        'required_qualifications',
        'preferred_qualifications',
        'application_deadline',
        'application_method',
        'company_website',
        'benefits',
        'industry',
        'experience_level',
        'work_schedule',
        'hiring_manager_contact',
        'company_culture',
        'interview_process',
        'posting_date',
        'job_reference',
        'image'
    ];

    protected $appends = ['image_url'];
    
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
