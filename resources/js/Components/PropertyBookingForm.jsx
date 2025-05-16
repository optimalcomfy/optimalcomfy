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

  useEffect(() => {
    if (data.check_in_date && data.check_out_date) {
      const nights = calculateDays(data.check_in_date, data.check_out_date);
      setData('nights', nights);
      setData('total_price', nights * (property.price_per_night || 0));
    } else {
      setData('nights', 0);
      setData('total_price', 0);
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
      
      if(data.is_registered === false) {
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
        });
        userId = response.data.user_id;
      }

      axios.post(route('login'), {
        email: data.email,
        password: data.password
      });

      if (userId) {
        setData('user_id', userId);
      }
      
      post(route('bookings.store'));
    } catch (error) {
      alert(error.response?.data?.message || 'User creation failed.');
    }
  };

  return (
    <div className="bg-gray dark:bg-[#1B1B1B] dark:text-white py-6 px-2 rounded-lg relative z-10 dark:shadow-none">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Check In */}
          <div className="flex justify-between relative w-full p-4 bg-white dark:bg-[#2D2D2D] rounded-md">
            <label htmlFor="check_in_date" className="block text-xl font-medium text-heading dark:text-white">
              Check In
            </label>
            <input
              type="date"
              id="check_in_date"
              name="check_in_date"
              className="w-full max-w-[160px] bg-white dark:bg-[#2D2D2D] appearance-none outline-none dark:text-white"
              value={data.check_in_date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.check_in_date && <div className="text-red-500 text-sm mt-1">{errors.check_in_date}</div>}
          </div>

          {/* Check Out */}
          <div className="flex justify-between relative w-full p-4 bg-white dark:bg-[#2D2D2D] rounded-md">
            <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
              Check Out
            </label>
            <input
              type="date"
              id="check_out_date"
              name="check_out_date"
              className="w-full max-w-[160px] bg-white dark:bg-[#2D2D2D] appearance-none outline-none dark:text-white"
              value={data.check_out_date}
              onChange={handleDateChange}
              min={data.check_in_date || new Date().toISOString().split('T')[0]}
              required
            />
            {errors.check_out_date && <div className="text-red-500 text-sm mt-1">{errors.check_out_date}</div>}
          </div>

          {/* Stay Duration */}
          {data.nights > 0 && (
            <div className="text-center font-medium">
              Your stay: <span className="font-bold">{data.nights} night{data.nights !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Total Price */}
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="text-xl font-bold text-heading dark:text-white">Total Price</span>
            <span className="text-xl font-bold text-heading dark:text-white">KES {data.total_price}</span>
          </div>

          {/* User Info */}
          {(data.check_in_date !== '' && data.check_out_date !== '') &&
          <>
            <h3 className="text-lg font-bold mt-4 mb-2">Guest Information</h3>
            
            {/* Registration Toggle */}
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-md">
              <span className="font-medium">I am a:</span>
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
                  <span className="ml-2">Registered</span>
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
                  <span className="ml-2">New</span>
                </label>
              </div>
            </div>

            
            {/* Form fields */}
            <div className="grid gap-4">
              {!data.is_registered && (
                <>
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Full name
                  </label>

                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={data.name} 
                    onChange={(e) => setData('name', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                    required={!data.is_registered} 
                  />
                </>
              )}

              <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                Email
              </label>
              
              <input 
                type="email" 
                placeholder="Email" 
                value={data.email} 
                onChange={(e) => setData('email', e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                required 
              />

              <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                Password
              </label>
              
              <input 
                type="password" 
                placeholder="Password" 
                value={data.password} 
                onChange={(e) => setData('password', e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                required={!data.is_registered} 
              />
              
              {!data.is_registered && (
                <>
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Phone
                  </label>

                  <input 
                    type="text" 
                    placeholder="Phone" 
                    value={data.phone} 
                    onChange={(e) => setData('phone', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />

                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Nationality
                  </label>
                  
                  <input 
                    type="text" 
                    placeholder="Nationality" 
                    value={data.nationality} 
                    onChange={(e) => setData('nationality', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                
                   <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    ID/Passport number
                  </label>

                  <input 
                    type="text" 
                    placeholder="Passport Number" 
                    value={data.passport_number} 
                    onChange={(e) => setData('passport_number', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                  
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Address
                  </label>

                  <input 
                    type="text" 
                    placeholder="Address" 
                    value={data.address} 
                    onChange={(e) => setData('address', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                  
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    City
                  </label>

                  <input 
                    type="text" 
                    placeholder="City" 
                    value={data.city} 
                    onChange={(e) => setData('city', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                  
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Country
                  </label>

                  <input 
                    type="text" 
                    placeholder="Country" 
                    value={data.country} 
                    onChange={(e) => setData('country', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                  
                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Emergency contact name
                  </label>

                  <input 
                    type="text" 
                    placeholder="Emergency Contact" 
                    value={data.emergency_contact} 
                    onChange={(e) => setData('emergency_contact', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />

                  <label htmlFor="check_out_date" className="block text-xl font-medium text-heading dark:text-white">
                    Emergency contact phone
                  </label>

                  <input 
                    type="text" 
                    placeholder="Emergency Contact Phone" 
                    value={data.contact_phone} 
                    onChange={(e) => setData('contact_phone', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D]"
                  />
                </>
              )}
            </div>
          </>}
          
          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mt-4"
            disabled={processing}
          >
            {processing ? 'Booking...' : 'Book Your Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyBookingForm;