<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\PrerequisiteGroup;
use Illuminate\Support\Facades\File;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Read the JSON file
        $json = File::get(database_path('seeders/uidaho_cs_courses.json'));
        $courses = json_decode($json, true);

        // Create courses without prerequisites first
        foreach ($courses as $courseData) {
            Course::updateOrCreate(
                ['id' => $courseData['id']],
                [
                    'course_code' => $courseData['course_code'],
                    'title' => $courseData['title'],
                    'credits' => $courseData['credits'],
                    'level' => $courseData['level'],
                ]
            );
        }
    }
}
