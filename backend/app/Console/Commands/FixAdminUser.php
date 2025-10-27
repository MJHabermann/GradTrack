<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class FixAdminUser extends Command
{

    /**
     * php artisan user:make-admin {userId}
     */

     
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:make-admin {user_id : The ID of the user to make admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set a user\'s role to admin by their user ID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        
        // Find the user
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }
        
        // Check if user is already admin
        if ($user->role === 'admin') {
            $this->info("User {$user->full_name} (ID: {$userId}) is already an admin.");
            return 0;
        }
        
        // Update the user's role to admin
        $user->update(['role' => 'admin']);
        
        $this->info("Successfully set user {$user->full_name} (ID: {$userId}) as admin.");
        
        return 0;
    }
}
