<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('markup_user_id')->after('markup_id')->nullable()->constrained('users')->onDelete('set null');
            $table->index('markup_user_id');
        });

        Schema::table('car_bookings', function (Blueprint $table) {
            $table->foreignId('markup_user_id')->after('markup_id')->nullable()->constrained('users')->onDelete('set null');
            $table->index('markup_user_id');
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['markup_user_id']);
            $table->dropColumn('markup_user_id');
        });

        Schema::table('car_bookings', function (Blueprint $table) {
            $table->dropForeign(['markup_user_id']);
            $table->dropColumn('markup_user_id');
        });
    }
};
