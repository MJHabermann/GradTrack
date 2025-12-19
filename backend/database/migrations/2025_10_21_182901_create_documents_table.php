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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // pdf, docx, etc.
            $table->integer('file_size'); // in bytes
            $table->string('tag')->default('Untagged');
            $table->boolean('is_required')->default(false);
            $table->string('required_document_type')->nullable(); // 'Application Form', 'Transcripts', etc.
            $table->datetime('deadline')->nullable(); // 'Pending', 'Approved', 'Rejected'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
