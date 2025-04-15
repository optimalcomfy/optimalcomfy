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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->integer('role_id')->nullable();
            $table->string('email')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->rememberToken();
            $table->timestamps();

            // New fields based on the form
            $table->date('date_of_birth')->nullable(); // Added date of birth
            $table->string('nationality')->nullable(); // Added nationality
            $table->string('current_location')->nullable(); // Added current location
            $table->text('preferred_countries')->nullable(); // Added preferred countries
            $table->integer('work_experience')->nullable(); // Added work experience (years)
            $table->string('education')->nullable(); // Added education
            $table->string('languages')->nullable(); // Added languages
            $table->string('passport_number')->nullable(); // Added passport number
            $table->text('cv')->nullable(); // Added CV (could be file path or content)
            $table->text('cover_letter')->nullable(); // Added cover letter (could be file path or content)
            $table->text('references')->nullable(); // Added references
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
