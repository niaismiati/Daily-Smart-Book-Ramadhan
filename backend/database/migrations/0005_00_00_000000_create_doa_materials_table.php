<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doa_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('arabic_text');
            $table->text('latin_text');
            $table->text('translation');
            $table->string('audio_url')->nullable();
            $table->enum('category', [
                'niat_puasa',
                'berbuka',
                'after_berbuka',
                'sahur',
                'lailatul_qadar'
            ]);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doa_materials');
    }
};
