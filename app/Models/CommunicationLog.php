<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunicationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'bulk_communication_id',
        'user_id',
        'type',
        'recipient',
        'content',
        'subject',
        'status',
        'status_message',
        'message_id',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function bulkCommunication()
    {
        return $this->belongsTo(BulkCommunication::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class);
    }
}
