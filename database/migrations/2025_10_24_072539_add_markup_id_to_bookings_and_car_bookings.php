<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('markup_id')->nullable()->constrained('markups')->onDelete('set null');
        });

        Schema::table('car_bookings', function (Blueprint $table) {
            $table->foreignId('markup_id')->nullable()->constrained('markups')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['markup_id']);
            $table->dropColumn('markup_id');
        });

        Schema::table('car_bookings', function (Blueprint $table) {
            $table->dropForeign(['markup_id']);
            $table->dropColumn('markup_id');
        });
    }
};
