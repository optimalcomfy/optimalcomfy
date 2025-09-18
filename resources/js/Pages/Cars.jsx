import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import Slider from "react-slick";
import axios from "axios";
import debounce from "lodash/debounce";
import { MapPin, Shield, X } from 'lucide-react';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Cars.css";
import ProductSkeleton from "@/Components/ProductSkeleton";

// Lazy-loaded ProductCar component
const LazyProductCar = React.lazy(() => import("@/Components/ProductCar"));

// Configuration constants
const INITIAL_SLIDES_COUNT = 2;
const SLIDES_TO_ADD_ON_SCROLL = 2;
const INITIAL_CARS_PER_SLIDE = 6;
const CARS_TO_ADD_ON_SWIPE = 6;
const LOAD_AHEAD_BUFFER = 2;
const MIN_ITEMS_FOR_SLIDER = 4;
const FALLBACK_SECTION_NAME = "Other Areas";
const MOBILE_CARS_PER_BATCH = 8;
const LOCATION_COOKIE_NAME = "car_location_permission";

// Cookie management functions
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Location Permission Component
const LocationPermissionModal = ({ onAccept, onReject, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="h-12 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 text-[#e6632a]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                Find Cars Near You
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Discover available vehicles in your area
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-2">
          <p className="text-gray-600 leading-relaxed">
            We can show you available cars near your location for a convenient rental experience. 
            This helps us display the most relevant vehicles for your area.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="flex flex-col gap-2 items-start text-left">
              <p className="text-sm flex items-center font-medium text-gray-800 mb-1">
                <Shield className="w-5 text-[#000000] mt-0.5 flex-shrink-0 mr-auto" />
                Your privacy is protected
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your location data is only used to show relevant vehicles and is never stored. 
                You can change this preference at any time in your settings.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button 
            onClick={onAccept}
            className="w-full bg-[#e6632a] hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Yes, use my location
          </button>
          <button 
            onClick={onReject}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3.5 px-4 rounded-xl transition-colors duration-200"
          >
            No thanks, browse all vehicles
          </button>
        </div>
      </div>
    </div>
  );
};

function NextArrow({ onClick, disabled }) {
  return (
    <div
      className={`custom-arrow custom-next-arrow ${disabled ? "slick-disabled" : ""}`}
      onClick={(e) => {
        if (!disabled && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <img src="/image/chevron.png" alt="Next" className="h-5" loading="lazy" />
    </div>
  );
}

function PrevArrow({ onClick, disabled }) {
  return (
    <div
      className={`custom-arrow custom-prev-arrow ${disabled ? "slick-disabled" : ""}`}
      onClick={(e) => {
        if (!disabled && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <img src="/image/left-chevron.png" alt="Prev" className="h-5" loading="lazy" />
    </div>
  );
}

// Utility function to extract and format location from location_address
function extractLocationInfo(locationAddress) {
  if (!locationAddress) return 'Unknown Location';
  
  // Convert to title case and clean up the location
  const cleanLocation = locationAddress
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return cleanLocation;
}

// Group cars by location with minimum threshold
function groupCarsWithMinimum(cars) {
  const grouped = {};
  const smallGroups = [];
  
  cars.forEach(car => {
    const location = car.location_address ? extractLocationInfo(car.location_address) : 'All Locations';
    
    if (!grouped[location]) {
      grouped[location] = [];
    }
    
    grouped[location].push(car);
  });
  
  // Separate locations with enough items vs those with few items
  const finalGrouped = {};
  
  Object.entries(grouped).forEach(([location, items]) => {
    if (items.length >= MIN_ITEMS_FOR_SLIDER) {
      finalGrouped[location] = items;
    } else {
      // Add to small groups for combining
      smallGroups.push(...items.map(item => ({ ...item, originalLocation: location })));
    }
  });
  
  // If we have small groups, create a combined section
  if (smallGroups.length > 0) {
    finalGrouped[FALLBACK_SECTION_NAME] = smallGroups;
  }
  
  return finalGrouped;
}

// Sort locations by priority
function sortLocationsByPriority(groupedCars, userLocation) {
  const locations = Object.keys(groupedCars);
  
  return locations.sort((a, b) => {
    const aCount = groupedCars[a].length;
    const bCount = groupedCars[b].length;
    
    // Priority 1: User's location (if available)
    if (userLocation) {
      const aIsUserLocation = a.toLowerCase().includes(userLocation.toLowerCase()) ||
                             userLocation.toLowerCase().includes(a.toLowerCase());
      const bIsUserLocation = b.toLowerCase().includes(userLocation.toLowerCase()) ||
                             userLocation.toLowerCase().includes(b.toLowerCase());
      
      if (aIsUserLocation && !bIsUserLocation) return -1;
      if (!aIsUserLocation && bIsUserLocation) return 1;
    }
    
    // Priority 2: Locations with more cars come first
    if (aCount !== bCount) {
      return bCount - aCount;
    }
    
    // Priority 3: Alphabetical
    return a.localeCompare(b);
  });
}

// Dynamic slider settings based on item count
function getDynamicSliderSettings(itemCount, baseSettings) {
  if (itemCount <= 2) {
    return {
      ...baseSettings,
      slidesToShow: Math.min(itemCount, 2),
      slidesToScroll: 1,
      arrows: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };
  } else if (itemCount <= 4) {
    return {
      ...baseSettings,
      slidesToShow: Math.min(itemCount, 4),
      slidesToScroll: 2,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(itemCount, 3),
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(itemCount, 2),
            slidesToScroll: 1,
          },
        },
      ],
    };
  }
  
  return baseSettings;
}

// Shuffle array function for mobile mixed display
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Cars() {
    const { flash, cars: initialCars } = usePage().props;
    const sliderRefs = useRef({});
    const [currentSlides, setCurrentSlides] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [groupedCars, setGroupedCars] = useState({});
    const [mixedCars, setMixedCars] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const containerRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState({});
    const [loadedCars, setLoadedCars] = useState({});
    const [loadingMore, setLoadingMore] = useState({});
    const [locationBasedCars, setLocationBasedCars] = useState(null);
    const [isLoadingLocationData, setIsLoadingLocationData] = useState(false);
    const [usingLocationData, setUsingLocationData] = useState(false);
    const [showLocationPermission, setShowLocationPermission] = useState(false);
    const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
        checkIsMobile();
        const resizeHandler = debounce(checkIsMobile, 200);
        window.addEventListener('resize', resizeHandler);
        return () => window.removeEventListener('resize', resizeHandler);
    }, []);

    // Check location permission cookie on component mount
    useEffect(() => {
        const locationPermission = getCookie(LOCATION_COOKIE_NAME);
        if (locationPermission === 'granted') {
            requestLocationAccess();
        } else if (locationPermission === 'denied') {
            setLocationPermissionAsked(true);
        } else {
            // Show permission modal if not asked before
            setTimeout(() => {
                setShowLocationPermission(true);
            }, 1000);
        }
    }, []);

    // Initialize cars and lazy loading
    useEffect(() => {
        const carsToUse = usingLocationData && locationBasedCars 
            ? locationBasedCars 
            : initialCars;
        
        if (carsToUse && carsToUse.length > 0) {
            // For desktop: group with minimum threshold
            const grouped = groupCarsWithMinimum(carsToUse);
            setGroupedCars(grouped);
            
            // For mobile: create mixed array with location info
            const mixed = shuffleArray(carsToUse.map(car => ({
                ...car,
                displayLocation: car.location_address ? extractLocationInfo(car.location_address) : 'All Locations'
            })));
            setMixedCars(mixed);
            
            const initialSlides = {};
            const initialLoadedCars = {};
            
            Object.keys(grouped).forEach(location => {
                initialSlides[location] = 0;
                initialLoadedCars[location] = grouped[location].slice(0, INITIAL_CARS_PER_SLIDE);
            });
            
            setCurrentSlides(initialSlides);
            setLoadedCars(initialLoadedCars);
            setVisibleLocations(Object.keys(grouped).slice(0, INITIAL_SLIDES_COUNT));
        }
    }, [initialCars, locationBasedCars, usingLocationData]);

    // Request location access
    const requestLocationAccess = useCallback(() => {
        if (!window.navigator.onLine) {
            console.error("No internet connection");
            return;
        }

        setIsLoadingLocationData(true);
        setShowLocationPermission(false);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude: lat, longitude: lon } = position.coords;
                    
                    // Get location name
                    const locationResponse = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                    );
                    
                    if (locationResponse.data?.address) {
                        const userCounty = locationResponse.data.address.state || 
                                        locationResponse.data.address.county || 
                                        locationResponse.data.address.city;
                        setUserLocation(userCounty);
                    }
                    
                    // Fetch location-based cars
                    try {
                        const carsResponse = await axios.get(route('cars.all'), {
                            params: { latitude: lat, longitude: lon, limit: 75 }
                        });
                        
                        if (carsResponse.data?.cars) {
                            setLocationBasedCars(carsResponse.data.cars);
                            setUsingLocationData(true);
                            setCookie(LOCATION_COOKIE_NAME, 'granted');
                        }
                    } catch (error) {
                        console.error("Error fetching location-based cars:", error);
                        setUsingLocationData(false);
                    }
                } catch (error) {
                    console.error("Error processing location:", error);
                    setUsingLocationData(false);
                } finally {
                    setIsLoadingLocationData(false);
                    setLocationPermissionAsked(true);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsLoadingLocationData(false);
                setUsingLocationData(false);
                setLocationPermissionAsked(true);
                setCookie(LOCATION_COOKIE_NAME, 'denied');
            },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 } // Cache for 5 minutes
        );
    }, []);

    // Handle permission responses
    const handleAcceptLocation = useCallback(() => {
        setCookie(LOCATION_COOKIE_NAME, 'granted');
        requestLocationAccess();
    }, [requestLocationAccess]);

    const handleRejectLocation = useCallback(() => {
        setCookie(LOCATION_COOKIE_NAME, 'denied');
        setShowLocationPermission(false);
        setLocationPermissionAsked(true);
        setUsingLocationData(false);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowLocationPermission(false);
    }, []);

    // Intersection Observer for lazy loading more location slides (desktop)
    useEffect(() => {
        if (isMobile || !containerRef.current || visibleLocations.length >= Object.keys(groupedCars).length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !loadingMore.locations) {
                        setLoadingMore(prev => ({ ...prev, locations: true }));
                        
                        setTimeout(() => {
                            setVisibleLocations(prev => {
                                const allLocations = Object.keys(groupedCars);
                                const newLocations = allLocations.slice(prev.length, prev.length + SLIDES_TO_ADD_ON_SCROLL);
                                return [...prev, ...newLocations];
                            });
                            setLoadingMore(prev => ({ ...prev, locations: false }));
                        }, 300);
                    }
                });
            },
            { threshold: 0.5 }
        );

        const lastLocationElement = document.querySelector('.location-container:last-child');
        if (lastLocationElement) {
            observer.observe(lastLocationElement);
        }

        return () => {
            if (lastLocationElement) {
                observer.unobserve(lastLocationElement);
            }
        };
    }, [groupedCars, visibleLocations, loadingMore, isMobile]);

    // Intersection Observer for lazy loading images
    useEffect(() => {
        const imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const imgSrc = entry.target.getAttribute('data-src');
                        if (imgSrc) {
                            setLoadedImages(prev => ({ ...prev, [imgSrc]: true }));
                            imageObserver.unobserve(entry.target);
                        }
                    }
                });
            },
            { rootMargin: '200px' }
        );

        const lazyImages = document.querySelectorAll('[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));

        return () => {
            lazyImages.forEach(img => imageObserver.unobserve(img));
        };
    }, [visibleLocations, loadedCars, mixedCars]);

    // Load more cars when scrolling right in a slider
    const loadMoreCars = useCallback((location, currentLoaded) => {
        setLoadingMore(prev => ({ ...prev, [location]: true }));
        
        setTimeout(() => {
            const nextBatch = groupedCars[location].slice(
                currentLoaded, 
                Math.min(currentLoaded + CARS_TO_ADD_ON_SWIPE, groupedCars[location].length)
            );
            
            setLoadedCars(prev => ({
                ...prev,
                [location]: [...(prev[location] || []), ...nextBatch]
            }));
            
            setLoadingMore(prev => ({ ...prev, [location]: false }));
        }, 300);
    }, [groupedCars]);

    const handleSliderAfterChange = useCallback((location, currentSlide) => {
        setCurrentSlides(prev => ({ ...prev, [location]: currentSlide }));
        
        const totalCars = groupedCars[location]?.length || 0;
        const currentLoaded = loadedCars[location]?.length || 0;
        
        if (currentSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
            currentLoaded < totalCars && 
            !loadingMore[location]) {
            loadMoreCars(location, currentLoaded);
        }
    }, [groupedCars, loadedCars, loadingMore, loadMoreCars]);

    // Handle manual next/prev arrow clicks
    const handleNextClick = useCallback((location) => {
        const slider = sliderRefs.current[location]?.current;
        if (slider) {
            const currentSlide = currentSlides[location] || 0;
            
            slider.slickNext();
            
            const totalCars = groupedCars[location]?.length || 0;
            const currentLoaded = loadedCars[location]?.length || 0;
            
            if (currentSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
                currentLoaded < totalCars && 
                !loadingMore[location]) {
                loadMoreCars(location, currentLoaded);
            }
        }
    }, [groupedCars, loadedCars, loadingMore, currentSlides, loadMoreCars]);

    const handlePrevClick = useCallback((location) => {
        const slider = sliderRefs.current[location]?.current;
        if (slider) slider.slickPrev();
    }, []);

    const sliderSettings = useMemo(() => ({
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 2,
        centerMode: false,
        variableWidth: false,
        lazyLoad: 'ondemand',
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
        ],
    }), []);

    // Sort locations to prioritize user's location and car count
    const sortedLocations = useMemo(() => {
        return sortLocationsByPriority(groupedCars, userLocation);
    }, [groupedCars, userLocation]);

    // Mobile Mixed Grid Component
    const MobileMixedGrid = React.memo(() => {
        const [visibleCars, setVisibleCars] = useState(
            mixedCars.slice(0, MOBILE_CARS_PER_BATCH)
        );
        const loadMoreRef = useRef(null);

        useEffect(() => {
            if (!loadMoreRef.current || visibleCars.length >= mixedCars.length) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleCars(prev => {
                            const nextIndex = prev.length;
                            const nextBatch = mixedCars.slice(
                                nextIndex, 
                                nextIndex + MOBILE_CARS_PER_BATCH
                            );
                            return [...prev, ...nextBatch];
                        });
                    }
                },
                { threshold: 0.1 }
            );

            observer.observe(loadMoreRef.current);
            return () => observer.disconnect();
        }, [visibleCars.length]);

        return (
            <div className="mobile-mixed-container">
                <div className="location-header">
                    <h2 className="mobile-main-title">
                        {usingLocationData ? "Cars Near You" : "Available Vehicles"}
                    </h2>
                    {isLoadingLocationData && (
                        <div className="location-loading">Finding vehicles near you...</div>
                    )}
                </div>
                <div className="mobile-mixed-grid">
                    {visibleCars.map((car, index) => (
                        <div key={car.id || `mixed-${index}`} className="mobile-car-item">
                            <Suspense fallback={<ProductSkeleton />}>
                                <LazyProductCar {...car} loadedImages={loadedImages} />
                            </Suspense>
                            <div className="car-location-tag">
                                {car.displayLocation}
                            </div>
                        </div>
                    ))}
                </div>
                {visibleCars.length < mixedCars.length && (
                    <div ref={loadMoreRef} className="load-more-trigger" style={{ height: '20px' }} />
                )}
                {visibleCars.length >= mixedCars.length && mixedCars.length > 0 && (
                    <div className="end-of-content">
                        You've seen all available vehicles
                    </div>
                )}
            </div>
        );
    });

    // Render location section (desktop)
    const renderLocationSection = useCallback((location, cars) => {
        const itemCount = cars.length;
        
        // Use grid layout for very small counts
        if (itemCount <= 3) {
            return (
                <div key={location} className="small-location-grid padding-container p-5 location-container" data-location={location}>
                    <h2>Vehicles in {location}</h2>
                    <div className={`cars-grid items-${itemCount}`}>
                        {cars.map((car, idx) => (
                            <div key={car.id || `${location}-${idx}`} className="grid-car-item">
                                <Suspense fallback={<ProductSkeleton />}>
                                    <LazyProductCar {...car} loadedImages={loadedImages} />
                                </Suspense>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        // Use slider for larger counts
        const currentSlide = currentSlides[location] || 0;
        const loadedCount = loadedCars[location]?.length || 0;
        const totalCount = cars.length;
        const slidesToShow = window.innerWidth <= 1024 ? (window.innerWidth <= 768 ? 2 : 4) : 6;

        if (!sliderRefs.current[location]) {
            sliderRefs.current[location] = React.createRef();
        }

        const dynamicSettings = getDynamicSliderSettings(itemCount, {
            ...sliderSettings,
            afterChange: (current) => handleSliderAfterChange(location, current),
        });

        // Calculate if next button should be disabled
        const isNextDisabled = (loadedCount >= totalCount) && 
                             (currentSlide >= loadedCount - slidesToShow);
        
        const isPrevDisabled = currentSlide === 0;
        const shouldHideArrows = itemCount <= 2;

        return (
            <div 
                key={location} 
                className={`car-slider-container padding-container p-5 location-container ${shouldHideArrows ? 'no-arrows' : ''}`}
                data-location={location}
            >
                <div className="slider-header">
                    <h2>
                        {location === FALLBACK_SECTION_NAME ? '✨ ' : ' '}
                        Vehicles in {location}
                    </h2>
                    {!shouldHideArrows && (
                        <div className="slider-arrows">
                            <PrevArrow
                                onClick={() => handlePrevClick(location)}
                                disabled={isPrevDisabled}
                            />
                            <NextArrow
                                onClick={() => handleNextClick(location)}
                                disabled={isNextDisabled}
                            />
                        </div>
                    )}
                </div>

                {loadedCount > 0 && (
                    <Slider ref={sliderRefs.current[location]} {...dynamicSettings}>
                        {loadedCars[location].map((car, index) => (
                            <div key={car.id || `${location}-${index}`}>
                                <Suspense fallback={<ProductSkeleton />}>
                                    <LazyProductCar {...car} loadedImages={loadedImages} />
                                </Suspense>
                            </div>
                        ))}
                        {loadingMore[location] && (
                            <div className="loading-more-cars">
                                Loading more vehicles...
                            </div>
                        )}
                    </Slider>
                )}
            </div>
        );
    }, [currentSlides, loadedCars, loadingMore, groupedCars, loadedImages, sliderSettings, handleSliderAfterChange, handleNextClick, handlePrevClick]);

    if (!initialCars || initialCars.length === 0) {
        return (
            <PrimeReactProvider>
                <LayoutProvider>
                    <Head title="Vehicles" />
                    <HomeLayout>
                        <div className="padding-container p-5">
                            <h2>No vehicles available at the moment</h2>
                        </div>
                    </HomeLayout>
                </LayoutProvider>
            </PrimeReactProvider>
        );
    }

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Vehicles" />
                <HomeLayout>
                    <div ref={containerRef} className="cars-container">
                        {showLocationPermission && (
                            <LocationPermissionModal
                                onAccept={handleAcceptLocation}
                                onReject={handleRejectLocation}
                                onClose={handleCloseModal}
                            />
                        )}
                        
                        {isLoadingLocationData && (
                            <div className="location-loading-overlay">
                                <div className="loading-spinner"></div>
                                <p>Finding the best vehicles near you...</p>
                            </div>
                        )}
                        
                        {isMobile ? (
                            <div className="mobile-layout">
                                <MobileMixedGrid />
                            </div>
                        ) : (
                            <>
                                {sortedLocations.slice(0, visibleLocations.length).map((location) => 
                                    renderLocationSection(location, groupedCars[location])
                                )}
                                {loadingMore.locations && (
                                    <div className="loading-more-locations">Loading more locations...</div>
                                )}
                            </>
                        )}
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}