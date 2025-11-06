<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('communication_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject')->nullable();
            $table->text('sms_content')->nullable();
            $table->text('email_content')->nullable();
            $table->enum('type', ['booking_confirmation', 'payment_reminder', 'checkin_reminder', 'checkout_reminder', 'promotional', 'custom']);
            $table->enum('target_audience', ['guests', 'hosts', 'both', 'custom']);
            $table->json('custom_recipients')->nullable(); // For custom recipient selection
            $table->boolean('is_active')->default(true);
            $table->json('variables')->nullable(); // Available variables for template
            $table->timestamps();
        });

        Schema::create('bulk_communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('communication_templates');
            $table->string('subject')->nullable();
            $table->text('sms_content')->nullable();
            $table->text('email_content')->nullable();
            $table->enum('target_audience', ['guests', 'hosts', 'both', 'custom']);
            $table->json('recipient_filters')->nullable(); // Filters for selecting recipients
            $table->json('custom_recipients')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->integer('sms_sent')->default(0);
            $table->integer('emails_sent')->default(0);
            $table->integer('sms_failed')->default(0);
            $table->integer('emails_failed')->default(0);
            $table->enum('status', ['draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bulk_communication_id')->nullable()->constrained('bulk_communications');
            $table->foreignId('user_id')->constrained('users');
            $table->string('type'); // sms, email, push
            $table->string('recipient');
            $table->text('content');
            $table->string('subject')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed']);
            $table->text('status_message')->nullable();
            $table->string('message_id')->nullable(); // SMS/Email provider message ID
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('info'); // info, success, warning, error
            $table->json('data')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('communication_logs');
        Schema::dropIfExists('bulk_communications');
        Schema::dropIfExists('communication_templates');
    }
};
