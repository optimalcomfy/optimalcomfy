<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('checklist_responses', function (Blueprint $table) {
            $table->id();
            $table->string('checklistable_type'); // App\Models\Booking or App\Models\CarBooking
            $table->unsignedBigInteger('checklistable_id'); // booking_id or car_booking_id
            $table->foreignId('checklist_template_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // pending, in_progress, completed
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('completed_by')->nullable(); // host/admin who completed it
            $table->foreign('completed_by')->references('id')->on('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['checklistable_type', 'checklistable_id']);
        });

        Schema::create('checklist_response_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_response_id')->constrained()->onDelete('cascade');
            $table->foreignId('checklist_item_id')->constrained()->onDelete('cascade');
            $table->boolean('is_checked')->default(false);
            $table->text('notes')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->unsignedBigInteger('checked_by')->nullable();
            $table->foreign('checked_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
            
            // Use a custom, shorter name for the unique constraint
            $table->unique(['checklist_response_id', 'checklist_item_id'], 'checklist_resp_item_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_response_items');
        Schema::dropIfExists('checklist_responses');
    }
};