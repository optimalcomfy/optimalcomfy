<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
use App\Models\Company;
use Illuminate\Support\Facades\Storage;

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
    protected $appends = ['earnings_from_referral', 'balance', 'pending_balance', 'can_add_markup'];

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

    /**
     * Get completed car bookings (checked in AND checked out)
     */
    public function carBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNotNull("checked_out"); // Added this condition
    }

    /**
     * Get completed bookings (checked in AND checked out)
     */
    public function bookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNotNull("checked_out"); // Added this condition
    }

    /**
     * Get pending car bookings where checkin is done but checkout is null (ongoing rentals)
     */
    public function pendingCarBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out"); // Changed to check for ongoing rentals
    }

    /**
     * Get pending bookings where checkin is done but checkout is null (ongoing stays)
     */
    public function pendingBookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out"); // Changed to check for ongoing stays
    }

    /**
     * Get upcoming bookings (not checked in yet)
     */
    public function upcomingBookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNull("checked_in");
    }

    /**
     * Get upcoming car bookings (not checked in yet)
     */
    public function upcomingCarBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
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

        // Calculate earnings from COMPLETED bookings (both checked in AND checked out)
        $bookings = $this->bookings()->get();
        foreach ($bookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $totalEarnings += $earnings;
        }

        // Calculate earnings from COMPLETED car bookings (both checked in AND checked out)
        $carBookings = $this->carBookings()->get();
        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $totalEarnings += $earnings;
        }

        return round($totalEarnings, 2);
    }

    /**
     * Get pending balance from ONGOING bookings (checked in but not checked out)
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

        // Calculate pending earnings from ONGOING bookings (checked in but not checked out)
        $pendingBookings = $this->pendingBookings()->get();
        foreach ($pendingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $totalPendingEarnings += $earnings;
        }

        // Calculate pending earnings from ONGOING car bookings (checked in but not checked out)
        $pendingCarBookings = $this->pendingCarBookings()->get();
        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $totalPendingEarnings += $earnings;
        }

        return round($totalPendingEarnings, 2);
    }

    /**
     * Get upcoming balance from bookings that haven't started yet
     */
    public function getUpcomingBalanceAttribute()
    {
        $totalUpcomingEarnings = 0;

        $company = $this->getFirstCompanyWithReferralPercentage();
        if (!$company || !$company->referral_percentage) {
            return $totalUpcomingEarnings;
        }

        $referralPercentage = $company->referral_percentage;

        // Calculate upcoming earnings from bookings that haven't started
        $upcomingBookings = $this->upcomingBookings()->get();
        foreach ($upcomingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $earnings = ($bookingTotal * $referralPercentage) / 100;
            $totalUpcomingEarnings += $earnings;
        }

        // Calculate upcoming earnings from car bookings that haven't started
        $upcomingCarBookings = $this->upcomingCarBookings()->get();
        foreach ($upcomingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = ($carBookingTotal * $referralPercentage) / 100;
            $totalUpcomingEarnings += $earnings;
        }

        return round($totalUpcomingEarnings, 2);
    }

    /**
     * Get total repayments amount
     */
    public function getTotalRepaymentsAttribute()
    {
        return round($this->repayments()->sum('amount'), 2);
    }

    /**
     * Get balance attribute (earnings from referrals - total repayments)
     */
    public function getBalanceAttribute()
    {
        $earnings = $this->earnings_from_referral;
        $repayments = $this->total_repayments;

        $balance = $earnings - $repayments;
        return round(max(0, $balance), 2); // Ensure balance doesn't go negative
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
                'upcoming_balance' => 0,
                'upcoming_booking_earnings' => 0,
                'upcoming_car_booking_earnings' => 0,
                'total_repayments' => 0,
                'balance' => 0,
                'referral_percentage' => 0,
                'company' => null
            ];
        }

        $referralPercentage = $company->referral_percentage;

        // Use the relationship queries to ensure consistency
        $bookings = $this->bookings()->get();
        $carBookings = $this->carBookings()->get();
        $pendingBookings = $this->pendingBookings()->get();
        $pendingCarBookings = $this->pendingCarBookings()->get();
        $upcomingBookings = $this->upcomingBookings()->get();
        $upcomingCarBookings = $this->upcomingCarBookings()->get();

        $bookingEarnings = 0;
        $carBookingEarnings = 0;
        $pendingBookingEarnings = 0;
        $pendingCarBookingEarnings = 0;
        $upcomingBookingEarnings = 0;
        $upcomingCarBookingEarnings = 0;

        foreach ($bookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $bookingEarnings += ($bookingTotal * $referralPercentage) / 100;
        }

        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $carBookingEarnings += ($carBookingTotal * $referralPercentage) / 100;
        }

        foreach ($pendingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $pendingBookingEarnings += ($bookingTotal * $referralPercentage) / 100;
        }

        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $pendingCarBookingEarnings += ($carBookingTotal * $referralPercentage) / 100;
        }

        foreach ($upcomingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $upcomingBookingEarnings += ($bookingTotal * $referralPercentage) / 100;
        }

        foreach ($upcomingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $upcomingCarBookingEarnings += ($carBookingTotal * $referralPercentage) / 100;
        }

        $totalEarnings = $bookingEarnings + $carBookingEarnings;
        $totalPendingEarnings = $pendingBookingEarnings + $pendingCarBookingEarnings;
        $totalUpcomingEarnings = $upcomingBookingEarnings + $upcomingCarBookingEarnings;
        $totalRepayments = $this->total_repayments;
        $balance = max(0, $totalEarnings - $totalRepayments);

        return [
            'total_earnings' => round($totalEarnings, 2),
            'booking_earnings' => round($bookingEarnings, 2),
            'car_booking_earnings' => round($carBookingEarnings, 2),
            'pending_balance' => round($totalPendingEarnings, 2),
            'pending_booking_earnings' => round($pendingBookingEarnings, 2),
            'pending_car_booking_earnings' => round($pendingCarBookingEarnings, 2),
            'upcoming_balance' => round($totalUpcomingEarnings, 2),
            'upcoming_booking_earnings' => round($upcomingBookingEarnings, 2),
            'upcoming_car_booking_earnings' => round($upcomingCarBookingEarnings, 2),
            'total_repayments' => round($totalRepayments, 2),
            'balance' => round($balance, 2),
            'referral_percentage' => $referralPercentage,
            'company' => $company->name,
            'total_bookings_count' => $bookings->count(),
            'total_car_bookings_count' => $carBookings->count(),
            'pending_bookings_count' => $pendingBookings->count(),
            'pending_car_bookings_count' => $pendingCarBookings->count(),
            'upcoming_bookings_count' => $upcomingBookings->count(),
            'upcoming_car_bookings_count' => $upcomingCarBookings->count(),
            'total_repayments_count' => $this->repayments->count()
        ];
    }

    /**
     * Get financial summary including all balance types
     */
    public function getFinancialSummary()
    {
        $detailedEarnings = $this->getDetailedReferralEarnings();

        return [
            'earnings_from_referrals' => $detailedEarnings['total_earnings'],
            'pending_balance' => $detailedEarnings['pending_balance'],
            'upcoming_balance' => $detailedEarnings['upcoming_balance'],
            'total_repayments' => $detailedEarnings['total_repayments'],
            'balance' => $detailedEarnings['balance'],
            'available_for_withdrawal' => max(0, $detailedEarnings['balance']),
            'total_potential_earnings' => $detailedEarnings['total_earnings'] + $detailedEarnings['pending_balance'] + $detailedEarnings['upcoming_balance'],
            'referral_percentage' => $detailedEarnings['referral_percentage']
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
     * Get total potential earnings (all types of earnings)
     */
    public function getTotalPotentialEarnings()
    {
        $detailed = $this->getDetailedReferralEarnings();
        return $detailed['total_earnings'] + $detailed['pending_balance'] + $detailed['upcoming_balance'];
    }

    /**
     * Check if user is a host
     */
    public function isHost()
    {
        return in_array($this->role_id, [2]); // Role ID 2 is host
    }

    /**
     * Check if user can add markup (must be host - can markup any property/car)
     */
    public function canAddMarkup()
    {
        return $this->isHost();
    }

    /**
     * Accessor for can_add_markup
     */
    public function getCanAddMarkupAttribute()
    {
        return $this->canAddMarkup();
    }

    public function hostedProperties()
    {
        return $this->hasMany(Property::class, 'user_id');
    }

    public function hostedCars()
    {
        return $this->hasMany(Car::class, 'user_id');
    }

    /**
     * Get all markups created by this user
     */
    public function markups()
    {
        return $this->hasMany(Markup::class);
    }
}
