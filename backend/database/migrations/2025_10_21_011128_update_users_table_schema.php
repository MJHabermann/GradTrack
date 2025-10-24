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
        Schema::table('users', function (Blueprint $table) {
            // Add new columns with default values for existing data
            $table->string('first_name')->default('Unknown')->after('id');
            $table->string('last_name')->default('User')->after('first_name');
            $table->string('department')->nullable()->after('role');

            $table->dropColumn('name');
            
            // Update the role enum to include 'faculty'
            $table->dropColumn('role');
        });
        
        // Add the updated role column with all three options
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'faculty', 'admin'])->default('student')->after('email');
        });
        
        // Remove default values after adding the columns
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->default(null)->change();
            $table->string('last_name')->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the new columns
            $table->dropColumn(['first_name', 'last_name', 'department']);
            
            // Revert role enum to original
            $table->dropColumn('role');
        });
        
        // Add back the original role column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['student', 'admin'])->default('student')->after('email');
        });
    }
};
