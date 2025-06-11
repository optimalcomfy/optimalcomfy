import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye } from 'lucide-react';
import { Link, Head, router, usePage } from "@inertiajs/react";
const today = new Date().toISOString().split('T')[0];

const PropertyBookingForm = () => {

  const { flash, pagination, property } = usePage().props;

  const url = usePage().url

  const params = new URLSearchParams(url.split('?')[1]);

  const checkInDate = params.get('check_in_date');
  const checkOutDate = params.get('check_out_date');

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    property_id: property.id,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    total_price: 0,
    nights: 0,
    status: 'Booked',
    
    // User fields
    name: '',
    email: '',
    phone: '',
    password: '',
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

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState(['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen', 'Kilimani']);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const locationRef = useRef(null);

  const calculateDays = (check_in_date, check_out_date) => {
    if (check_in_date && check_out_date) {
      const checkInDate = new Date(check_in_date);
      const checkOutDate = new Date(check_out_date);
      const timeDifference = checkOutDate - checkInDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    }
    return 0;
  };

  const nights = calculateDays(data.check_in_date, data.check_out_date);
  const subtotal = nights * property.price_per_night;
  const totalPrice = subtotal;

  const handleLocationSelect = (location) => {
    setData(prev => ({ ...prev, current_location: location }));
    setShowLocationSuggestions(false);
  };

  const handleDateChange = (field, value) => {
    if (field === 'check_out_date' && data.check_in_date && new Date(value) <= new Date(data.check_in_date)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (field === 'check_in_date' && data.check_out_date && new Date(value) >= new Date(data.check_out_date)) {
      alert('Check-in date must be before check-out date');
      return;
    }

    setData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const calculatedNights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = calculatedNights * property.price_per_night;
      const fee = Math.round(basePrice * 0.12);
      
      setData(prev => ({
        ...prev,
        nights: calculatedNights,
        total_price: basePrice + fee
      }));
    }
  }, [data.check_in_date, data.check_out_date]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.current_location && data.current_location.length < 3) {
        setLocationSuggestions([]);
        return;
      }
      try {
        // Mock API call - replace with actual endpoint
        const suggestions = ['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen', 'Kilimani'];
        setLocationSuggestions(suggestions.filter(s => 
          s.toLowerCase().includes((data.current_location || '').toLowerCase())
        ));
      } catch (err) {
        console.error("Error fetching location suggestions:", err);
        setLocationSuggestions([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [data.current_location]);

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!data.check_in_date || !data.check_out_date || nights <= 0) {
      alert('Please select valid check-in and check-out dates');
      setProcessing(false);
      return;
    }

    try {
      // Mock API calls - replace with actual endpoints
      let userId = null;
      
      // Register user
      const registrationData = {
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
      };

      console.log('Registering user:', registrationData);
      // Mock registration response
      userId = Math.floor(Math.random() * 1000) + 1;

      // Login user
      console.log('Logging in user:', { email: data.email, password: data.password });

      // Create booking
      const bookingData = {
        ...data,
        user_id: userId
      };

      console.log('Creating booking:', bookingData);
      
      // Mock success
      setTimeout(() => {
        alert('Booking created successfully!');
        setProcessing(false);
        // Redirect to confirmation page
        console.log('Redirecting to confirmation page...');
      }, 1500);

    } catch (error) {
      console.error("Booking error:", error);
      alert('Booking failed. Please try again.');
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

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-semibold text-left">Request to book a property</h1>
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
                          onChange={() => setData(prev => ({ ...prev, is_registered: false }))}
                          className="mr-2"
                        />
                        New User
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          checked={data.is_registered}
                          onChange={() => setData(prev => ({ ...prev, is_registered: true }))}
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
                            onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
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
                          onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-3 border rounded-md"
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                       </div>

                      <div className="relative border rounded-md">
                        <input
                          type="password"
                          placeholder="Password"
                          value={data.password}
                          onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        />
                        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                      </div>

                      <div className="relative border rounded-md">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={data.phone}
                          onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
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

            {/* Step 2: Booking Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${currentStep >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-full flex items-center justify-center font-semibold`}>
                    2
                  </div>
                  <span className="font-medium">Add booking details</span>
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
                        <label className="block text-sm font-medium mb-2">Check-in Date</label>
                        <div className="relative border rounded-md">
                          <input
                            type="date"
                            value={data.check_in_date}
                            onChange={(e) => handleDateChange('check_in_date', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg"
                            min={today}
                          />
                          {errors.check_in_date && <div className="text-red-500 text-sm mt-1">{errors.check_in_date}</div>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Check-out Date</label>
                        <div className="relative border rounded-md">
                          <input
                            type="date"
                            value={data.check_out_date}
                            onChange={(e) => handleDateChange('check_out_date', e.target.value)}
                            className="w-full pl-10 p-3 border rounded-lg"
                            min={data.check_in_date || today}
                          />
                          {errors.check_out_date && <div className="text-red-500 text-sm mt-1">{errors.check_out_date}</div>}
                        </div>
                      </div>
                    </div>

                    {!data.is_registered && (
                      <>
                        {/* Guest Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nationality</label>
                            <input
                              type="text"
                              placeholder="Nationality"
                              value={data.nationality}
                              onChange={(e) => setData(prev => ({ ...prev, nationality: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">ID/Passport Number</label>
                            <input
                              type="text"
                              placeholder="Passport Number"
                              value={data.passport_number}
                              onChange={(e) => setData(prev => ({ ...prev, passport_number: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Current Location */}
                        <div className="relative" ref={locationRef}>
                          <label className="block text-sm font-medium mb-2">Current Location</label>
                          <div className="relative border rounded-md">
                            <input
                              type="text"
                              placeholder="Search current location"
                              value={data.current_location}
                              onChange={(e) => setData(prev => ({ ...prev, current_location: e.target.value }))}
                              onFocus={() => setShowLocationSuggestions(true)}
                              className="w-full pl-10 p-3 border rounded-lg"
                            />
                            {data.current_location && (
                              <X 
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer w-5 h-5"
                                onClick={() => setData(prev => ({ ...prev, current_location: '' }))}
                              />
                            )}
                          </div>
                          {showLocationSuggestions && locationSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                              {locationSuggestions.map((location, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleLocationSelect(location)}
                                  className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                >
                                  {location}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Address Information */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Address</label>
                            <input
                              type="text"
                              placeholder="Address"
                              value={data.address}
                              onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <input
                              type="text"
                              placeholder="City"
                              value={data.city}
                              onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Country</label>
                            <input
                              type="text"
                              placeholder="Country"
                              value={data.country}
                              onChange={(e) => setData(prev => ({ ...prev, country: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
                            <input
                              type="text"
                              placeholder="Emergency Contact"
                              value={data.emergency_contact}
                              onChange={(e) => setData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Emergency Contact Phone</label>
                            <input
                              type="text"
                              placeholder="Emergency Contact Phone"
                              value={data.contact_phone}
                              onChange={(e) => setData(prev => ({ ...prev, contact_phone: e.target.value }))}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Additional Requests */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Requests</label>
                      <textarea
                        placeholder="Do you have any specific requests?"
                        value={data.message}
                        onChange={(e) => setData(prev => ({ ...prev, message: e.target.value }))}
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
                        <p><strong>Property:</strong> {property.property_name}</p>
                        <p><strong>Check-in:</strong> {data.check_in_date}</p>
                        <p><strong>Check-out:</strong> {data.check_out_date}</p>
                        <p><strong>Nights:</strong> {nights}</p>
                        <p><strong>Guest:</strong> {data.name} ({data.email})</p>
                        {data.current_location && <p><strong>Current Location:</strong> {data.current_location}</p>}
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

        {/* Right Column - Property Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            
            {/* Property Image and Details */}
            <div className="mb-4">
              <img
                src={property.initial_gallery && property.initial_gallery.length > 0 
                            ? `/storage/${property.initial_gallery[0].image}` 
                            : `/images/property-placeholder.jpg`}
                 alt={property.property_name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2">{property.property_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{property.type}</p>
              <p className="text-sm text-gray-600 mb-4">{property.location}</p>
              <div className="flex items-center gap-1 text-sm mb-4">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">4.88</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">249 reviews</span>
              </div>
            </div>

            {/* Booking Details */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Stay details</span>
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-pink-500 hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p>{data.check_in_date} – {data.check_out_date}</p>
                <p>{nights} {nights === 1 ? 'night' : 'nights'}</p>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Price details</h4>
                <div className="flex justify-between text-sm mb-2">
                  <span>KES {property.price_per_night.toLocaleString()} x {nights} nights</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>KES {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rare Find Badge */}
              <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 text-pink-600">
                  <div className="w-6 h-6 text-pink-500">💎</div>
                  <div className="text-sm">
                    <p className="font-medium">This is a rare find.</p>
                    <p>This property is usually booked.</p>
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