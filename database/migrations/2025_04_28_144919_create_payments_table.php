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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->foreignId('car_booking_id')->nullable()->constrained('car_bookings')->onDelete('cascade');
            $table->foreignId('food_order_id')->nullable()->constrained('food_orders')->onDelete('cascade');
            $table->foreignId('service_booking_id')->nullable()->constrained('service_bookings')->onDelete('cascade');
            $table->double('amount')->nullable();
            $table->string('booking_type')->nullable();
            $table->string('method')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
