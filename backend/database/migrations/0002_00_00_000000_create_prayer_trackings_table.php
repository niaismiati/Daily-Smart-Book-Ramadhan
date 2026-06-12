<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->boolean('subuh_checked')->default(false);
            $table->boolean('subuh_berjamaah')->default(false);
            $table->boolean('dzuhur_checked')->default(false);
            $table->boolean('dzuhur_berjamaah')->default(false);
            $table->boolean('ashar_checked')->default(false);
            $table->boolean('ashar_berjamaah')->default(false);
            $table->boolean('maghrib_checked')->default(false);
            $table->boolean('maghrib_berjamaah')->default(false);
            $table->boolean('isya_checked')->default(false);
            $table->boolean('isya_berjamaah')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_trackings');
    }
};
