import React, { useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import CarRentSlider from "./CarRentSlider";
import { Link, router } from '@inertiajs/react';
import axios from "axios";
import { useNetwork } from '../hooks/useNetwork';

const ProductCar = (props) => {
  const [page, setPage] = useState(1);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [showGalleryControls, setShowGalleryControls] = useState(false);
  const hideControlsTimeoutRef = useRef(null);
  const [hasFetchedFullGallery, setHasFetchedFullGallery] = useState(false);

  const network = useNetwork();
  const { isSlow, getOptimalImageSource, isOnline } = network;

  const {
    name,
    brand,
    model,
    year,
    location_address,
    platform_price,
    id,
    first_image,
    gallery_image_count,
    user
  } = props;

  // Initialize with first image
  useEffect(() => {
    if (first_image) {
      setGalleryImages([first_image]);
    }
  }, [first_image]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Fetch gallery images from API
  const fetchGalleryImages = useCallback(async () => {
    if (isLoadingGallery || hasFetchedFullGallery || galleryImages.length >= gallery_image_count) return;
    
    // Only fetch if online
    if (!isOnline) return;
    
    setIsLoadingGallery(true);
    try {
      const response = await axios.get(`/api/cars/${id}/gallery`);
      setGalleryImages(response.data.images);
      setHasFetchedFullGallery(true);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setIsLoadingGallery(false);
    }
  }, [id, gallery_image_count, isLoadingGallery, galleryImages.length, hasFetchedFullGallery, isOnline]);

  // Handle image container interactions
  const handleImageContainerEnter = () => {
    if (gallery_image_count > 1) {
      setShowGalleryControls(true);
      
      // Clear any existing timeout
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  };

  const handleImageContainerLeave = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    // Hide controls after a short delay
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowGalleryControls(false);
    }, 1000);
  };

  // Handle next image click
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (galleryImages.length > 0) {
      // Calculate next page based on current page
      let nextPage;
      
      // If we only have first image and need to fetch more
      if (galleryImages.length === 1 && gallery_image_count > 1 && page === 1) {
        // We're on first image, next should be 2
        nextPage = 2;
        setPage(nextPage);
        
        // Fetch full gallery if not already fetched and online
        if (!hasFetchedFullGallery && isOnline) {
          fetchGalleryImages();
        }
      } else {
        // Normal pagination
        nextPage = page === gallery_image_count ? 1 : page + 1;
        setPage(nextPage);
      }
      
      // Reset auto-hide timeout
      resetAutoHideTimeout();
    }
  };

  // Handle previous image click
  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (galleryImages.length > 0) {
      let prevPage;
      
      // If we only have first image and need to fetch more
      if (galleryImages.length === 1 && gallery_image_count > 1 && page === 1) {
        // Going back from first image should go to last image
        prevPage = gallery_image_count;
        setPage(prevPage);
        
        // Fetch full gallery if not already fetched and online
        if (!hasFetchedFullGallery && isOnline) {
          fetchGalleryImages();
        }
      } else {
        // Normal pagination
        prevPage = page === 1 ? gallery_image_count : page - 1;
        setPage(prevPage);
      }
      
      // Reset auto-hide timeout
      resetAutoHideTimeout();
    }
  };

  // Handle dot click
  const handleDotClick = (e, dotIndex) => {
    e.stopPropagation();
    const targetPage = dotIndex + 1;
    
    // Only fetch full gallery if we're trying to view an image beyond the first one and online
    if (galleryImages.length === 1 && gallery_image_count > 1 && targetPage > 1 && !hasFetchedFullGallery && isOnline) {
      fetchGalleryImages();
    }
    
    setPage(targetPage);
    
    // Reset auto-hide timeout
    resetAutoHideTimeout();
  };

  // Reset auto-hide timeout
  const resetAutoHideTimeout = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowGalleryControls(false);
    }, 3000);
  };

  // Get current image based on page
  const getCurrentImage = () => {
    // If we have full gallery or the requested page is within our current images
    if (galleryImages.length > 0) {
      // If we're trying to access an image we don't have yet, show loading or first image
      if (page - 1 < galleryImages.length) {
        return galleryImages[page - 1];
      } else {
        // Return first image as fallback while loading
        return galleryImages[0];
      }
    }
    return first_image || null;
  };

  const currentImage = getCurrentImage();
  
  // Optimize image source based on network conditions
  const getImageSource = () => {
    if (!currentImage) {
      return '/images/no-pic.avif';
    }
    
    if (!isOnline) {
      // Return cached or low-quality version if available
      return currentImage?.thumbnail ? `/storage/${currentImage.thumbnail}` : '/images/no-pic.avif';
    }
    
    if (isSlow) {
      // On slow network, use thumbnail if available
      return currentImage?.thumbnail ? `/storage/${currentImage.thumbnail}` : 
             currentImage?.image ? `/storage/${currentImage.image}` : '/images/no-pic.avif';
    }
    
    // On good network, use full quality image
    return currentImage?.image ? `/storage/${currentImage.image}` : '/images/no-pic.avif';
  };
  
  const imageSrc = getImageSource();
  
  // Create derived values from available data
  const carDisplayName = `${brand} ${model} ${name}`;
  const locationDisplay = location_address || 'Location not specified';
  const yearDisplay = `${year}`;
  
  // Check if user is verified
  const isVerified = user?.ristay_verified === "1";

  return (
    <div className="relative flex flex-col cursor-pointer">
      {/* Image Slider */}
      <div 
        className="relative rounded-xl overflow-hidden"
        onMouseEnter={handleImageContainerEnter}
        onMouseLeave={handleImageContainerLeave}
      >
        <CarRentSlider page={page} setPage={setPage}>
          {currentImage ? (
            <img
              src={imageSrc}
              onClick={() => router.visit(route('rent-now', { car_id: id }))}
              alt={`Image ${page} of ${gallery_image_count} - ${carDisplayName}`}
              className="w-full aspect-[20/19] object-cover"
              loading="lazy"
            />
          ) : (
            <img
              src='/images/no-pic.avif'
              onClick={() => router.visit(route('rent-now', { car_id: id }))}
              alt={`Image of ${carDisplayName}`}
              className="w-full aspect-[20/19] object-cover"
            />
          )}
        </CarRentSlider>

        {/* Gallery Navigation Controls */}
        {showGalleryControls && gallery_image_count > 1 && (
          <>
            {/* Previous button - only show if not on first image */}
            {page > 1 && (
              <button 
                className="absolute top-1/2 left-2 -translate-y-1/2 p-2 rounded-full bg-white/90 flex items-center justify-center text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                onClick={handlePrevImage}
                disabled={isLoadingGallery}
                aria-label="Previous image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            
            {/* Next button - only show if not on last image */}
            {page < gallery_image_count && (
              <button 
                className="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full bg-white/90 flex items-center justify-center text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                onClick={handleNextImage}
                disabled={isLoadingGallery}
                aria-label="Next image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
          </>
        )}

        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-1 right-1 font-bold rounded-full flex items-center gap-1 shadow-sm z-10">
            <img src="/img/verfied.png" className="h-8" alt="Verified" loading="lazy" />
          </div>
        )}

        {/* Pagination Dots */}
        {gallery_image_count > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-x-[5px] backdrop-blur-sm px-2 py-1 rounded-full">
            {Array.from({ length: gallery_image_count }).map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(e, index)}
                aria-label={`Go to slide ${index + 1}`}
                data-selected={page === (index + 1)}
                className="flex-shrink-0 w-[6px] h-[6px] bg-white opacity-[.6] data-[selected=true]:opacity-100 rounded-full transition-opacity duration-200 hover:opacity-100"
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <Link
        href={route('rent-now', { car_id: id })}
        className="grid grid-cols-[minmax(0,1fr),max-content] gap-[2px_8px] mt-3 text-[.9375rem] leading-[19px] px-2 hover:no-underline"
      >
        <div className="font-bold line-clamp-2 text-gray-900">
          {carDisplayName}
        </div>

        <div className="text-[#717171] col-span-2 line-clamp-1">{locationDisplay}</div>
        <div className="text-[#717171] col-span-2">{yearDisplay}</div>
        <div className="mt-[6px] col-span-2">
          <span className="font-semibold">KES {platform_price}</span> per day
        </div>
      </Link>
    </div>
  );
};

// Updated PropTypes
ProductCar.propTypes = {
  name: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  year: PropTypes.string,
  first_image: PropTypes.shape({
    id: PropTypes.number,
    image: PropTypes.string,
    thumbnail: PropTypes.string, // Added thumbnail prop
    car_id: PropTypes.number,
    media_type: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string
  }),
  gallery_image_count: PropTypes.number,
  location_address: PropTypes.string,
  platform_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  id: PropTypes.number.isRequired,
  user: PropTypes.shape({
    ristay_verified: PropTypes.string
  })
};

ProductCar.defaultProps = {
  gallery_image_count: 0,
  first_image: null
};

export default ProductCar;