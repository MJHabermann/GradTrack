<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\User;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        // Get student users and faculty users
        $studentUsers = User::where('role', 'student')->get();
        $facultyUsers = User::where('role', 'faculty')->get();

        $studentData = [
            [
                'student_id' => $studentUsers->where('email', 'john.smith@student.gradtrack.com')->first()->id,
                'program_type' => 'PhD',
                'major_professor_id' => $facultyUsers->where('email', 'sarah.johnson@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2023',
                'i9_status' => 'Completed',
                'deficiency_cleared' => true,
                'graduation_term' => 'Spring 2027',
            ],
            [
                'student_id' => $studentUsers->where('email', 'alice.brown@student.gradtrack.com')->first()->id,
                'program_type' => 'Masters',
                'major_professor_id' => $facultyUsers->where('email', 'michael.chen@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2024',
                'i9_status' => 'Completed',
                'deficiency_cleared' => false,
                'graduation_term' => 'Spring 2026',
            ],
            [
                'student_id' => $studentUsers->where('email', 'bob.wilson@student.gradtrack.com')->first()->id,
                'program_type' => 'PhD',
                'major_professor_id' => $facultyUsers->where('email', 'emily.rodriguez@gradtrack.com')->first()->id,
                'start_term' => 'Spring 2023',
                'i9_status' => 'Completed',
                'deficiency_cleared' => true,
                'graduation_term' => 'Fall 2026',
            ],
            [
                'student_id' => $studentUsers->where('email', 'carol.davis@student.gradtrack.com')->first()->id,
                'program_type' => 'Masters',
                'major_professor_id' => $facultyUsers->where('email', 'david.kim@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2024',
                'i9_status' => 'Pending',
                'deficiency_cleared' => false,
                'graduation_term' => 'Spring 2026',
            ],
            [
                'student_id' => $studentUsers->where('email', 'david.miller@student.gradtrack.com')->first()->id,
                'program_type' => 'PhD',
                'major_professor_id' => $facultyUsers->where('email', 'lisa.wang@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2022',
                'i9_status' => 'Completed',
                'deficiency_cleared' => true,
                'graduation_term' => 'Spring 2025',
            ],
            [
                'student_id' => $studentUsers->where('email', 'eva.garcia@student.gradtrack.com')->first()->id,
                'program_type' => 'Masters',
                'major_professor_id' => $facultyUsers->where('email', 'sarah.johnson@gradtrack.com')->first()->id,
                'start_term' => 'Spring 2024',
                'i9_status' => 'Completed',
                'deficiency_cleared' => true,
                'graduation_term' => 'Fall 2025',
            ],
            [
                'student_id' => $studentUsers->where('email', 'frank.martinez@student.gradtrack.com')->first()->id,
                'program_type' => 'PhD',
                'major_professor_id' => $facultyUsers->where('email', 'emily.rodriguez@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2023',
                'i9_status' => 'Pending',
                'deficiency_cleared' => false,
                'graduation_term' => 'Spring 2027',
            ],
            [
                'student_id' => $studentUsers->where('email', 'grace.anderson@student.gradtrack.com')->first()->id,
                'program_type' => 'Masters',
                'major_professor_id' => $facultyUsers->where('email', 'david.kim@gradtrack.com')->first()->id,
                'start_term' => 'Fall 2024',
                'i9_status' => 'Completed',
                'deficiency_cleared' => false,
                'graduation_term' => 'Spring 2026',
            ],
        ];

        foreach ($studentData as $student) {
            Student::create($student);
        }
    }
}
