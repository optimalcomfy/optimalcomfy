<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->integer('rooms')->unsigned()->nullable()->after('max_children');
            $table->integer('beds')->unsigned()->nullable()->after('rooms');
            $table->integer('baths')->unsigned()->nullable()->after('beds');
        });
    }

    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['rooms', 'beds', 'baths']);
        });
    }
};