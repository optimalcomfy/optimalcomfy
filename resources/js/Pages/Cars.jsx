import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { Link, Head, router, usePage, useForm } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import Slider from "react-slick";
import axios from "axios";
import debounce from "lodash.debounce";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Welcome.css";
import ProductSkeleton from "@/Components/ProductSkeleton";
import './Cars.css'

// Lazy-loaded ProductCar component
const LazyProductCar = React.lazy(() => import("@/Components/ProductCar"));

// Configuration constants
const INITIAL_SLIDES_COUNT = 2;
const SLIDES_TO_ADD_ON_SCROLL = 2;
const INITIAL_CARS_PER_SLIDE = 6;
const CARS_TO_ADD_ON_SWIPE = 6;
const LOAD_AHEAD_BUFFER = 2;
const MIN_ITEMS_FOR_SLIDER = 4; // Minimum items to show as slider
const FALLBACK_SECTION_NAME = "Other Areas";
const MOBILE_CARS_PER_BATCH = 8;

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

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const { flash, cars } = usePage().props;
    const sliderRefs = useRef({});
    const [currentSlides, setCurrentSlides] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [groupedCars, setGroupedCars] = useState({});
    const [mixedCars, setMixedCars] = useState([]); // For mobile mixed display
    const [isMobile, setIsMobile] = useState(false);
    const [visibleLocations, setVisibleLocations] = useState([]);
    const containerRef = useRef(null);
    const [loadedImages, setLoadedImages] = useState({});
    const [loadedCars, setLoadedCars] = useState({});
    const [loadingMore, setLoadingMore] = useState({});

    // Initialize form data and setData function using useForm
    const { data, setData, errors } = useForm({
        Car_Type: "Residential",
        PickupLocation: "",
        DropoffLocation: "",
        "Pick Up Date": "",
        "Pick Up Time": "",
        "Collection Date": "",
        "Collection Time": "",
    });

    // Check if device is mobile
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkIsMobile();
        const resizeHandler = debounce(checkIsMobile, 200);
        window.addEventListener('resize', resizeHandler);
        
        return () => window.removeEventListener('resize', resizeHandler);
    }, []);

    // Initialize cars and lazy loading
    useEffect(() => {
        if (cars && cars.length > 0) {
            // For desktop: group with minimum threshold
            const grouped = groupCarsWithMinimum(cars);
            setGroupedCars(grouped);
            
            // For mobile: create mixed array with location info
            const mixed = shuffleArray(cars.map(car => ({
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
    }, [cars]);

    // Geolocation effect
    useEffect(() => {
        if (window.navigator.onLine) {
            const geolocationTimeout = setTimeout(() => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude: lat, longitude: lon } = position.coords;
                        try {
                            const response = await axios.get(
                                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
                            );

                            if (response.data?.address) {
                                const userLocationData = response.data.address.state || 
                                                       response.data.address.county || 
                                                       response.data.address.city ||
                                                       response.data.address.town ||
                                                       response.data.address.village;
                                setUserLocation(userLocationData);
                            }
                        } catch (error) {
                            console.error("Error fetching location data:", error);
                        }
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                    },
                    { timeout: 5000 }
                );
            }, 1000);
            
            return () => clearTimeout(geolocationTimeout);
        }
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
            const nextSlide = currentSlide + sliderSettings.slidesToScroll;
            
            slider.slickNext();
            
            const totalCars = groupedCars[location]?.length || 0;
            const currentLoaded = loadedCars[location]?.length || 0;
            
            if (nextSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
                currentLoaded < totalCars && 
                !loadingMore[location]) {
                loadMoreCars(location, currentLoaded);
            }
        }
    }, [groupedCars, loadedCars, loadingMore, currentSlides, loadMoreCars]);

    const handlePrevClick = useCallback((location) => {
        const slider = sliderRefs.current[location]?.current;
        if (slider) {
            slider.slickPrev();
        }
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
                <h2 className="mobile-main-title">Available Rides</h2>
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
                        You've seen all available rides
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
                    <h2>Rides in {location}</h2>
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
                        Rides in {location}
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
                                Loading more cars...
                            </div>
                        )}
                    </Slider>
                )}
            </div>
        );
    }, [currentSlides, loadedCars, loadingMore, groupedCars, loadedImages, sliderSettings, handleSliderAfterChange, handleNextClick, handlePrevClick]);

    if (!cars || cars.length === 0) {
        return (
            <PrimeReactProvider>
                <LayoutProvider>
                    <Head title="Rides" />
                    <HomeLayout>
                        <div className="padding-container p-5">
                            <h2>No cars available at the moment</h2>
                        </div>
                    </HomeLayout>
                </LayoutProvider>
            </PrimeReactProvider>
        );
    }

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Rides" />
                <HomeLayout>
                    <div ref={containerRef} className="cars-container">
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