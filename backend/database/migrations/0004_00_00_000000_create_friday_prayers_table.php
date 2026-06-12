<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friday_prayers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('khatib_name');
            $table->foreignId('sermon_topic_id')->nullable()->constrained()->nullOnDelete();
            $table->text('summary');
            $table->text('lesson')->nullable();
            $table->text('teacher_comment')->nullable();
            $table->integer('teacher_score')->nullable();
            $table->boolean('is_graded')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friday_prayers');
    }
};
