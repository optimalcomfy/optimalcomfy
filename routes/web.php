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
use App\Http\Controllers\FoodOrderController;
use App\Http\Controllers\FoodOrderItemController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceBookingController;
use App\Http\Controllers\RoomGalleryController;
use App\Http\Controllers\RoomAmenityController;
use App\Http\Controllers\RoomServiceController;
use App\Http\Controllers\RoomFeatureController;

use App\Http\Controllers\CarController;
use App\Http\Controllers\CarBookingController;
use App\Http\Controllers\CarCategoryController;
use App\Http\Controllers\CarFeatureController;
use App\Http\Controllers\CarMediaController;

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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/restaurant', [HomeController::class, 'restaurant'])->name('restaurant');
Route::get('/activity', [HomeController::class, 'activity'])->name('activity');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/event', [HomeController::class, 'event'])->name('event');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::get('/gallery', [HomeController::class, 'gallery'])->name('gallery');
Route::get('/room-detail', [HomeController::class, 'roomDetail'])->name('room-detail');
Route::get('/all-services', [HomeController::class, 'services'])->name('all-services');
Route::get('/all-rooms', [HomeController::class, 'rooms'])->name('all-rooms');
Route::get('/all-cars', [HomeController::class, 'allCars'])->name('all-cars');
Route::get('/search-cars', [HomeController::class, 'searchCars'])->name('search-cars');
Route::get('/rent-now', [HomeController::class, 'rentNow'])->name('rent-now');
Route::get('/car-booking', [HomeController::class, 'carBooking'])->name('car-booking');

Route::get('/joby/{job}', [HomeController::class, 'showJob'])->name('jobShow');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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

    Route::resource('bookings', BookingController::class);
    Route::resource('foods', FoodController::class);
    Route::resource('foodOrders', FoodOrderController::class);

    Route::resource('cars', CarController::class);
    Route::resource('car-bookings', CarBookingController::class);
    Route::resource('car-categories', CarCategoryController::class);
    Route::resource('car-features', CarFeatureController::class);
    Route::resource('car-medias', CarMediaController::class);

    Route::resource('foodOrderItems', FoodOrderItemController::class);
    Route::resource('payments', PaymentController::class);
    Route::resource('reviews', ReviewController::class);
    Route::resource('rooms', RoomController::class);
    Route::resource('services', ServiceController::class);
    Route::resource('serviceBookings', ServiceBookingController::class);
    Route::resource('roomGalleries', RoomGalleryController::class);
    Route::resource('roomAmenities', RoomAmenityController::class);
    Route::resource('roomFeatures', RoomFeatureController::class);
    Route::resource('roomServices', RoomServiceController::class);

    // Add these within your auth middleware group in web.php
    Route::post('/rooms/gallery/store', [RoomGalleryController::class, 'store'])->name('rooms.gallery.store');
    Route::delete('/rooms/gallery/{roomGallery}', [RoomGalleryController::class, 'destroy'])->name('rooms.gallery.destroy');
    Route::get('/rooms/{room}/gallery', [RoomGalleryController::class, 'getByRoom'])->name('rooms.gallery.byRoom');

    Route::post('/rooms/amenities/store', [RoomAmenityController::class, 'store'])->name('rooms.amenities.store');
    Route::delete('/rooms/amenities/{roomAmenity}', [RoomAmenityController::class, 'destroy'])->name('rooms.amenities.destroy');
    Route::get('/rooms/{room}/amenities', [RoomAmenityController::class, 'getByRoom'])->name('rooms.amenities.byRoom');

    Route::post('/rooms/services/store', [RoomServiceController::class, 'store'])->name('rooms.services.store');
    Route::delete('/rooms/services/{roomService}', [RoomServiceController::class, 'destroy'])->name('rooms.services.destroy');
    Route::get('/rooms/{room}/services', [RoomServiceController::class, 'getByRoom'])->name('rooms.services.byRoom');

    Route::post('/rooms/features/store', [RoomFeatureController::class, 'store'])->name('rooms.features.store');
    Route::delete('/rooms/features/{roomFeature}', [RoomFeatureController::class, 'destroy'])->name('rooms.features.destroy');
    Route::get('/rooms/{room}/features', [RoomFeatureController::class, 'getByRoom'])->name('rooms.features.byRoom');

});

Route::resource('employees', EmployeeController::class);
Route::get('/companies/{company}/employees', [EmployeeController::class, 'getEmployeesByCompany'])
    ->name('company.employees');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/uikit/button', function () {
    return Inertia::render('main/uikit/button/page');
})->name('button');





require __DIR__.'/auth.php';
