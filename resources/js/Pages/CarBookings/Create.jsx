import React, { useState, useEffect, useRef } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';
import { format, addDays, isWithinInterval, parseISO, differenceInDays, isSameDay, isAfter, isBefore } from 'date-fns';
import { X } from 'lucide-react';

const CreateCarBooking = () => {
  const { users, cars, booking, auth } = usePage().props;
  const [bookedDates, setBookedDates] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pricePerDay, setPricePerDay] = useState(0);

  // Location suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const { data, setData, post, errors, processing } = useForm({
    user_id: auth.user?.id,
    car_id: '',
    start_date: '',
    end_date: '',
    total_price: '',
    pickup_location: '',
    dropoff_location: '',
    status: 'paid',
    special_requests: '',
    external_booking: 'Yes'
  });

  // Initialize form with booking data
  useEffect(() => {
    if (booking) {
      const car = cars.find(c => c.id === booking.car_id);
      if (car) {
        setSelectedCar(car);
        setPricePerDay(parseFloat(car.price_per_day));
        const dates = car.bookings
          .filter(b => b.id !== booking.id)
          .map(booking => ({
            start: parseISO(booking.start_date),
            end: parseISO(booking.end_date)
          }));
        setBookedDates(dates);

        // Initialize form data with booking data
        setData({
          ...data,
          car_id: booking.car_id,
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_price: booking.total_price,
          pickup_location: booking.pickup_location,
          dropoff_location: booking.dropoff_location,
          status: booking.status,
          special_requests: booking.special_requests
        });
      }
    }
  }, [booking, cars]);

  // Load booked dates when car is selected
  useEffect(() => {
    if (data.car_id) {
      const car = cars.find(c => c.id === data.car_id);
      if (car) {
        setSelectedCar(car);
        setPricePerDay(parseFloat(car.price_per_day));
        const dates = car.bookings.map(booking => ({
          start: parseISO(booking.start_date),
          end: parseISO(booking.end_date)
        }));
        setBookedDates(dates);
      }
    }
  }, [data.car_id, cars]);

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async (query, setSuggestions) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/locations?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const suggestions = await res.json();
        setSuggestions(suggestions);
      } catch (err) {
        console.error("Error fetching location suggestions:", err);
        setSuggestions([]);
      }
    };

    const pickupDelay = setTimeout(() => {
      fetchSuggestions(data.pickup_location, setPickupSuggestions);
    }, 300);

    const dropoffDelay = setTimeout(() => {
      fetchSuggestions(data.dropoff_location, setDropoffSuggestions);
    }, 300);

    return () => {
      clearTimeout(pickupDelay);
      clearTimeout(dropoffDelay);
    };
  }, [data.pickup_location, data.dropoff_location]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupSuggestions(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target)) {
        setShowDropoffSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location, field) => {
    setData(field, location);
    if (field === 'pickup_location') {
      setShowPickupSuggestions(false);
    } else {
      setShowDropoffSuggestions(false);
    }
  };

  // Calculate price based on selected dates
  const calculatePrice = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const diffDays = differenceInDays(endDate, startDate) + 1;
    return (diffDays * pricePerDay).toFixed(2);
  };

  // Handle date selection
  const handleDateClick = (date) => {
    const isBooked = bookedDates.some(range =>
      isWithinInterval(date, { start: range.start, end: range.end })
    );

    if (isBooked) {
      alert('This date is already booked. Please select an available date.');
      return;
    }

    if (!data.start_date || (data.start_date && data.end_date)) {
      setData({
        ...data,
        start_date: format(date, 'yyyy-MM-dd'),
        end_date: '',
        total_price: ''
      });
    } else {
      // Second selection
      const startDate = new Date(data.start_date);
      const endDate = isAfter(date, startDate) ? date : startDate;
      const newStartDate = isAfter(date, startDate) ? startDate : date;

      // Check if any date in range is booked
      const datesInRange = [];
      let currentDate = new Date(newStartDate);
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
        start_date: format(newStartDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_price: calculatePrice(newStartDate, endDate)
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
    if (!data.start_date) return false;

    const startDate = new Date(data.start_date);
    if (isSameDay(date, startDate)) return true;

    if (data.end_date) {
      const endDate = new Date(data.end_date);
      return isWithinInterval(date, { start: startDate, end: endDate });
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

  const carOptions = cars.map(car => ({
    value: car.id,
    label: `${car.brand} ${car.model} (${car.year}) - ${car.price_per_day}/day`
  }));

  const calendarDays = generateCalendarDays();

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = 'car-bookings.add';
    post(route(routeName));
  };

  return (
    <Layout>
      <div className="max-w-6xl lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-peachDark px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              {booking ? 'Edit Car Booking' : 'Create New Car Booking'}
            </h1>
            <p className="text-blue-100 mt-2">
              {booking ? 'Update booking details' : 'Select car, dates, and customer details'}
            </p>
          </div>

          {/* Main Form */}
          <div className="p-3 lg:p-4 space-y-8 min-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* User and Car Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Car</label>
                  <Select
                    options={carOptions}
                    value={carOptions.find(option => option.value === data.car_id)}
                    onChange={(selected) => setData('car_id', selected ? selected.value : '')}
                    placeholder="Select car..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={!!booking} // Disable if editing existing booking
                  />
                  {errors.car_id && <p className="mt-2 text-sm text-red-600">{errors.car_id}</p>}
                </div>
              </div>

              {/* Car Details */}
              {selectedCar && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-semibold text-xl text-gray-800 mb-4">Car Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Brand/Model</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedCar.brand} {selectedCar.model}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Price</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedCar.price_per_day}/day</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Seats</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedCar.seats} seats</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Fuel Type</p>
                          <p className="text-sm font-semibold text-gray-900">{selectedCar.fuel_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Calendar */}
              {selectedCar && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Select Rental Dates</h3>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center">
                      <div className="min-h-4 min-w-4 bg-blue-500 rounded mr-2"></div>
                      <span className="text-gray-600">Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="min-h-4 min-w-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="min-h-4 min-w-4 bg-gray-200 rounded mr-2"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              ${isSelected ? 'bg-blue-500 text-white shadow-lg' : ''}
                              ${isBooked ? 'bg-red-500 text-white cursor-not-allowed' : ''}
                              ${isPast && !isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                              ${!isSelected && !isBooked && !isPast && isCurrentMonthDate ? 'hover:bg-gray-100' : ''}
                              ${!isDisabled ? 'cursor-pointer' : ''}
                            `}
                          >
                            <span className="relative z-10">{date.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Summary */}
                  {data.start_date && data.end_date && data.total_price && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">Rental Summary</h4>
                          <p className="text-blue-700 mt-1">
                            {differenceInDays(new Date(data.end_date), new Date(data.start_date))} days
                            × {pricePerDay} per day
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-700">Total Amount</p>
                          <p className="text-3xl font-bold text-blue-900">{data.total_price}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location and Status Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Location with Suggestions */}
                <div className="relative" ref={pickupRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={data.pickup_location}
                      onChange={(e) => setData('pickup_location', e.target.value)}
                      onFocus={() => setShowPickupSuggestions(true)}
                      placeholder="Search pickup location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {data.pickup_location && (
                      <button
                        type="button"
                        onClick={() => setData('pickup_location', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5" />
                      </button>
                    )}
                  </div>
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {pickupSuggestions.map((location, index) => (
                        <div
                          key={index}
                          onClick={() => handleLocationSelect(location, 'pickup_location')}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.pickup_location && <p className="mt-1 text-sm text-red-600">{errors.pickup_location}</p>}
                </div>

                {/* Dropoff Location with Suggestions */}
                <div className="relative" ref={dropoffRef}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Drop-off Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={data.dropoff_location}
                      onChange={(e) => setData('dropoff_location', e.target.value)}
                      onFocus={() => setShowDropoffSuggestions(true)}
                      placeholder="Search drop-off location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {data.dropoff_location && (
                      <button
                        type="button"
                        onClick={() => setData('dropoff_location', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5" />
                      </button>
                    )}
                  </div>
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {dropoffSuggestions.map((location, index) => (
                        <div
                          key={index}
                          onClick={() => handleLocationSelect(location, 'dropoff_location')}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.dropoff_location && <p className="mt-1 text-sm text-red-600">{errors.dropoff_location}</p>}
                </div>
              </div>

              {/* Status and Special Requests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className='col-span-2'>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={data.special_requests}
                    onChange={(e) => setData('special_requests', e.target.value)}
                    placeholder="Any special requests or notes?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                  {errors.special_requests && <p className="mt-1 text-sm text-red-600">{errors.special_requests}</p>}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between pt-8 border-t border-gray-200">
                <Link
                  href={route('car-bookings.index')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-peachDark to-peachDark hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={processing || !data.start_date || !data.end_date || !data.car_id || !data.pickup_location}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {booking ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg className="h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {booking ? 'Update Booking' : 'Create Booking'}
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

export default CreateCarBooking;
