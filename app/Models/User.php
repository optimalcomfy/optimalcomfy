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
    protected $appends = [
        'earnings_from_referral',
        'earnings_from_markups',
        'total_earnings',
        'balance',
        'pending_balance',
        'pending_markup_earnings',
        'upcoming_markup_earnings',
        'can_add_markup'
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
                    ->whereNotNull("checked_out");
    }

    /**
     * Get completed bookings (checked in AND checked out)
     */
    public function bookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNotNull("checked_out");
    }

    /**
     * Get pending car bookings where checkin is done but checkout is null (ongoing rentals)
     */
    public function pendingCarBookings(){
        return $this->hasMany('App\Models\CarBooking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out");
    }

    /**
     * Get pending bookings where checkin is done but checkout is null (ongoing stays)
     */
    public function pendingBookings(){
        return $this->hasMany('App\Models\Booking', 'referral_code', 'referral_code')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out");
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

    /**
     * Get completed bookings through markups (checked in AND checked out)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function markupBookings()
    {
        return $this->hasMany(Booking::class, 'markup_user_id')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNotNull("checked_out");
    }

    /**
     * Get completed car bookings through markups (checked in AND checked out)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function markupCarBookings()
    {
        return $this->hasMany(CarBooking::class, 'markup_user_id')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNotNull("checked_out");
    }

    /**
     * Get pending markup bookings where checkin is done but checkout is null (ongoing stays)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function pendingMarkupBookings()
    {
        return $this->hasMany(Booking::class, 'markup_user_id')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out");
    }

    /**
     * Get pending markup car bookings where checkin is done but checkout is null (ongoing rentals)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function pendingMarkupCarBookings()
    {
        return $this->hasMany(CarBooking::class, 'markup_user_id')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNotNull("checked_in")
                    ->whereNull("checked_out");
    }

    /**
     * Get upcoming markup bookings (not checked in yet)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function upcomingMarkupBookings()
    {
        return $this->hasMany(Booking::class, 'markup_user_id')
                    ->whereNull("external_booking")
                    ->where("status", "paid")
                    ->whereNull("checked_in");
    }

    /**
     * Get upcoming markup car bookings (not checked in yet)
     * UPDATED: Use markup_user_id instead of markup_id
     */
    public function upcomingMarkupCarBookings()
    {
        return $this->hasMany(CarBooking::class, 'markup_user_id')
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
     * Calculate referral earnings based on platform commission
     */
    protected function calculateReferralEarnings($bookingTotal, $referralPercentage, $platformPercentage = 15)
    {
        // First calculate platform commission
        $platformCommission = ($bookingTotal * $platformPercentage) / 100;

        // Then calculate referral earnings as percentage of platform commission
        $referralEarnings = ($platformCommission * $referralPercentage) / 100;

        return $referralEarnings;
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
            $earnings = $this->calculateReferralEarnings($bookingTotal, $referralPercentage);
            $totalEarnings += $earnings;
        }

        // Calculate earnings from COMPLETED car bookings (both checked in AND checked out)
        $carBookings = $this->carBookings()->get();
        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = $this->calculateReferralEarnings($carBookingTotal, $referralPercentage);
            $totalEarnings += $earnings;
        }

        return round($totalEarnings, 2);
    }

    /**
     * Get earnings from markups attribute - UPDATED to use markup_profit with markup_user_id fallback
     */
    public function getEarningsFromMarkupsAttribute()
    {
        $totalMarkupEarnings = 0;

        // Calculate earnings from COMPLETED markup bookings - using markup_profit which accounts for platform fee
        $markupBookings = $this->markupBookings()->get();
        foreach ($markupBookings as $booking) {
            $totalMarkupEarnings += $booking->markup_profit;
        }

        // Calculate earnings from COMPLETED markup car bookings - using markup_profit which accounts for platform fee
        $markupCarBookings = $this->markupCarBookings()->get();
        foreach ($markupCarBookings as $carBooking) {
            $totalMarkupEarnings += $carBooking->markup_profit;
        }

        return round($totalMarkupEarnings, 2);
    }

    /**
     * Get total earnings (referral + markups)
     */
    public function getTotalEarningsAttribute()
    {
        return $this->earnings_from_referral + $this->earnings_from_markups;
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
            $earnings = $this->calculateReferralEarnings($bookingTotal, $referralPercentage);
            $totalPendingEarnings += $earnings;
        }

        // Calculate pending earnings from ONGOING car bookings (checked in but not checked out)
        $pendingCarBookings = $this->pendingCarBookings()->get();
        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = $this->calculateReferralEarnings($carBookingTotal, $referralPercentage);
            $totalPendingEarnings += $earnings;
        }

        return round($totalPendingEarnings, 2);
    }

    /**
     * Get pending markup earnings from ONGOING bookings - UPDATED to use markup_profit with markup_user_id
     */
    public function getPendingMarkupEarningsAttribute()
    {
        $totalPendingMarkupEarnings = 0;

        // Calculate pending earnings from ONGOING markup bookings
        $pendingMarkupBookings = $this->pendingMarkupBookings()->get();
        foreach ($pendingMarkupBookings as $booking) {
            $totalPendingMarkupEarnings += $booking->markup_profit;
        }

        // Calculate pending earnings from ONGOING markup car bookings
        $pendingMarkupCarBookings = $this->pendingMarkupCarBookings()->get();
        foreach ($pendingMarkupCarBookings as $carBooking) {
            $totalPendingMarkupEarnings += $carBooking->markup_profit;
        }

        return round($totalPendingMarkupEarnings, 2);
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
            $earnings = $this->calculateReferralEarnings($bookingTotal, $referralPercentage);
            $totalUpcomingEarnings += $earnings;
        }

        // Calculate upcoming earnings from car bookings that haven't started
        $upcomingCarBookings = $this->upcomingCarBookings()->get();
        foreach ($upcomingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $earnings = $this->calculateReferralEarnings($carBookingTotal, $referralPercentage);
            $totalUpcomingEarnings += $earnings;
        }

        return round($totalUpcomingEarnings, 2);
    }

    /**
     * Get upcoming markup earnings from bookings that haven't started yet - UPDATED to use markup_profit with markup_user_id
     */
    public function getUpcomingMarkupEarningsAttribute()
    {
        $totalUpcomingMarkupEarnings = 0;

        // Calculate upcoming earnings from markup bookings that haven't started
        $upcomingMarkupBookings = $this->upcomingMarkupBookings()->get();
        foreach ($upcomingMarkupBookings as $booking) {
            $totalUpcomingMarkupEarnings += $booking->markup_profit;
        }

        // Calculate upcoming earnings from markup car bookings that haven't started
        $upcomingMarkupCarBookings = $this->upcomingMarkupCarBookings()->get();
        foreach ($upcomingMarkupCarBookings as $carBooking) {
            $totalUpcomingMarkupEarnings += $carBooking->markup_profit;
        }

        return round($totalUpcomingMarkupEarnings, 2);
    }

    /**
     * Get total repayments amount
     */
    public function getTotalRepaymentsAttribute()
    {
        return round($this->repayments()->sum('amount'), 2);
    }

    /**
     * Get balance attribute (earnings from referrals + markups - total repayments)
     */
    public function getBalanceAttribute()
    {
        $referralEarnings = $this->earnings_from_referral;
        $markupEarnings = $this->earnings_from_markups;
        $repayments = $this->total_repayments;

        $totalEarnings = $referralEarnings + $markupEarnings;
        $balance = $totalEarnings - $repayments;

        return round(max(0, $balance), 2); // Ensure balance doesn't go negative
    }

    /**
     * Alternative method to get detailed earnings breakdown with balance and pending balance
     * UPDATED: All markup relationships now use markup_user_id
     */
    public function getDetailedReferralEarnings()
    {
        $company = $this->getFirstCompanyWithReferralPercentage();

        if (!$company || !$company->referral_percentage) {
            return [
                'total_earnings' => 0,
                'booking_earnings' => 0,
                'car_booking_earnings' => 0,
                'markup_earnings' => 0,
                'markup_booking_earnings' => 0,
                'markup_car_booking_earnings' => 0,
                'pending_balance' => 0,
                'pending_booking_earnings' => 0,
                'pending_car_booking_earnings' => 0,
                'pending_markup_earnings' => 0,
                'upcoming_balance' => 0,
                'upcoming_booking_earnings' => 0,
                'upcoming_car_booking_earnings' => 0,
                'upcoming_markup_earnings' => 0,
                'total_repayments' => 0,
                'balance' => 0,
                'referral_percentage' => 0,
                'platform_percentage' => 15,
                'company' => null
            ];
        }

        $referralPercentage = $company->referral_percentage;
        $platformPercentage = $company->percentage ?? 15;

        // Use the relationship queries to ensure consistency
        $bookings = $this->bookings()->get();
        $carBookings = $this->carBookings()->get();
        $markupBookings = $this->markupBookings()->get();
        $markupCarBookings = $this->markupCarBookings()->get();
        $pendingBookings = $this->pendingBookings()->get();
        $pendingCarBookings = $this->pendingCarBookings()->get();
        $pendingMarkupBookings = $this->pendingMarkupBookings()->get();
        $pendingMarkupCarBookings = $this->pendingMarkupCarBookings()->get();
        $upcomingBookings = $this->upcomingBookings()->get();
        $upcomingCarBookings = $this->upcomingCarBookings()->get();
        $upcomingMarkupBookings = $this->upcomingMarkupBookings()->get();
        $upcomingMarkupCarBookings = $this->upcomingMarkupCarBookings()->get();

        $bookingEarnings = 0;
        $carBookingEarnings = 0;
        $markupBookingEarnings = 0;
        $markupCarBookingEarnings = 0;
        $pendingBookingEarnings = 0;
        $pendingCarBookingEarnings = 0;
        $pendingMarkupBookingEarnings = 0;
        $pendingMarkupCarBookingEarnings = 0;
        $upcomingBookingEarnings = 0;
        $upcomingCarBookingEarnings = 0;
        $upcomingMarkupBookingEarnings = 0;
        $upcomingMarkupCarBookingEarnings = 0;

        foreach ($bookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $bookingEarnings += $this->calculateReferralEarnings($bookingTotal, $referralPercentage, $platformPercentage);
        }

        foreach ($carBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $carBookingEarnings += $this->calculateReferralEarnings($carBookingTotal, $referralPercentage, $platformPercentage);
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($markupBookings as $booking) {
            $markupBookingEarnings += $booking->markup_profit;
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($markupCarBookings as $carBooking) {
            $markupCarBookingEarnings += $carBooking->markup_profit;
        }

        foreach ($pendingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $pendingBookingEarnings += $this->calculateReferralEarnings($bookingTotal, $referralPercentage, $platformPercentage);
        }

        foreach ($pendingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $pendingCarBookingEarnings += $this->calculateReferralEarnings($carBookingTotal, $referralPercentage, $platformPercentage);
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($pendingMarkupBookings as $booking) {
            $pendingMarkupBookingEarnings += $booking->markup_profit;
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($pendingMarkupCarBookings as $carBooking) {
            $pendingMarkupCarBookingEarnings += $carBooking->markup_profit;
        }

        foreach ($upcomingBookings as $booking) {
            $bookingTotal = $booking->total_price ?? 0;
            $upcomingBookingEarnings += $this->calculateReferralEarnings($bookingTotal, $referralPercentage, $platformPercentage);
        }

        foreach ($upcomingCarBookings as $carBooking) {
            $carBookingTotal = $carBooking->total_price ?? 0;
            $upcomingCarBookingEarnings += $this->calculateReferralEarnings($carBookingTotal, $referralPercentage, $platformPercentage);
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($upcomingMarkupBookings as $booking) {
            $upcomingMarkupBookingEarnings += $booking->markup_profit;
        }

        // UPDATED: Use markup_profit with markup_user_id fallback
        foreach ($upcomingMarkupCarBookings as $carBooking) {
            $upcomingMarkupCarBookingEarnings += $carBooking->markup_profit;
        }

        $totalReferralEarnings = $bookingEarnings + $carBookingEarnings;
        $totalMarkupEarnings = $markupBookingEarnings + $markupCarBookingEarnings;
        $totalEarnings = $totalReferralEarnings + $totalMarkupEarnings;
        $totalPendingReferralEarnings = $pendingBookingEarnings + $pendingCarBookingEarnings;
        $totalPendingMarkupEarnings = $pendingMarkupBookingEarnings + $pendingMarkupCarBookingEarnings;
        $totalPendingEarnings = $totalPendingReferralEarnings + $totalPendingMarkupEarnings;
        $totalUpcomingReferralEarnings = $upcomingBookingEarnings + $upcomingCarBookingEarnings;
        $totalUpcomingMarkupEarnings = $upcomingMarkupBookingEarnings + $upcomingMarkupCarBookingEarnings;
        $totalUpcomingEarnings = $totalUpcomingReferralEarnings + $totalUpcomingMarkupEarnings;
        $totalRepayments = $this->total_repayments;
        $balance = max(0, $totalEarnings - $totalRepayments);

        return [
            'total_earnings' => round($totalEarnings, 2),
            'referral_earnings' => round($totalReferralEarnings, 2),
            'booking_earnings' => round($bookingEarnings, 2),
            'car_booking_earnings' => round($carBookingEarnings, 2),
            'markup_earnings' => round($totalMarkupEarnings, 2),
            'markup_booking_earnings' => round($markupBookingEarnings, 2),
            'markup_car_booking_earnings' => round($markupCarBookingEarnings, 2),
            'pending_balance' => round($totalPendingEarnings, 2),
            'pending_referral_earnings' => round($totalPendingReferralEarnings, 2),
            'pending_booking_earnings' => round($pendingBookingEarnings, 2),
            'pending_car_booking_earnings' => round($pendingCarBookingEarnings, 2),
            'pending_markup_earnings' => round($totalPendingMarkupEarnings, 2),
            'upcoming_balance' => round($totalUpcomingEarnings, 2),
            'upcoming_referral_earnings' => round($totalUpcomingReferralEarnings, 2),
            'upcoming_booking_earnings' => round($upcomingBookingEarnings, 2),
            'upcoming_car_booking_earnings' => round($upcomingCarBookingEarnings, 2),
            'upcoming_markup_earnings' => round($totalUpcomingMarkupEarnings, 2),
            'total_repayments' => round($totalRepayments, 2),
            'balance' => round($balance, 2),
            'referral_percentage' => $referralPercentage,
            'platform_percentage' => $platformPercentage,
            'company' => $company->name,
            'total_bookings_count' => $bookings->count() + $carBookings->count(),
            'total_markup_bookings_count' => $markupBookings->count() + $markupCarBookings->count(),
            'pending_bookings_count' => $pendingBookings->count() + $pendingCarBookings->count(),
            'pending_markup_bookings_count' => $pendingMarkupBookings->count() + $pendingMarkupCarBookings->count(),
            'upcoming_bookings_count' => $upcomingBookings->count() + $upcomingCarBookings->count(),
            'upcoming_markup_bookings_count' => $upcomingMarkupBookings->count() + $upcomingMarkupCarBookings->count(),
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
            'earnings_from_referrals' => $detailedEarnings['referral_earnings'],
            'earnings_from_markups' => $detailedEarnings['markup_earnings'],
            'total_earnings' => $detailedEarnings['total_earnings'],
            'pending_balance' => $detailedEarnings['pending_balance'],
            'pending_referral_earnings' => $detailedEarnings['pending_referral_earnings'],
            'pending_markup_earnings' => $detailedEarnings['pending_markup_earnings'],
            'upcoming_balance' => $detailedEarnings['upcoming_balance'],
            'upcoming_referral_earnings' => $detailedEarnings['upcoming_referral_earnings'],
            'upcoming_markup_earnings' => $detailedEarnings['upcoming_markup_earnings'],
            'total_repayments' => $detailedEarnings['total_repayments'],
            'balance' => $detailedEarnings['balance'],
            'available_for_withdrawal' => max(0, $detailedEarnings['balance']),
            'total_potential_earnings' => $detailedEarnings['total_earnings'] + $detailedEarnings['pending_balance'] + $detailedEarnings['upcoming_balance'],
            'referral_percentage' => $detailedEarnings['referral_percentage'],
            'platform_percentage' => $detailedEarnings['platform_percentage']
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
