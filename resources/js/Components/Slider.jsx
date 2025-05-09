import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import './slider.css';
import { Link, usePage, router } from '@inertiajs/react';

function Slider() {
  const swiperRef = useRef(null);

  const { properties, flash, pagination } = usePage().props;

  useEffect(() => {
    // Initialize Swiper when component mounts
    swiperRef.current = new Swiper('.property-slider-main', {
      slidesPerView: 'auto',
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: '.rts-pagination',
        clickable: true,
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
        1440: {
          slidesPerView: 4,
        },
      },
    });

    // Cleanup function to destroy Swiper instance when component unmounts
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="property-section">
      <div className="container">
        <div className="property-header">
          <div className="property-title">
            <span className="sub-heading">Property</span>
            <h2>Our properties</h2>
          </div>
          <div className="property-description">
            <p>
              Our properties offer a harmonious blend of comfort and elegance, designed
              to provide an exceptional stay for every guest. Each property features
              plush bedding, high-quality linens, and a selection of pillows to
              ensure a restful night's sleep.
            </p>
          </div>
        </div>
      </div>

      <div className="container-full">
        <div className="property-slider-main swiper px-4">
          <div className="swiper-wrapper">
          {properties.map(property => (
            property && property.id && (
              <Link href={route('property-detail', { id: property.id })} className="swiper-slide" key={property.id}>
                <div className="property-card">
                  <div className="property-image">
                    {property.initial_gallery?.length > 0 &&
                    <img src={`/storage/${property?.initial_gallery?.[0].image}`} alt={property.name} />}
                  </div>
                  <div className="property-content">
                    <Link href={route('property-detail', { id: property.id })} className="property-name">
                      {property.name}
                    </Link>
                    <div className="property-details">
                      <span className="property-capacity">
                        <i className="flaticon-user"></i>
                        {property.max_guests} Person
                      </span>
                    </div>
                    <span className="property-price">KES {property.price_per_night}</span>
                  </div>
                </div>
              </Link>
            )
          ))}
          </div>
        </div>
        <div className="slider-pagination">
          <div className="rts-pagination"></div>
        </div>
      </div>
    </div>
  );
}

export default Slider;