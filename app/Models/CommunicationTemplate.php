<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'sms_content',
        'email_content',
        'type',
        'target_audience',
        'custom_recipients',
        'is_active',
        'variables'
    ];

    protected $casts = [
        'custom_recipients' => 'array',
        'variables' => 'array',
        'is_active' => 'boolean'
    ];

    public function bulkCommunications()
    {
        return $this->hasMany(BulkCommunication::class);
    }

    // Available template variables
    public static function getAvailableVariables($type = null)
    {
        $baseVariables = [
            'user_name',
            'user_email',
            'user_phone',
            'booking_number',
            'booking_date',
            'check_in_date',
            'check_out_date',
            'property_name',
            'car_name',
            'total_amount',
            'host_name',
            'current_date'
        ];

        $typeSpecific = [
            'booking_confirmation' => [
                'booking_details',
                'payment_status',
                'check_in_instructions'
            ],
            'payment_reminder' => [
                'due_amount',
                'due_date',
                'payment_link'
            ],
            'promotional' => [
                'promo_code',
                'discount_amount',
                'valid_until'
            ]
        ];

        if ($type && isset($typeSpecific[$type])) {
            return array_merge($baseVariables, $typeSpecific[$type]);
        }

        return $baseVariables;
    }
}
