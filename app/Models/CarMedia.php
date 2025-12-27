<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Gumlet\ImageResize;
use Gumlet\ImageResizeException;

class CarMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'thumbnail',
        'media_type',
        'car_id'
    ];

    protected $appends = [
        'image_url',
        'thumbnail_url'
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    // Accessor for image URL
    public function getImageUrlAttribute()
    {
        return $this->image ? Storage::url($this->image) : null;
    }

    // Accessor for thumbnail URL
    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail) {
            return Storage::url($this->thumbnail);
        }
        return $this->image_url;
    }

    /**
     * Boot method - Handle all image processing automatically
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!empty($model->image) && empty($model->thumbnail)) {
                $model->thumbnail = $model->generateThumbnail($model->image);
            }
        });

        static::created(function ($model) {
            if ($model->image && !$model->thumbnail) {
                $thumbnailPath = $model->generateThumbnail($model->image);
                if ($thumbnailPath) {
                    $model->updateQuietly(['thumbnail' => $thumbnailPath]);
                }
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('image')) {
                $model->deleteOldFiles();
                
                if ($model->image) {
                    $model->thumbnail = $model->generateThumbnail($model->image);
                } else {
                    $model->thumbnail = null;
                }
            }
        });

        static::deleting(function ($model) {
            $model->deleteImageFiles();
        });
    }

    /**
     * Generate thumbnail from image path using Gumlet
     */
    private function generateThumbnail($imagePath, $width = 300, $height = 200)
    {
        try {
            $fullPath = storage_path('app/public/' . $imagePath);
            
            if (!file_exists($fullPath)) {
                \Log::warning("Image file not found: {$fullPath}");
                return null;
            }

            // Create thumbnail using Gumlet
            $image = new ImageResize($fullPath);
            
            // Resize with best fit (maintain aspect ratio)
            $image->resizeToBestFit($width, $height);
            
            // Generate thumbnail path
            $filename = pathinfo($imagePath, PATHINFO_FILENAME);
            $extension = pathinfo($imagePath, PATHINFO_EXTENSION);
            $thumbnailName = 'thumbnail_' . $filename . '_' . time() . '.' . $extension;
            $thumbnailPath = 'car-media/thumbnails/' . $thumbnailName;
            
            $thumbnailDir = storage_path('app/public/car-media/thumbnails');
            if (!file_exists($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }
            
            // Save the thumbnail
            $image->save(storage_path('app/public/' . $thumbnailPath), null, 85);
            
            return $thumbnailPath;
            
        } catch (ImageResizeException $e) {
            \Log::error('Gumlet thumbnail generation failed: ' . $e->getMessage());
            // Fallback to simple copy
            return $this->generateThumbnailSimpleCopy($imagePath);
        } catch (\Exception $e) {
            \Log::error('Thumbnail generation failed: ' . $e->getMessage());
            // Fallback to simple copy
            return $this->generateThumbnailSimpleCopy($imagePath);
        }
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
     * Delete old image files when updating
     */
    private function deleteOldFiles()
    {
        $originalImage = $this->getOriginal('image');
        $originalThumbnail = $this->getOriginal('thumbnail');
        
        if ($originalImage && Storage::disk('public')->exists($originalImage)) {
            Storage::disk('public')->delete($originalImage);
        }
        
        if ($originalThumbnail && Storage::disk('public')->exists($originalThumbnail)) {
            Storage::disk('public')->delete($originalThumbnail);
        }
    }

    /**
     * Delete image files when deleting model
     */
    private function deleteImageFiles()
    {
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            Storage::disk('public')->delete($this->image);
        }
        
        if ($this->thumbnail && Storage::disk('public')->exists($this->thumbnail)) {
            Storage::disk('public')->delete($this->thumbnail);
        }
    }

    /**
     * Regenerate thumbnail
     */
    public function regenerateThumbnail($width = 300, $height = 200)
    {
        if (!$this->image) {
            return false;
        }

        if ($this->thumbnail && Storage::disk('public')->exists($this->thumbnail)) {
            Storage::disk('public')->delete($this->thumbnail);
        }

        $newThumbnail = $this->generateThumbnail($this->image, $width, $height);
        
        if ($newThumbnail) {
            $this->thumbnail = $newThumbnail;
            return $this->saveQuietly();
        }
        
        return false;
    }

    /**
     * Helper method for quiet update
     */
    public function updateQuietly(array $attributes = [], array $options = [])
    {
        return static::withoutEvents(function () use ($attributes, $options) {
            return $this->update($attributes, $options);
        });
    }

    /**
     * Helper method for quiet save
     */
    public function saveQuietly(array $options = [])
    {
        return static::withoutEvents(function () use ($options) {
            return $this->save($options);
        });
    }
}