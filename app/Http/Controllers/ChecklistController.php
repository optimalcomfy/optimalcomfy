<?php

namespace App\Http\Controllers;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistItem;
use App\Models\ChecklistResponse;
use App\Models\ChecklistResponseItem;
use App\Models\Booking;
use App\Models\CarBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ChecklistController extends Controller
{
    /**
     * Display a listing of checklist templates.
     */
    public function index(Request $request)
    {
        $query = ChecklistTemplate::query()->with(['items' => function($q) {
            $q->orderBy('order');
        }]);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $templates = $query->orderBy('order')->paginate(10);

        return Inertia::render('Checklists/Index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new checklist template.
     */
    public function create()
    {
        return Inertia::render('Checklists/Create');
    }

    /**
     * Store a newly created checklist template.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:property,car,general',
            'is_active' => 'boolean',
        ]);

        $template = ChecklistTemplate::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'is_active' => $validated['is_active'] ?? true,
            'order' => ChecklistTemplate::max('order') + 1,
        ]);

        return redirect()->route('checklists.index')
            ->with('success', 'Checklist template created successfully.');
    }

    /**
     * Display the specified checklist template.
     */
    public function show(ChecklistTemplate $checklist)
    {
        $checklist->load(['items' => function($q) {
            $q->orderBy('order');
        }]);

        return Inertia::render('Checklists/Show', [
            'template' => $checklist,
        ]);
    }

    /**
     * Show the form for editing a checklist template.
     */
    public function edit(ChecklistTemplate $checklist)
    {
        $checklist->load(['items' => function($q) {
            $q->orderBy('order');
        }]);

        return Inertia::render('Checklists/Edit', [
            'template' => $checklist,
        ]);
    }

    /**
     * Update the specified checklist template.
     */
    public function update(Request $request, ChecklistTemplate $checklist)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:property,car,general',
            'is_active' => 'boolean',
        ]);

        $checklist->update($validated);

        return redirect()->route('checklists.index')
            ->with('success', 'Checklist template updated successfully.');
    }

    /**
     * Remove the specified checklist template.
     */
    public function destroy(ChecklistTemplate $checklist)
    {
        $checklist->delete();

        return redirect()->route('checklists.index')
            ->with('success', 'Checklist template deleted successfully.');
    }

    /**
     * Add item to checklist template.
     */
    public function addItem(Request $request, ChecklistTemplate $checklist)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'is_required' => 'boolean',
        ]);

        $item = $checklist->items()->create([
            'item_name' => $validated['item_name'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'is_required' => $validated['is_required'] ?? false,
            'order' => $checklist->items()->max('order') + 1,
        ]);

        return response()->json(['item' => $item], 201);
    }

    /**
     * Update checklist item.
     */
    public function updateItem(Request $request, ChecklistItem $item)
    {


        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'is_required' => 'boolean',
            'order' => 'integer',
        ]);

        $item->update($validated);

        return response()->json(['item' => $item]);
    }

    /**
     * Delete checklist item.
     */
    public function deleteItem(ChecklistItem $item)
    {
        $item->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get checklist for a booking.
     */
    public function getBookingChecklist(Booking $booking)
    {
        $checklist = $booking->activeChecklist();

        // Return Inertia response even when checklist is not found
        if (!$checklist) {
            return Inertia::render('Checklists/BookingChecklist', [
                'booking' => $booking,
                'checklist' => null, // Explicitly set to null
                'error' => 'No checklist found for this booking', // Add error message
                'type' => 'property',
            ]);
        }

        $checklist->load([
            'template.items',
            'responseItems' => function($q) {
                $q->with('item')->orderBy('id');
            }
        ]);

        return Inertia::render('Checklists/BookingChecklist', [
            'booking' => $booking,
            'checklist' => $checklist,
            'type' => 'property',
            'error' => null, // Explicitly set error to null when successful
        ]);
    }

    /**
     * Get checklist for a car booking.
     */
    public function getCarBookingChecklist(CarBooking $carBooking)
    {
        $checklist = $carBooking->activeChecklist();

        if (!$checklist) {
            return Inertia::render('Checklists/BookingChecklist', [
                'booking' => $carBooking,
                'checklist' => null,
                'error' => 'No checklist found for this booking',
                'type' => 'car',
            ]);
        }

        $checklist->load([
            'template.items',
            'responseItems' => function($q) {
                $q->with('item')->orderBy('id');
            }
        ]);

        return Inertia::render('Checklists/BookingChecklist', [
            'booking' => $carBooking,
            'checklist' => $checklist,
            'type' => 'car',
            'error' => null,
        ]);
    }

    /**
     * Update checklist response item.
     */
    public function updateChecklistItem(Request $request, ChecklistResponse $checklist)
    {
        $validated = $request->validate([
            'response_item_id' => 'required|exists:checklist_response_items,id',
            'is_checked' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $responseItem = ChecklistResponseItem::find($validated['response_item_id']);

        // Verify this response item belongs to the checklist
        if ($responseItem->checklist_response_id !== $checklist->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $responseItem->update([
            'is_checked' => $validated['is_checked'],
            'notes' => $validated['notes'] ?? null,
            'checked_at' => $validated['is_checked'] ? now() : null,
            'checked_by' => $validated['is_checked'] ? auth()->id() : null,
        ]);

        // Check if all items are checked
        $allChecked = !$checklist->responseItems()->where('is_checked', false)->exists();
        
        if ($allChecked && $checklist->status !== 'completed') {
            $checklist->update([
                'status' => 'completed',
                'completed_at' => now(),
                'completed_by' => auth()->id(),
            ]);
        }

        // Load the updated checklist with relationships
        $checklist->load(['responseItems', 'responseItems.item']);
        
        // Get the booking and type based on checklistable type
        $booking = null;
        $type = null;
        
        if ($checklist->checklistable_type === 'App\\Models\\Booking') {
            $booking = $checklist->checklistable;
            $type = 'property';
        } elseif ($checklist->checklistable_type === 'App\\Models\\CarBooking') {
            $booking = $checklist->checklistable;
            $type = 'car';
        }
        
        // Return to the checklist page with updated data
        return inertia('Checklists/BookingChecklist', [
            'booking' => $booking,
            'checklist' => $checklist,
            'type' => $type,
            'success' => 'Item updated successfully',
        ]);
    }

    /**
     * Complete checklist.
     */
    public function completeChecklist(ChecklistResponse $checklist)
    {
        $checklist->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => auth()->id(),
        ]);

        // Mark all items as checked if not already
        $checklist->responseItems()->update([
            'is_checked' => true,
            'checked_at' => now(),
            'checked_by' => auth()->id(),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Get all checklist responses.
     */
    public function responses(Request $request)
    {
        $query = ChecklistResponse::query()
            ->with(['template', 'checklistable', 'completedBy'])
            ->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->whereHas('template', function($q) use ($request) {
                $q->where('type', $request->type);
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('template', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                })->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $responses = $query->paginate(15);

        return Inertia::render('Checklists/Responses', [
            'responses' => $responses,
            'filters' => $request->only(['status', 'type', 'search']),
        ]);
    }

    /**
     * Show checklist response details.
     */
    public function showResponse(ChecklistResponse $checklistResponse)
    {
        $checklistResponse->load([
            'template.items',
            'responseItems.item',
            'checklistable',
            'completedBy'
        ]);

        return Inertia::render('Checklists/ResponseShow', [
            'response' => $checklistResponse,
        ]);
    }
}