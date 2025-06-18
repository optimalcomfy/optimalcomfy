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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('property_name')->unique();
            $table->string('type')->nullable();
            $table->string('wifi_password')->nullable();
            $table->string('cook')->nullable();
            $table->string('cleaner')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->text('key_location')->nullable();
            $table->decimal('price_per_night', 10, 2);
            $table->integer('max_guests')->default(0);
            $table->integer('max_adults')->default(0);
            $table->integer('max_children')->default(0);
            $table->enum('status', ['available', 'booked', 'maintenance'])->default('available');
            $table->longText('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
