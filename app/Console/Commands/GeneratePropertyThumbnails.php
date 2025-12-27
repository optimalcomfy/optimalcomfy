<?php

namespace App\Console\Commands;

use App\Models\PropertyGallery;
use Illuminate\Console\Command;
use Gumlet\ImageResize;
use Gumlet\ImageResizeException;

class GeneratePropertyThumbnails extends Command
{
    protected $signature = 'property:generate-thumbnails 
                            {--missing : Generate only for items missing thumbnails}
                            {--all : Generate thumbnails for all gallery items}
                            {--property= : Generate for specific property ID}
                            {--limit=50 : Limit the number of items to process}
                            {--force : Force regeneration even if thumbnail exists}';

    protected $description = 'Generate thumbnails for property gallery images';

    public function handle()
    {
        $this->info("Checking system requirements...");
        
        // Check if GD is available
        $gdLoaded = extension_loaded('gd');
        
        $this->info("GD extension: " . ($gdLoaded ? '✓ Loaded' : '✗ Not loaded'));
        
        if (!$gdLoaded) {
            $this->error('GD extension is not available on your system!');
            $this->warn('Thumbnails will be created as simple copies without resizing.');
            
            if (!$this->confirm('Continue anyway?')) {
                return 1;
            }
            $canProcessImages = false;
        } else {
            $this->info("Using GD for image processing.");
            $canProcessImages = true;
        }
        
        // Check if Gumlet is available
        if (!class_exists('Gumlet\ImageResize')) {
            $this->warn('Gumlet package is not installed! Using simple file copy.');
            $this->warn('Run: composer require gumlet/php-image-resize for better thumbnails');
            $canProcessImages = false;
        } else {
            $this->info("✓ Gumlet package is installed");
        }
        
        // Build query
        $query = PropertyGallery::query();
        
        if ($this->option('property')) {
            $propertyId = $this->option('property');
            $query->where('property_id', $propertyId);
            $this->info("Processing thumbnails for property ID: {$propertyId}");
        }
        
        if ($this->option('missing')) {
            $query->where(function($q) {
                $q->whereNull('thumbnail')
                  ->orWhere('thumbnail', '');
            });
            $this->info("Processing only items missing thumbnails");
        }
        
        if (!$this->option('missing') && !$this->option('all') && !$this->option('property')) {
            // Default to missing thumbnails
            $query->where(function($q) {
                $q->whereNull('thumbnail')
                  ->orWhere('thumbnail', '');
            });
            $this->info("Default: Processing items missing thumbnails");
        }
        
        // Only process items with images
        $query->whereNotNull('image')->where('image', '!=', '');
        
        // Apply limit
        $limit = (int) $this->option('limit');
        $total = $query->count();
        
        if ($limit > 0) {
            $query->limit($limit);
        }
        
        if ($total === 0) {
            $this->info("No items found to process.");
            return 0;
        }
        
        $this->info("Found {$total} items to process...");
        
        // Progress bar
        $bar = $this->output->createProgressBar($total);
        
        $success = 0;
        $failed = 0;
        $skipped = 0;
        
        // Process items
        $query->get()->each(function ($gallery) use (&$success, &$failed, &$skipped, $bar, $canProcessImages) {
            // Skip if thumbnail exists and not forcing
            if ($gallery->thumbnail && !$this->option('force')) {
                $skipped++;
                $bar->advance();
                return;
            }
            
            // Check if image file exists
            $fullPath = storage_path('app/public/' . $gallery->image);
            if (!file_exists($fullPath)) {
                $this->error(" ✗ Image file not found: " . basename($gallery->image), 'verbose');
                $failed++;
                $bar->advance();
                return;
            }
            
            try {
                // Delete old thumbnail if exists
                if ($gallery->thumbnail && \Illuminate\Support\Facades\Storage::disk('public')->exists($gallery->thumbnail)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($gallery->thumbnail);
                }
                
                // Generate thumbnail
                $thumbnailPath = null;
                
                if ($canProcessImages) {
                    try {
                        // Use Gumlet for resizing
                        $image = new ImageResize($fullPath);
                        
                        // Resize with best fit (maintain aspect ratio)
                        $image->resizeToBestFit(300, 200);
                        
                        $filename = pathinfo($gallery->image, PATHINFO_FILENAME);
                        $extension = pathinfo($gallery->image, PATHINFO_EXTENSION);
                        $thumbnailName = 'thumbnail_' . $filename . '_' . time() . '.' . $extension;
                        $thumbnailPath = 'property-gallery/thumbnails/' . $thumbnailName;
                        
                        $thumbnailDir = storage_path('app/public/property-gallery/thumbnails');
                        if (!file_exists($thumbnailDir)) {
                            mkdir($thumbnailDir, 0755, true);
                        }
                        
                        // Save the thumbnail
                        $image->save(storage_path('app/public/' . $thumbnailPath), null, 85);
                        
                    } catch (ImageResizeException $e) {
                        $this->warn(" ✗ Gumlet failed, using simple copy: " . $e->getMessage(), 'verbose');
                        $thumbnailPath = $this->generateThumbnailSimpleCopy($gallery->image);
                    } catch (\Exception $e) {
                        $this->warn(" ✗ Image processing failed, using simple copy: " . $e->getMessage(), 'verbose');
                        $thumbnailPath = $this->generateThumbnailSimpleCopy($gallery->image);
                    }
                } else {
                    // Simple copy fallback
                    $thumbnailPath = $this->generateThumbnailSimpleCopy($gallery->image);
                }
                
                if ($thumbnailPath) {
                    // Update the model
                    $gallery->thumbnail = $thumbnailPath;
                    $gallery->saveQuietly();
                    
                    $success++;
                    $this->line(" ✓ Generated: " . basename($gallery->image), 'verbose');
                } else {
                    $failed++;
                    $this->error(" ✗ Failed to generate thumbnail: " . basename($gallery->image), 'verbose');
                }
                
            } catch (\Exception $e) {
                $failed++;
                $this->error(" ✗ Failed: " . basename($gallery->image) . " - " . $e->getMessage(), 'verbose');
                \Log::error("Thumbnail generation failed for gallery ID {$gallery->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        });
        
        $bar->finish();
        $this->newLine(2);
        
        // Summary
        $this->info("=== Summary ===");
        $this->info("Total found: {$total}");
        $this->info("Successfully generated: {$success}");
        $this->info("Failed: {$failed}");
        $this->info("Skipped: {$skipped}");
        
        if ($failed > 0) {
            $this->error("Some thumbnails failed to generate. Check logs for details.");
            return 1;
        }
        
        $this->info("Thumbnail generation completed successfully!");
        return 0;
    }
    
    /**
     * Simple fallback: copy the image as thumbnail (no resizing)
     */
    private function generateThumbnailSimpleCopy($imagePath)
    {
        $fullPath = storage_path('app/public/' . $imagePath);
        
        if (!file_exists($fullPath)) {
            \Log::warning("Image file not found for copy: {$fullPath}");
            return null;
        }

        $filename = pathinfo($imagePath, PATHINFO_FILENAME);
        $extension = pathinfo($imagePath, PATHINFO_EXTENSION);
        $thumbnailName = 'thumbnail_' . $filename . '_' . time() . '.' . $extension;
        $thumbnailPath = 'property-gallery/thumbnails/' . $thumbnailName;
        
        $thumbnailDir = storage_path('app/public/property-gallery/thumbnails');
        if (!file_exists($thumbnailDir)) {
            mkdir($thumbnailDir, 0755, true);
        }
        
        // Simply copy the file
        copy($fullPath, storage_path('app/public/' . $thumbnailPath));
        
        return $thumbnailPath;
    }
}