<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PopulateDisplayNames extends Command
{
    protected $signature = 'users:populate-display-names';
    protected $description = 'Copy name to display_name for all users';

    public function handle()
    {
        $count = User::whereNull('display_name')->count();
        
        $this->info("Found {$count} users without display_name");
        
        if ($this->confirm('Do you want to populate display_name from name?')) {
            User::whereNull('display_name')->each(function ($user) {
                $user->display_name = $user->name;
                $user->save();
            });
            
            $this->info('Display names populated successfully!');
        }
        
        return 0;
    }
}