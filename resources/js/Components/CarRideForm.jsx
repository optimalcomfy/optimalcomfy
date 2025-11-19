// resources/js/Pages/Car/CarBookingForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CarRideForm = ({ car }) => {
  const { data, setData } = useForm({
    car_id: car.id,
    check_in_date: '',
    check_out_date: '',
    days: 0,
    total_price: 0
  });

  // Get all booked dates for the car
  const getBookedDates = () => {
    const bookedDates = [];

    car.bookings.forEach(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);

      // Add all dates in the range (excluding end date as it's available)
      let current = new Date(start);
      while (current < end) {
        bookedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    return bookedDates;
  };

  // Check if a date should be disabled for pickup
  const isPickupDateDisabled = (date) => {
    const bookedDates = getBookedDates();
    return bookedDates.some(bookedDate =>
      bookedDate.toDateString() === date.toDateString()
    );
  };

  // Check if a date should be disabled for drop-off
  const isDropoffDateDisabled = (date) => {
    if (!data.check_in_date) return true;

    const pickup = new Date(data.check_in_date);

    // Must be after pickup
    if (date <= pickup) return true;

    // Check if any date in the range is booked
    const bookedDates = getBookedDates();
    let current = new Date(pickup);
    current.setDate(current.getDate() + 1);

    while (current <= date) {
      if (bookedDates.some(bookedDate =>
        bookedDate.toDateString() === current.toDateString()
      )) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }

    return false;
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

  // Helper function to format date without timezone issues
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePickupChange = (date) => {
    if (date) {
      const dateString = formatDateString(date);
      setData({
        ...data,
        check_in_date: dateString,
        check_out_date: '' // Reset drop-off when pickup changes
      });
    }
  };

  const handleDropoffChange = (date) => {
    if (date) {
      const dateString = formatDateString(date);
      setData('check_out_date', dateString);
    }
  };

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const days = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = days * (car.platform_price || 0);

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

  const subtotal = data.days > 0 ? (car.platform_price || 0) * data.days : 0;

  return (
    <>
      <div className="sticky-content--container">
        <div className="sticky-content hidden lg:flex">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price Section */}
            <div className="price-detail mb-6">
              <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
                KES {car.platform_price || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">/day</span>
              </h2>
            </div>

            {/* Date Selection with react-datepicker */}
            <div className="date-selection mb-4">
              <div className="flex flex-col lg:flex-row border border-gray-300 dark:border-gray-600 rounded-lg">
                {/* Pickup Date */}
                <div className="border-r flex-1 border-gray-300 dark:border-gray-600 p-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Pickup Date
                  </label>
                  <DatePicker
                    selected={data.check_in_date ? new Date(data.check_in_date) : null}
                    onChange={handlePickupChange}
                    minDate={new Date()}
                    filterDate={(date) => !isPickupDateDisabled(date)}
                    placeholderText="Add date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                    dateFormat="yyyy-MM-dd"
                    withPortal
                    showPopperArrow={false}
                  />
                </div>

                {/* Drop-off Date */}
                <div className="p-3 flex-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Drop-off Date
                  </label>
                  <DatePicker
                    selected={data.check_out_date ? new Date(data.check_out_date) : null}
                    onChange={handleDropoffChange}
                    minDate={data.check_in_date ? new Date(new Date(data.check_in_date).getTime() + 86400000) : new Date()}
                    filterDate={(date) => !isDropoffDateDisabled(date)}
                    disabled={!data.check_in_date}
                    placeholderText="Add date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none disabled:opacity-50 cursor-pointer"
                    dateFormat="yyyy-MM-dd"
                    withPortal
                    showPopperArrow={false}
                  />
                </div>
              </div>
            </div>

            {/* Reserve Button */}
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  href={route('car-booking', {
                    car_id: car.id,
                    check_in_date: data.check_in_date,
                    check_out_date: data.check_out_date
                  })}
                  className="btn btn--pink w-full py-3 text-center px-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
                >
                  Hire Ride
                </Link>

                <span className="block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}

            {/* Price Breakdown */}
            {data.days > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    KES {car.platform_price || 0} x {data.days} day{data.days !== 1 ? 's' : ''}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    KES {subtotal}
                  </p>
                </div>
                <hr className="border-gray-200 dark:border-gray-600 mb-4" />
                <h4 className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                  Total
                  <span>KES {data.total_price}</span>
                </h4>
              </>
            )}

            {/* Rental Duration */}
            {data.days > 0 && (
              <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                Your rental: <span className="font-bold text-blue-600 dark:text-blue-400">{data.days} day{data.days !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="mt-2 lg:hidden">
        <div className="sticky-content">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price Section */}
            <div className="price-detail mb-6">
              <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
                KES {car.platform_price || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">/day</span>
              </h2>
            </div>

            {/* Date Selection with react-datepicker */}
            <div className="date-selection mb-4">
              <div className="flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg">
                {/* Pickup Date */}
                <div className="border-b border-gray-300 dark:border-gray-600 p-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Pickup Date
                  </label>
                  <DatePicker
                    selected={data.check_in_date ? new Date(data.check_in_date) : null}
                    onChange={handlePickupChange}
                    minDate={new Date()}
                    filterDate={(date) => !isPickupDateDisabled(date)}
                    placeholderText="Add date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                    dateFormat="yyyy-MM-dd"
                    withPortal
                    showPopperArrow={false}
                  />
                </div>

                {/* Drop-off Date */}
                <div className="p-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Drop-off Date
                  </label>
                  <DatePicker
                    selected={data.check_out_date ? new Date(data.check_out_date) : null}
                    onChange={handleDropoffChange}
                    minDate={data.check_in_date ? new Date(new Date(data.check_in_date).getTime() + 86400000) : new Date()}
                    filterDate={(date) => !isDropoffDateDisabled(date)}
                    disabled={!data.check_in_date}
                    placeholderText="Add date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none disabled:opacity-50 cursor-pointer"
                    dateFormat="yyyy-MM-dd"
                    withPortal
                    showPopperArrow={false}
                  />
                </div>
              </div>
            </div>

            {/* Reserve Button */}
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  href={route('car-booking', {
                    car_id: car.id,
                    check_in_date: data.check_in_date,
                    check_out_date: data.check_out_date
                  })}
                  className="btn btn--pink w-full py-3 text-center px-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
                >
                  Hire Ride
                </Link>

                <span className="block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}

            {/* Price Breakdown */}
            {data.days > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    KES {car.platform_price || 0} x {data.days} day{data.days !== 1 ? 's' : ''}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    KES {subtotal}
                  </p>
                </div>
                <hr className="border-gray-200 dark:border-gray-600 mb-4" />
                <h4 className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                  Total
                  <span>KES {data.total_price}</span>
                </h4>
              </>
            )}

            {/* Rental Duration */}
            {data.days > 0 && (
              <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                Your rental: <span className="font-bold text-blue-600 dark:text-blue-400">{data.days} day{data.days !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CarRideForm;
