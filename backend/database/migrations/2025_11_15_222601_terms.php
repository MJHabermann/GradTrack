<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (! Schema::hasTable('terms')) {
            Schema::create('terms', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
                $table->string('name')->nullable();
                $table->integer('order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('term_courses')) {
            Schema::create('term_courses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('term_id')->constrained('terms')->onDelete('cascade');
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('term_courses');
        Schema::dropIfExists('terms');
    }
};
