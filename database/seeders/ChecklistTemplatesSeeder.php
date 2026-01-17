<?php

namespace Database\Seeders;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistItem;
use Illuminate\Database\Seeder;

class ChecklistTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        // Property Checklist Template
        $propertyChecklist = ChecklistTemplate::create([
            'name' => 'Property Setup & Verification Checklist',
            'type' => 'property',
            'is_active' => true,
            'order' => 1,
        ]);

        // Key/Lockbox access items
        $propertyItems = [
            [
                'category' => 'Key/Lockbox Access',
                'item_name' => 'Test physical keys (if applicable)',
                'description' => 'Ensure all physical keys work properly',
                'is_required' => true,
                'order' => 1
            ],
            [
                'category' => 'Key/Lockbox Access',
                'item_name' => 'Test electronic lock code',
                'description' => 'Verify the digital lock code works',
                'is_required' => true,
                'order' => 2
            ],
            [
                'category' => 'Key/Lockbox Access',
                'item_name' => 'Check lockbox location and security',
                'description' => 'Ensure lockbox is securely placed and accessible',
                'is_required' => true,
                'order' => 3
            ],
            [
                'category' => 'Key/Lockbox Access',
                'item_name' => 'Verify backup key is available',
                'description' => 'Ensure emergency backup key is accessible to host',
                'is_required' => true,
                'order' => 4
            ],

            // Wifi Details items
            [
                'category' => 'Wifi Details',
                'item_name' => 'Wifi network name verified',
                'description' => 'Check wifi network name matches provided information',
                'is_required' => true,
                'order' => 5
            ],
            [
                'category' => 'Wifi Details',
                'item_name' => 'Wifi password verified',
                'description' => 'Test wifi password is working correctly',
                'is_required' => true,
                'order' => 6
            ],
            [
                'category' => 'Wifi Details',
                'item_name' => 'Internet speed test performed',
                'description' => 'Run speed test to ensure adequate internet connection',
                'is_required' => false,
                'order' => 7
            ],
            [
                'category' => 'Wifi Details',
                'item_name' => 'Wifi router location verified',
                'description' => 'Confirm router location for troubleshooting',
                'is_required' => true,
                'order' => 8
            ],

            // Cleaning Status items
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Professional cleaning completed',
                'description' => 'Confirm professional cleaning service has finished',
                'is_required' => true,
                'order' => 9
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Bathrooms sanitized',
                'description' => 'All bathrooms thoroughly cleaned and sanitized',
                'is_required' => true,
                'order' => 10
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Kitchen surfaces disinfected',
                'description' => 'Countertops, sinks, and appliances cleaned',
                'is_required' => true,
                'order' => 11
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Fresh linens and towels provided',
                'description' => 'All beds made with fresh linens; towels stocked',
                'is_required' => true,
                'order' => 12
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Floor vacuumed/mopped',
                'description' => 'All floors thoroughly cleaned',
                'is_required' => true,
                'order' => 13
            ],

            // Amenities Stocked items
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Toilet paper stocked',
                'description' => 'Adequate toilet paper in all bathrooms',
                'is_required' => true,
                'order' => 14
            ],
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Hand soap available',
                'description' => 'Hand soap at all sinks',
                'is_required' => true,
                'order' => 15
            ],
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Shampoo/Conditioner stocked',
                'description' => 'Bathroom amenities available',
                'is_required' => true,
                'order' => 16
            ],
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Kitchen basics available',
                'description' => 'Dish soap, sponge, trash bags provided',
                'is_required' => true,
                'order' => 17
            ],
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Coffee/tea supplies stocked',
                'description' => 'Coffee maker with filters, tea available',
                'is_required' => false,
                'order' => 18
            ],
            [
                'category' => 'Amenities Stocked',
                'item_name' => 'Emergency supplies checked',
                'description' => 'First aid kit, flashlight, fire extinguisher',
                'is_required' => true,
                'order' => 19
            ],

            // Direction/Pin Verified items
            [
                'category' => 'Direction/Pin Verified',
                'item_name' => 'Google Maps pin verified',
                'description' => 'Property location on map is accurate',
                'is_required' => true,
                'order' => 20
            ],
            [
                'category' => 'Direction/Pin Verified',
                'item_name' => 'Check-in instructions clear',
                'description' => 'Guests will have clear arrival instructions',
                'is_required' => true,
                'order' => 21
            ],
            [
                'category' => 'Direction/Pin Verified',
                'item_name' => 'Parking instructions provided',
                'description' => 'Clear parking directions available',
                'is_required' => true,
                'order' => 22
            ],
            [
                'category' => 'Direction/Pin Verified',
                'item_name' => 'Landmarks mentioned in directions',
                'description' => 'Key landmarks included for easy navigation',
                'is_required' => true,
                'order' => 23
            ],
            [
                'category' => 'Direction/Pin Verified',
                'item_name' => 'Photos match actual property',
                'description' => 'Listing photos accurately represent the property',
                'is_required' => true,
                'order' => 24
            ],
        ];

        foreach ($propertyItems as $item) {
            $propertyChecklist->items()->create($item);
        }

        // Car Checklist Template
        $carChecklist = ChecklistTemplate::create([
            'name' => 'Car Preparation & Verification Checklist',
            'type' => 'car',
            'is_active' => true,
            'order' => 2,
        ]);

        $carItems = [
            // Key/Access items
            [
                'category' => 'Key/Access',
                'item_name' => 'Test all keys/remotes',
                'description' => 'Ensure all keys and remotes work properly',
                'is_required' => true,
                'order' => 1
            ],
            [
                'category' => 'Key/Access',
                'item_name' => 'Spare key available',
                'description' => 'Verify spare key is accessible to host',
                'is_required' => true,
                'order' => 2
            ],
            
            // Documentation items
            [
                'category' => 'Documentation',
                'item_name' => 'Registration verified',
                'description' => 'Car registration is current and in vehicle',
                'is_required' => true,
                'order' => 3
            ],
            [
                'category' => 'Documentation',
                'item_name' => 'Insurance verified',
                'description' => 'Insurance documents available and valid',
                'is_required' => true,
                'order' => 4
            ],
            
            // Cleaning Status items
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Exterior washed and cleaned',
                'description' => 'Car exterior thoroughly cleaned',
                'is_required' => true,
                'order' => 5
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Interior vacuumed and cleaned',
                'description' => 'All interior surfaces cleaned',
                'is_required' => true,
                'order' => 6
            ],
            [
                'category' => 'Cleaning Status',
                'item_name' => 'Windows and mirrors cleaned',
                'description' => 'All glass surfaces spotless',
                'is_required' => true,
                'order' => 7
            ],
            
            // Features/Amenities items
            [
                'category' => 'Features/Amenities',
                'item_name' => 'Fuel level adequate',
                'description' => 'At least half tank of fuel',
                'is_required' => true,
                'order' => 8
            ],
            [
                'category' => 'Features/Amenities',
                'item_name' => 'Bluetooth/audio working',
                'description' => 'Test Bluetooth connectivity and audio system',
                'is_required' => true,
                'order' => 9
            ],
            [
                'category' => 'Features/Amenities',
                'item_name' => 'Climate control working',
                'description' => 'AC and heating systems functional',
                'is_required' => true,
                'order' => 10
            ],
            [
                'category' => 'Features/Amenities',
                'item_name' => 'Emergency kit stocked',
                'description' => 'First aid kit, warning triangle, etc.',
                'is_required' => true,
                'order' => 11
            ],
            
            // Location/Directions items
            [
                'category' => 'Location/Directions',
                'item_name' => 'Pickup location verified',
                'description' => 'Exact pickup location confirmed',
                'is_required' => true,
                'order' => 12
            ],
            [
                'category' => 'Location/Directions',
                'item_name' => 'Parking instructions clear',
                'description' => 'Clear directions for pickup parking',
                'is_required' => true,
                'order' => 13
            ],
            [
                'category' => 'Location/Directions',
                'item_name' => 'Emergency contact info provided',
                'description' => 'Host contact information available',
                'is_required' => true,
                'order' => 14
            ],
        ];

        foreach ($carItems as $item) {
            $carChecklist->items()->create($item);
        }
    }
}