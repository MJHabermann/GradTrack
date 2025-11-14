<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Faculty;
use App\Models\User;

class FacultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get faculty users
        $facultyUsers = User::where('role', 'faculty')->get();

        $facultyData = [
            [
                'faculty_id' => $facultyUsers->where('email', 'faculty@gradtrack.com')->first()->id,
                'title' => 'Prof.',
                'office' => 'CS Building Room 101',
            ],
            [
                'faculty_id' => $facultyUsers->where('email', 'sarah.johnson@gradtrack.com')->first()->id,
                'title' => 'Dr.',
                'office' => 'CS Building Room 201',
            ],
            [
                'faculty_id' => $facultyUsers->where('email', 'michael.chen@gradtrack.com')->first()->id,
                'title' => 'Prof.',
                'office' => 'CS Building Room 205',
            ],
            [
                'faculty_id' => $facultyUsers->where('email', 'emily.rodriguez@gradtrack.com')->first()->id,
                'title' => 'Dr.',
                'office' => 'Math Building Room 301',
            ],
            [
                'faculty_id' => $facultyUsers->where('email', 'david.kim@gradtrack.com')->first()->id,
                'title' => 'Prof.',
                'office' => 'Physics Building Room 401',
            ],
            [
                'faculty_id' => $facultyUsers->where('email', 'lisa.wang@gradtrack.com')->first()->id,
                'title' => 'Dr.',
                'office' => 'CS Building Room 203',
            ],
        ];

        foreach ($facultyData as $faculty) {
            Faculty::create($faculty);
        }
    }
}
