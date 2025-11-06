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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('license_plate')->nullable();
            $table->string('brand');
            $table->string('model');
            $table->year('year')->nullable();
            $table->integer('mileage')->nullable();
            $table->string('body_type')->nullable();
            $table->unsignedTinyInteger('seats')->nullable();
            $table->unsignedTinyInteger('doors')->nullable();
            $table->integer('luggage_capacity')->nullable();
            $table->string('fuel_type')->nullable();
            $table->integer('engine_capacity')->nullable();
            $table->string('transmission')->nullable();
            $table->string('drive_type')->nullable();
            $table->string('fuel_economy')->nullable();
            $table->string('exterior_color')->nullable();
            $table->string('interior_color')->nullable();
            $table->decimal('price_per_day', 10, 2);
            $table->double('amount')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_available')->default(true);
            $table->string('location_address')->nullable();
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
        Schema::dropIfExists('cars');
    }
};
