import React, { useRef, useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";

import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../css/main';
import "./Welcome.css";
import Product from "@/Components/Product";

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

export default function Properties({ auth, laravelVersion, phpVersion }) {
  const { flash, pagination, properties } = usePage().props;

  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = properties.length;
  const slidesToShow = 7;

  const sliderSettings = {
    dots: false,
    infinite: properties.length > 7,
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
        <Head title="Properties" />
        <HomeLayout>
          <>
            {/* Slider Container */}
            <div className="product-slider-container padding-container p-5 relative">
              <div className="slider-header flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Explore Properties</h2>
                <div className="slider-arrows flex gap-4">
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
                {properties.map((data) => (
                  <div key={data.id}>
                    <div style={{ padding: "0 8px" }}>
                      <Product {...data} />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </>
        </HomeLayout>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}
