<?php

namespace App\Services;

use App\Models\CommunicationLog;
use App\Models\BulkCommunication;
use App\Models\User;
use App\Models\Booking;
use App\Models\CarBooking;
use Illuminate\Support\Facades\Log;

class CommunicationService
{
    protected $smsService;
    protected $emailService;

    public function __construct(SmsService $smsService, EmailService $emailService)
    {
        $this->smsService = $smsService;
        $this->emailService = $emailService;
    }

    /**
     * Send both SMS and Email with flexible parameters
     */
    public function sendCommunication(array $recipient, ?string $smsContent, ?string $emailContent, ?string $emailSubject, array $metadata = []): array
    {
        $results = [
            'sms' => null,
            'email' => null,
            'success' => false
        ];

        $userId = $recipient['user_id'] ?? null;
        $phone = $recipient['phone'] ?? null;
        $email = $recipient['email'] ?? null;
        $name = $recipient['name'] ?? 'Guest';

        $sendSms = $metadata['send_sms'] ?? (!empty($smsContent));
        $sendEmail = $metadata['send_email'] ?? (!empty($emailContent) && !empty($emailSubject));

        // Check if we should use processed content (for individual communications)
        $useProcessedContent = $metadata['use_processed_content'] ?? false;

        // Get processed content if available
        $processedSmsContent = $recipient['processed_sms_content'] ?? null;
        $processedEmailContent = $recipient['processed_email_content'] ?? null;
        $processedEmailSubject = $recipient['processed_email_subject'] ?? null;

        // Use processed content if available, otherwise use original content
        $finalSmsContent = $useProcessedContent && $processedSmsContent ? $processedSmsContent : $smsContent;
        $finalEmailContent = $useProcessedContent && $processedEmailContent ? $processedEmailContent : $emailContent;
        $finalEmailSubject = $useProcessedContent && $processedEmailSubject ? $processedEmailSubject : $emailSubject;

        // For bulk communications without pre-processed content, replace variables here
        if (!$useProcessedContent && $userId) {
            $user = User::find($userId);
            if ($user) {
                if ($sendSms && $finalSmsContent) {
                    $finalSmsContent = $this->replaceTemplateVariables($finalSmsContent, $user);
                }
                if ($sendEmail && $finalEmailContent) {
                    $finalEmailContent = $this->replaceTemplateVariables($finalEmailContent, $user);
                }
                if ($sendEmail && $finalEmailSubject) {
                    $finalEmailSubject = $this->replaceTemplateVariables($finalEmailSubject, $user);
                }
            }
        }

        // Send SMS if phone, content provided and SMS is enabled
        if ($sendSms && $phone && !empty($finalSmsContent)) {
            $results['sms'] = $this->sendSms($phone, $finalSmsContent, $userId, $metadata);
        }

        // Send Email if email, content provided and email is enabled
        if ($sendEmail && $email && !empty($finalEmailContent) && !empty($finalEmailSubject)) {
            $results['email'] = $this->sendEmail($email, $finalEmailSubject, $finalEmailContent, $userId, $metadata);
        }

        $results['success'] = ($results['sms']['success'] ?? false) || ($results['email']['success'] ?? false);

        return $results;
    }

    /**
     * Send SMS with logging
     */
    private function sendSms(string $phone, string $content, $userId = null, array $metadata = []): array
    {
        try {
            $result = $this->smsService->sendSms($phone, $content);

            // Log the SMS attempt
            CommunicationLog::create([
                'type' => isset($metadata['type']) && $metadata['type'] === 'individual' ? 'individual_sms' : 'sms',
                'user_id' => $userId,
                'recipient' => $phone,
                'content' => $content,
                'status' => $result['success'] ? 'sent' : 'failed',
                'message_id' => $result['message_id'] ?? null,
                'status_message' => $result['error_description'] ?? ($result['success'] ? 'Success' : 'Failed'),
                'metadata' => array_merge($metadata, ['raw_response' => $result]),
                'created_by' => $metadata['sent_by'] ?? null
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('SMS sending failed', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);

            CommunicationLog::create([
                'type' => isset($metadata['type']) && $metadata['type'] === 'individual' ? 'individual_sms' : 'sms',
                'user_id' => $userId,
                'recipient' => $phone,
                'content' => $content,
                'status' => 'failed',
                'status_message' => 'Exception: ' . $e->getMessage(),
                'metadata' => $metadata,
                'created_by' => $metadata['sent_by'] ?? null
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send Email with logging
     */
    private function sendEmail(string $email, string $subject, string $content, $userId = null, array $metadata = []): array
    {
        try {
            $result = $this->emailService->sendEmail($email, $subject, $content);

            // Log the email attempt
            CommunicationLog::create([
                'type' => isset($metadata['type']) && $metadata['type'] === 'individual' ? 'individual_email' : 'email',
                'user_id' => $userId,
                'recipient' => $email,
                'subject' => $subject,
                'content' => $content,
                'status' => $result['success'] ? 'sent' : 'failed',
                'status_message' => $result['error'] ?? ($result['success'] ? 'Success' : 'Failed'),
                'metadata' => array_merge($metadata, ['raw_response' => $result]),
                'created_by' => $metadata['sent_by'] ?? null
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);

            CommunicationLog::create([
                'type' => isset($metadata['type']) && $metadata['type'] === 'individual' ? 'individual_email' : 'email',
                'user_id' => $userId,
                'recipient' => $email,
                'subject' => $subject,
                'content' => $content,
                'status' => 'failed',
                'status_message' => 'Exception: ' . $e->getMessage(),
                'metadata' => $metadata,
                'created_by' => $metadata['sent_by'] ?? null
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send bulk communications
     */
    public function sendBulkCommunications(array $recipients, string $smsContent, string $emailContent, string $emailSubject, array $metadata = []): array
    {
        $results = [
            'total' => count($recipients),
            'sms_success' => 0,
            'sms_failed' => 0,
            'email_success' => 0,
            'email_failed' => 0,
            'details' => []
        ];

        $sendSms = $metadata['send_sms'] ?? !empty($smsContent);
        $sendEmail = $metadata['send_email'] ?? (!empty($emailContent) && !empty($emailSubject));

        foreach ($recipients as $recipient) {
            $result = $this->sendCommunication(
                $recipient,
                $sendSms ? $smsContent : null,
                $sendEmail ? $emailContent : null,
                $sendEmail ? $emailSubject : null,
                $metadata
            );

            $results['details'][] = $result;

            if ($result['sms']['success'] ?? false) {
                $results['sms_success']++;
            } elseif (isset($result['sms'])) {
                $results['sms_failed']++;
            }

            if ($result['email']['success'] ?? false) {
                $results['email_success']++;
            } elseif (isset($result['email'])) {
                $results['email_failed']++;
            }
        }

        return $results;
    }

    /**
     * Send bulk communication using a template
     */
    public function sendBulkCommunicationByTemplate(BulkCommunication $bulkCommunication, array $metadata = []): array
    {
        $recipients = $bulkCommunication->getRecipients();
        $smsContent = $bulkCommunication->sms_content;
        $emailContent = $bulkCommunication->email_content;
        $emailSubject = $bulkCommunication->subject;

        $results = [
            'sms_sent' => 0,
            'emails_sent' => 0,
            'sms_failed' => 0,
            'emails_failed' => 0
        ];

        $sendSms = $metadata['send_sms'] ?? $bulkCommunication->send_sms ?? !empty($smsContent);
        $sendEmail = $metadata['send_email'] ?? $bulkCommunication->send_email ?? (!empty($emailContent) && !empty($emailSubject));

        foreach ($recipients as $recipient) {
            $recipientData = [
                'user_id' => $recipient->id,
                'phone' => $recipient->phone,
                'email' => $recipient->email,
                'name' => $recipient->name
            ];

            $result = $this->sendCommunication(
                $recipientData,
                $sendSms ? $smsContent : null,
                $sendEmail ? $emailContent : null,
                $sendEmail ? $emailSubject : null,
                array_merge($metadata, [
                    'bulk_communication_id' => $bulkCommunication->id,
                    'sent_by' => $bulkCommunication->created_by
                ])
            );

            if ($result['sms']['success'] ?? false) {
                $results['sms_sent']++;
            } elseif (isset($result['sms'])) {
                $results['sms_failed']++;
            }

            if ($result['email']['success'] ?? false) {
                $results['emails_sent']++;
            } elseif (isset($result['email'])) {
                $results['emails_failed']++;
            }
        }

        return $results;
    }

    /**
     * Replace template variables with actual values
     */
    public function replaceTemplateVariables($content, $recipient)
    {
        if (empty($content)) {
            return $content;
        }

        $variables = [];

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

            // Add booking-related variables if user has recent bookings
            $this->addBookingVariables($variables, $recipient);
        } else {
            // Array recipient
            $variables = [
                '{{user_name}}' => $recipient['name'] ?? 'Guest',
                '{{user_email}}' => $recipient['email'] ?? '',
                '{{user_phone}}' => $recipient['phone'] ?? '',
                '{{current_date}}' => now()->format('M j, Y'),
                '{{current_time}}' => now()->format('g:i A'),
                '{{app_name}}' => config('app.name'),
            ];

            // Add booking variables if user ID is available
            if (isset($recipient['user_id']) && $recipient['user_id']) {
                $user = User::find($recipient['user_id']);
                if ($user) {
                    $this->addBookingVariables($variables, $user);
                }
            }
        }

        $replacedContent = str_replace(array_keys($variables), array_values($variables), $content);

        Log::info('Variable replacement in CommunicationService', [
            'original_content' => $content,
            'replaced_content' => $replacedContent,
            'recipient_name' => $recipient['name'] ?? ($recipient->name ?? 'Unknown'),
            'variables_used' => array_keys($variables)
        ]);

        return $replacedContent;
    }

    /**
     * Add booking-related variables to the variables array
     */
    private function addBookingVariables(&$variables, $user)
    {
        // Get the most recent completed booking
        $recentBooking = Booking::where('user_id', $user->id)
            ->where('status', 'paid')
            ->whereNotNull('checked_in')
            ->whereNotNull('checked_out')
            ->orderBy('check_out_date', 'desc')
            ->first();

        // Get the most recent upcoming booking
        $upcomingBooking = Booking::where('user_id', $user->id)
            ->where('status', 'paid')
            ->whereNull('checked_in')
            ->whereNull('checked_out')
            ->orderBy('check_in_date', 'asc')
            ->first();

        // Get the most recent car booking
        $recentCarBooking = CarBooking::where('user_id', $user->id)
            ->where('status', 'paid')
            ->whereNotNull('checked_in')
            ->whereNotNull('checked_out')
            ->orderBy('end_date', 'desc')
            ->first();

        $upcomingCarBooking = CarBooking::where('user_id', $user->id)
            ->where('status', 'paid')
            ->whereNull('checked_in')
            ->whereNull('checked_out')
            ->orderBy('start_date', 'asc')
            ->first();

        // Use the most relevant booking (prefer upcoming over completed)
        $booking = $upcomingBooking ?? $recentBooking;
        $carBooking = $upcomingCarBooking ?? $recentCarBooking;

        // Booking variables
        if ($booking) {
            $variables['{{booking_number}}'] = $booking->number ?? 'N/A';
            $variables['{{booking_date}}'] = $booking->created_at ? $booking->created_at->format('M j, Y') : 'N/A';
            $variables['{{check_in_date}}'] = $booking->check_in_date ? $booking->check_in_date->format('M j, Y') : 'N/A';
            $variables['{{check_out_date}}'] = $booking->check_out_date ? $booking->check_out_date->format('M j, Y') : 'N/A';
            $variables['{{total_amount}}'] = $booking->total_price ? number_format($booking->total_price, 2) : 'N/A';

            if ($booking->property) {
                $variables['{{property_name}}'] = $booking->property->property_name ?? 'N/A';
                $variables['{{host_name}}'] = $booking->property->user->name ?? 'N/A';
            } else {
                $variables['{{property_name}}'] = 'N/A';
                $variables['{{host_name}}'] = 'N/A';
            }
        } else {
            $variables['{{booking_number}}'] = 'N/A';
            $variables['{{booking_date}}'] = 'N/A';
            $variables['{{check_in_date}}'] = 'N/A';
            $variables['{{check_out_date}}'] = 'N/A';
            $variables['{{property_name}}'] = 'N/A';
            $variables['{{total_amount}}'] = 'N/A';
            $variables['{{host_name}}'] = 'N/A';
        }

        // Car booking variables
        if ($carBooking) {
            $variables['{{car_name}}'] = $carBooking->car ? ($carBooking->car->name ?? 'N/A') : 'N/A';
            // If we have car booking but no property booking, use car booking amount
            if (!$booking) {
                $variables['{{total_amount}}'] = $carBooking->total_price ? number_format($carBooking->total_price, 2) : 'N/A';
            }
        } else {
            $variables['{{car_name}}'] = 'N/A';
        }

        // Ensure all required variables are set
        $requiredVariables = [
            '{{booking_number}}', '{{booking_date}}', '{{check_in_date}}', '{{check_out_date}}',
            '{{property_name}}', '{{car_name}}', '{{total_amount}}', '{{host_name}}'
        ];

        foreach ($requiredVariables as $var) {
            if (!isset($variables[$var])) {
                $variables[$var] = 'N/A';
            }
        }
    }
}
