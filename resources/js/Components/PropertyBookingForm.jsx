import React, { useEffect, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

const PropertyBookingForm = ({ property }) => {
  const [selectedVariation, setSelectedVariation] = useState(null);
  
  const { data, setData, errors } = useForm({
    property_id: property.id,
    check_in_date: '',
    check_out_date: '',
    nights: 0,
    total_price: 0,
    variation_id: null
  });

  // 

  // Function to check if a date range is booked for a specific variation (or standard)
  const isRangeBooked = (startDate, endDate, variationId = null) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    return property.bookings.some(booking => {
      // Skip if we're checking for standard and this booking is for a variation
      if (variationId === null && booking.variation_id !== null) return false;
      
      // Skip if we're checking for a variation and this booking is for standard or a different variation
      if (variationId !== null && booking.variation_id !== variationId) return false;
      
      const bookingStart = new Date(booking.check_in_date);
      bookingStart.setHours(0, 0, 0, 0);
      
      const bookingEnd = new Date(booking.check_out_date);
      bookingEnd.setHours(0, 0, 0, 0);
      
      return (
        (start >= bookingStart && start < bookingEnd) || // Start date is within a booking
        (end > bookingStart && end <= bookingEnd) ||    // End date is within a booking
        (start <= bookingStart && end >= bookingEnd)     // Range encompasses a booking
      );
    });
  };

  // Function to get the minimum available check-out date
  const getMinCheckoutDate = (checkInDate) => {
    if (!checkInDate) return new Date().toISOString().split('T')[0];
    
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    // Find the next day after check-in that's not booked for the selected variation
    let nextDay = new Date(checkIn);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (isRangeBooked(checkInDate, nextDay.toISOString().split('T')[0], data.variation_id)) {
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

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Booking Conflict',
      text: message,
      confirmButtonColor: '#f97316',
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'check_in_date') {
      // Check if this date is booked for the selected variation (or standard)
      if (isRangeBooked(value, value, data.variation_id)) {
        const message = data.variation_id 
          ? 'This date is already booked for the selected room type. Please choose different dates.'
          : 'This date is already booked for the standard room. Please choose different dates.';
        showErrorAlert(message);
        return;
      }

      // If changing check-in date and we have a check-out date, validate the range
      if (data.check_out_date && isRangeBooked(value, data.check_out_date, data.variation_id)) {
        const message = data.variation_id 
          ? 'The selected dates overlap with an existing booking for this room type.'
          : 'The selected dates overlap with an existing booking for the standard room.';
        showErrorAlert(message);
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
        showErrorAlert('Please select check-in date first');
        return;
      }

      // Check-out must be after check-in
      if (new Date(value) <= new Date(data.check_in_date)) {
        showErrorAlert('Check-out date must be after check-in date');
        return;
      }

      // Check for booking conflicts for the selected variation (or standard)
      if (isRangeBooked(data.check_in_date, value, data.variation_id)) {
        const message = data.variation_id 
          ? 'The selected dates overlap with an existing booking for this room type.'
          : 'The selected dates overlap with an existing booking for the standard room.';
        showErrorAlert(message);
        return;
      }

      setData(name, value);
    }
  };

  const handleVariationChange = (variation) => {
    const newVariationId = variation?.id || null;
    
    // Check if current selected dates are available for the new variation
    if (data.check_in_date && data.check_out_date) {
      if (isRangeBooked(data.check_in_date, data.check_out_date, newVariationId)) {
        const message = variation 
          ? 'The currently selected dates are not available for this room type. Please choose different dates.'
          : 'The currently selected dates are not available for the standard room. Please choose different dates.';
        showErrorAlert(message);
        return;
      }
    }
    
    setSelectedVariation(variation);
    setData('variation_id', newVariationId);
    
    // Recalculate total price if dates are already selected
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = nights * (variation ? variation.platform_price : property.platform_price);
      
      setData(prev => ({
        ...prev,
        nights: nights,
        total_price: basePrice
      }));
    }
  };

  const handleDivClick = (inputId) => {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.focus();
      inputElement.showPicker();
    }
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
    } else {
      setData(prev => ({
        ...prev,
        nights: 0,
        total_price: 0
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
            {/* Price and Rating Section */}
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
                    className={`p-3 border rounded-lg cursor-pointer ${!selectedVariation ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
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
                      className={`p-3 border rounded-lg cursor-pointer ${selectedVariation?.id === variation.id ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
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

            {/* Date Selection */}
            <div className="date-selection mb-4">
              <div className="flex flex-col lg:flex-row border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Check-in Date */}
                <div 
                  className="border-r flex-1 border-gray-300 dark:border-gray-600 p-3 cursor-pointer"
                  onClick={() => handleDivClick('check_in_date')}
                >
                  <div className="flex flex-col">
                    <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      id="check_in_date"
                      name="check_in_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 pointer-events-none"
                      value={data.check_in_date}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Add date"
                      required
                    />
                  </div>
                </div>
                
                {/* Check-out Date */}
                <div 
                  className="p-3 flex-1 cursor-pointer"
                  onClick={() => handleDivClick('check_out_date')}
                >
                  <div className="flex flex-col">
                    <label htmlFor="check_out_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Checkout
                    </label>
                    <input
                      type="date"
                      id="check_out_date"
                      name="check_out_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 pointer-events-none"
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
            </div>

            {/* Reserve Button */}
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  type="button"
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

                <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}
            
            {/* Price Breakdown */}
            {data.nights > 0 && (
              <>
                <div className="sticky-card__detail flex justify-between items-center mb-3">
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                    KES {getCurrentPrice()} x {data.nights} night{data.nights !== 1 ? 's' : ''}
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

      {/* Mobile version */}
      <div className="mt-2 sm:hidden">
        <div className="sticky-content">
          <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Price and Rating Section */}
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
                    className={`p-3 border rounded-lg cursor-pointer ${!selectedVariation ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
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
                      className={`p-3 border rounded-lg cursor-pointer ${selectedVariation?.id === variation.id ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
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

            {/* Date Selection */}
            <div className="date-selection mb-4">
              <div className="flex flex-col lg:flex-row border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                {/* Check-in Date */}
                <div 
                  className="border-b lg:border-r border-gray-300 dark:border-gray-600 p-3 cursor-pointer"
                  onClick={() => handleDivClick('check_in_date')}
                >
                  <div className="flex flex-col">
                    <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      id="check_in_date"
                      name="check_in_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 pointer-events-none"
                      value={data.check_in_date}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Add date"
                      required
                    />
                  </div>
                </div>
                
                {/* Check-out Date */}
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => handleDivClick('check_out_date')}
                >
                  <div className="flex flex-col">
                    <label htmlFor="check_out_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Checkout
                    </label>
                    <input
                      type="date"
                      id="check_out_date"
                      name="check_out_date"
                      className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 pointer-events-none"
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
            </div>

            {/* Reserve Button */}
            {data.check_in_date && data.check_out_date && (
              <>
                <Link
                  type="button"
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

                <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You won't be charged yet
                </span>
              </>
            )}
            
            {/* Price Breakdown */}
            {data.nights > 0 && (
              <>
                <div className="sticky-card__detail flex justify-between items-center mb-3">
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                    KES {getCurrentPrice()} x {data.nights} night{data.nights !== 1 ? 's' : ''}
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
    </>
  );
};

export default PropertyBookingForm;