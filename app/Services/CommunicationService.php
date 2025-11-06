<?php

namespace App\Services;

use App\Models\CommunicationLog;
use App\Models\BulkCommunication;
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

        // Send SMS if phone, content provided and SMS is enabled
        if ($sendSms && $phone && !empty($smsContent)) {
            $results['sms'] = $this->sendSms($phone, $smsContent, $userId, $metadata);
        }

        // Send Email if email, content provided and email is enabled
        if ($sendEmail && $email && !empty($emailContent) && !empty($emailSubject)) {
            $results['email'] = $this->sendEmail($email, $emailSubject, $emailContent, $userId, $metadata);
        }

        $results['success'] = ($results['sms']['success'] ?? false) || ($results['email']['success'] ?? false);

        return $results;
    }

    /**
     * Send SMS with logging
     */
    private function sendSms(string $phone, string $content, $userId = null, array $metadata = []): array
    {
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
    }

    /**
     * Send Email with logging
     */
    private function sendEmail(string $email, string $subject, string $content, $userId = null, array $metadata = []): array
    {
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

    // In your CommunicationService, add this method and use it:
    protected function replaceTemplateVariables($content, $recipient)
    {
        // Use the controller's method or implement the same logic here
        $controller = app(CommunicationController::class);
        return $controller->replaceTemplateVariables($content, $recipient);
    }
}
