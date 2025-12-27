<?php

namespace App\Console\Commands;

use App\Models\CarMedia;
use Illuminate\Console\Command;
use Gumlet\ImageResize;
use Gumlet\ImageResizeException;

class GenerateCarMediaThumbnails extends Command
{
    protected $signature = 'car-media:generate-thumbnails 
                            {--missing : Generate only for items missing thumbnails}
                            {--all : Generate thumbnails for all car media items}
                            {--car= : Generate for specific car ID}
                            {--limit=50 : Limit the number of items to process}
                            {--force : Force regeneration even if thumbnail exists}
                            {--type= : Filter by media type (image/video)}
                            {--width=300 : Thumbnail width}
                            {--height=200 : Thumbnail height}';

    protected $description = 'Generate thumbnails for car media images';

    public function handle()
    {
        $this->info("🚗 Car Media Thumbnail Generator");
        $this->line("=================================");
        
        // Check system requirements
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
        
        // Get thumbnail dimensions
        $width = (int) $this->option('width');
        $height = (int) $this->option('height');
        $this->info("Thumbnail dimensions: {$width}x{$height}px");
        
        // Build query
        $query = CarMedia::query();
        
        // Filter by car ID
        if ($this->option('car')) {
            $carId = $this->option('car');
            $query->where('car_id', $carId);
            $this->info("Processing thumbnails for car ID: {$carId}");
        }
        
        // Filter by media type
        if ($this->option('type')) {
            $mediaType = $this->option('type');
            $query->where('media_type', $mediaType);
            $this->info("Filtering by media type: {$mediaType}");
        } else {
            // Default to images only (videos might need different handling)
            $query->where('media_type', 'image');
            $this->info("Processing image media only (default)");
        }
        
        // Filter for missing thumbnails
        if ($this->option('missing')) {
            $query->where(function($q) {
                $q->whereNull('thumbnail')
                  ->orWhere('thumbnail', '');
            });
            $this->info("Processing only items missing thumbnails");
        }
        
        // Default behavior if no specific options
        if (!$this->option('missing') && !$this->option('all') && !$this->option('car')) {
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
            $this->info("No car media items found to process.");
            return 0;
        }
        
        $this->info("Found {$total} car media items to process...");
        
        // Confirm before proceeding
        if ($total > 10 && !$this->confirm("Process {$total} items?", true)) {
            $this->info("Operation cancelled.");
            return 0;
        }
        
        // Progress bar
        $bar = $this->output->createProgressBar($total);
        
        $success = 0;
        $failed = 0;
        $skipped = 0;
        
        // Process items
        $query->get()->each(function ($carMedia) use (&$success, &$failed, &$skipped, $bar, $canProcessImages, $width, $height) {
            // Skip if thumbnail exists and not forcing
            if ($carMedia->thumbnail && !$this->option('force')) {
                $skipped++;
                $bar->advance();
                return;
            }
            
            // For video media type, you might want to handle differently
            if ($carMedia->media_type === 'video') {
                $this->warn(" ⚠ Video thumbnails require different handling: ID {$carMedia->id}", 'verbose');
                $skipped++;
                $bar->advance();
                return;
            }
            
            // Check if image file exists
            $fullPath = storage_path('app/public/' . $carMedia->image);
            if (!file_exists($fullPath)) {
                $this->error(" ✗ Image file not found: " . basename($carMedia->image), 'verbose');
                $failed++;
                $bar->advance();
                return;
            }
            
            // Check file size
            $fileSize = filesize($fullPath);
            if ($fileSize === 0) {
                $this->error(" ✗ Empty image file: " . basename($carMedia->image), 'verbose');
                $failed++;
                $bar->advance();
                return;
            }
            
            try {
                // Delete old thumbnail if exists
                if ($carMedia->thumbnail && \Illuminate\Support\Facades\Storage::disk('public')->exists($carMedia->thumbnail)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($carMedia->thumbnail);
                }
                
                // Generate thumbnail
                $thumbnailPath = null;
                
                if ($canProcessImages) {
                    try {
                        // Use Gumlet for resizing
                        $image = new ImageResize($fullPath);
                        
                        // Resize with best fit (maintain aspect ratio)
                        $image->resizeToBestFit($width, $height);
                        
                        $filename = pathinfo($carMedia->image, PATHINFO_FILENAME);
                        $extension = pathinfo($carMedia->image, PATHINFO_EXTENSION);
                        $thumbnailName = 'thumbnail_' . $filename . '_' . time() . '.' . $extension;
                        $thumbnailPath = 'car-media/thumbnails/' . $thumbnailName;
                        
                        $thumbnailDir = storage_path('app/public/car-media/thumbnails');
                        if (!file_exists($thumbnailDir)) {
                            mkdir($thumbnailDir, 0755, true);
                        }
                        
                        // Save the thumbnail with quality setting
                        $image->save(storage_path('app/public/' . $thumbnailPath), null, 85);
                        
                    } catch (ImageResizeException $e) {
                        $this->warn(" ✗ Gumlet failed, using simple copy: " . $e->getMessage(), 'verbose');
                        $thumbnailPath = $this->generateThumbnailSimpleCopy($carMedia->image);
                    } catch (\Exception $e) {
                        $this->warn(" ✗ Image processing failed, using simple copy: " . $e->getMessage(), 'verbose');
                        $thumbnailPath = $this->generateThumbnailSimpleCopy($carMedia->image);
                    }
                } else {
                    // Simple copy fallback
                    $thumbnailPath = $this->generateThumbnailSimpleCopy($carMedia->image);
                }
                
                if ($thumbnailPath) {
                    // Update the model
                    $carMedia->thumbnail = $thumbnailPath;
                    $carMedia->saveQuietly();
                    
                    $success++;
                    $this->line(" ✓ Generated: " . basename($carMedia->image), 'verbose');
                } else {
                    $failed++;
                    $this->error(" ✗ Failed to generate thumbnail: " . basename($carMedia->image), 'verbose');
                }
                
            } catch (\Exception $e) {
                $failed++;
                $this->error(" ✗ Failed: " . basename($carMedia->image) . " - " . $e->getMessage(), 'verbose');
                \Log::error("Car media thumbnail generation failed for ID {$carMedia->id}: " . $e->getMessage());
            }
            
            $bar->advance();
        });
        
        $bar->finish();
        $this->newLine(2);
        
        // Summary
        $this->info("📊 Summary");
        $this->line("=========");
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total found', $total],
                ['Successfully generated', $success],
                ['Failed', $failed],
                ['Skipped', $skipped],
                ['Success rate', $total > 0 ? round(($success / $total) * 100, 2) . '%' : 'N/A']
            ]
        );
        
        if ($failed > 0) {
            $this->error("⚠ Some thumbnails failed to generate. Check logs for details.");
            return 1;
        }
        
        if ($skipped > 0) {
            $this->warn("⚠ {$skipped} items were skipped (thumbnails already exist). Use --force to regenerate.");
        }
        
        $this->info("✅ Thumbnail generation completed successfully!");
        
        // Show usage tips
        if ($success > 0) {
            $this->newLine();
            $this->line("💡 Usage Tips:");
            $this->line("- Run with --all to process all items (including those with existing thumbnails)");
            $this->line("- Use --force to regenerate thumbnails that already exist");
            $this->line("- Specify a car ID with --car=123");
            $this->line("- Adjust thumbnail size with --width=400 --height=300");
            $this->line("- Filter by media type with --type=image or --type=video");
        }
        
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
        $thumbnailPath = 'car-media/thumbnails/' . $thumbnailName;
        
        $thumbnailDir = storage_path('app/public/car-media/thumbnails');
        if (!file_exists($thumbnailDir)) {
            mkdir($thumbnailDir, 0755, true);
        }
        
        // Simply copy the file
        copy($fullPath, storage_path('app/public/' . $thumbnailPath));
        
        return $thumbnailPath;
    }
    
    /**
     * Video thumbnail generation (placeholder - would need ffmpeg)
     */
    private function generateVideoThumbnail($videoPath)
    {
        // This is a placeholder for video thumbnail generation
        // You would typically use ffmpeg to extract a frame
        
        $this->warn("Video thumbnail generation not implemented. Would use ffmpeg here.");
        return null;
        
        // Example ffmpeg command:
        // ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 output.jpg
    }
}