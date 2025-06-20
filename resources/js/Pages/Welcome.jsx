import React, { useRef, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import Product from "@/Components/Product";
import Slider from "react-slick";
import axios from "axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Welcome.css";

function NextArrow({ onClick, disabled }) {
  return (
    <div
      className={`custom-arrow custom-next-arrow ${disabled ? "slick-disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <img src="/image/chevron.png" alt="Next" className="h-5" />
    </div>
  );
}

function PrevArrow({ onClick, disabled }) {
  return (
    <div
      className={`custom-arrow custom-prev-arrow ${disabled ? "slick-disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <img src="/image/left-chevron.png" alt="Prev" className="h-5" />
    </div>
  );
}

function extractLocationInfo(location) {
  if (!location) return 'Unknown Location';
  
  try {
    const parts = location.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const county = parts[parts.length - 2]; // Second to last part (County)
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

// Group properties by county
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
  const { properties } = usePage().props;
  const sliderRefs = useRef({});
  const [currentSlides, setCurrentSlides] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [groupedProperties, setGroupedProperties] = useState({});

  useEffect(() => {
    // Filter out properties with invalid locations
    const validProperties = properties.filter(property => 
      property?.location && typeof property.location === 'string'
    );
    
    // Group properties by location
    const grouped = groupPropertiesByLocation(validProperties);
    setGroupedProperties(grouped);
    
    // Initialize current slides for each county
    const initialSlides = {};
    Object.keys(grouped).forEach(county => {
      initialSlides[county] = 0;
    });
    setCurrentSlides(initialSlides);
  }, [properties]);

  useEffect(() => {
    if (window.navigator.onLine) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            console.log(response);

            if (response.data && response.data.address) {
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
        }
      );
    }
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 1,
    centerMode: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Sort counties to prioritize user's location
  const sortedCounties = React.useMemo(() => {
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

  const handleSliderChange = (county, newSlide) => {
    setCurrentSlides(prev => ({
      ...prev,
      [county]: newSlide
    }));
  };

  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <Head title="Welcome" />
        <HomeLayout>
          {sortedCounties.map((county) => {
            const countyProperties = groupedProperties[county];
            const currentSlide = currentSlides[county] || 0;
            const totalSlides = countyProperties.length;
            const slidesToShow = 7;

            // Create ref for this county if it doesn't exist
            if (!sliderRefs.current[county]) {
              sliderRefs.current[county] = React.createRef();
            }

            const countySliderSettings = {
              ...sliderSettings,
              infinite: countyProperties.length > 7,
              beforeChange: (oldIndex, newIndex) => handleSliderChange(county, newIndex),
            };

            return (
              <div key={county} className="product-slider-container padding-container p-5">
                <div className="slider-header">
                  <h2>Stays in {county}</h2>
                  <div className="slider-arrows">
                    <PrevArrow
                      onClick={() => sliderRefs.current[county]?.current?.slickPrev()}
                      disabled={currentSlide === 0}
                    />
                    <NextArrow
                      onClick={() => sliderRefs.current[county]?.current?.slickNext()}
                      disabled={currentSlide >= totalSlides - slidesToShow}
                    />
                  </div>
                </div>

                <Slider ref={sliderRefs.current[county]} {...countySliderSettings}>
                  {countyProperties.map((data, index) => (
                    <Product key={index} {...data} />
                  ))}
                </Slider>
              </div>
            );
          })}
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}