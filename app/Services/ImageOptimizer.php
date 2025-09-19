<?php

namespace App\Services;

use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ImageOptimizer
{
    public static function getOptimizedUrl($path, $width = 800, $quality = 70)
    {
        if (!Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }
        
        $optimizedPath = 'optimized/' . $width . '/' . $path;
        
        if (!Storage::disk('public')->exists($optimizedPath)) {
            self::createOptimizedVersion($path, $optimizedPath, $width, $quality);
        }
        
        return Storage::disk('public')->url($optimizedPath);
    }
    
    protected static function createOptimizedVersion($originalPath, $optimizedPath, $width, $quality)
    {
        $image = Image::make(Storage::disk('public')->path($originalPath));
        
        $image->resize($width, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        })->encode('jpg', $quality);
        
        Storage::disk('public')->put($optimizedPath, $image);
    }
}