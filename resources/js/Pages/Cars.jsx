import { useState, useEffect, useRef } from "react";
import { Link, Head, router, usePage, useForm } from "@inertiajs/react"; // Import useForm
import {
    LayoutContext,
    LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'
import Slider from "react-slick";

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

export default function Welcome({ auth, laravelVersion, phpVersion }) { // Add any other props your page might receive

    const { flash, cars } = usePage().props; // Removed pagination as it's not used in the provided snippet
    const sliderRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = cars.length;
    const slidesToShow = 7;

    // Initialize form data and setData function using useForm
    // The keys correspond to the 'name' attributes of your form inputs
    // or a chosen convention if 'name' is not present/suitable.
    const { data, setData, errors } = useForm({
        Car_Type: "Residential", // Default value from 'defaultChecked' radio button
        PickupLocation: "",
        DropoffLocation: "",
        "Pick Up Date": "", // Key matches the 'name' attribute
        "Pick Up Time": "", // Key matches the 'name' attribute
        "Collection Date": "", // Key matches the 'name' attribute
        "Collection Time": "", // Key matches the 'name' attribute
    });

    // This function will be called when any form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // Handle radio button changes specifically if needed, or use name attribute directly
    const handleRadioChange = (e) => {
        setData("Car_Type", e.target.value);
    };

    const getCarTypeIcon = (body_type) => {
        // Default to SUV icon if body_type doesn't match known types
        return "/cars/images/icons/4-green.svg";
    };
  

    const sliderSettings = {
        dots: false,
        infinite: cars.length > 7,
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

    return (
    <PrimeReactProvider>
      <LayoutProvider>
        <Head title="Welcome" />
        <HomeLayout>
          <div className="product-slider-container padding-container p-5">
            <div className="slider-header">
              <h2>Explore Rides</h2>
              <div className="slider-arrows">
                <PrevArrow
                  onClick={() => sliderRef.current?.slickPrev()}
                  disabled={currentSlide === 0}
                />
                <NextArrow
                  onClick={() => sliderRef.current?.slickNext()}
                  disabled={currentSlide >= totalSlides - slidesToShow}
                />
              </div>
            </div>

            <Slider ref={sliderRef} {...sliderSettings}>
             {cars.map((data, index) => (
                <ProductCar key={index} {...data} />
              ))}
            </Slider>
          </div>
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
    );
}