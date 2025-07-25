import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../css/main';
import "./PropertiesCustom.css"; 
import Product from "@/Components/Product";
import './Welcome.css'

export default function Properties({ auth, laravelVersion, phpVersion }) {
  const { properties, keys } = usePage().props;
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isMobileMapVisible, setIsMobileMapVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8); // Initial visible items
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: keys,
  });

  // Lazy loading implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleCount < properties.length) {
          setLoading(true);
          setTimeout(() => {
            setVisibleCount(prev => prev + 8); // Load 8 more items
            setLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [visibleCount, properties.length, loading]);

  const center = useMemo(() => ({ lat: -1.2921, lng: 36.8219 }), []);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ saturation: -20 }]
        }
      ]
    }),
    []
  );

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('KES', 'KES ');
  };

  const handlePropertyHover = useCallback((propertyId) => {
    setHoveredProperty(propertyId);
  }, []);

  const handlePropertySelect = useCallback((propertyId) => {
    setSelectedProperty(propertyId);
  }, []);

  const toggleMobileMap = () => {
    setIsMobileMapVisible(!isMobileMapVisible);
  };

  // Get currently visible properties
  const visibleProperties = useMemo(() => {
    return properties.slice(0, visibleCount);
  }, [properties, visibleCount]);

  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <Head title="Stays" />
        <HomeLayout>
          <div className="properties-container p-5">
            <div className="flex flex-col lg:flex-row">
              {/* Properties List */}
              <div className="w-full lg:w-[55%]">
                <div className="mb-6">
                  <div className="properties-header flex justify-between items-center mb-6">
                    <div>
                      <h1 className="properties-title text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                        Explore Properties
                      </h1>
                      <p className="properties-subtitle text-gray-600">
                        Showing {visibleProperties.length} of {properties.length} properties
                      </p>
                    </div>
                  </div>

                  <div className="product-grid padding-container">
                    {visibleProperties.map((property) => (
                      <div 
                        key={property.id}
                        onMouseEnter={() => handlePropertyHover(property.id)}
                        onMouseLeave={() => handlePropertyHover(null)}
                        onClick={() => handlePropertySelect(property.id)}
                        className="interactive-element"
                      >
                        <div className="">
                          <div className={`property-card ${selectedProperty === property.id ? 'selected' : ''}`}>
                            <Product {...property} />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator and trigger element */}
                    {loading && (
                      <div className="loading-indicator">
                        Loading more properties...
                      </div>
                    )}
                    
                    {/* This element triggers loading when it comes into view */}
                    {visibleCount < properties.length && (
                      <div ref={containerRef} className="load-more-trigger" style={{ height: '1px' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Map Container */}
              <div className="w-full lg:w-[45%] relative">
                {/* Mobile Toggle Button */}
                <div className="lg:hidden bg-white border-t border-gray-200 p-4">
                  <button 
                    className="mobile-map-toggle"
                    onClick={toggleMobileMap}
                    aria-label="Toggle map view"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z"/>
                    </svg>
                    Show map
                  </button>
                </div>

                {/* Mobile Map (Full Screen Overlay) */}
                {isMobileMapVisible && (
                  <div className="mobile-map-overlay">
                    <div className="h-full flex flex-col">
                      <div className="mobile-map-header">
                        <h2 className="text-lg font-semibold">Map</h2>
                        <button 
                          onClick={toggleMobileMap}
                          className="mobile-map-close"
                          aria-label="Close map"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        {isLoaded ? (
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={10}
                            options={mapOptions}
                          >
                            {properties.map((property) => (
                              <MarkerF
                                key={property.id}
                                position={{
                                  lat: parseFloat(property.latitude),
                                  lng: parseFloat(property.longitude),
                                }}
                                icon={{
                                  path: "M-12,-24 L12,-24 L12,-8 C12,-3.58 8.42,0 4,0 L-4,0 C-8.42,0 -12,-3.58 -12,-8 L-12,-24 Z",
                                  fillColor: selectedProperty === property.id ? '#F26722' : 
                                            hoveredProperty === property.id ? '#F26722' : '#FFFFFF',
                                  fillOpacity: 1,
                                  strokeColor: selectedProperty === property.id || hoveredProperty === property.id ? 
                                             '#F26722' : '#B0B0B0',
                                  strokeWeight: 2,
                                  scale: 1,
                                  anchor: { x: 0, y: 0 },
                                }}
                                label={{
                                  text: formatPrice(property.price_per_night),
                                  color: selectedProperty === property.id || hoveredProperty === property.id ? 
                                         '#FFFFFF' : '#000000',
                                  fontWeight: '600',
                                  fontSize: '12px',
                                }}
                                onClick={() => handlePropertySelect(property.id)}
                              />
                            ))}
                          </GoogleMap>
                        ) : (
                          <div className="map-loading flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="map-loading spinner mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading map...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Map (Sticky) */}
                <div className="hidden lg:block sticky top-6 h-[calc(100vh-3rem)]">
                  <div className="map-container h-full">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={7}
                        options={mapOptions}
                      >
                        {properties.map((property) => (
                          <MarkerF
                            key={property.id}
                            position={{
                              lat: parseFloat(property.latitude),
                              lng: parseFloat(property.longitude),
                            }}
                            icon={{
                              path: "M-20,-35 L20,-35 C25,-35 25,-25 20,-25 L4,-25 L0,0 L-4,-25 L-20,-25 C-25,-25 -25,-35 -20,-35 Z",
                              fillColor: selectedProperty === property.id ? '#F26722' : 
                                        hoveredProperty === property.id ? '#F26722' : '#FFFFFF',
                              fillOpacity: 1,
                              strokeColor: selectedProperty === property.id || hoveredProperty === property.id ? 
                                         '#F26722' : '#DDDDDD',
                              strokeWeight: 1.5,
                              scale: 1,
                              anchor: { x: 0, y: 0 },
                            }}
                            label={{
                              text: formatPrice(property.price_per_night),
                              color: selectedProperty === property.id || hoveredProperty === property.id ? 
                                     '#FFFFFF' : '#222222',
                              fontWeight: '600',
                              fontSize: '13px',
                              className: `price-marker ${selectedProperty === property.id || hoveredProperty === property.id ? 'active' : ''}`
                            }}
                            onClick={() => handlePropertySelect(property.id)}
                            onMouseOver={() => handlePropertyHover(property.id)}
                            onMouseOut={() => handlePropertyHover(null)}
                          />
                        ))}
                      </GoogleMap>
                    ) : (
                      <div className="map-loading flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="map-loading spinner mx-auto mb-4"></div>
                          <p className="text-gray-600 font-medium">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}