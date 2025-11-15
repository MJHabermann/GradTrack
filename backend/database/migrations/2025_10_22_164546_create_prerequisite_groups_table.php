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
        Schema::create('prerequisite_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
        Schema::create('group_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prerequisite_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('prerequisite_id')->constrained('courses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_prerequisites');
        Schema::dropIfExists('prerequisite_groups');
    }
};
