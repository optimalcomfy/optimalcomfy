// resources/js/Pages/Property/PropertyBookingForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

const PropertyBookingForm = ({ property }) => {
  const { data, setData, post, processing, errors } = useForm({
    property_id: property.id,
    check_in_date: '',
    check_out_date: '',
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
    contact_phone:'',
    is_registered: true,
    user_type: 'guest'
  });

  const [showGuestForm, setShowGuestForm] = useState(false);

  const calculateDays = (check_in_date, check_out_date) => {
    if (check_in_date && check_out_date) {
      const check_in_dateDate = new Date(check_in_date);
      const check_out_dateDate = new Date(check_out_date);
      const timeDifference = check_out_dateDate - check_in_dateDate;
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

    setData(name, value);
  };

  const handleReserveClick = () => {
    if (!data.check_in_date || !data.check_out_date) {
      alert('Please select check-in and check-out dates first');
      return;
    }
    setShowGuestForm(true);
    // Scroll to guest form
    setTimeout(() => {
      const guestSection = document.querySelector('.guest-info-section');
      if (guestSection) {
        guestSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      const basePrice = nights * (property.price_per_night || 0);
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
  }, [data.check_in_date, data.check_out_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.check_in_date || !data.check_out_date || data.nights <= 0) {
      alert('Please select valid check-in and check-out dates');
      return;
    }

    try {
      let userId = null;
      
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

      await axios.post(route('login'), {
        email: data.email,
        password: data.password
      });

      if (userId) {
        setData('user_id', userId);
      }

      post(route('bookings.store'), {
        onSuccess: () => {
          window.location.href = route('booking.confirmation');
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || 'User creation failed.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const serviceFee = data.nights > 0 ? Math.round((property.price_per_night || 0) * data.nights * 0.12) : 0;
  const subtotal = data.nights > 0 ? (property.price_per_night || 0) * data.nights : 0;

  return (
    <div className="sticky-content--container">
      <div className="sticky-content">
        <div className="sticky-card bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Price and Rating Section */}
          <div className="price-detail mb-6">
            <h2 className="price text-2xl font-bold text-gray-900 dark:text-white mb-2">
              KES {property.price_per_night || 0}<span className="text-base font-normal text-gray-600 dark:text-gray-400">night</span>
            </h2>
            <span className="rating flex items-center gap-1 text-sm">
              <div className="rating-img__container">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">4.88</span>
              <span className="dot text-gray-400">•</span>
              <a href="#" className="reviews text-gray-600 dark:text-gray-400 hover:underline">
                249 reviews
              </a>
            </span>
          </div>

          {/* Date Selection */}
          <div className="date-selection mb-4">
            <div className="grid grid-cols-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Check-in Date */}
              <div className="border-r border-gray-300 dark:border-gray-600 p-3">
                <div className="flex flex-col">
                  <label htmlFor="check_in_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    id="check_in_date"
                    name="check_in_date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    value={data.check_in_date}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    placeholder="Add date"
                    required
                  />
                </div>
              </div>
              
              {/* Check-out Date */}
              <div className="p-3">
                <div className="flex flex-col">
                  <label htmlFor="check_out_date" className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Checkout
                  </label>
                  <input
                    type="date"
                    id="check_out_date"
                    name="check_out_date"
                    className="w-full border-none bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0"
                    value={data.check_out_date}
                    onChange={handleDateChange}
                    min={data.check_in_date || new Date().toISOString().split('T')[0]}
                    placeholder="Add date"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Display validation errors */}
            {errors.check_in_date && <div className="text-red-500 text-sm mt-1">{errors.check_in_date}</div>}
            {errors.check_out_date && <div className="text-red-500 text-sm mt-1">{errors.check_out_date}</div>}
          </div>

          {/* Reserve Button */}
          <button
            type="button"
            className="btn btn--pink w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 mb-4"
            onClick={handleReserveClick}
          >
            Reserve
          </button>

          <span className="sticky-card--ext-text block text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            You won't be charged yet
          </span>

          {/* Price Breakdown */}
          {data.nights > 0 && (
            <>
              <div className="sticky-card__detail flex justify-between items-center mb-3">
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  KES {property.price_per_night || 0} x {data.nights} night{data.nights !== 1 ? 's' : ''}
                </a>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  KES {subtotal}
                </p>
              </div>
              <div className="sticky-card__detail flex justify-between items-center mb-4">
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  Service fee
                </a>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  KES {serviceFee}
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

        {/* Guest Information Section */}
        {showGuestForm && (
          <div className="guest-info-section bg-white dark:bg-[#2D2D2D] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Guest Information</h3>
            
            <form onSubmit={handleSubmit}>
              {/* Registration Toggle */}
              <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-[#1B1B1B] p-3 rounded-md">
                <span className="font-medium text-gray-900 dark:text-white">I am a:</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="userStatus"
                      value="registered"
                      checked={data.is_registered}
                      onChange={() => setData({ ...data, is_registered: true })}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Registered</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="userStatus"
                      value="new"
                      checked={!data.is_registered}
                      onChange={() => setData({ ...data, is_registered: false })}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">New</span>
                  </label>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid gap-4">
                {!data.is_registered && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={data.name} 
                      onChange={(e) => setData('name', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={!data.is_registered} 
                    />
                  </>
                )}

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={data.email} 
                  onChange={(e) => setData('email', e.target.value)} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required 
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={data.password} 
                  onChange={(e) => setData('password', e.target.value)} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!data.is_registered} 
                />
                
                {!data.is_registered && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      value={data.phone} 
                      onChange={(e) => setData('phone', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nationality
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nationality" 
                      value={data.nationality} 
                      onChange={(e) => setData('nationality', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID/Passport number
                    </label>
                    <input 
                      type="text" 
                      placeholder="Passport Number" 
                      value={data.passport_number} 
                      onChange={(e) => setData('passport_number', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <input 
                      type="text" 
                      placeholder="Address" 
                      value={data.address} 
                      onChange={(e) => setData('address', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={data.city} 
                      onChange={(e) => setData('city', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <input 
                      type="text" 
                      placeholder="Country" 
                      value={data.country} 
                      onChange={(e) => setData('country', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Emergency contact name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Emergency Contact" 
                      value={data.emergency_contact} 
                      onChange={(e) => setData('emergency_contact', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Emergency contact phone
                    </label>
                    <input 
                      type="text" 
                      placeholder="Emergency Contact Phone" 
                      value={data.contact_phone} 
                      onChange={(e) => setData('contact_phone', e.target.value)} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1B1B1B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-md transition-all duration-200 mt-6"
                disabled={processing}
              >
                {processing ? 'Booking...' : 'Book Your Property'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyBookingForm;