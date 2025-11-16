import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, X, Loader2, MapPin, Calendar, User, CreditCard, Eye, Check, Mail, Shield, Phone } from 'lucide-react';
import { Link, Head, router, usePage } from "@inertiajs/react";
import Swal from 'sweetalert2';

const CarExtendPayForm = () => {
  const { flash, pagination, car, auth, company, extension_data } = usePage().props;

  const today = new Date().toISOString().split('T')[0];

  // Get the original booking's end_date and set it as the minimum for extension
  const originalBooking = car.bookings.find(b => b.id === extension_data?.booking_id);
  const originalEndDate = originalBooking?.end_date ?
    new Date(originalBooking.end_date).toISOString().split('T')[0] : today;

  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const [referralData, setReferralData] = useState({
    isValid: false,
    isLoading: false,
    error: '',
    discountAmount: 0,
    referredByUserName: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const [data, setData] = useState({
    car_id: car.id,
    booking_id: extension_data?.booking_id || null,
    start_date: originalEndDate || '', // Set to original end_date
    end_date: extension_data?.end_date || '',
    total_price: 0,
    days: 0,
    status: 'Booked',
    pickup_location: originalBooking?.pickup_location || '',
    dropoff_location: originalBooking?.dropoff_location || '',
    is_extension: extension_data?.is_extension || false,

    // User fields
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    password: '',
    phone: auth.user?.phone || '',
    nationality: auth.user?.nationality || '',
    current_location: auth.user?.current_location || '',
    passport_number: auth.user?.passport_number || '',
    address: auth.user?.address || '',
    city: auth.user?.city || '',
    country: auth.user?.country || '',
    referral_code: '',
    emergency_contact: '',
    contact_phone: '',
    message: '',
    is_registered: !!auth.user,
    user_type: auth.user ? 'registered' : 'guest'
  });

  // Calculate days
  const calculateDays = (start_date, end_date) => {
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const timeDifference = endDate - startDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    }
    return 0;
  };

  const days = calculateDays(data.start_date, data.end_date);
  const pricePerDay = car.platform_price;
  const subtotal = days * pricePerDay;
  const totalPrice = subtotal;
  const finalPrice = totalPrice - referralData.discountAmount;

  // Function to check if a date range is booked
  const isRangeBooked = (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return car.bookings.some(booking => {
      if (booking.id === extension_data?.booking_id) return false; // Skip the current booking we're extending

      const bookingStart = new Date(booking.start_date);
      bookingStart.setHours(0, 0, 0, 0);

      const bookingEnd = new Date(booking.end_date);
      bookingEnd.setHours(0, 0, 0, 0);

      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  // Function to get the next available date (no gaps allowed)
  const getNextAvailableDate = () => {
    return originalEndDate;
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Booking Conflict',
      text: message,
      confirmButtonColor: '#f97316',
    });
  };

  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
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

    // For extension, start_date is fixed to the original booking's end_date
    if (name === 'start_date') {
      if (value !== originalEndDate) {
        showErrorAlert(`Extension must start from your current return date: ${new Date(originalEndDate).toLocaleDateString()}`);
        return;
      }
      updateData('start_date', originalEndDate);
      return;
    }

    if (name === 'end_date') {
      // Check if date is before the minimum allowed date
      if (new Date(value) <= new Date(originalEndDate)) {
        showErrorAlert('Return date must be after your current return date');
        return;
      }

      // Check for one-day minimum extension (no gaps allowed)
      const minEndDate = new Date(originalEndDate);
      minEndDate.setDate(minEndDate.getDate() + 1);

      if (new Date(value) < minEndDate) {
        showErrorAlert('Extension must be for at least one additional day');
        return;
      }

      // Check if this date range is booked
      if (isRangeBooked(originalEndDate, value)) {
        showErrorAlert('The selected extension dates overlap with an existing booking for this car.');
        return;
      }

      updateData('end_date', value);
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
        if (!code || code.trim().length < 3) {
            setReferralData({
            isValid: false,
            isLoading: false,
            error: '',
            discountAmount: 0,
            commissionAmount: 0,
            referredByUserName: ''
            });
            return;
        }

        const trimmedCode = code.trim().toUpperCase();

        setReferralData(prev => ({ ...prev, isLoading: true, error: '' }));

        try {

            const response = await fetch(`/validate-referral?code=${encodeURIComponent(trimmedCode)}`);

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Check if the response has the expected structure
            if (result.valid === true && result.user && result.user.name) {
            // Get percentages from company
            const customerDiscountPercentage = company?.booking_referral_percentage || 0;
            const referrerCommissionPercentage = company?.referral_percentage || 0;

            // Calculate amounts
            const discountAmount = (totalPrice * customerDiscountPercentage) / 100;
            const commissionAmount = (totalPrice * referrerCommissionPercentage) / 100;

            setReferralData({
                isValid: true,
                isLoading: false,
                error: '',
                discountAmount: discountAmount,
                commissionAmount: commissionAmount,
                referredByUserName: result.user.name,
                customerDiscountPercentage: customerDiscountPercentage,
                referrerCommissionPercentage: referrerCommissionPercentage
            });

            } else {
            setReferralData({
                isValid: false,
                isLoading: false,
                error: result.message || 'Invalid referral code',
                discountAmount: 0,
                commissionAmount: 0,
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
            commissionAmount: 0,
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

  // Price calculation effect
  useEffect(() => {
    if (data.end_date) {
      const days = calculateDays(originalEndDate, data.end_date);
      const basePrice = days * car.platform_price;

      updateData('days', days);
      updateData('total_price', basePrice);
    } else {
      updateData('days', 0);
      updateData('total_price', 0);
    }
  }, [data.end_date, originalEndDate]);

  // Set initial start_date to original end_date
  useEffect(() => {
    if (originalEndDate && !data.start_date) {
      updateData('start_date', originalEndDate);
    }
  }, [originalEndDate]);

  const handleReserveClick = () => {
    if (!data.end_date) {
      showErrorAlert('Please select a return date for your extension');
      return;
    }
    setCurrentStep(2);
  };

  useEffect(() => {
    if (auth.user) {
      setCurrentStep(3);
    }
  }, [auth]);

  // Handle M-Pesa submission for extension
  const handleMpesaSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!data.end_date || days <= 0) {
      showErrorAlert('Please select a valid return date for your extension');
      setProcessing(false);
      return;
    }

    try {
      const bookingData = {
        ...data,
        referral_discount: referralData.discountAmount,
        final_price: finalPrice,
        payment_method: 'mpesa',
        is_extension: true,
        original_booking_id: extension_data?.booking_id
      };

      router.post(route('car-bookings.store'), bookingData, {
        onSuccess: () => {
          showSuccessAlert('Your car rental extension request has been submitted successfully.');
        },
        onError: (errors) => {
          console.error('Extension booking failed:', errors);
          showErrorAlert('Extension booking failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      showErrorAlert(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Pesapal payment submission for extension
  const handlePesapalSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!data.end_date || days <= 0) {
      showErrorAlert('Please select a valid return date for your extension');
      setProcessing(false);
      return;
    }

    try {
      const bookingData = {
        ...data,
        referral_discount: referralData.discountAmount,
        final_price: finalPrice,
        payment_method: 'pesapal',
        is_extension: true,
        original_booking_id: extension_data?.booking_id
      };

      router.post(route('car-bookings.store'), bookingData, {
        onSuccess: (result) => {
          if (result.props.redirect_url) {
            window.open(result.props.redirect_url, 'pesapal_payment', 'width=800,height=600,scrollbars=yes');
            Swal.fire({
              icon: 'success',
              title: 'Redirecting to Pesapal',
              text: 'Please complete your payment for the extension.',
              confirmButtonColor: '#f97316',
            });
          }
        },
        onError: (errors) => {
          console.error('Extension creation failed:', errors);
          showErrorAlert('Extension creation failed. Please try again.');
        }
      });
    } catch (error) {
      console.error('Pesapal submission error:', error);
      showErrorAlert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const StepIndicator = ({ step, currentStep, title, completed = false }) => (
    <div className="flex items-center gap-3 mb-6">
      <div style={{width: '20px', height: '20px'}} className={`
        rounded-full flex items-center justify-center font-semibold text-sm
        ${completed ? 'bg-green-500 text-white p-1' :
          step === currentStep ? 'bg-peachDark text-white p-1' :
          'bg-gray-200 text-gray-600'}
      `}>
        {completed ? <Check className="" /> : step}
      </div>
      <span className={`font-medium ${step === currentStep ? 'text-gray-900' : 'text-gray-600'}`}>
        {title}
      </span>
    </div>
  );

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Car not found</h2>
          <p className="text-gray-600">The car you're looking for is not available.</p>
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
            className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Extend Your Car Rental</h1>
            <p className="text-gray-600">Add more days to your current rental</p>
          </div>
        </div>

        {/* Extension notice */}
        {data.is_extension && (
          <div className="mb-6 p-4 max-w-5xl mx-auto bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Rental Extension</p>
                <p className="text-sm text-blue-600">
                  You are extending your current rental. The extension must start from your current return date: <strong>{new Date(originalEndDate).toLocaleDateString()}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

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
                    {/* Start Date - Fixed and Readonly */}
                    <div className="border-b lg:border-r flex-1 border-gray-300 p-4 bg-gray-50">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        Start Date (Fixed)
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none pointer-events-none"
                        value={originalEndDate}
                        readOnly
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Your extension starts here</p>
                    </div>

                    {/* End Date - User Selectable */}
                    <div
                      className="p-4 flex-1 cursor-pointer bg-white"
                      onClick={() => handleDivClick('end_date')}
                    >
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                        New Return Date
                      </label>
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        className="w-full bg-transparent text-sm font-medium text-gray-900 border-none focus:outline-none pointer-events-none"
                        value={data.end_date}
                        onChange={handleDateChange}
                        min={getNextAvailableDate()}
                      />
                      <p className="text-xs text-gray-500 mt-1">Select your new return date</p>
                    </div>
                  </div>

                  {currentStep === 1 && (
                    <button
                      onClick={handleReserveClick}
                      disabled={!data.end_date}
                      className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        car_id: car.id,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        is_extension: true,
                        booking_id: extension_data?.booking_id
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
                        car_id: car.id,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        is_extension: true,
                        booking_id: extension_data?.booking_id
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
                    <form onSubmit={handleMpesaSubmit}>
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
                            Processing extension...
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
                    <form onSubmit={handlePesapalSubmit}>
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

          {/* Right Column - Car Summary */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-6 space-y-6">

              {/* Car Preview */}
              <div className="flex gap-4">
                <img
                  src={car.initial_gallery && car.initial_gallery.length > 0
                    ? `/storage/${car?.initial_gallery[0]?.image}`
                    : `/images/car-placeholder.jpg`}
                  alt={car.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{car.make} {car.model}</p>
                  <h3 className="font-semibold text-lg mb-2">{car.name}</h3>
                  <p className="text-sm text-gray-600">{car.year} • {car.transmission}</p>
                </div>
              </div>

              {/* Booking Details */}
              {data.end_date && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold">Your extension</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Extended Dates</p>
                        <p className="text-sm text-gray-600">
                          {new Date(originalEndDate).toLocaleDateString()} - {new Date(data.end_date).toLocaleDateString()}
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

                    {days > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-center font-medium text-blue-800">
                          {days} additional day{days !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {days > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold">Price details</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">
                        KES {pricePerDay.toLocaleString()} × {days} day{days !== 1 ? 's' : ''}
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

              {/* Features */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 text-green-600">
                  <div className="text-2xl">⭐</div>
                  <div className="text-sm">
                    <p className="font-medium">Popular Car</p>
                    <p className="text-peachDark">This car is frequently booked</p>
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

export default CarExtendPayForm;
