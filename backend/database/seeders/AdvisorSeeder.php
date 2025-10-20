<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Advisor;

class AdvisorSeeder extends Seeder
{

public function run()
{
    Advisor::create([
        'name' => 'Dr. Elaine Rivers',
        'email' => 'erivers@university.edu',
        'office' => 'Room 214, Grad Building',
    ]);

    Advisor::create([
        'name' => 'Prof. Marcus Lee',
        'email' => 'mlee@university.edu',
        'office' => 'Room 108, Academic Hall',
    ]);
}

}
