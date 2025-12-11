<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\PrerequisiteGroup;
use Illuminate\Support\Facades\File;

class PrerequisiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Read the JSON file
        $json = File::get(database_path('seeders/uidaho_cs_courses.json'));
        $courses = json_decode($json, true);

        // Create prerequisite groups and attach prerequisites
        foreach ($courses as $courseData) {
            $course = Course::find($courseData['id']);
            
            if (!$course || empty($courseData['prerequisite_groups'])) {
                continue;
            }

            foreach ($courseData['prerequisite_groups'] as $groupData) {
                // Create prerequisite group
                $group = PrerequisiteGroup::updateOrCreate(
                    ['id' => $groupData['id']],
                    ['course_id' => $course->id]
                );

                // Attach prerequisites to the group
                if (!empty($groupData['prerequisites'])) {
                    $prerequisiteIds = collect($groupData['prerequisites'])
                        ->pluck('id')
                        ->toArray();
                    
                    $group->prerequisites()->sync($prerequisiteIds);
                }
            }
        }
    }
}