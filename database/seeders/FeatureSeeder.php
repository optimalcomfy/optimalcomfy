<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            ['name' => 'Air Conditioning', 'icon' => 'pi pi-sun'],
            ['name' => 'GPS Navigation', 'icon' => 'pi pi-map-marker'],
            ['name' => 'Bluetooth', 'icon' => 'pi pi-volume-up'],
            ['name' => 'Backup Camera', 'icon' => 'pi pi-camera'],
            ['name' => 'Cruise Control', 'icon' => 'pi pi-compass'],
            ['name' => 'Keyless Entry', 'icon' => 'pi pi-key'],
            ['name' => 'Heated Seats', 'icon' => 'pi pi-fire'],
            ['name' => 'Sunroof', 'icon' => 'pi pi-window-maximize'],
            ['name' => 'Leather Seats', 'icon' => 'pi pi-clone'],
            ['name' => 'Parking Sensors', 'icon' => 'pi pi-bell'],
            ['name' => 'Lane Assist', 'icon' => 'pi pi-road'],
            ['name' => 'Automatic Emergency Braking', 'icon' => 'pi pi-shield'],
            ['name' => 'All-Wheel Drive', 'icon' => 'pi pi-cog'],
            ['name' => 'Apple CarPlay/Android Auto', 'icon' => 'pi pi-mobile'],
            ['name' => 'Third Row Seating', 'icon' => 'pi pi-users'],
            ['name' => 'Tow Hitch', 'icon' => 'pi pi-briefcase'],
            ['name' => 'Remote Start', 'icon' => 'pi pi-power-off'],
            ['name' => 'Blind Spot Monitor', 'icon' => 'pi pi-eye'],
        ];

        foreach ($features as $feature) {
            DB::table('features')->insert([
                'name' => $feature['name'],
                'icon' => $feature['icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
