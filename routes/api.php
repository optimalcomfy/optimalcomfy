<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\MpesaStkController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CarBookingController;
use App\Http\Controllers\RefundController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/pesapal/confirm/{user_id}/{booking_type}/{booking_id}/{cycle}', [PesapalController::class, 'verifyPayment']);

Route::post('/mpesa/result', [WithdrawalController::class, 'handleMpesaCallback']);


Route::post('/mpesa/timeout', [WithdrawalController::class, 'handleTimeout'])->name('mpesa.timeout');

Route::post('/mpesa/stk/callback', [BookingController::class, 'handleCallback']);

Route::post('/mpesa/ride/stk/callback', [CarBookingController::class, 'handleCallback']);


 Route::post('/callback', [RefundController::class, 'handleRefundCallback'])
         ->name('api.refund.callback');
    
Route::prefix('refund')->group(function () {
    Route::post('/callback', [RefundController::class, 'handleRefundCallback'])
         ->name('api.refund.callback');
    
    Route::post('/timeout', function (Request $request) {
        \Log::channel('refunds')->info('Refund Timeout Callback:', $request->all());
        return response()->json(['message' => 'Timeout callback received'], 200);
    })->name('api.refund.timeout');
});