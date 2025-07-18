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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('status');
            $table->string('checkout_request_id')->nullable()->after('phone');
            $table->string('merchant_request_id')->nullable()->after('checkout_request_id');
            $table->string('mpesa_receipt')->nullable()->after('merchant_request_id');
            $table->string('transaction_date')->nullable()->after('mpesa_receipt');
            $table->string('transaction_id')->nullable()->after('transaction_date');
            $table->string('failure_reason')->nullable()->after('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            //
        });
    }
};
