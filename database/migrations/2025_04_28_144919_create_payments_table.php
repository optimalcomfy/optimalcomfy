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
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->onDelete('cascade');
            $table->foreignId('car_booking_id')->nullable()->constrained('car_bookings')->onDelete('cascade');
            $table->foreignId('food_order_id')->nullable()->constrained('food_orders')->onDelete('cascade');
            $table->foreignId('service_booking_id')->nullable()->constrained('service_bookings')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('');
            $table->enum('method', ['cash', 'card', 'mpesa', 'paypal']);
            $table->enum('status', ['pending', 'successful', 'failed'])->default('pending');
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
