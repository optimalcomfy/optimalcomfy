import { useState, useEffect, useRef } from "react";

const CarSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  
  const defaultImages = [
    "/cars/images/car-single/1.jpg",
    "/cars/images/car-single/2.jpg",
    "/cars/images/car-single/3.jpg",
    "/cars/images/car-single/4.jpg"
  ];
  const sliderImages = images || defaultImages;

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) =>
        prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
      );
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Auto-advance on mount
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, []); // only on mount

  return (
    <div className="car-slider-container">
      {/* Main image display */}
      <div 
        className="car-slider-wrapper relative overflow-hidden rounded-lg mb-4"
        style={{ height: "400px" }}
      >
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`car-slide absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={`/storage/${image.image}`} 
              alt={`Car Image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Thumbnails row */}
      <div className="thumbnails-container flex gap-2 overflow-x-auto">
        {sliderImages.map((image, index) => (
          <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`thumbnail-item cursor-pointer transition-all duration-200 ${
              index === currentIndex 
                ? "border-2 border-peach opacity-100" 
                : "border border-gray-300 opacity-70 hover:opacity-100"
            }`}
            style={{ flex: "0 0 80px", height: "60px" }}
          >
            <img 
              src={`/storage/${image.image}`} 
              alt={`Car Thumbnail ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarSlider;
