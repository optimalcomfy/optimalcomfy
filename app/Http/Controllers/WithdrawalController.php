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


    public function processDisbursement(Request $request)
    {
        $user = Auth::user();
        $input = $request->all();
        
        $amount = (int) $input['amount']; // Ensure this is sent in the request
        
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
            
            // Return Inertia response instead of JSON
            return redirect()->back()->with('success', 'Withdrawal initiated successfully');
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Disbursement failed:', ['error' => $e->getMessage()]);
            
            // Return Inertia response with error
            return redirect()->back()->withErrors(['error' => 'Disbursement failed: ' . $e->getMessage()]);
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
    
        $repaymentId = $request->input('loanId');
    
        if ($repaymentId) {
            $repayment = Repayment::find($repaymentId);
    
            if ($repayment) {
                $result = $request->json('Result');
                $resultCode = $result['ResultCode'] ?? null;
                $resultDesc = $result['ResultDesc'] ?? 'No description';
    
                $content = $result['ResultParameters']['ResultParameter'] ?? [];
                $data = [];
    
                foreach ($content as $row) {
                    $data[$row['Key']] = $row['Value'];
                }
    
                Log::info('data: ', $data);
    
                if ($resultCode == 0) {
                    $repayment->update(['status' => 'Approved']);

                    $repayment->refresh()->load(['user']);
    
                    return Inertia::render('Repayments/Approval', [
                        'repayment' => $repayment,
                        'repaymentFailure'=> $repayment->status != 'Approved' ? 'The disbursement failed. Please contact Centiflow for assistance.' : 'The disbursement was successful!',
                    ]);
                } else {
 
                    $repayment->update(['status' => 'Failed']);
    
                    return Inertia::render('Repayments/Approval', [
                        'repayment' => $repayment,
                        'repaymentFailure'=> $repayment->status != 'Approved' ? 'The disbursement failed. Please contact Centiflow for assistance.' : 'The disbursement was successful!',
                    ]);
                }
            } else {
                Log::warning('Repayment not found for ID: ' . $repaymentId);
            }
        } else {
            Log::warning('No repayment Id found in callback');
        }
    
        $repayment->refresh()->load(['user']);
    
        return Inertia::render('Repayments/Approval', [
            'repayment' => $repayment,
            'repaymentFailure'=> $repayment->status != 'Approved' ? 'The disbursement failed. Please contact Centiflow for assistance.' : 'The disbursement was successful!',
        ]);
    }
    
}