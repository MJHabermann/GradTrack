<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test student user
        User::factory()->create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'role' => 'student',
        ]);

        // Create a test admin user
        User::factory()->admin()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
        ]);

        $this->call([
            AdvisorSeeder::class,
            StudentSeeder::class,
        ]);
    }
}
