import React, { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './testimonials.css';

function Testimonial() {
  const swiperRef = useRef(null);

  useEffect(() => {
    // Initialize Swiper with navigation
    swiperRef.current = new Swiper('.testimonial-slider', {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      navigation: {
        nextEl: '.button-next',
        prevEl: '.button-prev',
      },
    });

    // Cleanup function
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy();
      }
    };
  }, []);

  const testimonials = [
    {
      id: 1,
      image: "assets/images/author/author-2x.webp",
      name: "Sarah Martinez",
      position: "COO of Apex Solutions",
      quote: "Choosing Ristay was one of the best decisions we've ever made. They have proven to be a reliable and innovative partner, always ready to tackle new challenges with and expertise. Their commitment to and delivering tailored."
    },
    {
      id: 2,
      image: "assets/images/author/author-6.webp",
      name: "Sarah Martinez",
      position: "COO of Apex Solutions",
      quote: "Choosing Ristay was one of the best decisions we've ever made. They have proven to be a reliable and innovative partner, always ready to tackle new challenges with and expertise. Their commitment to and delivering tailored."
    }
  ];

  return (
    <div className="testimonial-section">
      <div className="container">
        <div className="testimonial-header">
          <div className="title-wrapper">
            <span className="sub-heading">Testimonial</span>
            <h2>What Our Client Say</h2>
          </div>
          <div className="slider-navigation">
            <div className="nav-btn button-prev">
              <img src="assets/images/icon/arrow-left-short.svg" alt="Previous" />
            </div>
            <div className="nav-btn button-next">
              <img src="assets/images/icon/arrow-right-short.svg" alt="Next" />
            </div>
          </div>
        </div>
        
        <div className="testimonial-slider swiper">
          <div className="swiper-wrapper">
            {testimonials.map(testimonial => (
              <div className="swiper-slide" key={testimonial.id}>
                <div className="testimonial-item">
                  <div className="author-image">
                  <img
                    className="rounded-[50%] border-[6px] border-[#F1F1F1] md:h-[310px] md:min-w-[310px] h-[280px] min-w-[280px] object-cover"
                    src={testimonial.image}
                    alt={testimonial.name}
                    height={310}
                    width={310}
                  />
                  </div>
                  <div className="testimonial-content">
                    <div className="rating">
                      <i className="flaticon-star"></i>
                      <i className="flaticon-star"></i>
                      <i className="flaticon-star"></i>
                      <i className="flaticon-star"></i>
                      <i className="flaticon-star-sharp-half-stroke"></i>
                    </div>
                    <span className="quote">{testimonial.quote}</span>
                    <div className="author-info">
                      <div className="author-details">
                        <h6>{testimonial.name}</h6>
                        <span>{testimonial.position}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonial;