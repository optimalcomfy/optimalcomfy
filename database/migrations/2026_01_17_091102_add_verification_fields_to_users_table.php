<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('id_front', 'id_front');
            
            $table->string('id_back')->nullable()->after('contact_phone');
            $table->string('pending_profile_picture')->nullable()->after('profile_picture');
            $table->string('pending_id_front')->nullable()->after('id_back');
            $table->string('pending_id_back')->nullable()->after('pending_id_front');
            $table->json('pending_data')->nullable()->after('pending_id_back');
            $table->enum('profile_status', ['active', 'pending', 'rejected'])->default('active')->after('pending_data');
            $table->timestamp('profile_verified_at')->nullable()->after('profile_status');
            $table->text('rejection_reason')->nullable()->after('profile_verified_at');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('id_front', 'id_front');
            
            $table->dropColumn([
                'id_back',
                'pending_profile_picture',
                'pending_id_front',
                'pending_id_back',
                'pending_data',
                'profile_status',
                'profile_verified_at',
                'rejection_reason'
            ]);
        });
    }
};