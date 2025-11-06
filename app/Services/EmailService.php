<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    /**
     * Send individual email
     */
    public function sendEmail(string $to, string $subject, string $content, array $data = []): array
    {
        try {
            Mail::send([], [], function ($message) use ($to, $subject, $content) {
                $message->to($to)
                        ->subject($subject)
                        ->setBody($content, 'text/html');
            });

            Log::info('Email sent successfully', [
                'to' => $to,
                'subject' => $subject
            ]);

            return [
                'success' => true,
                'message' => 'Email sent successfully'
            ];

        } catch (\Exception $e) {
            Log::error('Email sending failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send bulk emails
     */
    public function sendBulkEmails(array $recipients, string $subject, string $content, array $data = []): array
    {
        $results = [
            'success_count' => 0,
            'fail_count' => 0,
            'errors' => []
        ];

        foreach ($recipients as $recipient) {
            $email = is_array($recipient) ? ($recipient['email'] ?? $recipient) : $recipient;

            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $result = $this->sendEmail($email, $subject, $content, $data);

                if ($result['success']) {
                    $results['success_count']++;
                } else {
                    $results['fail_count']++;
                    $results['errors'][$email] = $result['error'];
                }
            } else {
                $results['fail_count']++;
                $results['errors'][$email] = 'Invalid email address';
            }
        }

        return $results;
    }
}
