<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use App\Models\PropertyGallery;

class OptimizeImages extends Command
{
    protected $signature = 'images:optimize';
    protected $description = 'Optimize existing property gallery images';

    public function handle()
    {
        $galleries = PropertyGallery::all();
        
        foreach ($galleries as $gallery) {
            $this->optimizeImage($gallery);
        }
        
        $this->info('All images optimized successfully!');
    }
    
    protected function optimizeImage($gallery)
    {
        $path = $gallery->image;
        
        if (Storage::disk('public')->exists($path)) {
            try {
                $image = Image::make(Storage::disk('public')->path($path));
                
                // Resize and compress
                $image->resize(1200, null, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })->encode('jpg', 70);
                
                // Save optimized image
                Storage::disk('public')->put($path, $image);
                
                $this->info("Optimized: {$path}");
                
            } catch (\Exception $e) {
                $this->error("Failed to optimize {$path}: " . $e->getMessage());
            }
        }
    }
}