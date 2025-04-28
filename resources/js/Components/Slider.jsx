import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import './slider.css';
import { Link, usePage, router } from '@inertiajs/react';

function Slider() {
  const swiperRef = useRef(null);

  const { rooms, flash, pagination } = usePage().props;

  useEffect(() => {
    // Initialize Swiper when component mounts
    swiperRef.current = new Swiper('.room-slider-main', {
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
    <div className="room-section">
      <div className="container">
        <div className="room-header">
          <div className="room-title">
            <span className="sub-heading">Room</span>
            <h2>Our rooms</h2>
          </div>
          <div className="room-description">
            <p>
              Our rooms offer a harmonious blend of comfort and elegance, designed
              to provide an exceptional stay for every guest. Each room features
              plush bedding, high-quality linens, and a selection of pillows to
              ensure a restful night's sleep.
            </p>
          </div>
        </div>
      </div>

      <div className="container-full">
        <div className="room-slider-main swiper px-4">
          <div className="swiper-wrapper">
          {rooms.map(room => (
            room && room.id && (
              <Link href={route('room-detail', { id: room.id })} className="swiper-slide" key={room.id}>
                <div className="room-card">
                  <div className="room-image">
                    {room.initial_gallery?.length > 0 &&
                    <img src={`/storage/${room?.initial_gallery?.[0].image}`} alt={room.name} />}
                  </div>
                  <div className="room-content">
                    <Link href={route('room-detail', { id: room.id })} className="room-name">
                      {room.name}
                    </Link>
                    <div className="room-details">
                      <span className="room-capacity">
                        <i className="flaticon-user"></i>
                        {room.max_guests} Person
                      </span>
                    </div>
                    <span className="room-price">KES {room.price_per_night}</span>
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