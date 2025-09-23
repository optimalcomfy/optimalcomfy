<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ChangeForeignKeysOnDeleteToSetNull extends Migration
{
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        
        // Helper function to safely drop foreign keys
        $dropForeignKeySafe = function($tableName, $columnName) {
            $foreignKey = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = ? 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ", [DB::getDatabaseName(), $tableName, $columnName]);
            
            if (!empty($foreignKey)) {
                DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$foreignKey[0]->CONSTRAINT_NAME}`");
            }
        };
        
        // Make columns nullable first
        Schema::table('repayments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unsignedBigInteger('property_id')->nullable()->change();
            $table->unsignedBigInteger('cancelled_by_id')->nullable()->change();
        });
        
        Schema::table('car_bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unsignedBigInteger('car_id')->nullable()->change();
            $table->unsignedBigInteger('cancelled_by_id')->nullable()->change();
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unsignedBigInteger('car_booking_id')->nullable()->change();
            $table->unsignedBigInteger('food_order_id')->nullable()->change();
            $table->unsignedBigInteger('service_booking_id')->nullable()->change();
            
            if (Schema::hasColumn('payments', 'booking_id')) {
                $table->unsignedBigInteger('booking_id')->nullable()->change();
            }
        });
        
        // Now drop and recreate foreign keys safely
        $dropForeignKeySafe('repayments', 'user_id');
        DB::statement("ALTER TABLE `repayments` ADD CONSTRAINT `repayments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('bookings', 'user_id');
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('bookings', 'property_id');
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('bookings', 'cancelled_by_id');
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_cancelled_by_id_foreign` FOREIGN KEY (`cancelled_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('car_bookings', 'user_id');
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('car_bookings', 'car_id');
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_car_id_foreign` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('car_bookings', 'cancelled_by_id');
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_cancelled_by_id_foreign` FOREIGN KEY (`cancelled_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('payments', 'user_id');
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('payments', 'car_booking_id');
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_car_booking_id_foreign` FOREIGN KEY (`car_booking_id`) REFERENCES `car_bookings` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('payments', 'food_order_id');
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_food_order_id_foreign` FOREIGN KEY (`food_order_id`) REFERENCES `food_orders` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('payments', 'service_booking_id');
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_service_booking_id_foreign` FOREIGN KEY (`service_booking_id`) REFERENCES `service_bookings` (`id`) ON DELETE SET NULL");
        
        // Handle booking_id separately
        if (Schema::hasColumn('payments', 'booking_id')) {
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'payments' 
                AND COLUMN_NAME = 'booking_id' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ", [DB::getDatabaseName()]);
            
            if (empty($foreignKeys)) {
                DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL");
            } else {
                $dropForeignKeySafe('payments', 'booking_id');
                DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL");
            }
        }
        
        Schema::enableForeignKeyConstraints();
    }
    
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        
        // Helper function for down migration
        $dropForeignKeySafe = function($tableName, $columnName) {
            $foreignKey = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = ? 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ", [DB::getDatabaseName(), $tableName, $columnName]);
            
            if (!empty($foreignKey)) {
                DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$foreignKey[0]->CONSTRAINT_NAME}`");
            }
        };
        
        // Revert foreign keys to CASCADE and make columns not nullable
        $dropForeignKeySafe('repayments', 'user_id');
        DB::statement("ALTER TABLE `repayments` MODIFY `user_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `repayments` ADD CONSTRAINT `repayments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('bookings', 'user_id');
        DB::statement("ALTER TABLE `bookings` MODIFY `user_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('bookings', 'property_id');
        DB::statement("ALTER TABLE `bookings` MODIFY `property_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('bookings', 'cancelled_by_id');
        DB::statement("ALTER TABLE `bookings` ADD CONSTRAINT `bookings_cancelled_by_id_foreign` FOREIGN KEY (`cancelled_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('car_bookings', 'user_id');
        DB::statement("ALTER TABLE `car_bookings` MODIFY `user_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('car_bookings', 'car_id');
        DB::statement("ALTER TABLE `car_bookings` MODIFY `car_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_car_id_foreign` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('car_bookings', 'cancelled_by_id');
        DB::statement("ALTER TABLE `car_bookings` ADD CONSTRAINT `car_bookings_cancelled_by_id_foreign` FOREIGN KEY (`cancelled_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL");
        
        $dropForeignKeySafe('payments', 'user_id');
        DB::statement("ALTER TABLE `payments` MODIFY `user_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('payments', 'car_booking_id');
        DB::statement("ALTER TABLE `payments` MODIFY `car_booking_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_car_booking_id_foreign` FOREIGN KEY (`car_booking_id`) REFERENCES `car_bookings` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('payments', 'food_order_id');
        DB::statement("ALTER TABLE `payments` MODIFY `food_order_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_food_order_id_foreign` FOREIGN KEY (`food_order_id`) REFERENCES `food_orders` (`id`) ON DELETE CASCADE");
        
        $dropForeignKeySafe('payments', 'service_booking_id');
        DB::statement("ALTER TABLE `payments` MODIFY `service_booking_id` BIGINT UNSIGNED NOT NULL");
        DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_service_booking_id_foreign` FOREIGN KEY (`service_booking_id`) REFERENCES `service_bookings` (`id`) ON DELETE CASCADE");
        
        if (Schema::hasColumn('payments', 'booking_id')) {
            $dropForeignKeySafe('payments', 'booking_id');
            DB::statement("ALTER TABLE `payments` MODIFY `booking_id` BIGINT UNSIGNED NOT NULL");
            DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE");
        }
        
        Schema::enableForeignKeyConstraints();
    }
}