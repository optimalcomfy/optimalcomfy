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
        Schema::table('properties', function (Blueprint $table) {
            $table->string('wifi_password')->nullable()->after('type');
            $table->string('cook')->nullable()->after('wifi_password');
            $table->string('cleaner')->nullable()->after('cook');
            $table->string('emergency_contact')->nullable()->after('cleaner');
            $table->text('key_location')->nullable()->after('emergency_contact');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'wifi_password',
                'cook',
                'cleaner',
                'emergency_contact',
                'key_location',
            ]);
        });
    }
};
