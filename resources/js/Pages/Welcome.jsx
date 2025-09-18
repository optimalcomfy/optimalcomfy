import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import { MapPin, Shield, X } from 'lucide-react';
import Slider from "react-slick";
import axios from "axios";
import debounce from "lodash.debounce";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Welcome.css";
import ProductSkeleton from "@/Components/ProductSkeleton";

// Lazy-loaded Product component
const LazyProduct = React.lazy(() => import("@/Components/Product"));

// Configuration constants
const INITIAL_SLIDES_COUNT = 2;
const SLIDES_TO_ADD_ON_SCROLL = 2;
const INITIAL_PROPERTIES_PER_SLIDE = 6;
const PROPERTIES_TO_ADD_ON_SWIPE = 6;
const LOAD_AHEAD_BUFFER = 2;
const MIN_ITEMS_FOR_SLIDER = 4;
const FALLBACK_SECTION_NAME = "Other Areas";
const MOBILE_PROPERTIES_PER_BATCH = 8;
const LOCATION_COOKIE_NAME = "location_permission";

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

function extractLocationInfo(location) {
  if (!location) return 'Unknown Location';
  
  try {
    const parts = location.split(',').map(part => part.trim());
    if (parts.length >= 3) {
      const county = parts[parts.length - 2];
      return county || 'Unknown Location';
    } else if (parts.length === 2) {
      return parts[0] || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error processing location:', error);
    return 'Unknown Location';
  }
}

function groupPropertiesWithMinimum(properties) {
  const grouped = {};
  const smallGroups = [];
  
  properties.forEach(property => {
    const county = extractLocationInfo(property.location);
    if (!grouped[county]) grouped[county] = [];
    grouped[county].push(property);
  });
  
  const finalGrouped = {};
  Object.entries(grouped).forEach(([county, items]) => {
    if (items.length >= MIN_ITEMS_FOR_SLIDER) {
      finalGrouped[county] = items;
    } else {
      smallGroups.push(...items.map(item => ({ ...item, originalCounty: county })));
    }
  });
  
  if (smallGroups.length > 0) {
    finalGrouped[FALLBACK_SECTION_NAME] = smallGroups;
  }
  
  return finalGrouped;
}

function sortCountiesByPriority(groupedProperties, userLocation) {
  const counties = Object.keys(groupedProperties);
  return counties.sort((a, b) => {
    const aCount = groupedProperties[a].length;
    const bCount = groupedProperties[b].length;
    
    if (userLocation) {
      const aIsUserLocation = a.toLowerCase().includes(userLocation.toLowerCase());
      const bIsUserLocation = b.toLowerCase().includes(userLocation.toLowerCase());
      if (aIsUserLocation && !bIsUserLocation) return -1;
      if (!aIsUserLocation && bIsUserLocation) return 1;
    }
    
    if (aCount !== bCount) return bCount - aCount;
    return a.localeCompare(b);
  });
}

function getDynamicSliderSettings(itemCount, baseSettings) {
  if (itemCount <= 2) {
    return {
      ...baseSettings,
      slidesToShow: Math.min(itemCount, 2),
      slidesToScroll: 1,
      arrows: false,
      responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } }],
    };
  } else if (itemCount <= 4) {
    return {
      ...baseSettings,
      slidesToShow: Math.min(itemCount, 4),
      slidesToScroll: 2,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: Math.min(itemCount, 3), slidesToScroll: 1 } },
        { breakpoint: 768, settings: { slidesToShow: Math.min(itemCount, 2), slidesToScroll: 1 } },
      ],
    };
  }
  return baseSettings;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
                Enhance Your Experience
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Find properties near you
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-2">
          <p className="text-gray-600 leading-relaxed">
            We can show you properties near your location for a personalized browsing experience. 
            This helps us display the most relevant listings for your area.
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
                Your location data is only used to show relevant properties and is never stored. 
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
            No thanks, browse all properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Welcome() {
  const { properties: initialProperties } = usePage().props;
  const sliderRefs = useRef({});
  const [currentSlides, setCurrentSlides] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [groupedProperties, setGroupedProperties] = useState({});
  const [mixedProperties, setMixedProperties] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCounties, setVisibleCounties] = useState([]);
  const containerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [loadedProperties, setLoadedProperties] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [locationBasedProperties, setLocationBasedProperties] = useState(null);
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

  // Initialize properties
  useEffect(() => {
    const propertiesToUse = usingLocationData && locationBasedProperties 
      ? locationBasedProperties 
      : initialProperties;
    
    const validProperties = propertiesToUse.filter(property => 
      property?.location && typeof property.location === 'string'
    );
    
    const grouped = groupPropertiesWithMinimum(validProperties);
    setGroupedProperties(grouped);
    
    const mixed = shuffleArray(validProperties.map(property => ({
      ...property,
      displayLocation: extractLocationInfo(property.location)
    })));
    setMixedProperties(mixed);
    
    const initialSlides = {};
    const initialLoadedProperties = {};
    
    Object.keys(grouped).forEach(county => {
      initialSlides[county] = 0;
      initialLoadedProperties[county] = grouped[county].slice(0, INITIAL_PROPERTIES_PER_SLIDE);
    });
    
    setCurrentSlides(initialSlides);
    setLoadedProperties(initialLoadedProperties);
    setVisibleCounties(Object.keys(grouped).slice(0, INITIAL_SLIDES_COUNT));
  }, [initialProperties, locationBasedProperties, usingLocationData]);

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
          
          // Fetch location-based properties
          try {
            const propertiesResponse = await axios.get(route('welcome'), {
              params: { latitude: lat, longitude: lon, limit: 75 }
            });
            
            if (propertiesResponse.data?.properties) {
              setLocationBasedProperties(propertiesResponse.data.properties);
              setUsingLocationData(true);
              setCookie(LOCATION_COOKIE_NAME, 'granted');
            }
          } catch (error) {
            console.error("Error fetching location-based properties:", error);
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

  // Load more properties function
  const loadMoreProperties = useCallback((county, currentLoaded) => {
    setLoadingMore(prev => ({ ...prev, [county]: true }));
    setTimeout(() => {
      const nextBatch = groupedProperties[county].slice(
        currentLoaded, 
        Math.min(currentLoaded + PROPERTIES_TO_ADD_ON_SWIPE, groupedProperties[county].length)
      );
      setLoadedProperties(prev => ({
        ...prev,
        [county]: [...(prev[county] || []), ...nextBatch]
      }));
      setLoadingMore(prev => ({ ...prev, [county]: false }));
    }, 300);
  }, [groupedProperties]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (isMobile || !containerRef.current || visibleCounties.length >= Object.keys(groupedProperties).length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loadingMore.counties) {
            setLoadingMore(prev => ({ ...prev, counties: true }));
            setTimeout(() => {
              setVisibleCounties(prev => {
                const allCounties = Object.keys(groupedProperties);
                return [...prev, ...allCounties.slice(prev.length, prev.length + SLIDES_TO_ADD_ON_SCROLL)];
              });
              setLoadingMore(prev => ({ ...prev, counties: false }));
            }, 300);
          }
        });
      },
      { threshold: 0.5 }
    );

    const lastCountyElement = document.querySelector('.county-container:last-child');
    if (lastCountyElement) observer.observe(lastCountyElement);

    return () => {
      if (lastCountyElement) observer.unobserve(lastCountyElement);
    };
  }, [groupedProperties, visibleCounties, loadingMore, isMobile]);

  // Image lazy loading
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

    return () => lazyImages.forEach(img => imageObserver.unobserve(img));
  }, [visibleCounties, loadedProperties, mixedProperties]);

  const handleSliderAfterChange = useCallback((county, currentSlide) => {
    setCurrentSlides(prev => ({ ...prev, [county]: currentSlide }));
    const totalProperties = groupedProperties[county]?.length || 0;
    const currentLoaded = loadedProperties[county]?.length || 0;
    
    if (currentSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
        currentLoaded < totalProperties && 
        !loadingMore[county]) {
      loadMoreProperties(county, currentLoaded);
    }
  }, [groupedProperties, loadedProperties, loadingMore, loadMoreProperties]);

  const handleNextClick = useCallback((county) => {
    const slider = sliderRefs.current[county]?.current;
    if (slider) {
      const currentSlide = currentSlides[county] || 0;
      slider.slickNext();
      
      const totalProperties = groupedProperties[county]?.length || 0;
      const currentLoaded = loadedProperties[county]?.length || 0;
      
      if (currentSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
          currentLoaded < totalProperties && 
          !loadingMore[county]) {
        loadMoreProperties(county, currentLoaded);
      }
    }
  }, [groupedProperties, loadedProperties, loadingMore, currentSlides, loadMoreProperties]);

  const handlePrevClick = useCallback((county) => {
    const slider = sliderRefs.current[county]?.current;
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
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  }), []);

  const sortedCounties = useMemo(() => {
    return sortCountiesByPriority(groupedProperties, userLocation);
  }, [groupedProperties, userLocation]);

  // Mobile Mixed Grid Component
  const MobileMixedGrid = React.memo(() => {
    const [visibleProperties, setVisibleProperties] = useState(
      mixedProperties.slice(0, MOBILE_PROPERTIES_PER_BATCH)
    );
    const loadMoreRef = useRef(null);

    useEffect(() => {
      if (!loadMoreRef.current || visibleProperties.length >= mixedProperties.length) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleProperties(prev => {
              const nextIndex = prev.length;
              const nextBatch = mixedProperties.slice(nextIndex, nextIndex + MOBILE_PROPERTIES_PER_BATCH);
              return [...prev, ...nextBatch];
            });
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(loadMoreRef.current);
      return () => observer.disconnect();
    }, [visibleProperties.length]);

    return (
      <div className="mobile-mixed-container">
        <div className="location-header">
          <h2 className="mobile-main-title">
            {usingLocationData ? "Stays Near You" : "Available Stays"}
          </h2>
          {isLoadingLocationData && (
            <div className="location-loading">Finding stays near you...</div>
          )}
        </div>
        <div className="mobile-mixed-grid">
          {visibleProperties.map((property, index) => (
            <div key={`mixed-${index}`} className="mobile-property-item">
              <React.Suspense fallback={<ProductSkeleton />}>
                <LazyProduct {...property} loadedImages={loadedImages} />
              </React.Suspense>
              <div className="property-location-tag">{property.displayLocation}</div>
            </div>
          ))}
        </div>
        {visibleProperties.length < mixedProperties.length && (
          <div ref={loadMoreRef} className="load-more-trigger" style={{ height: '20px' }} />
        )}
        {visibleProperties.length >= mixedProperties.length && mixedProperties.length > 0 && (
          <div className="end-of-content">You've seen all available properties</div>
        )}
      </div>
    );
  });

  // Render county section
  const renderCountySection = useCallback((county, properties) => {
    const itemCount = properties.length;
    
    if (itemCount <= 3) {
      return (
        <div key={county} className="small-county-grid padding-container p-5 county-container" data-county={county}>
          <h2>Stays in {county}</h2>
          <div className={`properties-grid items-${itemCount}`}>
            {properties.map((data, idx) => (
              <div key={`${county}-${idx}`} className="grid-property-item">
                <React.Suspense fallback={<ProductSkeleton />}>
                  <LazyProduct {...data} loadedImages={loadedImages} />
                </React.Suspense>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    const currentSlide = currentSlides[county] || 0;
    const loadedCount = loadedProperties[county]?.length || 0;
    const totalCount = properties.length;
    const slidesToShow = window.innerWidth <= 1024 ? (window.innerWidth <= 768 ? 2 : 4) : 6;

    if (!sliderRefs.current[county]) sliderRefs.current[county] = React.createRef();

    const dynamicSettings = getDynamicSliderSettings(itemCount, {
      ...sliderSettings,
      afterChange: (current) => handleSliderAfterChange(county, current),
    });

    const isNextDisabled = (loadedCount >= totalCount) && (currentSlide >= loadedCount - slidesToShow);
    const isPrevDisabled = currentSlide === 0;
    const shouldHideArrows = itemCount <= 2;

    return (
      <div 
        key={county} 
        className={`product-slider-container padding-container p-5 county-container ${shouldHideArrows ? 'no-arrows' : ''}`}
        data-county={county}
      >
        <div className="slider-header">
          <h2>{county === FALLBACK_SECTION_NAME ? '✨ ' : ' '}Stays in {county}</h2>
          {!shouldHideArrows && (
            <div className="slider-arrows">
              <PrevArrow onClick={() => handlePrevClick(county)} disabled={isPrevDisabled} />
              <NextArrow onClick={() => handleNextClick(county)} disabled={isNextDisabled} />
            </div>
          )}
        </div>

        {loadedCount > 0 && (
          <Slider ref={sliderRefs.current[county]} {...dynamicSettings}>
            {loadedProperties[county].map((data, index) => (
              <div key={`${county}-${index}`}>
                <React.Suspense fallback={<ProductSkeleton />}>
                  <LazyProduct {...data} loadedImages={loadedImages} />
                </React.Suspense>
              </div>
            ))}
            {loadingMore[county] && (
              <div className="loading-more-properties">Loading more properties...</div>
            )}
          </Slider>
        )}
      </div>
    );
  }, [currentSlides, loadedProperties, loadingMore, groupedProperties, loadedImages, sliderSettings, handleSliderAfterChange, handleNextClick, handlePrevClick]);

  if (!initialProperties || initialProperties.length === 0) {
    return (
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Stays" />
          <HomeLayout>
            <div className="padding-container p-5">
              <h2>No properties available at the moment</h2>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    );
  }

  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <Head title="Stays" />
        <HomeLayout>
          <div ref={containerRef} className="properties-container">
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
                <p>Finding the best stays near you...</p>
              </div>
            )}
            
            {isMobile ? (
              <div className="mobile-layout">
                <MobileMixedGrid />
              </div>
            ) : (
              <>
                
                {sortedCounties.slice(0, visibleCounties.length).map((county) => 
                  renderCountySection(county, groupedProperties[county])
                )}
                
                {loadingMore.counties && (
                  <div className="loading-more-counties">Loading more locations...</div>
                )}
              </>
            )}
          </div>
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}