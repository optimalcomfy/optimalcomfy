import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import Product from "@/Components/Product";
import Slider from "react-slick";
import axios from "axios";
import debounce from "lodash.debounce";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Welcome.css";

// Lazy-loaded Product component
const LazyProduct = React.lazy(() => import("@/Components/Product"));

// Configuration constants
const INITIAL_SLIDES_COUNT = 2;
const SLIDES_TO_ADD_ON_SCROLL = 2;
const INITIAL_PROPERTIES_PER_SLIDE = 6;
const PROPERTIES_TO_ADD_ON_SWIPE = 6;
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

function groupPropertiesByLocation(properties) {
  const grouped = {};
  
  properties.forEach(property => {
    const county = extractLocationInfo(property.location);
    
    if (!grouped[county]) {
      grouped[county] = [];
    }
    
    grouped[county].push(property);
  });
  
  return grouped;
}

export default function Welcome() {
  const { properties: initialProperties } = usePage().props;
  const sliderRefs = useRef({});
  const [currentSlides, setCurrentSlides] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [groupedProperties, setGroupedProperties] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCounties, setVisibleCounties] = useState([]);
  const containerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [loadedProperties, setLoadedProperties] = useState({});
  const [loadingMore, setLoadingMore] = useState({});

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

  // Initialize properties and lazy loading
  useEffect(() => {
    const validProperties = initialProperties.filter(property => 
      property?.location && typeof property.location === 'string'
    );
    
    const grouped = groupPropertiesByLocation(validProperties);
    setGroupedProperties(grouped);
    
    const initialSlides = {};
    const initialLoadedProperties = {};
    
    Object.keys(grouped).forEach(county => {
      initialSlides[county] = 0;
      // Load initial batch of properties for each county
      initialLoadedProperties[county] = grouped[county].slice(0, INITIAL_PROPERTIES_PER_SLIDE);
    });
    
    setCurrentSlides(initialSlides);
    setLoadedProperties(initialLoadedProperties);
    
    // Initially show first 2 counties
    const counties = Object.keys(grouped);
    setVisibleCounties(counties.slice(0, INITIAL_SLIDES_COUNT));
  }, [initialProperties]);

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
                const userCounty = response.data.address.state || 
                                 response.data.address.county || 
                                 response.data.address.city;
                setUserLocation(userCounty);
              }
            } catch (error) {
              console.error("Error fetching city data:", error);
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

  // Intersection Observer for lazy loading more county slides
  useEffect(() => {
    if (!containerRef.current || visibleCounties.length >= Object.keys(groupedProperties).length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !loadingMore.counties) {
            setLoadingMore(prev => ({ ...prev, counties: true }));
            
            setTimeout(() => {
              setVisibleCounties(prev => {
                const allCounties = Object.keys(groupedProperties);
                const newCounties = allCounties.slice(prev.length, prev.length + SLIDES_TO_ADD_ON_SCROLL);
                return [...prev, ...newCounties];
              });
              setLoadingMore(prev => ({ ...prev, counties: false }));
            }, 300);
          }
        });
      },
      { threshold: 0.5 }
    );

    const lastCountyElement = document.querySelector('.county-container:last-child');
    if (lastCountyElement) {
      observer.observe(lastCountyElement);
    }

    return () => {
      if (lastCountyElement) {
        observer.unobserve(lastCountyElement);
      }
    };
  }, [groupedProperties, visibleCounties, loadingMore]);

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
  }, [visibleCounties, loadedProperties]);

  // Handle slider change
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

  // Handle manual next/prev arrow clicks
  const handleNextClick = useCallback((county) => {
    const slider = sliderRefs.current[county]?.current;
    if (slider) {
      const currentSlide = currentSlides[county] || 0;
      const nextSlide = currentSlide + sliderSettings.slidesToScroll;
      
      slider.slickNext();
      
      const totalProperties = groupedProperties[county]?.length || 0;
      const currentLoaded = loadedProperties[county]?.length || 0;
      
      if (nextSlide + LOAD_AHEAD_BUFFER >= currentLoaded - 6 && 
          currentLoaded < totalProperties && 
          !loadingMore[county]) {
        loadMoreProperties(county, currentLoaded);
      }
    }
  }, [groupedProperties, loadedProperties, loadingMore, currentSlides, loadMoreProperties]);

  const handlePrevClick = useCallback((county) => {
    const slider = sliderRefs.current[county]?.current;
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

  // Sort counties to prioritize user's location
  const sortedCounties = useMemo(() => {
    const counties = Object.keys(groupedProperties);
    if (!userLocation) return counties;
    
    const userCounty = counties.find(county => 
      county.toLowerCase().includes(userLocation.toLowerCase())
    );
    
    if (userCounty) {
      return [userCounty, ...counties.filter(county => county !== userCounty)];
    }
    
    return counties;
  }, [groupedProperties, userLocation]);

  // Mobile Grid Component
  const MobileGrid = React.memo(({ properties, county }) => {
    const [visibleProperties, setVisibleProperties] = useState(properties.slice(0, INITIAL_PROPERTIES_PER_SLIDE));
    const containerRef = useRef(null);

    useEffect(() => {
      if (!containerRef.current || visibleProperties.length >= properties.length) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleProperties(prev => {
              const nextIndex = prev.length;
              return [...prev, ...properties.slice(nextIndex, nextIndex + PROPERTIES_TO_ADD_ON_SWIPE)];
            });
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [properties, visibleProperties]);

    return (
      <div className="mobile-grid-container county-container" data-county={county}>
        <h2 className="mobile-county-title">Stays in {county}</h2>
        <div className="mobile-properties-grid">
          {visibleProperties.map((data, index) => (
            <div key={`${county}-${index}`} className="mobile-property-item">
              <React.Suspense fallback={<div className="property-loading">Loading...</div>}>
                <LazyProduct {...data} loadedImages={loadedImages} />
              </React.Suspense>
            </div>
          ))}
        </div>
        {visibleProperties.length < properties.length && (
          <div ref={containerRef} className="load-more-trigger" style={{ height: '20px' }} />
        )}
      </div>
    );
  });

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
            {isMobile ? (
              <div className="mobile-layout">
                {sortedCounties.slice(0, visibleCounties.length).map((county) => (
                  <MobileGrid 
                    key={county} 
                    properties={groupedProperties[county]} 
                    county={county} 
                  />
                ))}
                {loadingMore.counties && (
                  <div className="loading-more-counties">Loading more locations...</div>
                )}
              </div>
            ) : (
              sortedCounties.slice(0, visibleCounties.length).map((county) => {
                const countyProperties = groupedProperties[county];
                const currentSlide = currentSlides[county] || 0;
                const loadedCount = loadedProperties[county]?.length || 0;
                const totalCount = countyProperties?.length || 0;
                const slidesToShow = window.innerWidth <= 1024 ? (window.innerWidth <= 768 ? 2 : 4) : 6;

                if (!sliderRefs.current[county]) {
                  sliderRefs.current[county] = React.createRef();
                }

                const countySliderSettings = {
                  ...sliderSettings,
                  afterChange: (current) => handleSliderAfterChange(county, current),
                };

                // Calculate if next button should be disabled
                const isNextDisabled = (loadedCount >= totalCount) && 
                                     (currentSlide >= loadedCount - slidesToShow);
                
                const isPrevDisabled = currentSlide === 0;

                return (
                  <div 
                    key={county} 
                    className="product-slider-container padding-container p-5 county-container" 
                    data-county={county}
                  >
                    <div className="slider-header">
                      <h2>Stays in {county}</h2>
                      <div className="slider-arrows">
                        <PrevArrow
                          onClick={() => handlePrevClick(county)}
                          disabled={isPrevDisabled}
                        />
                        <NextArrow
                          onClick={() => handleNextClick(county)}
                          disabled={isNextDisabled}
                        />
                      </div>
                    </div>

                    {loadedCount > 0 && (
                      <Slider ref={sliderRefs.current[county]} {...countySliderSettings}>
                        {loadedProperties[county].map((data, index) => (
                          <div key={`${county}-${index}`}>
                            <React.Suspense fallback={<div className="property-loading">Loading...</div>}>
                              <LazyProduct {...data} loadedImages={loadedImages} />
                            </React.Suspense>
                          </div>
                        ))}
                        {loadingMore[county] && (
                          <div className="loading-more-properties">
                            Loading more properties...
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