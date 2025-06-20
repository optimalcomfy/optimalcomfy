// resources/js/Pages/Car/CarBookingForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import axios from 'axios';

const CarRideForm = ({ car }) => {
  const { data, setData, post, processing, errors } = useForm({
    car_id: car.id,
    check_in_date: '',
    check_out_date: '',
    days: 0,
    total_price: 0
  });

  // Function to check if a date is within any booked range
  const isDateBooked = (date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    return car.bookings.some(booking => {
      const start = new Date(booking.start_date);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(booking.end_date);
      end.setHours(0, 0, 0, 0);
      
      return dateToCheck >= start && dateToCheck <= end;
    });
  };

  // Function to check if a date range overlaps with any booking
  const isRangeBooked = (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    return car.bookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      bookingStart.setHours(0, 0, 0, 0);
      
      const bookingEnd = new Date(booking.end_date);
      bookingEnd.setHours(0, 0, 0, 0);
      
      return (
        (start >= bookingStart && start <= bookingEnd) || // Start date is within a booking
        (end >= bookingStart && end <= bookingEnd) ||    // End date is within a booking
        (start <= bookingStart && end >= bookingEnd)     // Range encompasses a booking
      );
    });
  };

  // Function to get the minimum available check-out date
  const getMinCheckoutDate = (checkInDate) => {
    if (!checkInDate) return new Date().toISOString().split('T')[0];
    
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    // Find the next day after check-in that's not booked
    let nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (isDateBooked(nextDay.toISOString().split('T')[0])) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay.toISOString().split('T')[0];
  };

  const calculateDays = (check_in_date, check_out_date) => {
    if (check_in_date && check_out_date) {
      const checkInDate = new Date(check_in_date);
      const checkOutDate = new Date(check_out_date);
      const timeDifference = checkOutDate - checkInDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    }
    return 0;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === 'check_in_date') {
      // Validate check-in date
      if (isDateBooked(value)) {
        alert('This date is already booked. Please select another pickup date.');
        return;
      }

      // If changing check-in date and we have a check-out date, validate the range
      if (data.check_out_date && isRangeBooked(value, data.check_out_date)) {
        alert('The selected dates overlap with an existing booking. Please adjust your dates.');
        setData('check_out_date', '');
      }

      setData({
        ...data,
        [name]: value,
        check_out_date: '' // Reset check-out date when check-in changes
      });
    } else if (name === 'check_out_date') {
      // Must have a check-in date first
      if (!data.check_in_date) {
        alert('Please select pickup date first');
        return;
      }

      // Check-out must be after check-in
      if (new Date(value) <= new Date(data.check_in_date)) {
        alert('Drop-off date must be after pickup date');
        return;
      }

      // Check for booking conflicts
      if (isRangeBooked(data.check_in_date, value)) {
        alert('The selected dates overlap with an existing booking. Please adjust your dates.');
        return;
      }

      setData(name, value);
    }
  };

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const days = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = days * (car.price_per_day || 0);
      
      setData(prev => ({
        ...prev,
        days: days,
        total_price: basePrice
      }));
    } else {
      setData(prev => ({
        ...prev,
        days: 0,
        total_price: 0
      }));
    }
  }, [data.check_in_date, data.check_out_date]);

  const subtotal = data.days > 0 ? (car.price_per_day || 0) * data.days : 0;

  // Get all booked dates for display
  const bookedDates = car.bookings.flatMap(booking => {
    const dates = [];
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  });

  return (
    <>
      <div className="sticky-content--container">
        <div className="sticky-content">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price and Rating Section */}
            <div className="price-detail mb-6">
              <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
                KES {car.price_per_day || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">day</span>
              </h2>
            </div>

            {/* Date Selection */}
            <div className="date-selection mb-4">
              <div className="grid grid-cols-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Check-in Date */}
                <div className="border-r border-gray-300 dark:border-gray-600 p-3">
                  <div className="flex flex-col">
                    <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      PICKUP DATE
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
                      DROP OFF DATE
                    </label>
                    <input
                      type="date"
                      id="check_out_date"
                      name="check_out_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                      value={data.check_out_date}
                      onChange={handleDateChange}
                      min={getMinCheckoutDate(data.check_in_date)}
                      disabled={!data.check_in_date}
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
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  type="button"
                  href={route('car-booking', { 
                    car_id: car.id, 
                    check_in_date: data.check_in_date, 
                    check_out_date: data.check_out_date  
                  })}
                  className="btn btn--pink w-full text-center py-3 px-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
                >
                  Hire ride
                </Link>

                <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}
            
            {/* Price Breakdown */}
            {data.days > 0 && (
              <>
                <div className="sticky-card__detail flex justify-between items-center mb-3">
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                    KES {car.price_per_day || 0} x {data.days} day{data.days !== 1 ? 's' : ''}
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
            {data.days > 0 && (
              <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                Your ride: <span className="font-bold text-blue-600 dark:text-blue-400">{data.days} day{data.days !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="mt-2 sm:hidden">
        <div className="sticky-content">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price and Rating Section */}
            <div className="price-detail mb-6">
              <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
                KES {car.price_per_day || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">day</span>
              </h2>
            </div>

            {/* Booked Dates Info */}
            {car.bookings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Note:</strong> This car has bookings on:
                </p>
                <ul className="list-disc pl-5 mt-1 text-sm">
                  {car.bookings.map((booking, index) => (
                    <li key={index} className="text-yellow-700 dark:text-yellow-300">
                      {booking.start_date} to {booking.end_date}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Date Selection */}
            <div className="date-selection mb-4">
              <div className="grid grid-cols-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Check-in Date */}
                <div className="border-r border-gray-300 dark:border-gray-600 p-3">
                  <div className="flex flex-col">
                    <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      PICKUP DATE
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
                      DROP OFF DATE
                    </label>
                    <input
                      type="date"
                      id="check_out_date"
                      name="check_out_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                      value={data.check_out_date}
                      onChange={handleDateChange}
                      min={getMinCheckoutDate(data.check_in_date)}
                      disabled={!data.check_in_date}
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
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  type="button"
                  href={route('car-booking', { 
                    car_id: car.id, 
                    check_in_date: data.check_in_date, 
                    check_out_date: data.check_out_date  
                  })}
                  className="btn btn--pink w-full text-center py-3 px-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
                >
                  Hire ride
                </Link>

                <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}
            
            {/* Price Breakdown */}
            {data.days > 0 && (
              <>
                <div className="sticky-card__detail flex justify-between items-center mb-3">
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                    KES {car.price_per_day || 0} x {data.days} day{data.days !== 1 ? 's' : ''}
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
            {data.days > 0 && (
              <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                Your ride: <span className="font-bold text-blue-600 dark:text-blue-400">{data.days} day{data.days !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CarRideForm;