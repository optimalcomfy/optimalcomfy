<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

    Route::get('/books/lookup', [BookingController::class, 'lookup'])->name('bookings.lookup');
});

// Route to initiate the payment (usually triggered by a logged-in user)
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

require __DIR__.'/auth.php';
