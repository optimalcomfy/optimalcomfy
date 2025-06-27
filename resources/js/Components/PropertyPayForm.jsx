import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye, Check, Mail, Shield, Phone } from 'lucide-react';
import { Link, Head, router, usePage } from "@inertiajs/react";

const PropertyBookingForm = () => {
  const { flash, pagination, property } = usePage().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);
  
  const checkInDate = params.get('check_in_date');
  const checkOutDate = params.get('check_out_date');
  const today = new Date().toISOString().split('T')[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState({
    property_id: property.id,
    check_in_date: checkInDate || '',
    check_out_date: checkOutDate || '',
    total_price: 0,
    nights: 0,
    status: 'Booked',

    // User fields
    name: '',
    email: '',
    password: '',
    phone: '',
    nationality: '',
    current_location: '',
    passport_number: '',
    address: '',
    city: '',
    country: '',
    emergency_contact: '',
    contact_phone: '',
    message: '',
    is_registered: false,
    user_type: 'guest'
  });
  
  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const locationRef = useRef(null);

  // Helper function to update data
  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }));
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

    if (name === 'check_out_date' && data.check_in_date && new Date(value) <= new Date(data.check_in_date)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (name === 'check_in_date' && data.check_out_date && new Date(value) >= new Date(data.check_out_date)) {
      alert('Check-in date must be before check-out date');
      return;
    }

    updateData(name, value);
  };

  const handleLocationSelect = (location) => {
    updateData('current_location', location);
    setShowLocationSuggestions(false);
  };

  // Location search effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.current_location.length < 3) {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        return;
      }
      
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/locations?query=${encodeURIComponent(data.current_location)}`);
        if (res.ok) {
          const suggestions = await res.json();
          setLocationSuggestions(suggestions);
          setShowLocationSuggestions(suggestions.length > 0);
        } else {
          setLocationSuggestions([]);
          setShowLocationSuggestions(false);
        }
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [data.current_location]);

  // Price calculation effect
  useEffect(() => {
    if (data.check_in_date && data.check_out_date && property?.platform_price) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = nights * property.platform_price;
      const serviceFee = Math.round(basePrice * 0.12);
      
      setData(prev => ({
        ...prev,
        nights: nights,
        total_price: basePrice + serviceFee
      }));
    } else {
      setData(prev => ({
        ...prev,
        nights: 0,
        total_price: 0
      }));
    }
  }, [data.check_in_date, data.check_out_date, property?.platform_price]);

  const handleReserveClick = () => {
    if (!data.check_in_date || !data.check_out_date) {
      alert('Please select check-in and check-out dates first');
      return;
    }
    setCurrentStep(2);
  };

  const handleContinueToStep3 = () => {
    // Validate required fields for step 2
    if (!data.email || !data.password) {
      alert('Please fill in email and password');
      return;
    }
    
    if (!data.is_registered && !data.name) {
      alert('Please fill in your name');
      return;
    }
    
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!data.check_in_date || !data.check_out_date || data.nights <= 0) {
      alert('Please select valid check-in and check-out dates');
      setProcessing(false);
      return;
    }

    try {
      let userId = null;
      
      // Register user
      const response = await axios.post(route('register'), {
        email: data.email,
        password: data.password,
        name: data.name,
        user_type: data.user_type,
        phone: data.phone,
        nationality: data.nationality,
        current_location: data.current_location,
        passport_number: data.passport_number,
        address: data.address,
        city: data.city,
        country: data.country,
        emergency_contact: data.emergency_contact,
        contact_phone: data.contact_phone,
      });
      
      userId = response.data.user_id;

      // Login user
      await axios.post(route('login'), {
        email: data.email,
        password: data.password
      });

      if (userId) {
        updateData('user_id', userId);
      }

      // Create booking
      await router.post(route('bookings.store'), data, {
        onSuccess: () => {
          window.location.href = route('booking.confirmation');
        },
        onError: (errors) => {
          console.error('Booking creation failed:', errors);
          alert('Booking creation failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate pricing
  const nights = calculateDays(data.check_in_date, data.check_out_date);
  const subtotal = nights * (property?.platform_price || 0);
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  const StepIndicator = ({ step, currentStep, title, completed = false }) => (
    <div className="flex items-center gap-3 mb-6">
      <div style={{width: '80px'}} className={`
        rounded-full flex items-center justify-center font-semibold text-sm
        ${completed ? 'bg-green-500 text-white' : 
          step === currentStep ? 'bg-peachDark text-white' : 
          'bg-gray-200 text-gray-600'}
      `}>
        {completed ? <Check className="w-5 h-5" /> : step}
      </div>
      <span className={`font-medium ${step === currentStep ? 'text-gray-900' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );

  // Show loading or error if property is not available
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600">The property you're looking for is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto lg:p-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold">Request to book</h1>
        </div>

        <div className="flex flex-col lg:flex-row justify-center lg:grid-cols-2 gap-8">
          
          {/* Left Column - Booking Form */}
          <div className="space-y-6">
            
            {/* Step 1: Date Selection & Reserve */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6">
              <StepIndicator 
                step={1} 
                currentStep={currentStep} 
                title="Select dates"
                completed={currentStep > 1}
              />
              
              {currentStep >= 1 && (
                <div className="space-y-4">
                  {/* Date Selection */}
                  <div className="flex flex-col lg:flex-row border border-gray-300 rounded-xl overflow-hidden">
                    <div className="border-b lg:border-r flex-1 border-gray-300 p-4">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Check-in
                      </label>
                      <input
                        type="date"
                        name="check_in_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none"
                        value={data.check_in_date}
                        onChange={handleDateChange}
                        min={today}
                      />
                    </div>
                    
                    <div className="p-4 flex-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Check-out
                      </label>
                      <input
                        type="date"
                        name="check_out_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none"
                        value={data.check_out_date}
                        onChange={handleDateChange}
                        min={data.check_in_date || today}
                      />
                    </div>
                  </div>

                  {currentStep === 1 && (
                    <button
                      onClick={handleReserveClick}
                      className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: User Information */}
            {currentStep >= 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6">
                <StepIndicator 
                  step={2} 
                  currentStep={currentStep} 
                  title="Your information"
                  completed={currentStep > 2}
                />
                
                <div className="space-y-6">
                  {/* User Type Selection */}
                  <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        checked={!data.is_registered}
                        onChange={() => updateData('is_registered', false)}
                        className=" text-peachDark"
                      />
                      <span className="ml-3 font-medium">New User</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        checked={data.is_registered}
                        onChange={() => updateData('is_registered', true)}
                        className=" text-peachDark"
                      />
                      <span className="ml-3 font-medium">Existing User</span>
                    </label>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    {!data.is_registered && (
                      <div className="relative">
                        <User className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={data.name}
                          onChange={(e) => updateData('name', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                          required={!data.is_registered}
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={data.email}
                        onChange={(e) => updateData('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Shield className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) => updateData('password', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        required={!data.is_registered}
                      />
                    </div>

                    {!data.is_registered && (
                    <div className="relative">
                      <Phone className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={data.phone}
                        onChange={(e) => updateData('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                      />
                    </div>)}
                  </div>

                  {/* Additional Details for New Users */}
                  {!data.is_registered && (
                    <div className="space-y-4 pt-4 p-2 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900">Additional Details</h4>
                      
                      <div className="grid lg:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nationality"
                          value={data.nationality}
                          onChange={(e) => updateData('nationality', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                        <input
                          type="text"
                          placeholder="ID/Passport Number"
                          value={data.passport_number}
                          onChange={(e) => updateData('passport_number', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                      </div>

                      {/* Current Location with Search */}
                      <div className="relative" ref={locationRef}>
                        <div className="relative">
                          <MapPin className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Current location"
                            value={data.current_location}
                            onChange={(e) => updateData('current_location', e.target.value)}
                            onFocus={() => data.current_location.length >= 3 && setShowLocationSuggestions(true)}
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                          />
                          {isLoadingSuggestions && (
                            <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                          )}
                          {data.current_location && (
                            <X 
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer w-5 h-5 hover:text-gray-600"
                              onClick={() => {
                                updateData('current_location', '');
                                setShowLocationSuggestions(false);
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Location Suggestions */}
                        {showLocationSuggestions && (
                          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-48 overflow-y-auto">
                            {isLoadingSuggestions ? (
                              <div className="p-4 text-center text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                Searching locations...
                              </div>
                            ) : locationSuggestions.length > 0 ? (
                              locationSuggestions.map((location, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleLocationSelect(location)}
                                  className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                                >
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{location}</span>
                                </div>
                              ))
                            ) : data.current_location.length >= 3 ? (
                              <div className="p-4 text-center text-gray-500">
                                No locations found for "{data.current_location}"
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      <div className="grid lg:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="Address"
                          value={data.address}
                          onChange={(e) => updateData('address', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={data.city}
                          onChange={(e) => updateData('city', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={data.country}
                          onChange={(e) => updateData('country', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                      </div>

                      <div className="grid lg:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Emergency contact name"
                          value={data.emergency_contact}
                          onChange={(e) => updateData('emergency_contact', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                        <input
                          type="text"
                          placeholder="Emergency contact phone"
                          value={data.contact_phone}
                          onChange={(e) => updateData('contact_phone', e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark"
                        />
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <textarea
                      placeholder="Any special requests or message for the host?"
                      value={data.message}
                      onChange={(e) => updateData('message', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-peachDark focus:border-peachDark resize-none"
                    />
                  </div>

                  {currentStep === 2 && (
                    <button
                      onClick={handleContinueToStep3}
                      className="w-full py-4 bg-gradient-to-r bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review and Confirm */}
            {currentStep >= 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6">
                <StepIndicator 
                  step={3} 
                  currentStep={currentStep} 
                  title="Confirm and pay"
                />
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 text-blue-800">
                      <Shield className="w-5 h-5" />
                      <div className="text-sm">
                        <p className="font-medium">Your payment is protected</p>
                        <p>You won't be charged until your booking is confirmed</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 bg-gradient-to-r bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing booking...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Confirm and book
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Property Summary */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 space-y-6">
              
              {/* Property Preview */}
              <div className="flex gap-4">
                <img
                  src={property.initial_gallery && property.initial_gallery.length > 0 
                    ? `/storage/${property.initial_gallery[0].image}` 
                    : `/images/property-placeholder.jpg`}
                  alt={property.property_name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{property.type}</p>
                  <h3 className="font-semibold text-lg mb-2">{property.property_name}</h3>
                </div>
              </div>

              {/* Booking Details */}
              {data.check_in_date && data.check_out_date && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold">Your trip</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-sm text-gray-600">
                          {new Date(data.check_in_date).toLocaleDateString()} - {new Date(data.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                      {currentStep >= 1 && (
                        <button 
                          onClick={() => setCurrentStep(1)}
                          className="text-sm text-peachDark hover:underline font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {nights > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-center font-medium text-blue-800">
                          {nights} night{nights !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold">Price details</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">KES {(property.platform_price || 0).toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                      <span className="text-sm">KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Service fee</span>
                      <span className="text-sm">KES {serviceFee.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">KES {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Rare Find Badge */}
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <div className="flex items-center gap-3 text-pink-600">
                  <div className="text-2xl">💎</div>
                  <div className="text-sm">
                    <p className="font-medium">This is a rare find</p>
                    <p className="text-peachDark">This property is usually booked</p>
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

export default PropertyBookingForm;