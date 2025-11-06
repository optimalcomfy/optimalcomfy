<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BulkCommunication extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'subject',
        'sms_content',
        'email_content',
        'target_audience',
        'recipient_filters',
        'custom_recipients',
        'total_recipients',
        'sms_sent',
        'emails_sent',
        'sms_failed',
        'emails_failed',
        'status',
        'scheduled_at',
        'sent_at',
        'created_by'
    ];

    protected $casts = [
        'recipient_filters' => 'array',
        'custom_recipients' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime'
    ];

    public function template()
    {
        return $this->belongsTo(CommunicationTemplate::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs()
    {
        return $this->hasMany(CommunicationLog::class);
    }

    public function getRecipients()
    {
        $query = User::query();

        switch ($this->target_audience) {
            case 'guests':
                $query->where('role_id', 3); // Guest role
                break;
            case 'hosts':
                $query->where('role_id', 2); // Host role
                break;
            case 'both':
                $query->whereIn('role_id', [2, 3]);
                break;
            case 'custom':
                if ($this->custom_recipients) {
                    $query->whereIn('id', $this->custom_recipients);
                }
                break;
        }

        // Apply additional filters
        if ($this->recipient_filters) {
            $filters = $this->recipient_filters;

            if (isset($filters['has_bookings']) && $filters['has_bookings']) {
                $query->whereHas('bookings');
            }

            if (isset($filters['has_car_bookings']) && $filters['has_car_bookings']) {
                $query->whereHas('carBookings');
            }

            if (isset($filters['last_activity_days'])) {
                $date = now()->subDays($filters['last_activity_days']);
                $query->where('last_login_at', '>=', $date);
            }
        }

        return $query->get();
    }
}
