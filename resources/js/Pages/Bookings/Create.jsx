import React, { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';
import { format, addDays, isWithinInterval, parseISO, differenceInDays, isSameDay, isAfter, isBefore } from 'date-fns';

const CreateBooking = () => {
  const { users, properties, auth } = usePage().props;
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, setData, post, errors, processing } = useForm({
    user_id: auth.user?.id,
    property_id: '',
    variation_id: '',
    check_in_date: '',
    check_out_date: '',
    total_price: '',
    status: 'paid',
    external_booking: 'Yes'
  });

  // Load booked dates when property is selected
  useEffect(() => {
    if (data.property_id) {
      const property = properties.find(p => p.id === data.property_id);
      if (property) {
        setSelectedProperty(property);
        const dates = property.bookings.map(booking => ({
          start: parseISO(booking.check_in_date),
          end: parseISO(booking.check_out_date)
        }));
        setBookedDates(dates);
        // Reset variation selection when property changes
        setSelectedVariation(null);
        setData('variation_id', '');
      }
    }
  }, [data.property_id, properties]);

  // Calculate price based on selected dates and variation
  const calculatePrice = (startDate, endDate) => {
    if (!selectedProperty || !startDate || !endDate) return '';
    
    const diffDays = differenceInDays(endDate, startDate) + 1;
    
    let pricePerNight = parseFloat(selectedProperty.price_per_night);
    
    if (selectedVariation) {
      pricePerNight = selectedVariation.price;
    }
    
    return (diffDays * pricePerNight).toFixed(2);
  };

  // Handle variation selection
  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    setData('variation_id', variation ? variation.id : '');
    
    // Recalculate price if dates are already selected
    if (data.check_in_date && data.check_out_date) {
      const startDate = new Date(data.check_in_date);
      const endDate = new Date(data.check_out_date);
      setData('total_price', calculatePrice(startDate, endDate));
    }
  };

  // Handle date selection
  const handleDateClick = (date) => {
    // Check if date is booked
    const isBooked = bookedDates.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
    
    if (isBooked) {
      alert('This date is already booked. Please select an available date.');
      return;
    }

    if (!data.check_in_date || (data.check_in_date && data.check_out_date)) {
      // First selection or new selection
      setData({
        ...data,
        check_in_date: format(date, 'yyyy-MM-dd'),
        check_out_date: '',
        total_price: ''
      });
    } else {
      // Second selection
      const checkInDate = new Date(data.check_in_date);
      const endDate = isAfter(date, checkInDate) ? date : checkInDate;
      const startDate = isAfter(date, checkInDate) ? checkInDate : date;
      
      // Check if any date in range is booked
      const datesInRange = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        datesInRange.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
      
      const hasConflict = datesInRange.some(rangeDate => 
        bookedDates.some(bookedRange => 
          isWithinInterval(rangeDate, { start: bookedRange.start, end: bookedRange.end })
        )
      );
      
      if (hasConflict) {
        alert('Some dates in your selection are already booked. Please select different dates.');
        return;
      }
      
      setData({
        ...data,
        check_in_date: format(startDate, 'yyyy-MM-dd'),
        check_out_date: format(endDate, 'yyyy-MM-dd'),
        total_price: calculatePrice(startDate, endDate)
      });
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!data.check_in_date) return false;
    
    const checkInDate = new Date(data.check_in_date);
    if (isSameDay(date, checkInDate)) return true;
    
    if (data.check_out_date) {
      const checkOutDate = new Date(data.check_out_date);
      return isWithinInterval(date, { start: checkInDate, end: checkOutDate });
    }
    
    return false;
  };

  // Check if date is booked
  const isDateBooked = (date) => {
    return bookedDates.some(range => 
      isWithinInterval(date, { start: range.start, end: range.end })
    );
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  // Navigate month
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    post(route('bookings.add'), {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };

  const propertyOptions = properties.map(property => ({ 
    value: property.id, 
    label: `${property.property_name} (${property.type}) - ${property.location}`
  }));

  const calendarDays = generateCalendarDays();

  return (
    <Layout>
      <div className="max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-lg flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Booking created successfully!</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#d95932] to-[#d95932] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create External Booking</h1>
            <p className="text-blue-100 mt-2">Book on behalf of a guest - Direct reservation</p>
          </div>

          {/* Main Form */}
          <div className="p-8 space-y-8 min-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* User and Property Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Property</label>
                  <Select
                    options={propertyOptions}
                    value={propertyOptions.find(option => option.value === data.property_id)}
                    onChange={(selected) => setData('property_id', selected ? selected.value : '')}
                    placeholder="Search properties..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '12px',
                        borderColor: errors.property_id ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: errors.property_id ? '#ef4444' : '#3b82f6'
                        }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '12px 16px'
                      })
                    }}
                  />
                  {errors.property_id && <p className="mt-2 text-sm text-red-600">{errors.property_id}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Type</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-[#d95932]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">External Booking</p>
                        <p className="text-sm text-[#d95932]">Direct reservation on behalf of guest</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              {selectedProperty && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 transition-all duration-300">
                  <h3 className="font-semibold text-xl text-gray-800 mb-4">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-[#d95932]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProperty.type}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Base Price</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedProperty.price_per_night}/night
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Capacity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedProperty.max_adults} adults, {selectedProperty.max_children} children
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedProperty.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variations Selection */}
                  {selectedProperty.variations && selectedProperty.variations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Select Room Type</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Base property option */}
                        <div 
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${!selectedVariation ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => handleVariationChange(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{selectedProperty.type} (Standard)</h5>
                              <p className="text-sm text-gray-600 mt-1">Base property option</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${selectedProperty.price_per_night}</p>
                              <p className="text-xs text-gray-500">per night</p>
                            </div>
                          </div>
                        </div>

                        {/* Variations options */}
                        {selectedProperty.variations.map(variation => (
                          <div 
                            key={variation.id}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedVariation?.id === variation.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => handleVariationChange(variation)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{variation.type}</h5>
                                <p className="text-sm text-gray-600 mt-1">{variation.description || 'Premium option'}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">${variation.price}</p>
                                <p className="text-xs text-gray-500">per night</p>
                                {variation.price > selectedProperty.price_per_night && (
                                  <p className="text-xs text-green-600 mt-1">+${(variation.price - selectedProperty.price_per_night).toFixed(2)} upgrade</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Calendar */}
              {selectedProperty && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Select Dates</h3>
                  
                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-gray-600">Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                      <span className="text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <span className="text-gray-600">Past Date</span>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((date, index) => {
                        const isSelected = isDateSelected(date);
                        const isBooked = isDateBooked(date);
                        const isCurrentMonthDate = isCurrentMonth(date);
                        const isPast = isBefore(date, new Date()) && !isSameDay(date, new Date());
                        const isDisabled = isBooked || isPast;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => !isDisabled && handleDateClick(date)}
                            disabled={isDisabled}
                            className={`
                              relative p-3 text-sm font-medium rounded-lg transition-all duration-200
                              ${isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'}
                              ${isSelected ? 'bg-blue-500 text-white shadow-md transform scale-105' : ''}
                              ${isBooked ? 'bg-red-400 text-white cursor-not-allowed' : ''}
                              ${isPast && !isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                              ${!isSelected && !isBooked && !isPast && isCurrentMonthDate ? 
                                'hover:bg-blue-50 hover:text-[#d95932] hover:border-blue-200' : ''}
                              ${!isDisabled ? 'cursor-pointer' : ''}
                              border border-transparent
                            `}
                          >
                            <span className="relative z-10">{date.getDate()}</span>
                            {isSelected && (isSameDay(date, new Date(data.check_in_date)) || 
                              isSameDay(date, new Date(data.check_out_date))) && (
                              <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Dates Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={data.check_in_date}
                          onChange={(e) => setData('check_in_date', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          min={format(new Date(), 'yyyy-MM-dd')}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      {errors.check_in_date && <p className="mt-1 text-sm text-red-600">{errors.check_in_date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={data.check_out_date}
                          onChange={(e) => setData('check_out_date', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          min={data.check_in_date || format(new Date(), 'yyyy-MM-dd')}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      {errors.check_out_date && <p className="mt-1 text-sm text-red-600">{errors.check_out_date}</p>}
                    </div>
                  </div>

                  {/* Price Summary */}
                  {data.check_in_date && data.check_out_date && data.total_price && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 transition-all duration-300">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">Booking Summary</h4>
                          <p className="text-[#d95932] mt-1">
                            {differenceInDays(new Date(data.check_out_date), new Date(data.check_in_date))} nights
                            × {selectedVariation ? selectedVariation.price : selectedProperty.price_per_night} per night
                            {selectedVariation && ` (${selectedVariation.type})`}
                          </p>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-sm font-medium text-[#d95932]">Total Amount</p>
                          <p className="text-3xl font-bold text-blue-900">{data.total_price}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <Link 
                  href={route('bookings.index')} 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-[#d95932] to-[#d95932] hover:from-[#d95932] hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  disabled={isSubmitting || !data.check_in_date || !data.check_out_date || !data.property_id}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm External Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBooking;