<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChecklistResponseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'checklist_response_id',
        'checklist_item_id',
        'is_checked',
        'notes',
        'image_path',
        'checked_at',
        'checked_by'
    ];

    protected $casts = [
        'is_checked' => 'boolean',
        'checked_at' => 'datetime',
    ];

    public function response(): BelongsTo
    {
        return $this->belongsTo(ChecklistResponse::class, 'checklist_response_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ChecklistItem::class, 'checklist_item_id');
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function markAsChecked($userId = null): void
    {
        $this->update([
            'is_checked' => true,
            'checked_at' => now(),
            'checked_by' => $userId ?? auth()->id(),
        ]);
    }

    public function markAsUnchecked(): void
    {
        $this->update([
            'is_checked' => false,
            'checked_at' => null,
            'checked_by' => null,
        ]);
    }
}