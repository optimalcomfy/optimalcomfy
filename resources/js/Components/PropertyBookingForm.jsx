// resources/js/Pages/Property/PropertyBookingForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import axios from 'axios';

const PropertyBookingForm = ({ property }) => {
  const { data, setData, post, processing, errors } = useForm({
    property_id: property.id,
    check_in_date: '',
    check_out_date: '',
  });

  const calculateDays = (check_in_date, check_out_date) => {
    if (check_in_date && check_out_date) {
      const check_in_dateDate = new Date(check_in_date);
      const check_out_dateDate = new Date(check_out_date);
      const timeDifference = check_out_dateDate - check_in_dateDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    }
    return 0;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === 'check_out_date' && data.check_in_date && new Date(value) <= new Date(data.check_in_date)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (name === 'check_in_date' && data.check_out_date && new Date(value) >= new Date(data.check_out_date)) {
      alert('Check-in date must be before check-out date');
      return;
    }

    setData(name, value);
  };


  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = nights * (property.price_per_night || 0);
      
      setData(prev => ({
        ...prev,
        nights: nights,
        total_price: basePrice
      }));
    } else {
      setData(prev => ({
        ...prev,
        nights: 0,
        total_price: 0
      }));
    }
  }, [data.check_in_date, data.check_out_date]);

  
  const subtotal = data.nights > 0 ? (property.price_per_night || 0) * data.nights : 0;

  return (
    <div className="sticky-content--container">
      <div className="sticky-content">
        <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Price and Rating Section */}
          <div className="price-detail mb-6">
            <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
              KES {property.price_per_night || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">night</span>
            </h2>
          </div>

          {/* Date Selection */}
          <div className="date-selection mb-4">
            <div className="grid grid-cols-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Check-in Date */}
              <div className="border-r border-gray-300 dark:border-gray-600 p-3">
                <div className="flex flex-col">
                  <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    id="check_in_date"
                    name="check_in_date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    value={data.check_in_date}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Add date"
                    required
                  />
                </div>
              </div>
              
              {/* Check-out Date */}
              <div className="p-3">
                <div className="flex flex-col">
                  <label htmlFor="check_out_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Checkout
                  </label>
                  <input
                    type="date"
                    id="check_out_date"
                    name="check_out_date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    value={data.check_out_date}
                    onChange={handleDateChange}
                    min={data.check_in_date || new Date().toISOString().split('T')[0]}
                    placeholder="Add date"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Display validation errors */}
            {errors.check_in_date && <div className="text-red-500 text-sm mt-1">{errors.check_in_date}</div>}
            {errors.check_out_date && <div className="text-red-500 text-sm mt-1">{errors.check_out_date}</div>}
          </div>

          {/* Reserve Button */}
          {data.check_in_date && data.check_out_date &&
          <>
          <Link
            type="button"
             href={route('property-booking', { property_id: property.id, check_in_date: data.check_in_date, check_out_date: data.check_out_date  })}
            className="btn btn--pink w-full py-3 text-center px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
          >
            Reserve
          </Link>

          <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            You won't be charged yet
          </span>
          </>}
          {/* Price Breakdown */}
          {data.nights > 0 && (
            <>
              <div className="sticky-card__detail flex justify-between items-center mb-3">
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  KES {property.price_per_night || 0} x {data.nights} night{data.nights !== 1 ? 's' : ''}
                </a>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  KES {subtotal}
                </p>
              </div>
              <hr className="border-gray-200 dark:border-gray-600 mb-4" />
              <h4 className="total flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                Total 
                <span>KES {data.total_price}</span>
              </h4>
            </>
          )}

          {/* Stay Duration */}
          {data.nights > 0 && (
            <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              Your stay: <span className="font-bold text-blue-600 dark:text-blue-400">{data.nights} night{data.nights !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyBookingForm;