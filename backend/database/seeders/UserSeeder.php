<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin users
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@gradtrack.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department' => null,
        ]);

        User::create([
            'first_name' => 'Registrar',
            'last_name' => 'Office',
            'email' => 'registrar@gradtrack.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department' => 'Registrar Office',
        ]);

        // Create faculty users
        $facultyUsers = [
            [
                'first_name' => 'Faculty',
                'last_name' => 'User',
                'email' => 'faculty@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Dr. Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Prof. Michael',
                'last_name' => 'Chen',
                'email' => 'michael.chen@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Dr. Emily',
                'last_name' => 'Rodriguez',
                'email' => 'emily.rodriguez@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Mathematics',
            ],
            [
                'first_name' => 'Prof. David',
                'last_name' => 'Kim',
                'email' => 'david.kim@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Physics',
            ],
            [
                'first_name' => 'Dr. Lisa',
                'last_name' => 'Wang',
                'email' => 'lisa.wang@gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'department' => 'Computer Science',
            ],
        ];

        foreach ($facultyUsers as $faculty) {
            User::create($faculty);
        }

        // Create student users
        $studentUsers = [
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john.smith@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Alice',
                'last_name' => 'Brown',
                'email' => 'alice.brown@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Bob',
                'last_name' => 'Wilson',
                'email' => 'bob.wilson@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Mathematics',
            ],
            [
                'first_name' => 'Carol',
                'last_name' => 'Davis',
                'email' => 'carol.davis@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Physics',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Miller',
                'email' => 'david.miller@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Eva',
                'last_name' => 'Garcia',
                'email' => 'eva.garcia@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Computer Science',
            ],
            [
                'first_name' => 'Frank',
                'last_name' => 'Martinez',
                'email' => 'frank.martinez@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Mathematics',
            ],
            [
                'first_name' => 'Grace',
                'last_name' => 'Anderson',
                'email' => 'grace.anderson@student.gradtrack.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Physics',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Habermann',
                'email' => 'mbhabes11@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Engineering',
            ],

        ];

        foreach ($studentUsers as $student) {
            User::create($student);
        }
    }
}
