<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request; // Add this import

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanProviderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RepaymentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\HomeController;

use App\Http\Controllers\BookingController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\FoodOrderController;
use App\Http\Controllers\FoodOrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceBookingController;
use App\Http\Controllers\PropertyGalleryController;
use App\Http\Controllers\PropertyAmenityController;
use App\Http\Controllers\AmenityController;
use App\Http\Controllers\PropertyServiceController;
use App\Http\Controllers\PropertyFeatureController;

use App\Http\Controllers\CarBookingController;
use App\Http\Controllers\CarCategoryController;
use App\Http\Controllers\CarFeatureController;
use App\Http\Controllers\CarMediaController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\VariationController;
use App\Http\Controllers\MpesaStkController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\CarRefundController;
use App\Http\Controllers\MarkupBookingController;
use Illuminate\Support\Facades\Auth;

use App\Models\Property;
use App\Models\User;
use App\Services\PesapalService;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::post('/send-comment', [ProfileController::class, 'sendComment'])->name('profile.sendComment');



Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/welcome', [HomeController::class, 'index'])->name('welcome');
Route::get('/list-property', [HomeController::class, 'listProperty'])->name('list-property');
Route::get('/properties/load-more', [HomeController::class, 'loadMore'])->name('properties.load-more');
Route::get('/restaurant', [HomeController::class, 'restaurant'])->name('restaurant');
Route::get('/activity', [HomeController::class, 'activity'])->name('activity');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/event', [HomeController::class, 'event'])->name('event');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::get('/gallery', [HomeController::class, 'gallery'])->name('gallery');
Route::get('/property-detail', [HomeController::class, 'propertyDetail'])->name('property-detail');
Route::get('/all-services', [HomeController::class, 'services'])->name('all-services');
Route::get('/all-properties', [HomeController::class, 'properties'])->name('all-properties');
Route::get('/all-cars', [HomeController::class, 'allCars'])->name('all-cars');
Route::get('/search-cars', [HomeController::class, 'searchCars'])->name('search-cars');
Route::get('/rent-now', [HomeController::class, 'rentNow'])->name('rent-now');
Route::get('/car-booking', [HomeController::class, 'carBooking'])->name('car-booking');
Route::get('/property-booking', [HomeController::class, 'propertyBooking'])->name('property-booking');
Route::get('/host-calendar-policy', [HomeController::class, 'hostCalendarPolicy'])->name('host-calendar-policy');
Route::get('/privacy-policy', [HomeController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/terms-and-conditions', [HomeController::class, 'termsAndConditions'])->name('terms-and-conditions');

Route::get('/joby/{job}', [HomeController::class, 'showJob'])->name('jobShow');

Route::get('/locations','App\Http\Controllers\LocationController@locations');

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/reload', [ProfileController::class, 'reload'])->name('profile.reload');

    Route::get('/wallet', [HomeController::class, 'hostWallet'])->name('wallet');

    Route::resource('companies', CompanyController::class);
    Route::get('/companies/list', [CompanyController::class, 'list'])->name('companies.list');


    Route::resource('loans', LoanController::class);
    Route::get('/loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approval');
    Route::post('/loans/{loan}/loanApproval', [LoanController::class, 'approveLoan'])->name('loans.approveLoan');
    Route::post('/loans/bulk-update', [LoanController::class, 'bulkUpdate'])->name('loans.bulkUpdate');
    Route::resource('loanProviders', LoanProviderController::class);
    Route::resource('notifications', NotificationController::class);
    Route::resource('repayments', RepaymentController::class);
    Route::resource('users', UserController::class);
    Route::resource('jobs', JobController::class);
    Route::resource('applications', ApplicationController::class);

    Route::post('/bookings/{booking}/handle-refund', [RefundController::class, 'handleRefund'])
    ->name('bookings.handle-refund');

    Route::post('/car-bookings/{car_booking}/refund', [CarRefundController::class, 'handleRefund'])
    ->name('car-bookings.handle-refund');

    Route::put('/stay-bookings-cancel', [BookingController::class, 'cancel'])
    ->name('stay-bookings.cancel');

    Route::get('/bookings/export-data', [BookingController::class, 'exportData'])
        ->name('bookings.exportData');
    Route::resource('bookings', BookingController::class);
    Route::post('/bookings/add', [BookingController::class, 'add'])->name('bookings.add');

    Route::resource('foods', FoodController::class);
    Route::resource('foodOrders', FoodOrderController::class);

    Route::get('/main-cars/export-data', [CarController::class, 'exportData'])->name('main-cars.exportData');
    Route::resource('main-cars', CarController::class)->parameters([
        'main-cars' => 'car'
    ]);

    Route::put('/car-bookings/{booking}/cancel', [CarBookingController::class, 'cancel'])
    ->name('car-bookings.cancel');
    Route::get('/car-bookings/export-data', [CarBookingController::class, 'exportData'])
        ->name('car-bookings.exportData');
    Route::resource('car-bookings', CarBookingController::class);
    Route::post('/car-bookings/add', [CarBookingController::class, 'add'])->name('car-bookings.add');
    Route::resource('car-categories', CarCategoryController::class);
    Route::resource('carFeatures', CarFeatureController::class);
    Route::resource('carMedias', CarMediaController::class);

    Route::get('/api/car-media/by-car/{carId}', [CarMediaController::class, 'getByCar']);

    Route::resource('foodOrderItems', FoodOrderItemController::class);
    Route::get('/payments/export-data', [PaymentController::class, 'exportData'])->name('payments.exportData');
    Route::resource('payments', PaymentController::class);
    Route::resource('reviews', ReviewController::class);
    Route::get('/properties/export-data', [PropertyController::class, 'exportData'])->name('properties.exportData');
    Route::resource('properties', PropertyController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('serviceBookings', ServiceBookingController::class);
    Route::resource('propertyGalleries', PropertyGalleryController::class);
    Route::resource('propertyVariations', VariationController::class);
    Route::resource('propertyAmenities', PropertyAmenityController::class);
    Route::resource('amenities', AmenityController::class);
    Route::resource('propertyFeatures', PropertyFeatureController::class);
    Route::resource('PropertyServices', PropertyServiceController::class);

    // Add these within your auth middleware group in web.php
    Route::post('/properties/gallery/store', [PropertyGalleryController::class, 'store'])->name('properties.gallery.store');
    Route::delete('/properties/gallery/{propertyGallery}', [PropertyGalleryController::class, 'destroy'])->name('properties.gallery.destroy');
    Route::get('/properties/{property}/gallery', [PropertyGalleryController::class, 'getByProperty'])->name('properties.gallery.byProperty');

    Route::post('/properties/variation/store', [VariationController::class, 'store'])->name('properties.variation.store');
    Route::delete('/properties/variation/{propertyVariation}', [VariationController::class, 'destroy'])->name('properties.variation.destroy');
    Route::get('/properties/{variation}/variation', [VariationController::class, 'getByProperty'])->name('properties.variation.byProperty');

    Route::post('/properties/amenities/store', [PropertyAmenityController::class, 'store'])->name('properties.amenities.store');
    Route::delete('/properties/amenities/{propertyAmenity}', [PropertyAmenityController::class, 'destroy'])->name('properties.amenities.destroy');
    Route::get('/properties/{property}/amenities', [PropertyAmenityController::class, 'getByProperty'])->name('properties.amenities.byProperty');

    Route::post('/properties/services/store', [PropertyServiceController::class, 'store'])->name('properties.services.store');
    Route::delete('/properties/services/{PropertyService}', [PropertyServiceController::class, 'destroy'])->name('properties.services.destroy');
    Route::get('/properties/{property}/services', [PropertyServiceController::class, 'getByProperty'])->name('properties.services.byProperty');

    Route::post('/properties/features/store', [PropertyFeatureController::class, 'store'])->name('properties.features.store');
    Route::delete('/properties/features/{propertyFeature}', [PropertyFeatureController::class, 'destroy'])->name('properties.features.destroy');
    Route::get('/properties/{property}/features', [PropertyFeatureController::class, 'getByProperty'])->name('properties.features.byProperty');

    Route::post('/withdraw', [WithdrawalController::class, 'processDisbursement'])->name('withdraw');

    Route::get('/withdrawal/waiting', [WithdrawalController::class, 'waitingPage'])->name('withdrawal.waiting');

    Route::post('/withdraw/initiate', [WithdrawalController::class, 'initiateWithdrawal'])->name('withdraw.initiate');
    Route::post('/withdraw/verify', [WithdrawalController::class, 'verifyAndWithdraw'])->name('withdraw.verify');
    Route::post('/withdraw/resend-code', [WithdrawalController::class, 'resendVerificationCode'])->name('withdraw.resend-code');

    Route::get('/books/lookup', [BookingController::class, 'lookup'])->name('bookings.lookup');

    Route::post('/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
    Route::post('/{user}/unverify', [UserController::class, 'unverify'])->name('users.unverify');

    Route::get('/validate-referral', function (Request $request) {
        $code = $request->query('code');
        $currentUser = Auth::user();

        if (!$code) {
            return response()->json(['valid' => false]);
        }

        // Check if the referral code belongs to the current user
        if ($currentUser && $currentUser->referral_code === $code) {
            return response()->json([
                'valid' => false,
                'message' => 'You cannot use your own referral code'
            ]);
        }

        $referralUser = User::where('referral_code', $code)->first();

        if ($referralUser) {
            return response()->json([
                'valid' => true,
                'user' => [
                    'id' => $referralUser->id,
                    'name' => $referralUser->name,
                    'email' => $referralUser->email
                ]
            ]);
        }

        return response()->json(['valid' => false]);
    });

});

Route::middleware('auth')->post('/pesapal/initiate', [PesapalController::class, 'initiatePayment'])->name('pesapal.initiate');


Route::resource('employees', EmployeeController::class);
Route::get('/companies/{company}/employees', [EmployeeController::class, 'getEmployeesByCompany'])
    ->name('company.employees');

Route::get('/uikit/button', function () {
    return Inertia::render('main/uikit/button/page');
})->name('button');


Route::get('/booking/success', function () {
    return view('success');
})->name('bookings.success');

Route::get('/booking/failed', function () {
    return view('failed');
})->name('bookings.failed');

Route::post('/mpesa/stk/initiate', [MpesaStkController::class, 'initiatePayment']);

Route::get('/booking/{booking}/payment-pending', [BookingController::class, 'paymentPending'])
    ->name('booking.payment.pending');


Route::get('/api/booking/{booking}/payment-status', [BookingController::class, 'paymentStatus'])
    ->name('booking.payment.status');


Route::get('/ride/{booking}/payment-pending', [CarBookingController::class, 'paymentPending'])
    ->name('ride.payment.pending');


Route::get('/api/ride/{booking}/payment-status', [CarBookingController::class, 'paymentStatus'])
    ->name('ride.payment.status');

Route::get('/test-ristay-sender', function () {
    $smsService = app(App\Services\SmsService::class);

    $result = $smsService->sendSms('254743630811', 'Test message with RISTAY sender ID');

    Log::info('RISTAY Sender Test Result', $result);
    return response()->json($result);
});


Route::post('/pesapal/callback', [BookingController::class, 'handlePesapalCallback'])->name('pesapal.callback');
Route::post('/api/pesapal/notification', [BookingController::class, 'handlePesapalNotification'])->name('pesapal.notification');
Route::get('/booking/{booking}/payment/success', [BookingController::class, 'paymentSuccess'])->name('booking.payment.success');
Route::get('/booking/{booking}/payment/cancelled', [BookingController::class, 'paymentCancelled'])->name('booking.payment.cancelled');


Route::middleware(['auth'])->group(function () {
    // Markup management routes
    Route::get('/my-markups', [MarkupBookingController::class, 'index'])->name('markup.index');
    Route::get('/user/markups', [MarkupBookingController::class, 'getUserMarkups'])->name('markup.user.markups');
    Route::post('/markups', [MarkupBookingController::class, 'addMarkup'])->name('markup.add');
    Route::delete('/markups/{markupId}', [MarkupBookingController::class, 'removeMarkup'])->name('markup.remove');
    Route::get('/markup-stats', [MarkupBookingController::class, 'getMarkupStats'])->name('markup.stats');

    // Browse routes
    Route::get('/markup/browse/properties', [MarkupBookingController::class, 'browseProperties'])->name('markup.browse.properties');
    Route::get('/markup/browse/cars', [MarkupBookingController::class, 'browseCars'])->name('markup.browse.cars');
});

Route::get('/debug-pesapal', function (PesapalService $pesapalService) {
    $token = $pesapalService->getToken(true);

    if (!$token) {
        return response()->json(['error' => 'Failed to get token']);
    }

    // Get registered IPNs
    $ipns = $pesapalService->getRegisteredIPNs($token);

    return response()->json([
        'token_info' => $pesapalService->getTokenInfo(),
        'registered_ipns' => $ipns,
        'config' => [
            'notification_url' => config('services.pesapal.notification_url'),
            'callback_url' => config('services.pesapal.callback_url'),
        ]
    ]);
});

// Add this to your routes/web.php
Route::get('/register-pesapal-ipn', function (PesapalService $pesapalService) {
    $token = $pesapalService->getToken(true);

    if (!$token) {
        return response()->json(['error' => 'Failed to get token']);
    }

    $ipnUrl = config('services.pesapal.notification_url');
    $ipnId = $pesapalService->registerIPN($token, $ipnUrl);

    if ($ipnId) {
        return response()->json([
            'success' => true,
            'ipn_id' => $ipnId,
            'ipn_url' => $ipnUrl,
            'message' => 'IPN registered successfully'
        ]);
    }

    return response()->json(['error' => 'Failed to register IPN']);
});

// Markup booking routes
Route::get('/markup-booking/{token}', [MarkupBookingController::class, 'showMarkupBooking'])->name('markup.booking.show');
Route::post('/markup-booking/{token}', [MarkupBookingController::class, 'processMarkupBooking'])->name('markup.booking.process');
Route::get('/check-user-exists', [MarkupBookingController::class, 'checkUserExists']);

require __DIR__.'/auth.php';
