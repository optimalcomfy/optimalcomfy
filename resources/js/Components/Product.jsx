import React, { useState } from "react";
import PropTypes from "prop-types";
import PropertySlider from "./PropertySlider";

import starIcon from "../assets/svgs/star.svg";
import { Link, usePage } from '@inertiajs/react';

const Product = (props) => {
  const [page, setPage] = useState(1);

  const {
    property_name,
    initial_gallery,
    country,
    starRate,
    location,
    dayRange,
    price_per_night,
    time,
    id
  } = props;

  return (
    <div className="relative flex flex-col cursor-pointer">
      {/* Image Slider */}
      <div className="relative rounded-xl overflow-hidden">
        <PropertySlider page={page} setPage={setPage}>
          {initial_gallery?.map((image, index) => (
            <img
              key={index}
              src={`/storage/${image.image}`}
              alt={`Image ${index + 1} of ${property_name}`}
              className="w-full aspect-[20/19] object-cover"
            />
          ))}
        </PropertySlider>

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
       href={route('property-detail', { id: id })}
       className="grid grid-cols-[minmax(0,1fr),max-content] gap-[2px_8px] mt-3 text-[.9375rem] leading-[19px]">
        <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {property_name}, {country}
        </div>

        {starRate && (
          <div className="flex items-center gap-x-1">
            <img src={starIcon} alt="Star" className="w-4 h-4" />
            {starRate}
          </div>
        )}

        <div className="text-[#717171] col-span-2">{location}</div>
        <div className="text-[#717171] col-span-2">{dayRange}</div>
        <div className="mt-[6px] col-span-2">
          <span className="font-semibold">{price_per_night}</span> {time}
        </div>
      </Link>
    </div>
  );
};

// Optional: Add PropTypes
Product.propTypes = {
  property_name: PropTypes.string.isRequired,
  initial_gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  country: PropTypes.string.isRequired,
  starRate: PropTypes.number,
  location: PropTypes.string,
  dayRange: PropTypes.string,
  price_per_night: PropTypes.number.isRequired,
  time: PropTypes.string,
};

export default Product;
