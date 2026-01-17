<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Check if id_front exists before renaming (though it seems to be the same name)
            if (Schema::hasColumn('users', 'id_front')) {
                // If you actually need to rename it to something else, change the second parameter
                // Currently it's renaming to itself, which is redundant
                // $table->renameColumn('id_front', 'new_column_name');
            }
            
            // Add new columns only if they don't exist
            if (!Schema::hasColumn('users', 'id_back')) {
                $table->string('id_back')->nullable()->after('contact_phone');
            }
            
            if (!Schema::hasColumn('users', 'pending_profile_picture')) {
                $table->string('pending_profile_picture')->nullable()->after('profile_picture');
            }
            
            if (!Schema::hasColumn('users', 'pending_id_front')) {
                $table->string('pending_id_front')->nullable()->after('id_back');
            }
            
            if (!Schema::hasColumn('users', 'pending_id_back')) {
                $table->string('pending_id_back')->nullable()->after('pending_id_front');
            }
            
            if (!Schema::hasColumn('users', 'pending_data')) {
                $table->json('pending_data')->nullable()->after('pending_id_back');
            }
            
            if (!Schema::hasColumn('users', 'profile_status')) {
                $table->enum('profile_status', ['active', 'pending', 'rejected'])->default('active')->after('pending_data');
            }
            
            if (!Schema::hasColumn('users', 'profile_verified_at')) {
                $table->timestamp('profile_verified_at')->nullable()->after('profile_status');
            }
            
            if (!Schema::hasColumn('users', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('profile_verified_at');
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Check if column exists before trying to rename
            if (Schema::hasColumn('users', 'id_front')) {
                // Again, this is renaming to itself - probably not needed
                // $table->renameColumn('new_column_name', 'id_front');
            }
            
            // Drop columns only if they exist
            if (Schema::hasColumn('users', 'id_back')) {
                $table->dropColumn('id_back');
            }
            
            if (Schema::hasColumn('users', 'pending_profile_picture')) {
                $table->dropColumn('pending_profile_picture');
            }
            
            if (Schema::hasColumn('users', 'pending_id_front')) {
                $table->dropColumn('pending_id_front');
            }
            
            if (Schema::hasColumn('users', 'pending_id_back')) {
                $table->dropColumn('pending_id_back');
            }
            
            if (Schema::hasColumn('users', 'pending_data')) {
                $table->dropColumn('pending_data');
            }
            
            if (Schema::hasColumn('users', 'profile_status')) {
                $table->dropColumn('profile_status');
            }
            
            if (Schema::hasColumn('users', 'profile_verified_at')) {
                $table->dropColumn('profile_verified_at');
            }
            
            if (Schema::hasColumn('users', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });
    }
};