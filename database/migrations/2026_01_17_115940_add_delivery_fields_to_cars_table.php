<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->integer('minimum_rental_days')->unsigned()->default(1)->after('price_per_day');
            $table->boolean('delivery_toggle')->default(false)->after('minimum_rental_days');
            $table->decimal('delivery_fee', 10, 2)->nullable()->after('delivery_toggle');
        });
    }

    public function down()
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn(['minimum_rental_days', 'delivery_toggle', 'delivery_fee']);
        });
    }
};