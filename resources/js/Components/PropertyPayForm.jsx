import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye, Check, Mail, Shield, Phone } from 'lucide-react';
import { Link, Head, router, usePage } from "@inertiajs/react";
import Swal from 'sweetalert2';

const PropertyBookingForm = () => {
  const { flash, pagination, property, auth, company } = usePage().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);

  const checkInDate = params.get('check_in_date');
  const checkOutDate = params.get('check_out_date');
  const variationId = params.get('variation_id');
  const today = new Date().toISOString().split('T')[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(
    variationId ? property.variations.find(v => v.id == variationId) : null
  );

  const [referralData, setReferralData] = useState({
    isValid: false,
    isLoading: false,
    error: '',
    discountAmount: 0,
    referredByUserName: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // Default to M-Pesa

  const [data, setData] = useState({
    property_id: property.id,
    check_in_date: checkInDate || '',
    check_out_date: checkOutDate || '',
    total_price: 0,
    nights: 0,
    status: 'Booked',
    variation_id: variationId || null,

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
    referral_code: '',
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

  // Calculate pricing - moved to the top to avoid reference errors
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
  const pricePerNight = selectedVariation ? selectedVariation.platform_price : property.platform_price;
  const subtotal = nights * pricePerNight;
  const totalPrice = subtotal;
  const finalPrice = totalPrice - referralData.discountAmount;

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

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Booking Conflict',
      text: message,
      confirmButtonColor: '#f97316',
    });
  };

  // Helper function to update data
  const updateData = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === 'check_out_date' && data.check_in_date && new Date(value) <= new Date(data.check_in_date)) {
      showErrorAlert('Check-out date must be after check-in date');
      return;
    }

    if (name === 'check_in_date' && data.check_out_date && new Date(value) >= new Date(data.check_out_date)) {
      showErrorAlert('Check-in date must be before check-out date');
      return;
    }

    // Check if this date is booked for the selected variation (or standard)
    if (name === 'check_in_date' && isRangeBooked(value, value, data.variation_id)) {
      const message = data.variation_id
        ? 'This date is already booked for the selected room type. Please choose different dates.'
        : 'This date is already booked for the standard room. Please choose different dates.';
      showErrorAlert(message);
      return;
    }

    // If changing check-in date and we have a check-out date, validate the range
    if (name === 'check_in_date' && data.check_out_date && isRangeBooked(value, data.check_out_date, data.variation_id)) {
      const message = data.variation_id
        ? 'The selected dates overlap with an existing booking for this room type.'
        : 'The selected dates overlap with an existing booking for the standard room.';
      showErrorAlert(message);
      updateData('check_out_date', '');
    }

    updateData(name, value);
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
    updateData('variation_id', newVariationId);

    // Recalculate price if dates are already selected
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = nights * (variation ? variation.platform_price : property.platform_price);

      updateData('total_price', basePrice);
    }
  };

  const handleDivClick = (inputId) => {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.focus();
      inputElement.showPicker();
    }
  };

  const handleLocationSelect = (location) => {
    updateData('current_location', location);
    setShowLocationSuggestions(false);
  };

  // Validate referral code - FIXED VERSION
  const validateReferralCode = async (code) => {
    if (!code || code.trim().length < 3) {
      setReferralData({
        isValid: false,
        isLoading: false,
        error: '',
        discountAmount: 0,
        referredByUserName: ''
      });
      return;
    }

    const trimmedCode = code.trim().toUpperCase();

    setReferralData(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      console.log('Validating referral code:', trimmedCode);
      console.log('Company data:', company);
      console.log('Total price:', totalPrice);

      const response = await fetch(`/validate-referral?code=${encodeURIComponent(trimmedCode)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log('Referral validation result:', result);

      // Check if the response has the expected structure
      if (result.valid === true && result.user && result.user.name) {
        // Check if company and booking_referral_percentage exist
        const referralPercentage = company?.booking_referral_percentage || 0;
        console.log('Referral percentage:', referralPercentage);

        const discountAmount = (totalPrice * referralPercentage) / 100;

        setReferralData({
          isValid: true,
          isLoading: false,
          error: '',
          discountAmount: discountAmount,
          referredByUserName: result.user.name
        });

        console.log('Discount applied:', discountAmount);
      } else {
        setReferralData({
          isValid: false,
          isLoading: false,
          error: result.message || 'Invalid referral code',
          discountAmount: 0,
          referredByUserName: ''
        });
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setReferralData({
        isValid: false,
        isLoading: false,
        error: 'Unable to validate referral code. Please try again.',
        discountAmount: 0,
        referredByUserName: ''
      });
    }
  };

  // Auto-validate referral code when it changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (data.referral_code) {
        validateReferralCode(data.referral_code);
      } else {
        setReferralData({
          isValid: false,
          isLoading: false,
          error: '',
          discountAmount: 0,
          referredByUserName: ''
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [data.referral_code, totalPrice]);

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
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const pricePerNight = selectedVariation ? selectedVariation.platform_price : property.platform_price;
      const basePrice = nights * pricePerNight;

      updateData('nights', nights);
      updateData('total_price', basePrice);
    } else {
      updateData('nights', 0);
      updateData('total_price', 0);
    }
  }, [data.check_in_date, data.check_out_date, selectedVariation]);

  const handleReserveClick = () => {
    if (!data.check_in_date || !data.check_out_date) {
      showErrorAlert('Please select check-in and check-out dates first');
      return;
    }
    setCurrentStep(2);
  };

  useEffect(()=>{
    if(auth.user) {
      setCurrentStep(3)
    }
  },[auth])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!data.check_in_date || !data.check_out_date || nights <= 0) {
      showErrorAlert('Please select valid check-in and check-out dates');
      setProcessing(false);
      return;
    }

    try {
      let userId = auth.user?.id;

      if (userId) {
        updateData('user_id', userId);
      }

      // Include referral discount and payment method in booking data
      const bookingData = {
        ...data,
        referral_discount: referralData.discountAmount,
        final_price: finalPrice,
        payment_method: paymentMethod
      };

      console.log('Submitting booking data:', bookingData);

      // Create booking
      router.post(route('bookings.store'), bookingData, {
        onSuccess: () => {
          // Handle success
        },
        onError: (errors) => {
          console.error('Booking creation failed:', errors);
          showErrorAlert('Booking creation failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      showErrorAlert(error.response?.data?.message || 'An error occurred. Please try again.');
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
                  {/* Variations Selection */}
                  {property.variations && property.variations.length > 0 && (
                    <div className="variations-selection mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Room Type
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <div
                          className={`p-3 border rounded-lg cursor-pointer ${!selectedVariation ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
                          onClick={() => handleVariationChange(null)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {property.type} (Standard)
                            </span>
                            <span>
                              KES {property.platform_price}
                            </span>
                          </div>
                        </div>

                        {property.variations.map((variation) => (
                          <div
                            key={variation.id}
                            className={`p-3 border rounded-lg cursor-pointer ${selectedVariation?.id === variation.id ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
                            onClick={() => handleVariationChange(variation)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {variation.type}
                            </span>
                            <span>
                              KES {variation.platform_price}
                            </span>
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date Selection */}
                  <div className="flex flex-col lg:flex-row border border-gray-300 rounded-xl overflow-hidden">
                    <div
                      className="border-b lg:border-r flex-1 border-gray-300 p-4 cursor-pointer"
                      onClick={() => handleDivClick('check_in_date')}
                    >
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Check-in
                      </label>
                      <input
                        type="date"
                        id="check_in_date"
                        name="check_in_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none pointer-events-none"
                        value={data.check_in_date}
                        onChange={handleDateChange}
                        min={today}
                      />
                    </div>

                    <div
                      className="p-4 flex-1 cursor-pointer"
                      onClick={() => handleDivClick('check_out_date')}
                    >
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Check-out
                      </label>
                      <input
                        type="date"
                        id="check_out_date"
                        name="check_out_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none pointer-events-none"
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
                  {!auth.user &&
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
                  </div>}

                  {auth.user &&
                    <div className='flex flex-col'>
                      <div className='flex gap-4'><p>Name:</p> <p>{auth.user?.name}</p></div>
                      <div className='flex gap-4'><p>Email:</p> <p>{auth.user?.email}</p></div>
                    </div>
                  }

                  {currentStep === 2 && (
                    <>
                    {data.is_registered === true ?
                    <Link
                      type="button"
                      href={route('c-login', {
                        property_id: property.id,
                        check_in_date: checkInDate,
                        check_out_date: checkOutDate,
                        variation_id: variationId || null
                      })}
                    >
                      <button className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200">
                        Continue
                      </button>
                    </Link>
                    :
                    <Link
                      type="button"
                      href={route('c-register', {
                        property_id: property.id,
                        check_in_date: checkInDate,
                        check_out_date: checkOutDate,
                        variation_id: variationId || null
                      })}
                    >
                      <button className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200">
                        Continue
                      </button>
                    </Link>
                    }
                    </>
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
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <div className="flex flex-col lg:flex-row gap-2">
                    {/* M-Pesa Option */}
                    <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        paymentMethod === 'mpesa'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setPaymentMethod('mpesa')}
                    >
                        <div className="flex items-center gap-3">
                        <img src="/image/mpesa.jpg" className="h-5" alt="M-Pesa" />
                        <span className="font-medium">M-Pesa</span>
                        </div>
                    </div>

                    {/* Pesapal Option */}
                    <div
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        paymentMethod === 'pesapal'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setPaymentMethod('pesapal')}
                    >
                        <div className="flex items-center gap-3">
                        <img src="/image/pesapal.png" className="h-5" alt="Pesapal" />
                        <span className="font-medium">Pesapal</span>
                        </div>
                    </div>
                    </div>
                  </div>

                  {/* Referral Code Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter referral code"
                        value={data.referral_code}
                        onChange={(e) => updateData('referral_code', e.target.value.toUpperCase())}
                        className="w-full p-3 rounded-lg border border-gray-300"
                      />
                      {referralData.isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
                      )}
                      {referralData.isValid && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          ✓
                        </div>
                      )}
                    </div>
                    {referralData.error && (
                      <p className="text-red-500 text-sm mt-1">{referralData.error}</p>
                    )}
                    {referralData.isValid && (
                      <p className="text-green-600 text-sm mt-1">
                        ✅ Valid referral code from {referralData.referredByUserName}! You get {company?.booking_referral_percentage || 0}% discount (KES {referralData.discountAmount.toLocaleString()})
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 text-blue-800">
                      <Shield className="w-5 h-5" />
                      <div className="text-sm">
                        <p className="font-medium">Your payment is protected</p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'mpesa' && (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative flex gap-1">
                          <div className="border rounded-tl-lg px-1 border-gray-300 rounded-bl-lg inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            +254
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="pl-14 w-full px-4 py-3 rounded-tr-lg border-gray-300 rounded-br-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                            placeholder="712345678"
                            pattern="[0-9]{9}"
                            maxLength="9"
                            required
                            inputMode="numeric"
                            value={data.phone.replace(/^254/, '')}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');

                              setData({
                                ...data,
                                phone: '254' + value
                              });
                              e.target.value = value;
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Enter your 9-digit phone number after 254</p>
                      </div>

                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing booking...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay with M-Pesa
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethod === 'pesapal' && (
                    <form onSubmit={handleSubmit}>
                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecting to Pesapal...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay with Pesapal
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        You will be redirected to Pesapal to complete your payment securely.
                      </p>
                    </form>
                  )}
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
                  {selectedVariation && (
                    <p className="text-sm text-gray-600">{selectedVariation.type}</p>
                  )}
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
                      <span className="text-sm">
                        KES {pricePerNight.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm">KES {subtotal.toLocaleString()}</span>
                    </div>

                    {/* Referral Discount */}
                    {referralData.isValid && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Referral Discount ({company?.booking_referral_percentage || 0}%)</span>
                        <span>- KES {referralData.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold text-lg">KES {finalPrice.toLocaleString()}</span>
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
