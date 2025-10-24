<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('markups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('markupable');
            $table->decimal('markup_percentage', 5, 2)->nullable();
            $table->decimal('markup_amount', 10, 2)->nullable();
            $table->decimal('original_amount', 10, 2);
            $table->decimal('final_amount', 10, 2);
            $table->string('markup_token')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'markupable_type', 'is_active']);
            $table->unique(['user_id', 'markupable_id', 'markupable_type', 'is_active'], 'unique_active_markup');
        });
    }

    public function down()
    {
        Schema::dropIfExists('markups');
    }
};
