import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye, Shield } from 'lucide-react';
import { Link, Head, router, usePage, useForm } from "@inertiajs/react";
import Swal from 'sweetalert2';

import './CarBookingForm.css'

const CarBookingForm = () => {
  const { flash, car, auth, company } = usePage().props;
  const url = usePage().url;
  const params = new URLSearchParams(url.split('?')[1]);

  const checkInDate = params.get('check_in_date');
  const checkOutDate = params.get('check_out_date');

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // Default to M-Pesa

  const { data, setData, post, errors } = useForm({
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
    is_registered: false,
    referral_code: '',
    total_price: 0,
    payment_method: 'mpesa'
  });

  // Location suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState(['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen', 'Kilimani']);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

  const pickupRef = useRef(null);

  const [referralData, setReferralData] = useState({
    isValid: false,
    isLoading: false,
    error: '',
    discountAmount: 0,
    referredByUserName: ''
  });

  const calculateDays = () => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
  };

  const days = calculateDays();
  const totalPrice = days * car.platform_price;
  const finalPrice = totalPrice - referralData.discountAmount;

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#f97316',
    });
  };

  const handleLocationSelect = (location, field) => {
    setData(field, location);
    if (field === 'pickup_location') {
      setShowPickupSuggestions(false);
    }
  };

  const handleDivClick = (inputId) => {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.focus();
      inputElement.showPicker();
    }
  };

  // Validate referral code
  const validateReferralCode = async (code) => {
    if (!code || code.length < 3) {
      setReferralData({
        isValid: false,
        isLoading: false,
        error: '',
        discountAmount: 0,
        referredByUserName: ''
      });
      return;
    }

    setReferralData(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch(`/validate-referral?code=${encodeURIComponent(code)}`);

      if (!response.ok) throw new Error('Failed to validate referral code');

      const result = await response.json();

      if (result.valid) {
        const discountAmount = (totalPrice * company.booking_referral_percentage) / 100;

        setReferralData({
          isValid: true,
          isLoading: false,
          error: '',
          discountAmount: discountAmount,
          referredByUserName: result.user.name
        });
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
      setReferralData({
        isValid: false,
        isLoading: false,
        error: 'Error validating referral code',
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.pickup_location.length < 3) {
        setPickupSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/locations?query=${encodeURIComponent(data.pickup_location)}`);
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        const suggestions = await res.json();
        setPickupSuggestions(suggestions);
      } catch (err) {
        console.error("Error fetching dropoff locations:", err);
        setPickupSuggestions([]);
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

  useEffect(() => {
    if (auth.user) {
      setCurrentStep(2);
    }
  }, [auth]);

  // Handle M-Pesa submission
  const handleMpesaSubmit = async (e) => {
    e.preventDefault();

    if (!data.start_date || !data.end_date) {
      showErrorAlert('Please select valid pickup and return dates');
      return;
    }

    if (!data.car_id) {
      showErrorAlert('Please select a vehicle');
      return;
    }

    if (!data.pickup_location) {
      showErrorAlert('Please select pickup location');
      return;
    }

    if (!data.phone) {
      showErrorAlert('Please enter your phone number');
      return;
    }

    setProcessing(true);

    try {
      const bookingData = {
        ...data,
        referral_discount: referralData.discountAmount,
        total_price: finalPrice,
        user_id: auth.user?.id,
        payment_method: 'mpesa'
      };

      console.log('Submitting M-Pesa car booking:', bookingData);

      router.post(route('car-bookings.store'), bookingData, {
        onSuccess: () => {
          // Success handled by controller redirect
        },
        onError: (formErrors) => {
          console.error('Car booking failed:', formErrors);
          showErrorAlert(formErrors.message || 'Booking failed. Please check the form and try again.');
        }
      });

    } catch (error) {
      console.error("Handle submit error:", error);
      showErrorAlert(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Pesapal submission
  const handlePesapalSubmit = async (e) => {
    e.preventDefault();

    if (!data.start_date || !data.end_date) {
      showErrorAlert('Please select valid pickup and return dates');
      return;
    }

    if (!data.car_id) {
      showErrorAlert('Please select a vehicle');
      return;
    }

    if (!data.pickup_location) {
      showErrorAlert('Please select pickup location');
      return;
    }

    setProcessing(true);

    try {
      const bookingData = {
        ...data,
        referral_discount: referralData.discountAmount,
        total_price: finalPrice,
        user_id: auth.user?.id,
        payment_method: 'pesapal'
      };

      console.log('Submitting Pesapal car booking:', bookingData);

      router.post(route('car-bookings.store'), bookingData, {
        onSuccess: (response) => {
          // The controller will handle the Pesapal redirect
          console.log('Pesapal booking initiated successfully');
        },
        onError: (formErrors) => {
          console.error('Pesapal car booking failed:', formErrors);
          showErrorAlert(formErrors.message || 'Booking failed. Please check the form and try again.');
        }
      });

    } catch (error) {
      console.error("Pesapal submit error:", error);
      showErrorAlert(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    if (paymentMethod === 'mpesa') {
      handleMpesaSubmit(e);
    } else if (paymentMethod === 'pesapal') {
      handlePesapalSubmit(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const StepIndicator = ({ step, currentStep, title, completed = false }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`
        rounded-full flex items-center justify-center font-semibold text-sm
        ${completed ? 'bg-green-500 text-white p-1' :
          step === currentStep ? 'bg-peachDark text-white p-1' :
          'bg-gray-200 text-gray-600'}
      `} style={{width: "30px", height: "30px"}}>
        {completed ? '✓' : step}
      </div>
      <span className={`font-medium ${step === currentStep ? 'text-gray-900' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto lg:p-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold">Request to book a ride</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column - Booking Form */}
          <div className="flex-1 space-y-6">

            {/* Step 1: Login or Sign Up */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <StepIndicator
                step={1}
                currentStep={currentStep}
                title="Log in or sign up"
                completed={currentStep > 1}
              />

              {currentStep >= 1 && (
                <div className="space-y-4">
                  {currentStep === 1 && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="mb-4 flex flex-col gap-4">
                        {!auth.user && (
                          <div className="flex flex-col lg:flex-row gap-4 mb-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="userType"
                                checked={!data.is_registered}
                                onChange={() => setData('is_registered', false)}
                                className="mr-2 text-red-300"
                              />
                              New User
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="userType"
                                checked={data.is_registered}
                                onChange={() => setData('is_registered', true)}
                                className="mr-2 text-red-300"
                              />
                              Existing User
                            </label>
                          </div>
                        )}

                        {auth.user && (
                          <div className='flex flex-col'>
                            <div className='flex gap-4'><p className="font-medium">Name:</p> <p>{auth.user?.name}</p></div>
                            <div className='flex gap-4'><p className="font-medium">Email:</p> <p>{auth.user?.email}</p></div>
                          </div>
                        )}

                        {!auth.user && (
                          <div className="relative">
                            {data.is_registered === true ? (
                              <Link
                                href={route('cr-login', {
                                  car_id: car.id,
                                  check_in_date: checkInDate,
                                  check_out_date: checkOutDate
                                })}
                              >
                                <button className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200">
                                  Continue
                                </button>
                              </Link>
                            ) : (
                              <Link
                                href={route('cr-register', {
                                  car_id: car.id,
                                  check_in_date: checkInDate,
                                  check_out_date: checkOutDate
                                })}
                              >
                                <button className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200">
                                  Continue
                                </button>
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Trip Details */}
            {currentStep >= 2 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <StepIndicator
                  step={2}
                  currentStep={currentStep}
                  title="Add trip details"
                  completed={currentStep > 2}
                />

                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Date Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div onClick={() => handleDivClick('start_date')} className="cursor-pointer">
                        <label className="block text-sm font-medium mb-2">Pickup Date</label>
                        <div className="relative rounded-lg border border-gray-300 p-3">
                          <input
                            type="date"
                            id="start_date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="w-full bg-transparent focus:outline-none"
                          />
                        </div>
                        {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
                      </div>
                      <div onClick={() => handleDivClick('end_date')} className="cursor-pointer">
                        <label className="block text-sm font-medium mb-2">Return Date</label>
                        <div className="relative rounded-lg border border-gray-300 p-3">
                          <input
                            type="date"
                            id="end_date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="w-full bg-transparent focus:outline-none"
                          />
                        </div>
                        {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
                      </div>
                    </div>

                    {/* Pickup Location */}
                    <div className="relative" ref={pickupRef}>
                      <label className="block text-sm font-medium mb-2">Pickup Location</label>
                      <div className="relative rounded-lg">
                        <input
                          type="text"
                          placeholder="Search pickup location"
                          value={data.pickup_location}
                          onChange={(e) => setData('pickup_location', e.target.value)}
                          onFocus={() => setShowPickupSuggestions(true)}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
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
                          {pickupSuggestions.length > 0 && pickupSuggestions.map((location, index) => (
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
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                      />
                      {errors.message && <div className="text-red-500 text-sm mt-1">{errors.message}</div>}
                    </div>

                    <button
                      onClick={handleContinue}
                      className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review and Pay */}
            {currentStep >= 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <StepIndicator
                  step={3}
                  currentStep={currentStep}
                  title="Review and pay"
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
                        onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
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
                        ✅ Valid referral code from {referralData.referredByUserName}! You get {company.booking_referral_percentage}% discount (KES {referralData.discountAmount.toLocaleString()})
                      </p>
                    )}
                  </div>

                  {/* Security Badge */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 text-blue-800">
                      <Shield className="w-5 h-5" />
                      <div className="text-sm">
                        <p className="font-medium">Your payment is protected</p>
                        <p>Secure payment processing with encrypted transactions</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Number for M-Pesa */}
                  {paymentMethod === 'mpesa' && (
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative flex gap-1">
                        <div className="border rounded-tl-lg px-3 border-gray-300 rounded-bl-lg inset-y-0 left-0 flex items-center pointer-events-none text-gray-500 bg-gray-50">
                          +254
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="pl-2 w-full px-4 py-3 rounded-tr-lg border-gray-300 rounded-br-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                          placeholder="712345678"
                          pattern="[0-9]{9}"
                          maxLength="9"
                          required
                          inputMode="numeric"
                          value={data.phone.replace(/^254/, '')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setData('phone', '254' + value);
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter your 9-digit phone number after 254</p>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <form onSubmit={handleSubmit}>
                    {paymentMethod === 'mpesa' && (
                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay with M-Pesa
                          </>
                        )}
                      </button>
                    )}

                    {paymentMethod === 'pesapal' && (
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
                    )}
                  </form>

                  {paymentMethod === 'pesapal' && (
                    <p className="text-sm text-gray-600 text-center">
                      You will be redirected to Pesapal to complete your payment securely.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Car Details */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">

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
                  {currentStep >= 2 && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-sm text-orange-500 hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>{data.start_date} – {data.end_date}</p>
                  <p>{days} {days === 1 ? 'day' : 'days'}</p>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Price details</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>KES {car.platform_price.toLocaleString()} × {days} days</span>
                    <span>KES {totalPrice.toLocaleString()}</span>
                  </div>

                  {/* Referral Discount */}
                  {referralData.isValid && (
                    <div className="flex justify-between text-sm mb-2 text-green-600">
                      <span>Referral Discount ({company.booking_referral_percentage}%)</span>
                      <span>- KES {referralData.discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>KES {finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rare Find Badge */}
                <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 text-pink-600">
                    <div className="text-2xl">💎</div>
                    <div className="text-sm">
                      <p className="font-medium">This is a rare find</p>
                      <p className="text-pink-500">This car is usually booked</p>
                    </div>
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
