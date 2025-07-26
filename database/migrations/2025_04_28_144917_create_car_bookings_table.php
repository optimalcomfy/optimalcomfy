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
        Schema::create('car_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('number')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamp('checked_in')->nullable();
            $table->timestamp('checked_out')->nullable();
            $table->decimal('total_price', 10, 2);
            $table->string('pickup_location')->nullable();
            $table->string('dropoff_location')->nullable();
            $table->string('status')->nullable();
            $table->text('special_requests')->nullable();
            $table->string('checkin_verification_code')->nullable();
            $table->string('checkout_verification_code')->nullable();
            $table->string('failed_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->unsignedBigInteger('cancelled_by_id')->nullable();
            $table->foreign('cancelled_by_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_bookings');
    }
};
