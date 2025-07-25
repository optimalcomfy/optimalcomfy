import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import ProductCar from "@/Components/ProductCar";
import './Cars.css'

// Configuration constants
const INITIAL_SLIDES_COUNT = 2;
const SLIDES_TO_ADD_ON_SCROLL = 2;
const INITIAL_CARS_PER_SLIDE = 6;
const CARS_TO_ADD_ON_SWIPE = 6;
const LOAD_AHEAD_BUFFER = 2;

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

// Group cars by location using location_address field
function groupCarsByLocation(cars) {
  const grouped = {};
  
  cars.forEach(car => {
    // Use location_address field from the car data
    const location = car.location_address ? extractLocationInfo(car.location_address) : 'All Locations';
    
    if (!grouped[location]) {
      grouped[location] = [];
    }
    
    grouped[location].push(car);
  });
  
  return grouped;
}

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const { flash, cars } = usePage().props;
    const sliderRefs = useRef({});
    const [currentSlides, setCurrentSlides] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [groupedCars, setGroupedCars] = useState({});
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
            const grouped = groupCarsByLocation(cars);
            setGroupedCars(grouped);
            
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

    // Intersection Observer for lazy loading more location slides
    useEffect(() => {
        if (!containerRef.current || visibleLocations.length >= Object.keys(groupedCars).length) return;

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
    }, [groupedCars, visibleLocations, loadingMore]);

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
    }, [visibleLocations, loadedCars]);

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

    // Sort locations to prioritize user's location
    const sortedLocations = useMemo(() => {
        const locations = Object.keys(groupedCars);
        if (!userLocation) return locations;
        
        const matchingLocation = locations.find(location => 
            location.toLowerCase().includes(userLocation.toLowerCase()) ||
            userLocation.toLowerCase().includes(location.toLowerCase())
        );
        
        if (matchingLocation) {
            return [matchingLocation, ...locations.filter(location => location !== matchingLocation)];
        }
        
        return locations;
    }, [groupedCars, userLocation]);

    // Mobile Grid Component
    const MobileCarGrid = React.memo(({ cars, location }) => {
        const [visibleCars, setVisibleCars] = useState(cars.slice(0, INITIAL_CARS_PER_SLIDE));
        const containerRef = useRef(null);

        useEffect(() => {
            if (!containerRef.current || visibleCars.length >= cars.length) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleCars(prev => {
                            const nextIndex = prev.length;
                            return [...prev, ...cars.slice(nextIndex, nextIndex + CARS_TO_ADD_ON_SWIPE)];
                        });
                    }
                },
                { threshold: 0.1 }
            );

            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }, [cars, visibleCars]);

        return (
            <div className="mobile-grid-container location-container" data-location={location}>
                <h2 className="mobile-location-title">Rides in {location}</h2>
                <div className="mobile-cars-grid">
                    {visibleCars.map((car, index) => (
                        <div key={car.id || index} className="mobile-car-item">
                            <ProductCar {...car} loadedImages={loadedImages} />
                        </div>
                    ))}
                </div>
                {visibleCars.length < cars.length && (
                    <div ref={containerRef} className="load-more-trigger" style={{ height: '20px' }} />
                )}
            </div>
        );
    });

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
                                {sortedLocations.slice(0, visibleLocations.length).map((location) => (
                                    <MobileCarGrid 
                                        key={location} 
                                        cars={groupedCars[location]} 
                                        location={location} 
                                    />
                                ))}
                                {loadingMore.locations && (
                                    <div className="loading-more-locations">Loading more locations...</div>
                                )}
                            </div>
                        ) : (
                            sortedLocations.slice(0, visibleLocations.length).map((location) => {
                                const locationCars = groupedCars[location];
                                const currentSlide = currentSlides[location] || 0;
                                const loadedCount = loadedCars[location]?.length || 0;
                                const totalCount = locationCars?.length || 0;
                                const slidesToShow = window.innerWidth <= 1024 ? (window.innerWidth <= 768 ? 2 : 4) : 6;

                                if (!sliderRefs.current[location]) {
                                    sliderRefs.current[location] = React.createRef();
                                }

                                const locationSliderSettings = {
                                    ...sliderSettings,
                                    afterChange: (current) => handleSliderAfterChange(location, current),
                                };

                                // Calculate if next button should be disabled
                                const isNextDisabled = (loadedCount >= totalCount) && 
                                                     (currentSlide >= loadedCount - slidesToShow);
                                
                                const isPrevDisabled = currentSlide === 0;

                                return (
                                    <div 
                                        key={location} 
                                        className="car-slider-container padding-container p-5 location-container" 
                                        data-location={location}
                                    >
                                        <div className="slider-header">
                                            <h2>Rides in {location}</h2>
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
                                        </div>

                                        {loadedCount > 0 && (
                                            <Slider ref={sliderRefs.current[location]} {...locationSliderSettings}>
                                                {loadedCars[location].map((car, index) => (
                                                    <div key={car.id || index}>
                                                        <ProductCar {...car} loadedImages={loadedImages} />
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
                            })
                        )}
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}