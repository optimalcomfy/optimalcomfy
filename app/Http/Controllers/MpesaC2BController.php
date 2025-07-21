<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaC2BController extends Controller
{
    public function confirmation(Request $request)
    {
        Log::info('C2B Confirmation Received', $request->all());

        // Save transaction details if needed

        return response()->json([
            "ResultCode" => 0,
            "ResultDesc" => "Confirmation Received Successfully"
        ]);
    }

    public function validation(Request $request)
    {
        Log::info('C2B Validation Received', $request->all());

        return response()->json([
            "ResultCode" => 0,
            "ResultDesc" => "Accepted"
        ]);
    }
}
