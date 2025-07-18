<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\WithdrawalController;

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

Route::post('/mpesa/stk/initiate', [MpesaStkController::class, 'initiatePayment']);
Route::post('/mpesa/stk/callback', [MpesaStkController::class, 'handleCallback']);