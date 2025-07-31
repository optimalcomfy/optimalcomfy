import React, { useState } from "react";
import PropTypes from "prop-types";
import CarRentSlider from "./CarRentSlider";
import { Link, router } from '@inertiajs/react';

const ProductCar = (props) => {
  const [page, setPage] = useState(1);

  const {
    name, // Changed from car_name to name
    brand,
    model,
    year,
    location_address, // Using location_address from data
    platform_price, // Changed from price_per_night to platform_price
    id,
    initial_gallery
  } = props;

  // Create derived values from available data
  const carDisplayName = `${brand} ${model} ${name}`;
  const locationDisplay = location_address || 'Location not specified';
  const yearDisplay = `${year}`;

  return (
    <div className="relative flex flex-col cursor-pointer">
      {/* Image Slider */}
      <div className="relative rounded-xl overflow-hidden">
        <CarRentSlider page={page} setPage={setPage}>
          {initial_gallery.length > 0 ?
          <>
            {initial_gallery?.map((image, index) => (
              <img
                key={index}
                src={`/storage/${image.image}`}
                onClick={() => router.visit(route('rent-now', { car_id: id }))}
                alt={`Image ${index + 1} of ${carDisplayName}`}
                className="w-full aspect-[20/19] object-cover"
              />
            ))}
          </>
            :
            <img
              src='/images/no-pic.avif'
              onClick={() => router.visit(route('rent-now', { car_id: id }))}
              alt={`Image of ${name}`}
              className="w-full aspect-[20/19] object-cover"
            />
            }
        </CarRentSlider>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-x-[5px]">
          {initial_gallery?.map((_, index) => (
            <button
              key={index}
              onClick={() => setPage(index + 1)}
              aria-label={`Go to slide ${index + 1}`}
              data-selected={page === index + 1}
              className="w-[6px] h-[6px] bg-white opacity-[.6] data-[selected=true]:opacity-100 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Product Details */}
      <Link
        href={route('rent-now', { car_id: id })} // Changed from car_id to id for consistency
        className="grid grid-cols-[minmax(0,1fr),max-content] gap-[2px_8px] mt-3 text-[.9375rem] leading-[19px]">
        <div className="font-bold line-clamp-2">
          {carDisplayName}
        </div>

        {/* Optional star rating - you can add this if you have rating data */}
        {/* 
        <div className="flex items-center gap-x-1">
          <img src={starIcon} alt="Star" className="w-4 h-4" />
          {starRate}
        </div>
        */}

        <div className="text-[#717171] col-span-2">{locationDisplay}</div>
        <div className="text-[#717171] col-span-2">{yearDisplay}</div>
        <div className="mt-[6px] col-span-2">
          <span className="font-semibold">KES {platform_price}</span> per day
        </div>
      </Link>
    </div>
  );
};

// Updated PropTypes to match actual data structure
ProductCar.propTypes = {
  name: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  initial_gallery: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      image: PropTypes.string.isRequired,
      media_type: PropTypes.string
    })
  ).isRequired,
  location_address: PropTypes.string,
  platform_price: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};

export default ProductCar;
