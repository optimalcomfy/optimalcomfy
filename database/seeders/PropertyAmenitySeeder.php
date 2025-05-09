<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertyAmenitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $amenities = [
            ['name' => 'Wi-Fi', 'icon' => 'pi pi-wifi'],
            ['name' => 'TV', 'icon' => 'pi pi-desktop'],
            ['name' => 'Air Conditioning', 'icon' => 'pi pi-sun'],
            ['name' => 'Heating', 'icon' => 'pi pi-fire'],
            ['name' => 'Kitchen', 'icon' => 'pi pi-inbox'],
            ['name' => 'Washer', 'icon' => 'pi pi-refresh'],
            ['name' => 'Dryer', 'icon' => 'pi pi-clone'],
            ['name' => 'Free Parking', 'icon' => 'pi pi-car'],
            ['name' => 'Pool', 'icon' => 'pi pi-star'],
            ['name' => 'Hot Tub', 'icon' => 'pi pi-star-fill'],
            ['name' => 'Gym', 'icon' => 'pi pi-heart'],
            ['name' => 'Pets Allowed', 'icon' => 'pi pi-paw'],
            ['name' => 'Smoke Alarm', 'icon' => 'pi pi-exclamation-triangle'],
            ['name' => 'Carbon Monoxide Alarm', 'icon' => 'pi pi-exclamation-circle'],
            ['name' => 'First Aid Kit', 'icon' => 'pi pi-medkit'],
            ['name' => 'Fire Extinguisher', 'icon' => 'pi pi-fire'],
            ['name' => 'Private Entrance', 'icon' => 'pi pi-sign-in'],
            ['name' => 'Breakfast Included', 'icon' => 'pi pi-apple'],
            ['name' => 'Dedicated Workspace', 'icon' => 'pi pi-briefcase'],
            ['name' => 'Security Cameras', 'icon' => 'pi pi-video'],
        ];

        foreach ($amenities as $amenity) {
            DB::table('property_amenities')->insert([
                'property_id' => rand(1, 4), 
                'amenity_id' => rand(1, 20), 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
