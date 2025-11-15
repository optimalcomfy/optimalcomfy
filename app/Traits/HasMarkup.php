<?php

namespace App\Traits;

use App\Models\Markup;
use Illuminate\Support\Facades\Cache;

trait HasMarkup
{
    /**
     * Polymorphic relationship with markups
     */
    public function markups()
    {
        return $this->morphMany(Markup::class, 'markupable');
    }

    /**
     * Get active markup for current user
     */
    public function getCurrentUserMarkup()
    {
        if (!auth()->check()) {
            return null;
        }

        return $this->markups()
            ->where('user_id', auth()->id())
            ->active()
            ->first();
    }

    public function applyMarkup($markupValue, $isPercentage = true, $userId = null)
    {
        $userId = $userId ?? auth()->id();
        $user = \App\Models\User::find($userId);

        if (!$user || !$user->canAddMarkup()) {
            throw new \Exception('Only hosts can add markups');
        }

        $this->markups()
            ->where('user_id', $userId)
            ->update(['is_active' => false]);

        $markup = new Markup([
            'user_id' => $userId,
            'markup_percentage' => $isPercentage ? $markupValue : null,
            'markup_amount' => $isPercentage ? null : $markupValue,
            'original_amount' => $this->amount,
            'is_active' => true,
        ]);

        $markup->final_amount = $markup->calculateFinalAmount();

        return $this->markups()->save($markup);
    }

    /**
     * Remove markup for current user
     */
    public function removeMarkup($userId = null)
    {
        $userId = $userId ?? auth()->id();

        return $this->markups()
            ->where('user_id', $userId)
            ->update(['is_active' => false]);
    }

    /**
     * Get final price for current user (with their markup)
     */
    public function getFinalPriceForUser($userId = null)
    {
        $userId = $userId ?? auth()->id();

        $markup = $this->markups()
            ->where('user_id', $userId)
            ->active()
            ->first();

        return $markup ? $markup->final_amount : $this->amount;
    }

    /**
     * Generate markup link for specific user
     */
    public function generateMarkupLink($userId = null)
    {
        $userId = $userId ?? auth()->id();

        $markup = $this->getCurrentUserMarkup();

        if (!$markup) {
            return url("/{$this->getTable()}/{$this->id}");
        }

        // Store the token in cache for verification
        Cache::put(
            "markup_link_{$markup->markup_token}",
            [
                'markup_id' => $markup->id,
                'user_id' => $markup->user_id,
                'type' => $this->getTable(),
                'id' => $this->id,
                'final_amount' => $markup->final_amount
            ],
            now()->addDays(30)
        );

        return url("/mrk-booking/{$markup->markup_token}");
    }

    /**
     * Get all active markups for this item
     */
    public function getActiveMarkups()
    {
        return $this->markups()
            ->active()
            ->with('user')
            ->get();
    }

    /**
     * Check if user has an active markup
     */
    public function userHasMarkup($userId = null)
    {
        $userId = $userId ?? auth()->id();

        return $this->markups()
            ->where('user_id', $userId)
            ->active()
            ->exists();
    }

    /**
     * Accessor for current user's final price
     */
    public function getCurrentUserFinalPriceAttribute()
    {
        return $this->getFinalPriceForUser();
    }

    /**
     * Accessor for markup details for current user
     */
    public function getCurrentUserMarkupDetailsAttribute()
    {
        $markup = $this->getCurrentUserMarkup();

        if (!$markup) {
            return null;
        }

        return [
            'base_amount' => $markup->original_amount,
            'markup_percentage' => $markup->markup_percentage,
            'markup_amount' => $markup->markup_amount,
            'final_amount' => $markup->final_amount,
            'your_profit' => $markup->profit,
            'markup_id' => $markup->id,
            'markup_token' => $markup->markup_token,
        ];
    }

    /**
     * Check if current user can add markup (must be host)
     */
    public function getCanAddMarkupAttribute()
    {
        if (!auth()->check()) {
            return false;
        }

        return auth()->user()->canAddMarkup();
    }
}
