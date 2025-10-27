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
        // Drop the entire table and recreate it with new schema
        Schema::dropIfExists('students');
        
        Schema::create('students', function (Blueprint $table) {
            // Add new columns according to specification
            $table->foreignId('student_id')->primary()->constrained('users', 'id')->onDelete('cascade');
            $table->enum('program_type', ['Masters', 'PhD'])->after('student_id');
            $table->foreignId('major_professor_id')->nullable()->constrained('users', 'id')->onDelete('set null')->after('program_type');
            $table->string('start_term')->after('major_professor_id');
            $table->enum('i9_status', ['Pending', 'Completed'])->default('Pending')->after('start_term');
            $table->boolean('deficiency_cleared')->default(false)->after('i9_status');
            $table->string('graduation_term')->nullable()->after('deficiency_cleared');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new table and recreate the original
        Schema::dropIfExists('students');
        
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('program')->nullable();
            $table->foreignId('advisor_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }
};
