<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // In the migration file
    public function up()
    {
        Schema::table('car_bookings', function (Blueprint $table) {
            $table->string('pesapal_tracking_id')->nullable()->after('referral_code');
        });
    }

    public function down()
    {
        Schema::table('car_bookings', function (Blueprint $table) {
            $table->dropColumn('pesapal_tracking_id');
        });
    }
};
