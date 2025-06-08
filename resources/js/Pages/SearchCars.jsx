import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import CarFilter from "@/Components/CarFilter";

import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../css/main';
import "./PropertiesCustom.css"; 
import './Welcome.css'

export default function SearchCars({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, cars } = usePage().props;

  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isMobileMapVisible, setIsMobileMapVisible] = useState(false);
  
  
  // Function to get proper icon for the car type
  const getCarTypeIcon = (body_type) => {
    // Default to SUV icon if body_type doesn't match known types
    return "/cars/images/icons/4-green.svg";
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_Maps_API_KEY,
  });
  

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
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>

          <div className="cars-container p-5">
            <div className="flex flex-col lg:flex-row">
              {/* cars List - Mobile: Full width, Desktop: 60% */}
              <div className="w-full lg:w-[55%]">
                <div className="properties-header flex justify-between items-center">
                  <div>
                    <h1 className="properties-title text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                      Explore rides
                    </h1>
                    <p className="properties-subtitle text-gray-600">
                      {cars.length} ride{cars.length > 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                <div className="no-bottom no-top zebra" id="content">
                    <div className="container">
                      <div className="row py-4">
                          <div className="col-sm-12">
                          <div className="row">
                              {/* Dynamic car listing based on cars data */}
                              {cars && cars.length > 0 ? (
                                cars.map((car) => (
                                <div 
                                  key={car.id}
                                  onMouseEnter={() => handlePropertyHover(car.id)}
                                  onMouseLeave={() => handlePropertyHover(null)}
                                  onClick={() => handlePropertySelect(car.id)}
                                  className="interactive-element col-sm-12 col-lg-4"
                                >
                                  <div className="">
                                    <div className={`property-card ${selectedProperty === car.id ? 'selected' : ''}`}>
                                      <div className="w-full" key={car.id}>
                                        <div className="de-item">
                                          <div className="d-img">
                                            {/* Use the first image from initial_gallery if available, otherwise use a placeholder */}
                                            <img
                                              src={car.initial_gallery && car.initial_gallery.length > 0 
                                                ? `/storage/${car.initial_gallery[0].image}` 
                                                : `/cars/images/cars/placeholder.jpg`}
                                              className="img-fluid"
                                              alt={`${car.brand} ${car.model}`}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/cars/images/cars/placeholder.jpg";
                                              }}
                                            />
                                          </div>
                                          <div className="d-info">
                                            <div className="d-text">
                                              <h4>{car.brand} {car.model}</h4>
                                              <div className="d-item_like">
                                                <i className="fa fa-heart" />
                                                <span>{Math.floor(Math.random() * 100)}</span>
                                              </div>
                                              <div className="d-atr-group">
                                                <span className="d-atr">
                                                  <img src="/cars/images/icons/1-green.svg" alt="" />
                                                  {car.seats || 5}
                                                </span>
                                                <span className="d-atr">
                                                  <img src="/cars/images/icons/2-green.svg" alt="" />
                                                  {car.doors || 4}
                                                </span>
                                                <span className="d-atr">
                                                  <img src="/cars/images/icons/3-green.svg" alt="" />
                                                  {car.luggage_capacity ? Math.floor(car.luggage_capacity / 1000) : 4}
                                                </span>
                                                <span className="d-atr">
                                                  <img src={getCarTypeIcon(car.body_type)} alt="" />
                                                  {car.body_type || 'Sedan'}
                                                </span>
                                              </div>
                                              <div className="d-price">
                                                Daily rate from <span>KES{car.price_per_day}</span>
                                              </div>
                                              <div className="mt-2">
                                                <Link className="btn-main" href={route('rent-now', { car_id: car.id })}>
                                                  Rent Now
                                                </Link>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                ))
                              ) : (
                                <div className="col-12">
                                  <div className="alert alert-info">
                                    No cars available at the moment. Please check back later.
                                  </div>
                                </div>
                              )}
                          </div>
                          </div>
                      </div>
                    </div>
                </div>
              </div>

              {/* Map Container - Mobile: Hidden by default, Desktop: 40% sticky */}
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
                      {/* Mobile Map Header */}
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
                      
                      {/* Mobile Map Content */}
                      <div className="flex-1">
                        {isLoaded ? (
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={10}
                            options={mapOptions}
                          >
                            {cars.map((property) => (
                              <MarkerF
                                key={property.id}
                                position={{
                                  lat: parseFloat(property.latitude),
                                  lng: parseFloat(property.longitude),
                                }}
                                icon={{
                                  path: "M-12,-24 L12,-24 L12,-8 C12,-3.58 8.42,0 4,0 L-4,0 C-8.42,0 -12,-3.58 -12,-8 L-12,-24 Z",
                                  fillColor: selectedProperty === property.id ? '#FF385C' : 
                                            hoveredProperty === property.id ? '#FF385C' : '#FFFFFF',
                                  fillOpacity: 1,
                                  strokeColor: selectedProperty === property.id || hoveredProperty === property.id ? 
                                              '#FF385C' : '#B0B0B0',
                                  strokeWeight: 2,
                                  scale: 1,
                                  anchor: { x: 0, y: 0 },
                                }}
                                label={{
                                  text: formatPrice(property.price_per_day),
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
                        {cars.map((property) => (
                          <MarkerF
                            key={property.id}
                            position={{
                              lat: parseFloat(property.latitude),
                              lng: parseFloat(property.longitude),
                            }}
                            icon={{
                              path: "M-20,-35 L20,-35 C25,-35 25,-25 20,-25 L4,-25 L0,0 L-4,-25 L-20,-25 C-25,-25 -25,-35 -20,-35 Z",
                              fillColor: selectedProperty === property.id ? '#FF385C' : 
                                        hoveredProperty === property.id ? '#FF385C' : '#FFFFFF',
                              fillOpacity: 1,
                              strokeColor: selectedProperty === property.id || hoveredProperty === property.id ? 
                                          '#FF385C' : '#DDDDDD',
                              strokeWeight: 1.5,
                              scale: 1,
                              anchor: { x: 0, y: 0 },
                            }}
                            label={{
                              text: formatPrice(property.price_per_day),
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
    </>
  );
}