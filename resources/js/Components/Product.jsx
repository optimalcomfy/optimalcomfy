import React, { useState } from "react";
import PropTypes from "prop-types";
import PropertySlider from "./PropertySlider";

import starIcon from "../assets/svgs/star.svg";
import { Link, router } from '@inertiajs/react';

const Product = (props) => {
  const [page, setPage] = useState(1);

  const {
    property_name,
    initial_gallery,
    country,
    starRate,
    location,
    dayRange,
    platform_price,
    time,
    id,
    user // Add user prop to access verification status
  } = props;

  // Check if user is verified
  const isVerified = user?.ristay_verified === "1";

  return (
    <div className="relative flex flex-col cursor-pointer">
      {/* Image Slider */}
      <div className="relative rounded-xl overflow-hidden">
        <PropertySlider page={page} setPage={setPage}>
          {initial_gallery.length > 0 ?
          <>
            {initial_gallery?.map((image, index) => (
              <>{image.image ?
              <img
                key={index}
                src={`/storage/${image.image}`}
                onClick={() => router.visit(route('property-detail', { id }))}
                alt={`Image ${index + 1} of ${property_name}`}
                className="w-full aspect-[20/19] object-cover"
              /> :
              <img
                key={index}
                src={`/images/no-pic.avif`}
                onClick={() => router.visit(route('property-detail', { id }))}
                alt={`Image ${index + 1} of ${property_name}`}
                className="w-full aspect-[20/19] object-cover"
              /> }</>
            ))}
          </>
          :
          <img
            src='/images/no-pic.avif'
            onClick={() => router.visit(route('property-detail', { id }))}
            alt={`Image of ${property_name}`}
            className="w-full aspect-[20/19] object-cover"
          />
          }
        </PropertySlider>

        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-3 left-3 bg-white px-1 py-1 font-bold rounded-full flex items-center gap-1 shadow-sm">
            <svg className="h-4 text-[#f0661d]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

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
       className="grid grid-cols-[minmax(0,1fr),max-content] gap-[2px_8px] mt-3 text-[.9375rem] leading-[19px] px-2">
        <div className="font-bold line-clamp-2">
          {property_name} in {location}
        </div>
        <div className="mt-[6px] col-span-2">
          <span className="font-light">KES {platform_price} for one night</span>
        </div>
      </Link>
    </div>
  );
};

// Updated PropTypes to include user object
Product.propTypes = {
  property_name: PropTypes.string.isRequired,
  initial_gallery: PropTypes.arrayOf(
  PropTypes.shape({
      image: PropTypes.string.isRequired,
    })
  ),
  country: PropTypes.string,
  starRate: PropTypes.number,
  location: PropTypes.string,
  dayRange: PropTypes.string,
  platform_price: PropTypes.number.isRequired,
  time: PropTypes.string,
  id: PropTypes.number.isRequired,
  user: PropTypes.shape({
    ristay_verified: PropTypes.string
  })
};

export default Product;
