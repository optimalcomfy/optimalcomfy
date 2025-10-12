<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
use App\Models\Company;

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
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['earnings_from_referral', 'balance', 'pending_balance'];

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

    public function generateWithdrawalCode(): string
    {
        $code = rand(100000, 999999);
        $this->withdrawal_code = $code;
        $this->save();

        return $code;
    }

    public function validateWithdrawalCode(string $code): bool
    {
        return $this->withdrawal_code === $code;
    }

    public function clearWithdrawalCode(): void
    {
        $this->withdrawal_code = null;
        $this->save();
    }

    public function carBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
            ->whereNotNull("checked_in");
    }

    public function bookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
            ->whereNotNull("checked_in");
    }

    /**
     * Get pending car bookings where checkin is null
     */
    public function pendingCarBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNull("checked_in");
    }

    /**
     * Get pending bookings where checkin is null
     */
    public function pendingBookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNull("checked_in");
    }

    public function repayments()
    {
        return $this->hasMany('App\Models\Repayment', 'user_id', 'id');
    }

    /**
     * Get the first company with referral percentage
     */
    protected function getFirstCompanyWithReferralPercentage()
    {
        // First try user's own company
        if ($this->company && $this->company->referral_percentage) {
            return $this->company;
        }

        // Alternatively, get the first company from the Company model
        return Company::whereNotNull('referral_percentage')->first();
    }

    /**
     * Get the earnings from referral attribute
     */
    public function getEarningsFromReferralAttribute()
    {
        $totalEarnings = 0;

        // Get the first company with referral percentage
        $company = $this->getFirstCompanyWithReferralPercentage();

        if (!$company || !$company->referral_percentage) {
            return $totalEarnings;
        }

        $referralPercentage = $company->referral_percentage;

        // Calculate earnings from regular bookings
        $bookings = $this->bookings;
        foreach ($bookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $totalEarnings += $earnings;
        }

        // Calculate earnings from car bookings
        $carBookings = $this->carBookings;
        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? $carBooking->total_price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $totalEarnings += $earnings;
        }

        return $totalEarnings;
    }

    /**
     * Get pending balance from bookings where checkin is null
     */
    public function getPendingBalanceAttribute()
    {
        $totalPendingEarnings = 0;

        // Get the first company with referral percentage
        $company = $this->getFirstCompanyWithReferralPercentage();

        if (!$company || !$company->referral_percentage) {
            return $totalPendingEarnings;
        }

        $referralPercentage = $company->referral_percentage;

        // Calculate pending earnings from regular bookings (checkin is null)
        $pendingBookings = $this->pendingBookings;
        foreach ($pendingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $totalPendingEarnings += $earnings;
        }

        // Calculate pending earnings from car bookings (checkin is null)
        $pendingCarBookings = $this->pendingCarBookings;
        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? $carBooking->price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $totalPendingEarnings += $earnings;
        }

        return $totalPendingEarnings;
    }

    /**
     * Get total repayments amount
     */
    public function getTotalRepaymentsAttribute()
    {
        return $this->repayments->sum('amount');
    }

    /**
     * Get balance attribute (earnings from referrals - total repayments)
     */
    public function getBalanceAttribute()
    {
        $earnings = $this->earnings_from_referral;
        $repayments = $this->total_repayments;

        return $earnings - $repayments;
    }

    /**
     * Alternative method to get detailed earnings breakdown with balance and pending balance
     */
    public function getDetailedReferralEarnings()
    {
        $company = $this->getFirstCompanyWithReferralPercentage();

        if (!$company || !$company->referral_percentage) {
            return [
                'total_earnings' => 0,
                'booking_earnings' => 0,
                'car_booking_earnings' => 0,
                'pending_balance' => 0,
                'pending_booking_earnings' => 0,
                'pending_car_booking_earnings' => 0,
                'total_repayments' => 0,
                'balance' => 0,
                'referral_percentage' => 0,
                'company' => null
            ];
        }

        $referralPercentage = $company->referral_percentage;
        $bookingEarnings = 0;
        $carBookingEarnings = 0;
        $pendingBookingEarnings = 0;
        $pendingCarBookingEarnings = 0;

        // Calculate earnings from regular bookings (checked in)
        $bookings = $this->bookings;
        foreach ($bookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $bookingEarnings += $earnings;
        }

        // Calculate earnings from car bookings (checked in)
        $carBookings = $this->carBookings;
        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? $carBooking->price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $carBookingEarnings += $earnings;
        }

        // Calculate pending earnings from regular bookings (checkin is null)
        $pendingBookings = $this->pendingBookings;
        foreach ($pendingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $pendingBookingEarnings += $earnings;
        }

        // Calculate pending earnings from car bookings (checkin is null)
        $pendingCarBookings = $this->pendingCarBookings;
        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? $carBooking->price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $pendingCarBookingEarnings += $earnings;
        }

        $totalEarnings = $bookingEarnings + $carBookingEarnings;
        $totalPendingEarnings = $pendingBookingEarnings + $pendingCarBookingEarnings;
        $totalRepayments = $this->total_repayments;
        $balance = $totalEarnings - $totalRepayments;

        return [
            'total_earnings' => $totalEarnings,
            'booking_earnings' => $bookingEarnings,
            'car_booking_earnings' => $carBookingEarnings,
            'pending_balance' => $totalPendingEarnings,
            'pending_booking_earnings' => $pendingBookingEarnings,
            'pending_car_booking_earnings' => $pendingCarBookingEarnings,
            'total_repayments' => $totalRepayments,
            'balance' => $balance,
            'referral_percentage' => $referralPercentage,
            'company' => $company->name,
            'total_bookings_count' => $bookings->count(),
            'total_car_bookings_count' => $carBookings->count(),
            'pending_bookings_count' => $pendingBookings->count(),
            'pending_car_bookings_count' => $pendingCarBookings->count(),
            'total_repayments_count' => $this->repayments->count()
        ];
    }

    /**
     * Get financial summary including pending balance
     */
    public function getFinancialSummary()
    {
        return [
            'earnings_from_referrals' => $this->earnings_from_referral,
            'pending_balance' => $this->pending_balance,
            'total_repayments' => $this->total_repayments,
            'balance' => $this->balance,
            'available_for_withdrawal' => max(0, $this->balance), // Only positive balance
            'total_potential_earnings' => $this->earnings_from_referral + $this->pending_balance
        ];
    }

    /**
     * Check if user has available balance for withdrawal
     */
    public function hasAvailableBalance()
    {
        return $this->balance > 0;
    }

    /**
     * Check if user has pending balance
     */
    public function hasPendingBalance()
    {
        return $this->pending_balance > 0;
    }

    /**
     * Get available withdrawal amount
     */
    public function getAvailableWithdrawalAmount()
    {
        return max(0, $this->balance);
    }

    /**
     * Get total potential earnings (current balance + pending balance)
     */
    public function getTotalPotentialEarnings()
    {
        return $this->earnings_from_referral + $this->pending_balance;
    }
}
