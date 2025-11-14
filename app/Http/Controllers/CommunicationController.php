<?php

namespace App\Http\Controllers;

use App\Models\CommunicationTemplate;
use App\Models\BulkCommunication;
use App\Models\CommunicationLog;
use App\Models\User;
use App\Services\SmsService;
use App\Services\EmailService;
use App\Services\CommunicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    protected $smsService;
    protected $emailService;
    protected $communicationService;

    public function __construct(SmsService $smsService, EmailService $emailService, CommunicationService $communicationService)
    {
        $this->smsService = $smsService;
        $this->emailService = $emailService;
        $this->communicationService = $communicationService;
    }

    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $templates = CommunicationTemplate::when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('sms_content', 'like', "%{$search}%");
        })->get();

        $campaigns = BulkCommunication::with(['template', 'creator'])
            ->when($search, function ($query, $search) {
                $query->whereHas('template', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $users = User::all();

        return Inertia::render('Communications/Index', [
            'templates' => $templates,
            'campaigns' => $campaigns,
            'availableVariables' => CommunicationTemplate::getAvailableVariables(),
            'users' => $users
        ]);
    }

    public function createTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'sms_content' => 'nullable|string',
            'email_content' => 'nullable|string',
            'type' => 'required|in:booking_confirmation,payment_reminder,checkin_reminder,checkout_reminder,promotional,custom',
            'target_audience' => 'required|in:guests,hosts,both,custom'
        ]);

        $template = CommunicationTemplate::create($request->all());

        return redirect()->back()->with('success', 'Template created successfully.');
    }

    public function updateTemplate(Request $request, CommunicationTemplate $template)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'nullable|string|max:255',
            'sms_content' => 'nullable|string',
            'email_content' => 'nullable|string',
            'type' => 'required|in:booking_confirmation,payment_reminder,checkin_reminder,checkout_reminder,promotional,custom',
            'target_audience' => 'required|in:guests,hosts,both,custom',
            'is_active' => 'boolean'
        ]);

        $template->update($request->all());

        return redirect()->back()->with('success', 'Template updated successfully.');
    }

    public function createBulkCommunication(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:communication_templates,id',
            'subject' => 'nullable|string|max:255',
            'sms_content' => 'nullable',
            'email_content' => 'nullable',
            'target_audience' => 'required|in:guests,hosts,both,custom',
            'recipient_filters' => 'nullable|array',
            'custom_recipients' => 'nullable|array',
            'scheduled_at' => 'nullable|date|after:now',
            'send_sms' => 'boolean',
            'send_email' => 'boolean'
        ]);

        // Validate that at least one communication method is selected
        if (!$request->send_sms && !$request->send_email) {
            return redirect()->back()->with('error', 'Please select at least one communication method (SMS or Email).');
        }

        // Validate content based on selected methods
        if ($request->send_sms && empty($request->sms_content)) {
            return redirect()->back()->with('error', 'SMS content is required when sending SMS.');
        }

        if ($request->send_email && empty($request->email_content)) {
            return redirect()->back()->with('error', 'Email content is required when sending email.');
        }

        if ($request->send_email && empty($request->subject)) {
            return redirect()->back()->with('error', 'Email subject is required when sending email.');
        }

        // Create the bulk communication
        $bulkCommunication = BulkCommunication::create([
            ...$request->all(),
            'created_by' => Auth::id(),
            'status' => $request->scheduled_at ? 'scheduled' : 'draft'
        ]);

        // Get recipient count
        $recipients = $bulkCommunication->getRecipients();
        $bulkCommunication->update(['total_recipients' => $recipients->count()]);

        // If it's not scheduled, send immediately
        if (!$request->scheduled_at) {
            $this->sendBulkCommunication($bulkCommunication);
        }

        return redirect()->back()->with('success', 'Bulk communication ' . ($request->scheduled_at ? 'scheduled' : 'sent') . ' successfully.');
    }

    public function sendBulkCommunication(BulkCommunication $bulkCommunication)
    {
        if (!in_array($bulkCommunication->status, ['draft', 'scheduled'])) {
            return redirect()->back()->with('error', 'Cannot send communication with current status.');
        }

        $bulkCommunication->update(['status' => 'sending']);

        // Process using communication service with explicit flags
        $results = $this->communicationService->sendBulkCommunicationByTemplate(
            $bulkCommunication,
            [
                'send_sms' => $bulkCommunication->send_sms,
                'send_email' => $bulkCommunication->send_email
            ]
        );

        $bulkCommunication->update([
            'sms_sent' => $results['sms_sent'],
            'emails_sent' => $results['emails_sent'],
            'sms_failed' => $results['sms_failed'],
            'emails_failed' => $results['emails_failed'],
            'status' => 'completed',
            'sent_at' => now()
        ]);

        return redirect()->back()->with('success', 'Bulk communication sent successfully.');
    }

    public function sendIndividualCommunication(Request $request)
    {
        // Only allow hosts to send individual communications
        if ($request->user()->role_id !== 2) {
            return redirect()->back()->with('error', 'Unauthorized to send individual communications.');
        }

        $request->validate([
            'template_id' => 'nullable|exists:communication_templates,id',
            'sms_content' => 'nullable|string',
            'email_content' => 'nullable|string',
            'email_subject' => 'nullable|string|required_if:send_email,true',
            'selected_users' => 'nullable|array',
            'selected_users.*' => 'exists:users,id',
            'custom_phone' => 'nullable|string',
            'custom_email' => 'nullable|email',
            'custom_name' => 'nullable|string',
            'send_sms' => 'boolean',
            'send_email' => 'boolean'
        ]);

        // Validate that at least one communication method is selected
        if (!$request->send_sms && !$request->send_email) {
            return redirect()->back()->with('error', 'Please select at least one communication method (SMS or Email).');
        }

        // Validate content based on selected methods
        if ($request->send_sms && empty($request->sms_content)) {
            return redirect()->back()->with('error', 'SMS content is required when sending SMS.');
        }

        if ($request->send_email && empty($request->email_content)) {
            return redirect()->back()->with('error', 'Email content is required when sending email.');
        }

        if ($request->send_email && empty($request->email_subject)) {
            return redirect()->back()->with('error', 'Email subject is required when sending email.');
        }

        $recipients = [];

        // Process selected users
        if (!empty($request->selected_users)) {
            $users = User::whereIn('id', $request->selected_users)->get();
            foreach ($users as $user) {
                $recipients[] = [
                    'type' => 'user',
                    'user_id' => $user->id,
                    'user' => $user,
                    'phone' => $request->send_sms ? $user->phone : null,
                    'email' => $request->send_email ? $user->email : null,
                    'name' => $user->name
                ];
            }
        }

        // Process custom recipient
        if (($request->send_sms && $request->custom_phone) || ($request->send_email && $request->custom_email)) {
            $recipients[] = [
                'type' => 'custom',
                'user_id' => null,
                'user' => null,
                'phone' => $request->send_sms ? $request->custom_phone : null,
                'email' => $request->send_email ? $request->custom_email : null,
                'name' => $request->custom_name
            ];
        }

        if (empty($recipients)) {
            return redirect()->back()->with('error', 'No recipients selected.');
        }

        // Filter out recipients that don't have the required contact method
        $filteredRecipients = array_filter($recipients, function($recipient) use ($request) {
            if ($request->send_sms && !$recipient['phone']) return false;
            if ($request->send_email && !$recipient['email']) return false;
            return true;
        });

        if (empty($filteredRecipients)) {
            return redirect()->back()->with('error', 'No valid recipients found for the selected communication methods.');
        }

        // Pre-process content for each recipient with variable replacement
        $processedRecipients = [];
        foreach ($filteredRecipients as $recipient) {
            $processedRecipient = $recipient;

            // Replace variables for this specific recipient
            if ($request->send_sms && $request->sms_content) {
                $processedRecipient['processed_sms_content'] = $this->replaceTemplateVariables($request->sms_content, $recipient);
            }

            if ($request->send_email && $request->email_content) {
                $processedRecipient['processed_email_content'] = $this->replaceTemplateVariables($request->email_content, $recipient);
                $processedRecipient['processed_email_subject'] = $this->replaceTemplateVariables($request->email_subject, $recipient);
            }

            $processedRecipients[] = $processedRecipient;
        }

        Log::info('Processed recipients for individual communication', [
            'total_recipients' => count($processedRecipients),
            'send_sms' => $request->send_sms,
            'send_email' => $request->send_email,
            'first_recipient_processed_content' => $processedRecipients[0]['processed_sms_content'] ?? 'No processed content',
            'first_recipient_name' => $processedRecipients[0]['name'] ?? 'Unknown'
        ]);

        // Use the communication service with PROCESSED content
        $results = $this->communicationService->sendBulkCommunications(
            $processedRecipients,
            $request->sms_content, // Keep original for logging
            $request->email_content, // Keep original for logging
            $request->email_subject, // Keep original for logging
            [
                'sent_by' => $request->user()->id,
                'type' => 'individual',
                'template_id' => $request->template_id,
                'send_sms' => $request->send_sms,
                'send_email' => $request->send_email,
                'use_processed_content' => true // Flag to use processed content
            ]
        );

        $message = "Individual communication sent successfully. ";
        if ($request->send_sms) {
            $message .= "SMS: {$results['sms_success']} sent, {$results['sms_failed']} failed. ";
        }
        if ($request->send_email) {
            $message .= "Email: {$results['email_success']} sent, {$results['email_failed']} failed.";
        }

        return redirect()->back()->with('success', trim($message));
    }

    public function searchUsers(Request $request)
    {
        // Only allow hosts to search users
        if ($request->user()->role_id !== 2) {
            return response()->json(['users' => []]);
        }

        $search = $request->get('search', '');

        if (strlen($search) < 2) {
            return response()->json(['users' => []]);
        }

        $users = User::where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email', 'phone', 'role_id']);

        return response()->json(['users' => $users]);
    }

    public function getCommunicationLogs(BulkCommunication $bulkCommunication)
    {
        $logs = $bulkCommunication->logs()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Communications/Logs', [
            'bulkCommunication' => $bulkCommunication,
            'logs' => $logs
        ]);
    }

    public function getIndividualLogs(Request $request)
    {
        // Only show logs for communications sent by the current host
        $logs = CommunicationLog::where('user_id', $request->user()->id)
            ->where('type', 'like', 'individual_%')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Communications/IndividualLogs', [
            'logs' => $logs
        ]);
    }

    public function getUserStats()
    {
        $totalUsers = User::count();
        $guests = User::where('role_id', 3)->count();
        $hosts = User::where('role_id', 2)->count();
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count();

        return response()->json([
            'total_users' => $totalUsers,
            'guests' => $guests,
            'hosts' => $hosts,
            'active_users' => $activeUsers
        ]);
    }

    public function analytics(Request $request)
    {
        $timeRange = $request->get('range', '7d');

        // Calculate date range
        $startDate = match($timeRange) {
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(7),
        };

        // Get basic stats
        $totalMessages = CommunicationLog::where('created_at', '>=', $startDate)->count();
        $smsSent = CommunicationLog::where('type', 'sms')
            ->where('status', 'sent')
            ->where('created_at', '>=', $startDate)
            ->count();
        $emailsSent = CommunicationLog::where('type', 'email')
            ->where('status', 'sent')
            ->where('created_at', '>=', $startDate)
            ->count();
        $individualSms = CommunicationLog::where('type', 'individual_sms')
            ->where('status', 'sent')
            ->where('created_at', '>=', $startDate)
            ->count();
        $individualEmails = CommunicationLog::where('type', 'individual_email')
            ->where('status', 'sent')
            ->where('created_at', '>=', $startDate)
            ->count();

        $successfulMessages = CommunicationLog::where('status', 'sent')
            ->where('created_at', '>=', $startDate)
            ->count();
        $failedMessages = CommunicationLog::where('status', 'failed')
            ->where('created_at', '>=', $startDate)
            ->count();

        $totalWithFailures = $successfulMessages + $failedMessages;
        $successRate = $totalWithFailures > 0 ? round(($successfulMessages / $totalWithFailures) * 100, 1) : 0;
        $failureRate = $totalWithFailures > 0 ? round(($failedMessages / $totalWithFailures) * 100, 1) : 0;

        // Get unique recipients
        $uniqueRecipients = CommunicationLog::where('created_at', '>=', $startDate)
            ->distinct('recipient')
            ->count('recipient');

        // Get message trends for chart
        $messageTrends = $this->getMessageTrends($startDate, $timeRange);

        // Get top templates - handle cases where template might be null
        $topTemplates = BulkCommunication::with(['template' => function($query) {
                $query->withTrashed(); // Include deleted templates if needed
            }])
            ->where('created_at', '>=', $startDate)
            ->selectRaw('template_id, COUNT(*) as campaign_count, SUM(total_recipients) as total_recipients')
            ->groupBy('template_id')
            ->orderByDesc('campaign_count')
            ->limit(5)
            ->get()
            ->map(function($campaign) {
                return [
                    'template_id' => $campaign->template_id,
                    'template' => $campaign->template ? [
                        'name' => $campaign->template->name,
                        'id' => $campaign->template->id
                    ] : null,
                    'campaign_count' => $campaign->campaign_count,
                    'total_recipients' => $campaign->total_recipients
                ];
            });

        // Get recent activity - handle cases where template might be null
        $recentActivity = BulkCommunication::with(['template' => function($query) {
                $query->withTrashed();
            }])
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'template' => $activity->template ? [
                        'name' => $activity->template->name,
                        'id' => $activity->template->id
                    ] : null,
                    'total_recipients' => $activity->total_recipients,
                    'status' => $activity->status,
                    'created_at' => $activity->created_at
                ];
            });

        // Get active templates count
        $activeTemplates = CommunicationTemplate::where('is_active', true)->count();

        return Inertia::render('Communications/Analytics', [
            'stats' => [
                'totalMessages' => $totalMessages,
                'smsSent' => $smsSent + $individualSms,
                'emailsSent' => $emailsSent + $individualEmails,
                'successRate' => $successRate,
                'failureRate' => $failureRate,
                'uniqueRecipients' => $uniqueRecipients,
                'bulkCampaigns' => BulkCommunication::where('created_at', '>=', $startDate)->count(),
                'individualMessages' => $individualSms + $individualEmails,
                'activeTemplates' => $activeTemplates,
            ],
            'messageTrends' => $messageTrends,
            'topTemplates' => $topTemplates,
            'recentActivity' => $recentActivity,
            'timeRange' => $timeRange,
        ]);
    }

    private function getMessageTrends($startDate, $timeRange)
    {
        $format = match($timeRange) {
            '1y' => 'Y-m',
            '90d', '30d' => 'Y-m-d',
            default => 'Y-m-d',
        };

        $groupBy = match($timeRange) {
            '1y' => 'month',
            '90d', '30d' => 'day',
            default => 'day',
        };

        $trends = CommunicationLog::where('created_at', '>=', $startDate)
            ->selectRaw("
                DATE_FORMAT(created_at, ?) as period,
                SUM(CASE WHEN type = 'sms' OR type = 'individual_sms' THEN 1 ELSE 0 END) as sms_count,
                SUM(CASE WHEN type = 'email' OR type = 'individual_email' THEN 1 ELSE 0 END) as email_count,
                COUNT(*) as total_count
            ", [$format === 'Y-m' ? '%Y-%m' : '%Y-%m-%d'])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $labels = [];
        $smsData = [];
        $emailData = [];

        // Fill in missing dates
        $current = clone $startDate;
        $end = now();

        while ($current <= $end) {
            $period = $current->format($format);
            $labels[] = $period;

            $trend = $trends->firstWhere('period', $period);
            $smsData[] = $trend ? $trend->sms_count : 0;
            $emailData[] = $trend ? $trend->email_count : 0;

            if ($groupBy === 'day') {
                $current->addDay();
            } else {
                $current->addMonth();
            }
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'SMS',
                    'data' => $smsData,
                    'backgroundColor' => '#10B981',
                ],
                [
                    'label' => 'Email',
                    'data' => $emailData,
                    'backgroundColor' => '#3B82F6',
                ]
            ]
        ];
    }

    /**
     * Replace template variables with actual values
     * This method is called for each recipient individually
     */
    public function replaceTemplateVariables($content, $recipient)
    {
        if (empty($content)) {
            return $content;
        }

        // Handle both User model and array recipients
        if (is_object($recipient) && method_exists($recipient, 'getAttributes')) {
            // User model
            $variables = [
                '{{user_name}}' => $recipient->name ?? 'Guest',
                '{{user_email}}' => $recipient->email ?? '',
                '{{user_phone}}' => $recipient->phone ?? '',
                '{{current_date}}' => now()->format('M j, Y'),
                '{{current_time}}' => now()->format('g:i A'),
                '{{app_name}}' => config('app.name'),
            ];
        } else {
            // Array recipient (custom or from individual send)
            $variables = [
                '{{user_name}}' => $recipient['name'] ?? 'Guest',
                '{{user_email}}' => $recipient['email'] ?? '',
                '{{user_phone}}' => $recipient['phone'] ?? '',
                '{{current_date}}' => now()->format('M j, Y'),
                '{{current_time}}' => now()->format('g:i A'),
                '{{app_name}}' => config('app.name'),
            ];
        }

        $replacedContent = str_replace(array_keys($variables), array_values($variables), $content);

        Log::info('Variable replacement debug', [
            'original_content' => $content,
            'replaced_content' => $replacedContent,
            'recipient_name' => $recipient['name'] ?? ($recipient->name ?? 'Unknown'),
            'variables_used' => array_keys($variables)
        ]);

        return $replacedContent;
    }

    /**
     * Preview template with variable replacement
     */
    public function previewTemplate(Request $request)
    {
        $request->validate([
            'sms_content' => 'nullable|string',
            'email_content' => 'nullable|string',
            'subject' => 'nullable|string'
        ]);

        // Create a sample user for preview
        $sampleUser = new User([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1234567890'
        ]);

        $preview = [
            'sms_content' => $request->sms_content ? $this->replaceTemplateVariables($request->sms_content, $sampleUser) : null,
            'email_content' => $request->email_content ? $this->replaceTemplateVariables($request->email_content, $sampleUser) : null,
            'subject' => $request->subject ? $this->replaceTemplateVariables($request->subject, $sampleUser) : null,
        ];

        return response()->json($preview);
    }

    /**
     * Get available template variables
     */
    public function getTemplateVariables()
    {
        return response()->json([
            'variables' => [
                'user_name' => 'Full name of the user',
                'user_email' => 'Email address of the user',
                'user_phone' => 'Phone number of the user',
                'current_date' => 'Current date (e.g., Jan 15, 2024)',
                'current_time' => 'Current time (e.g., 2:30 PM)',
                'app_name' => 'Name of your application',
            ]
        ]);
    }

    /**
     * Test SMS sending with variable replacement
     */
    public function testSms(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'content' => 'required|string'
        ]);

        try {
            // Create a test recipient
            $testRecipient = [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => $request->phone
            ];

            // Replace variables in content
            $processedContent = $this->replaceTemplateVariables($request->content, $testRecipient);

            // Send SMS
            $result = $this->smsService->sendSms($request->phone, $processedContent);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'SMS sent successfully',
                    'original_content' => $request->content,
                    'processed_content' => $processedContent
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send SMS',
                    'original_content' => $request->content,
                    'processed_content' => $processedContent
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending SMS: ' . $e->getMessage(),
                'original_content' => $request->content
            ], 500);
        }
    }

    /**
     * Direct SMS send with variable replacement for debugging
     */
    public function directSendSms(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'content' => 'required|string',
            'name' => 'required|string'
        ]);

        try {
            // Create recipient data
            $recipient = [
                'name' => $request->name,
                'email' => 'test@example.com',
                'phone' => $request->phone
            ];

            // Replace variables
            $processedContent = $this->replaceTemplateVariables($request->content, $recipient);

            Log::info('Direct SMS send debug', [
                'original_content' => $request->content,
                'processed_content' => $processedContent,
                'recipient_name' => $request->name,
                'phone' => $request->phone
            ]);

            // Send directly using SMS service
            $result = $this->smsService->sendSms($request->phone, $processedContent);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'SMS sent successfully',
                    'original_content' => $request->content,
                    'processed_content' => $processedContent,
                    'sent_to' => $request->phone
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'SMS service returned failure',
                    'original_content' => $request->content,
                    'processed_content' => $processedContent
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Direct SMS send error', [
                'error' => $e->getMessage(),
                'phone' => $request->phone,
                'content' => $request->content
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'original_content' => $request->content
            ], 500);
        }
    }
}
