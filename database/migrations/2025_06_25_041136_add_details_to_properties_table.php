<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDetailsToPropertiesTable extends Migration
{
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('apartment_name')->nullable()->after('id');
            $table->string('block')->nullable()->after('apartment_name');
            $table->string('house_number')->nullable()->after('block');
            $table->text('lock_box_location')->nullable()->after('house_number');
            $table->string('wifi_name')->nullable()->after('lock_box_location');
        });
    }

    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'apartment_name',
                'block',
                'house_number',
                'lock_box_location',
                'wifi_name',
            ]);
        });
    }
}
