<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Message;

class EmailService
{
    /**
     * Send individual email
     */
    public function sendEmail(string $to, string $subject, string $content, array $data = []): array
    {
        try {
            Log::info('EmailService: Attempting to send email', [
                'to' => $to,
                'subject' => $subject,
                'content_length' => strlen($content)
            ]);

            Mail::html($content, function (Message $message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject);
            });

            // Check for failures
            if (count(Mail::failures()) > 0) {
                Log::error('EmailService: Email failed to send', [
                    'to' => $to,
                    'subject' => $subject,
                    'failures' => Mail::failures()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to send to: ' . implode(', ', Mail::failures())
                ];
            }

            Log::info('EmailService: Email sent successfully', [
                'to' => $to,
                'subject' => $subject
            ]);

            return [
                'success' => true,
                'message' => 'Email sent successfully'
            ];

        } catch (\Exception $e) {
            Log::error('EmailService: Exception while sending email', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Alternative method using send()
     */
    public function sendEmailAlternative(string $to, string $subject, string $content, array $data = []): array
    {
        try {
            Mail::send([], [], function (Message $message) use ($to, $subject, $content) {
                $message->to($to)
                        ->subject($subject)
                        ->html($content); // Use html() instead of setBody()
            });

            if (count(Mail::failures()) > 0) {
                return [
                    'success' => false,
                    'error' => 'Failed to send to: ' . implode(', ', Mail::failures())
                ];
            }

            return ['success' => true, 'message' => 'Email sent successfully'];

        } catch (\Exception $e) {
            Log::error('EmailService Alternative: Exception', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Method using a Mailable class (recommended approach)
     */
    public function sendEmailWithMailable(string $to, string $subject, string $content, array $data = []): array
    {
        try {
            Mail::send(new \App\Mail\GenericEmail($to, $subject, $content));

            if (count(Mail::failures()) > 0) {
                return [
                    'success' => false,
                    'error' => 'Failed to send to: ' . implode(', ', Mail::failures())
                ];
            }

            return ['success' => true, 'message' => 'Email sent successfully'];

        } catch (\Exception $e) {
            Log::error('EmailService Mailable: Exception', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
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

        Log::info('EmailService: Bulk email results', $results);

        return $results;
    }
}
