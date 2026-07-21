<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ChecklistResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'checklistable_type',
        'checklistable_id',
        'checklist_template_id',
        'status',
        'completed_at',
        'completed_by',
        'notes'
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function checklistable(): MorphTo
    {
        return $this->morphTo();
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ChecklistTemplate::class, 'checklist_template_id');
    }

    public function responseItems(): HasMany
    {
        return $this->hasMany(ChecklistResponseItem::class, 'checklist_response_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }
    
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
    
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
    
    public function progressPercentage(): float
    {
        $totalItems = $this->responseItems()->count();
        if ($totalItems === 0) return 0;
        
        $checkedItems = $this->responseItems()->where('is_checked', true)->count();
        
        return round(($checkedItems / $totalItems) * 100, 2);
    }
}