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
        Schema::table('students', function (Blueprint $table) {
            $table->enum('program_type', ['Masters', 'PhD'])->nullable()->change();
            $table->string('start_term')->nullable()->change();
            $table->enum('i9_status', ['Pending', 'Completed'])->nullable()->change();
            $table->boolean('deficiency_cleared')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->enum('program_type', ['Masters', 'PhD'])->nullable(false)->change();
            $table->string('start_term')->nullable(false)->change();
            $table->enum('i9_status', ['Pending', 'Completed'])->default('Pending')->change();
            $table->boolean('deficiency_cleared')->default(false)->change();
        });
    }
};
