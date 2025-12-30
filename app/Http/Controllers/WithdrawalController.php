<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanRequest;
use App\Http\Requests\UpdateLoanRequest;
use App\Models\Loan;
use App\Models\Employee;
use App\Models\User;
use App\Models\Remittance;
use App\Models\Company;
use App\Models\Repayment;
use App\Models\LoanProvider;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Mail\LoanRequestMail;

use App\Mail\LoanApprovalMail;
use App\Mail\LoanDeclinedMail;
use App\Mail\LoanDisbursementFailureMail;
use Illuminate\Support\Facades\Mail;

use App\Mail\LoanRepaymentMail;
use App\Mail\EmployeeAdvanceRequestMail;
use App\Mail\LoanOtpMail;
use Carbon\Carbon;

use App\Services\MpesaService;
use Illuminate\Support\Facades\Log;

use App\Services\SmsService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

use Illuminate\Http\JsonResponse;


class WithdrawalController extends Controller
{

    protected $mpesaService;
    protected $smsService;

    public function __construct(MpesaService $mpesaService = null, SmsService $smsService = null)
    {
        $this->mpesaService = $mpesaService;
        $this->smsService = $smsService;
    }

    public function waitingPage()
    {
        // Clear any cached data
        \Cache::forget('withdrawal_repayment_' . auth()->id());
        
        // Get the latest repayment FORCE fresh from database
        $repayment = \App\Models\Repayment::where('user_id', auth()->id())
            ->latest('updated_at')
            ->first();
        
        \Log::info('WaitingForCallback - Fresh repayment data:', [
            'user_id' => auth()->id(),
            'repayment_id' => $repayment ? $repayment->id : null,
            'status' => $repayment ? $repayment->status : 'none',
            'amount' => $repayment ? $repayment->amount : 0,
            'updated_at' => $repayment ? $repayment->updated_at : null,
        ]);
        
        if (!$repayment) {
            return redirect()->route('wallet');
        }
        
        // If already approved, show success immediately
        if ($repayment->status === 'Approved') {
            \Log::info('Repayment already approved, showing success');
        }
        
        return Inertia::render('Wallet/WaitingForCallback', [
            'amount' => $repayment->amount,
            'repayment' => $repayment, // This should now show "Approved"
        ]);
    }

    public function processDisbursement(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'verification_code' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $input = $request->all();
        $verificationCode = $request->verification_code;

        $amount = (int) $input['amount'];

        if (! $user->validateWithdrawalCode($verificationCode)) {
            return back()->with([
                'flash' => [
                    'error' => 'Invalid or expired verification code.',
                ],
            ]);
        }

        DB::beginTransaction();
        try {
            $phone = $user->phone;

            // Create repayment record
            $repayment = Repayment::create([
                'amount' => $amount,
                'payment_date' => now(),
                'user_id' => $user->id,
                'status'=> 'Pending'
            ]);

            // Use user ID instead of loan ID
            $response = $this->mpesaService->sendB2CPayment($phone, $amount, $repayment->id);

            DB::commit();

            // Redirect to waiting page instead of back
            return Inertia::render('Wallet/WaitingForCallback', [
                'amount' => $amount,
                'repayment' => $repayment
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Disbursement failed:', ['error' => $e->getMessage()]);

            return back()->with([
                'flash' => [
                    'error' => 'Disbursement failed: ' . $e->getMessage(),
                ],
            ]);
        }
    }

    public function handleTimeout(Request $request)
    {
        Log::warning('M-Pesa Timeout Callback:', $request->all());

        return response()->json(['message' => 'Timeout callback received'], 200);
    }

    public function handleMpesaCallback(Request $request)
    {
        Log::info('B2C Callback Received: ', $request->all());

        $callbackData = $request->all();

        // Extract repayment ID from the callback - adjust this based on your M-Pesa callback structure
        $repaymentId = null;

        // Try different possible locations for the repayment ID
        if (isset($callbackData['Result']['ResultParameters']['ResultParameter'])) {
            $content = $callbackData['Result']['ResultParameters']['ResultParameter'];
            foreach ($content as $row) {
                if (isset($row['Key']) && $row['Key'] === 'TransactionReceipt' || $row['Key'] === 'TransactionID') {
                    // You might need to map this to your repayment ID differently
                    // This depends on how you structure the conversation ID in your B2C request
                    $repaymentId = $this->extractRepaymentIdFromConversationId($row['Value']);
                    break;
                }
            }
        }

        // Alternative: if you passed repayment ID as loanId in the initial request
        if (!$repaymentId && isset($callbackData['loanId'])) {
            $repaymentId = $callbackData['loanId'];
        }

        if ($repaymentId) {
            $repayment = Repayment::find($repaymentId);

            if ($repayment) {
                $result = $callbackData['Result'];
                $resultCode = $result['ResultCode'] ?? null;
                $resultDesc = $result['ResultDesc'] ?? 'No description';

                if ($resultCode == 0 || $resultCode == '0') {
                    $repayment->update(['status' => 'Approved']);
                    Log::info('Withdrawal approved for repayment ID: ' . $repaymentId);
                } else {
                    $repayment->update(['status' => 'Failed']);
                    Log::error('Withdrawal failed for repayment ID: ' . $repaymentId . ' - ' . $resultDesc);
                }

                // Return JSON response for M-Pesa callback
                return response()->json([
                    'ResultCode' => 0,
                    'ResultDesc' => 'Callback processed successfully'
                ], 200);
            } else {
                Log::warning('Repayment not found for ID: ' . $repaymentId);
            }
        } else {
            Log::warning('No repayment ID found in callback');
        }

        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Callback received'
        ], 200);
    }

    /**
     * Extract repayment ID from M-Pesa conversation ID
     * This depends on how you format the conversation ID in your MpesaService
     */
    private function extractRepaymentIdFromConversationId($conversationId)
    {
        // Example: if you format conversation ID as "repayment_{id}_timestamp"
        if (preg_match('/repayment_(\d+)_/', $conversationId, $matches)) {
            return $matches[1];
        }

        // Alternative: if you use the repayment ID directly as conversation ID
        return is_numeric($conversationId) ? $conversationId : null;
    }

    public function checkWithdrawalStatus(Request $request)
    {
        $user = Auth::user();
        $repaymentId = $request->repayment_id;

        $repayment = Repayment::where('id', $repaymentId)
            ->where('user_id', $user->id)
            ->first();

        if (!$repayment) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'Withdrawal not found'
            ], 404);
        }

        return response()->json([
            'status' => $repayment->status,
            'repayment' => $repayment
        ]);
    }

    public function initiateWithdrawal(Request $request, SmsService $smsService)
    {
        $user = Auth::user();
        $verificationCode = $user->generateWithdrawalCode();

        try {
            $smsService->sendSms(
                $user->phone,
                "Your withdrawal verification code is: {$verificationCode}. It expires in 10 minutes."
            );

            return back()->with([
                'flash' => [
                    'success' => 'Verification code sent to your phone',
                    'requires_verification' => true,
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('SMS sending failed: ' . $e->getMessage());

            return back()->with([
                'flash' => [
                    'error' => 'Failed to send verification code. Please try again.'
                ],
            ]);
        }
    }

    public function resendVerificationCode(Request $request, SmsService $smsService)
    {
        $user = Auth::user();

        $verificationCode = $user->generateWithdrawalCode();

        try {
            $smsService->sendSms(
                $user->phone,
                "Your new withdrawal verification code is: {$verificationCode}. It expires in 10 minutes."
            );

            return back()->with([
                'flash' => [
                    'success' => 'New verification code sent to your phone',
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('SMS resend failed: ' . $e->getMessage());

            return back()->with([
                'flash' => [
                    'error' => 'Failed to send verification code. Please try again.',
                ],
            ]);
        }
    }

    public function verifyAndWithdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'verification_code' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $amount = $request->amount;
        $verificationCode = $request->verification_code;

        if (! $user->validateWithdrawalCode($verificationCode)) {
            return back()->with([
                'flash' => [
                    'error' => 'Invalid or expired verification code.',
                ],
            ]);
        }

        DB::beginTransaction();
        try {
            $phone = $user->phone;

            // Create repayment record
            $repayment = Repayment::create([
                'amount' => $amount,
                'payment_date' => now(),
                'user_id' => $user->id,
                'status' => 'Pending'
            ]);

            // Use M-Pesa service to initiate payment
            $response = $this->mpesaService->sendB2CPayment($phone, $amount, $repayment->id);

            // Clear the verification code
            $user->clearWithdrawalCode();

            DB::commit();

            // Redirect to waiting page
            return Inertia::render('Wallet/WaitingForCallback', [
                'amount' => $amount,
                'repayment' => $repayment
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Withdrawal processing failed: ' . $e->getMessage());

            return back()->with([
                'flash' => [
                    'error' => 'Withdrawal processing failed: ' . $e->getMessage(),
                ],
            ]);
        }
    }
}
