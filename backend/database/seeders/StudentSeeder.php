<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::create([
            'name' => 'Ava Thompson',
            'email' => 'ava.thompson@university.edu',
            'program' => 'Computer Science MS',
            'advisor_id' => 1,
        ]);

        Student::create([
            'name' => 'Liam Patel',
            'email' => 'liam.patel@university.edu',
            'program' => 'Mechanical Engineering PhD',
            'advisor_id' => 2,
        ]);
    }
}
