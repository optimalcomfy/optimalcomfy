import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    { id: 1, name: "Client & Partner One", image: "/images/cp1.jpg" },
    { id: 2, name: "Client & Partner Two", image: "/images/cp1.jpg" },
    { id: 3, name: "Client & Partner Three", image: "/images/cp1.jpg" },
    { id: 4, name: "Client & Partner Four", image: "/images/cp1.jpg" },
    { id: 5, name: "Client & Partner Five", image: "/images/cp1.jpg" },
    { id: 6, name: "Client & Partner Six", image: "/images/cp1.jpg" }
  ];

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
      <div className="relative h-96">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <div className="test-w3 flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="mb-6 text-lg text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                nostrud exercitation.
              </p>
              <div className="client flex items-center justify-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <h5 className="text-xl font-semibold text-gray-900 ml-4">{testimonial.name}</h5>
                <div className="clearfix"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-0 p-2 transform -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:bg-gray-100"
        disabled={isAnimating}
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-0 p-2 transform -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:bg-gray-100"
        disabled={isAnimating}
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 500);
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;