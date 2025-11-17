import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PropertyBookingForm = ({ property }) => {
  const [selectedVariation, setSelectedVariation] = useState(null);

  const { data, setData } = useForm({
    property_id: property.id,
    check_in_date: '',
    check_out_date: '',
    nights: 0,
    total_price: 0,
    variation_id: null
  });

  // Get all booked dates for the selected variation
  const getBookedDates = (variationId = null) => {
    const bookedDates = [];

    property.bookings.forEach(booking => {
      // Filter bookings by variation
      if (variationId === null && booking.variation_id !== null) return;
      if (variationId !== null && booking.variation_id !== variationId) return;

      const start = new Date(booking.check_in_date);
      const end = new Date(booking.check_out_date);

      // Add all dates in the range (excluding checkout day as it's available)
      let current = new Date(start);
      while (current < end) {
        bookedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    return bookedDates;
  };

  // Check if a date should be disabled for check-in
  const isCheckInDateDisabled = (date) => {
    const bookedDates = getBookedDates(data.variation_id);
    return bookedDates.some(bookedDate =>
      bookedDate.toDateString() === date.toDateString()
    );
  };

  // Check if a date should be disabled for check-out
  const isCheckOutDateDisabled = (date) => {
    if (!data.check_in_date) return true;

    const checkIn = new Date(data.check_in_date);

    // Must be after check-in
    if (date <= checkIn) return true;

    // Check if any date in the range is booked
    const bookedDates = getBookedDates(data.variation_id);
    let current = new Date(checkIn);
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

  const handleCheckInChange = (date) => {
    if (date) {
      const dateString = formatDateString(date);
      setData({
        ...data,
        check_in_date: dateString,
        check_out_date: '' // Reset checkout when check-in changes
      });
    }
  };

  const handleCheckOutChange = (date) => {
    if (date) {
      const dateString = formatDateString(date);
      setData('check_out_date', dateString);
    }
  };

  const handleVariationChange = (variation) => {
    const newVariationId = variation?.id || null;

    setSelectedVariation(variation);
    setData({
      ...data,
      variation_id: newVariationId,
      check_in_date: '',
      check_out_date: '',
      nights: 0,
      total_price: 0
    });
  };

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const pricePerNight = selectedVariation ? selectedVariation.platform_price : property.platform_price;
      const basePrice = nights * pricePerNight;

      setData(prev => ({
        ...prev,
        nights: nights,
        total_price: basePrice
      }));
    }
  }, [data.check_in_date, data.check_out_date, selectedVariation]);

  const getCurrentPrice = () => {
    return selectedVariation ? selectedVariation.platform_price : property.platform_price;
  };

  const subtotal = data.nights > 0 ? getCurrentPrice() * data.nights : 0;

  return (
    <>
      <div className="sticky-content--container">
        <div className="sticky-content">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price Section */}
            <div className="price-detail mb-6">
              <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
                KES {getCurrentPrice() || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">/night</span>
              </h2>
            </div>

            {/* Variations Selection */}
            {property.variations && property.variations.length > 0 && (
              <div className="variations-selection mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Room Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer ${!selectedVariation ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
                    onClick={() => handleVariationChange(null)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {property.type} (Standard)
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        KES {property.platform_price}
                      </span>
                    </div>
                  </div>

                  {property.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className={`p-3 border rounded-lg cursor-pointer ${selectedVariation?.id === variation.id ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
                      onClick={() => handleVariationChange(variation)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {variation.type}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          KES {variation.platform_price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection with react-datepicker */}
            <div className="date-selection mb-4">
              <div className="flex flex-col lg:flex-row border border-gray-300 dark:border-gray-600 rounded-lg">
                {/* Check-in Date */}
                <div className="border-r flex-1 border-gray-300 dark:border-gray-600 p-3">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Check-In
                  </label>
                  <DatePicker
                    selected={data.check_in_date ? new Date(data.check_in_date) : null}
                    onChange={handleCheckInChange}
                    minDate={new Date()}
                    filterDate={(date) => !isCheckInDateDisabled(date)}
                    placeholderText="Add date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                    dateFormat="yyyy-MM-dd"
                    withPortal
                    showPopperArrow={false}
                  />
                </div>

                {/* Check-out Date */}
                <div className="p-3 flex-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Checkout
                  </label>
                  <DatePicker
                    selected={data.check_out_date ? new Date(data.check_out_date) : null}
                    onChange={handleCheckOutChange}
                    minDate={data.check_in_date ? new Date(new Date(data.check_in_date).getTime() + 86400000) : new Date()}
                    filterDate={(date) => !isCheckOutDateDisabled(date)}
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
                  href={route('property-booking', {
                    property_id: property.id,
                    check_in_date: data.check_in_date,
                    check_out_date: data.check_out_date,
                    variation_id: selectedVariation?.id || null
                  })}
                  className="btn btn--pink w-full py-3 text-center px-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
                >
                  Reserve
                </Link>

                <span className="block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}

            {/* Price Breakdown */}
            {data.nights > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    KES {getCurrentPrice()} x {data.nights} night{data.nights !== 1 ? 's' : ''}
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

            {/* Stay Duration */}
            {data.nights > 0 && (
              <div className="text-center font-medium mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                Your stay: <span className="font-bold text-blue-600 dark:text-blue-400">{data.nights} night{data.nights !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyBookingForm;
