import { useState, useEffect, useRef } from "react";
import { Link, Head, router, usePage, useForm } from "@inertiajs/react";
import {
    LayoutContext,
    LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'
import Slider from "react-slick";
import axios from "axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/main";
import "./Welcome.css";
import ProductCar from "@/Components/ProductCar";

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleRadioChange = (e) => {
        setData("Car_Type", e.target.value);
    };

    const getCarTypeIcon = (body_type) => {
        return "/cars/images/icons/4-green.svg";
    };

    useEffect(() => {
        // Group cars by location
        if (cars && cars.length > 0) {
            const grouped = groupCarsByLocation(cars);
            setGroupedCars(grouped);
            
            // Initialize current slides for each location
            const initialSlides = {};
            Object.keys(grouped).forEach(location => {
                initialSlides[location] = 0;
            });
            setCurrentSlides(initialSlides);
        }
    }, [cars]);

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

    // Sort locations to prioritize user's location
    const sortedLocations = React.useMemo(() => {
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

    const handleSliderChange = (location, newSlide) => {
        setCurrentSlides(prev => ({
            ...prev,
            [location]: newSlide
        }));
    };

    // Early return if no cars data
    if (!cars || cars.length === 0) {
        return (
            <PrimeReactProvider>
                <LayoutProvider>
                    <Head title="Welcome" />
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
                <Head title="Welcome" />
                <HomeLayout>
                    {sortedLocations.map((location) => {
                        const locationCars = groupedCars[location];
                        const currentSlide = currentSlides[location] || 0;
                        const totalSlides = locationCars.length;
                        const slidesToShow = 7;

                        // Create ref for this location if it doesn't exist
                        if (!sliderRefs.current[location]) {
                            sliderRefs.current[location] = React.createRef();
                        }

                        const locationSliderSettings = {
                            ...sliderSettings,
                            infinite: locationCars.length > 7,
                            beforeChange: (oldIndex, newIndex) => handleSliderChange(location, newIndex),
                        };

                        return (
                            <div key={location} className="product-slider-container padding-container p-5">
                                <div className="slider-header">
                                    <h2>Rides in {location}</h2>
                                    <div className="slider-arrows">
                                        <PrevArrow
                                            onClick={() => sliderRefs.current[location]?.current?.slickPrev()}
                                            disabled={currentSlide === 0}
                                        />
                                        <NextArrow
                                            onClick={() => sliderRefs.current[location]?.current?.slickNext()}
                                            disabled={currentSlide >= totalSlides - slidesToShow}
                                        />
                                    </div>
                                </div>

                                <Slider ref={sliderRefs.current[location]} {...locationSliderSettings}>
                                    {locationCars.map((car, index) => (
                                        <ProductCar key={car.id || index} {...car} />
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