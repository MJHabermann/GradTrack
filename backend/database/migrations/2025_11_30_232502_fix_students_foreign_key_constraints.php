<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');
        
        try {
            // Fix enrollments table
            if (Schema::hasTable('enrollments')) {
                // Create temporary table with correct foreign key
                DB::statement('
                    CREATE TABLE enrollments_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        course_id INTEGER NOT NULL,
                        term VARCHAR(255) NOT NULL,
                        status VARCHAR(255) NOT NULL DEFAULT "enrolled",
                        grade INTEGER NULL,
                        created_at DATETIME NULL,
                        updated_at DATETIME NULL,
                        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                    )
                ');
                
                // Copy data from old table to new table
                DB::statement('INSERT INTO enrollments_new SELECT * FROM enrollments');
                
                // Drop old table
                Schema::drop('enrollments');
                
                // Rename new table
                DB::statement('ALTER TABLE enrollments_new RENAME TO enrollments');
            }
            
            // Fix terms table
            if (Schema::hasTable('terms')) {
                // Create temporary table with correct foreign key
                DB::statement('
                    CREATE TABLE terms_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        name VARCHAR(255) NULL,
                        "order" INTEGER NOT NULL DEFAULT 0,
                        created_at DATETIME NULL,
                        updated_at DATETIME NULL,
                        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
                    )
                ');
                
                // Copy data from old table to new table
                DB::statement('INSERT INTO terms_new SELECT * FROM terms');
                
                // Drop old table
                Schema::drop('terms');
                
                // Rename new table
                DB::statement('ALTER TABLE terms_new RENAME TO terms');
            }
        } finally {
            // Re-enable foreign key checks
            DB::statement('PRAGMA foreign_keys = ON');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        DB::statement('PRAGMA foreign_keys = OFF');
        
        try {
            if (Schema::hasTable('enrollments')) {
                DB::statement('
                    CREATE TABLE enrollments_old (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        course_id INTEGER NOT NULL,
                        term VARCHAR(255) NOT NULL,
                        status VARCHAR(255) NOT NULL DEFAULT "enrolled",
                        grade INTEGER NULL,
                        created_at DATETIME NULL,
                        updated_at DATETIME NULL,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
                    )
                ');
                
                DB::statement('INSERT INTO enrollments_old SELECT * FROM enrollments');
                Schema::drop('enrollments');
                DB::statement('ALTER TABLE enrollments_old RENAME TO enrollments');
            }
            
            if (Schema::hasTable('terms')) {
                DB::statement('
                    CREATE TABLE terms_old (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        name VARCHAR(255) NULL,
                        "order" INTEGER NOT NULL DEFAULT 0,
                        created_at DATETIME NULL,
                        updated_at DATETIME NULL,
                        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                    )
                ');
                
                DB::statement('INSERT INTO terms_old SELECT * FROM terms');
                Schema::drop('terms');
                DB::statement('ALTER TABLE terms_old RENAME TO terms');
            }
        } finally {
            DB::statement('PRAGMA foreign_keys = ON');
        }
    }
};
