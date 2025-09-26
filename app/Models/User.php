<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'phone',
        'role_id',
        'email',
        'password',
        'company_id',
        'date_of_birth',
        'nationality',
        'current_location',
        'preferred_countries',
        'work_experience',
        'education',
        'languages',
        'passport_number',
        'cv',
        'cover_letter',
        'references',
        'position',
        // Additional fields from registration form
        'address',
        'city',
        'country',
        'postal_code',
        'profile_picture',
        'id_verification',
        'bio',
        'preferred_payment_method',
        'emergency_contact',
        'contact_phone',
        'user_type',
        'host_id',
        'withdrawal_code',
        'Phone_verification_code',
        'referral_code',
        'ristay_verified'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'preferred_countries' => 'array',
    ];

    /**
     * Boot function from Laravel model events
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->referral_code)) {
                $user->referral_code = static::generateUniqueReferralCode();
            }
        });
    }

    /**
     * Generate a unique referral code
     */
    protected static function generateUniqueReferralCode(): string
    {
        $code = Str::upper(Str::random(8));

        // Check if code already exists
        while (static::where('referral_code', $code)->exists()) {
            $code = Str::upper(Str::random(8));
        }

        return $code;
    }

    public function company()
    {
        return $this->hasOne('App\Models\Company', 'id', 'company_id');
    }
}
