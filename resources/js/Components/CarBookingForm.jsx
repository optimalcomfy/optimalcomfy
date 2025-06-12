import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye } from 'lucide-react';
import { Link, Head, router, usePage, useForm } from "@inertiajs/react";


const CarBookingForm = () => {
  const { flash, car } = usePage().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);

  const checkInDate = params.get('check_in_date');
  const checkOutDate = params.get('check_out_date');

  const [currentStep, setCurrentStep] = useState(1);
  const { data, setData, post, processing, errors } = useForm({
    pickup_location: '',
    dropoff_location: '',
    start_date: checkInDate,
    car_id: car.id,
    end_date: checkOutDate, 
    name: '',
    email: '',
    phone: '',
    password: '',
    message: '',
    is_registered: false
  });

  // Location suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState(['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen', 'Kilimani']);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const calculateDays = () => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
  };

  const days = calculateDays();
  const totalPrice = days * car.price_per_day;

  const handleLocationSelect = (location, field) => {
    setData(field, location);
    if (field === 'pickup_location') {
      setShowPickupSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.pickup_location.length < 3) {
        setPickupSuggestions([]);
        return;
      }
      try {
 
        // Ensure this endpoint exists and returns an array of strings
        const res = await fetch(`/locations?query=${encodeURIComponent(data.pickup_location)}`);
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const suggestions = await res.json();
        setPickupSuggestions(suggestions);
      } catch (err) {
        console.error("Error fetching dropoff locations:", err);
        setPickupSuggestions([]);
      } finally {
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [data.pickup_location]);

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.start_date || !data.end_date) {
      alert('Please select valid pickup and return dates');
      return;
    }

    if (!data.car_id) {
      alert('Please select a vehicle');
      return;
    }

    if (!data.pickup_location) {
      alert('Please select pickup and dropoff locations');
      return;
    }

    try {
      let userId = null;
      const bookingData = { ...data }; 

      const registrationResponse = await axios.post(route('register'), {
        email: data.email,
        password: data.password,
        name: data.name,
        user_type: data.user_type, 
        phone: data.phone
      });
      
      userId = registrationResponse.data.user_id; 
      bookingData.user_id = userId; 

      post(route('car-bookings.store'), {
        data: bookingData,
        onSuccess: () => {
          // Handle success
        },
        onError: (formErrors) => {
            alert(formErrors.message || 'Booking failed. Please check the form and try again.');
        }
      });

    } catch (error) {
      console.error("Handle submit error:", error);
      alert(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
  };

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

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold text-left">Request to book a ride</h1>
            </div>

            {/* Step 1: Login or Sign Up */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <span className="font-medium">Log in or sign up</span>
                </div>
                {currentStep === 1 ? (
                  <div className="text-sm text-gray-600">Required</div>
                ) : (
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="mb-4">
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          checked={!data.is_registered}
                          onChange={() => setData('is_registered', false)}
                          className="mr-2"
                        />
                        New User
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          checked={data.is_registered}
                          onChange={() => setData('is_registered', true)}
                          className="mr-2"
                        />
                        Existing User
                      </label>
                    </div>

                    {!data.is_registered && (
                      <div className="grid gap-4">
                        <div className="relative border rounded-md">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                          />
                          {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4">
                       <div className="relative border rounded-md">
                        <input
                          type="email"
                          placeholder="Email"
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          className="w-full p-3 border rounded-md"
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                       </div>

                      <div className="relative border rounded-md">
                        <input
                          type="password"
                          placeholder="Password"
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          className="w-full p-3 border rounded-lg"
                        />
                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                      </div>

                      <div className="relative border rounded-md">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={data.phone}
                          onChange={(e) => setData('phone', e.target.value)}
                          className="w-full p-3 border rounded-lg"
                        />
                        {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                      </div>

                    </div>

                    <div className="relative">
                      <button
                        onClick={handleContinue}
                        className="w-full mx-auto py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Trip Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-full flex items-center justify-center font-semibold`}>
                    2
                  </div>
                  <span className="font-medium">Add trip details</span>
                </div>
                {currentStep === 2 ? (
                  <div className="text-sm text-gray-600">In progress</div>
                ) : currentStep > 2 ? (
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              {currentStep === 2 && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="grid gap-4">
                    {/* Date Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Pickup Date</label>
                        <div className="relative border rounded-md">
                          <input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg"
                          />
                          {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Return Date</label>
                        <div className="relative border rounded-md">
                          <input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg"
                          />
                          {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Pickup Location */}
                    <div className="relative" ref={pickupRef}>
                      <label className="block text-sm font-medium mb-2">Pickup Location</label>
                      <div className="relative border rounded-md">
                        <input
                          type="text"
                          placeholder="Search pickup location"
                          value={data.pickup_location}
                          onChange={(e) => setData('pickup_location', e.target.value)}
                          onFocus={() => setShowPickupSuggestions(true)}
                          className="w-full pl-10 p-3 border rounded-lg"
                        />
                        {data.pickup_location && (
                          <X 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer w-5 h-5"
                            onClick={() => setData('pickup_location', '')}
                          />
                        )}
                      </div>
                      {errors.pickup_location && <div className="text-red-500 text-sm mt-1">{errors.pickup_location}</div>}
                      {showPickupSuggestions && (
                        <div className="absolute z-50 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                          {pickupSuggestions.length > 0 && pickupSuggestions?.map((location, index) => (
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
                    </div>

                    {/* Additional Requests */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Requests</label>
                      <textarea
                        placeholder="Do you have any specific requests?"
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        rows={3}
                        className="w-full p-3 border rounded-lg"
                      />
                      {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
                    </div>

                    <button
                      onClick={handleContinue}
                      className="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Review Request */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${currentStep >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-full flex items-center justify-center font-semibold`}>
                    3
                  </div>
                  <span className="font-medium">Review your request</span>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Booking Summary</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Pickup:</strong> {data.pickup_location || 'Not selected'}</p>
                        <p><strong>Dropoff:</strong> {data.pickup_location || 'Not selected'}</p>
                        <p><strong>Dates:</strong> {data.start_date} to {data.end_date} ({days} days)</p>
                        <p><strong>Customer:</strong> {data.name} ({data.email})</p>
                        {data.message && <p><strong>Requests:</strong> {data.message}</p>}
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={processing}
                      className="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Car Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            
            {/* Car Image and Details */}
            <div className="mb-4">
              <img
                src={car.initial_gallery && car.initial_gallery.length > 0 
                            ? `/storage/${car.initial_gallery[0].image}` 
                            : `/cars/images/cars/placeholder.jpg`}
                 alt={`${car.brand} ${car.model}`}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2">{car.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{car.location_address}</p>
            </div>

            {/* Booking Details */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Trip details</span>
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-pink-500 hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>{data.start_date} – {data.end_date}</p>
                <p>{days} {days === 1 ? 'day' : 'days'}</p>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Price details</h4>
                <div className="flex justify-between text-sm mb-2">
                  <span>KSh {car.price_per_day.toLocaleString()} x {days} days</span>
                  <span>KSh {totalPrice.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total KSh</span>
                    <span>KSh {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <button className="text-sm text-pink-500 hover:underline mt-2">
                  Price breakdown
                </button>
              </div>

              {/* Rare Find Badge */}
              <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 text-pink-600">
                  <div className="w-6 h-6 text-pink-500">💎</div>
                  <div className="text-sm">
                    <p className="font-medium">This is a rare find.</p>
                    <p>This car is usually booked.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarBookingForm;