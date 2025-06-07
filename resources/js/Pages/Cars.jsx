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
              {cars.map((car, index) => (
                <div className="col-xl-4 col-lg-6" key={index}>
                    <div className="de-item mb30">
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
              ))}
            </Slider>
          </div>
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
    );
}