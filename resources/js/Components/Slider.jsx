import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import './slider.css';
import { Link, usePage } from '@inertiajs/react';

function Slider() {
  const swiperRef = useRef(null);
  const { properties } = usePage().props;

  useEffect(() => {
    // Main property slider
    swiperRef.current = new Swiper('.property-slider-main', {
      slidesPerView: 'auto',
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: '.rts-pagination',
        clickable: true,
      },
      breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1440: { slidesPerView: 4 },
      },
    });

    // Nested gallery sliders (per property)
    setTimeout(() => {
      document.querySelectorAll('.property-gallery-slider').forEach((el, index) => {
        new Swiper(el, {
          slidesPerView: 1,
          loop: true,
          pagination: {
            el: `.gallery-pagination-${index}`,
            clickable: true,
          },
        });
      });
    }, 100); // Wait for DOM

    return () => {
      if (swiperRef.current) swiperRef.current.destroy();
    };
  }, []);

  return (
    <div className="property-section">
      <div className="container-full">
        <div className="property-slider-main swiper px-4">
          <div className="swiper-wrapper">
            {properties.map((property, idx) => (
              property && property.id && (
                <Link
                  href={route('property-detail', { id: property.id })}
                  className="swiper-slide"
                  key={property.id}
                >
                  <div className="property-card">
                    <div className="property-image">
                      <div className="swiper property-gallery-slider">
                        <div className="swiper-wrapper">
                          {property.initial_gallery?.map((img, i) => (
                            <div className="swiper-slide" key={i}>
                              <img
                                src={`/storage/${img.image}`}
                                alt={`${property.property_name} ${i}`}
                                className="property-image-slide"
                              />

                              <div className={`gallery-pagination-${i}`}></div>
                            </div>
                          ))}
                        </div>
                        <div className={`gallery-pagination-${idx}`}></div>
                      </div>
                    </div>
                    <div className="property-content bg-black/30">
                      <Link
                        href={route('property-detail', { id: property.id })}
                        className="property-name"
                      >
                        {property.property_name}
                      </Link>
                      <div className="property-details">
                        <span className="property-capacity">
                          <i className="flaticon-user"></i> {property.max_guests} Person
                        </span>
                      </div>
                      <div className="property-details">
                        <span className="property-capacity">
                          <i className="flaticon-user"></i> {property.location}
                        </span>
                      </div>
                      <span className="property-price">KES {property.price_per_night} / night</span>
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
