import React, { useEffect, useState, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Search, X, Loader2 } from 'lucide-react'; // Import necessary icons
import './CarBookingForm.css'; // Example: if you create a specific CSS file

const CarBookingForm = ({ cars }) => {
  const url = usePage().url;

  const carId = (() => {
    const queryString = url.split('?')[1];
    if (!queryString) return null;
    const params = new URLSearchParams(queryString);
    return params.get('car_id');
  })();

  const { data, setData, post, processing, errors } = useForm({
    car_id: carId,
    pickup_location: '',
    dropoff_location: '',
    start_date: '',
    end_date: '',
    total_price: 0,
    status: 'Booked',
    name: '',
    email: '',
    password: '',
    phone: '',
    message: '',
    is_registered: true,
    user_type: 'guest',
    days: 0, // Initialize days
  });

  const [selectedCar, setSelectedCar] = useState(null); // Assuming you still need this for price calculation

  // --- New state for location suggestions ---
  const [pickupLocationSuggestions, setPickupLocationSuggestions] = useState([]);
  const [isLoadingPickupSuggestions, setIsLoadingPickupSuggestions] = useState(false);
  const [isPickupSuggestionsOpen, setIsPickupSuggestionsOpen] = useState(false);

  const [dropoffLocationSuggestions, setDropoffLocationSuggestions] = useState([]);
  const [isLoadingDropoffSuggestions, setIsLoadingDropoffSuggestions] = useState(false);
  const [isDropoffSuggestionsOpen, setIsDropoffSuggestionsOpen] = useState(false);

  const pickupSuggestionRef = useRef(null);
  const dropoffSuggestionRef = useRef(null);
  // --- End of new state ---

  // Find the selected car based on carId to get its price_per_day
  useEffect(() => {
    if (carId && cars && cars.length > 0) {
        const foundCar = cars.find(car => car.id.toString() === carId);
        setSelectedCar(foundCar);
        if (foundCar) {
            // If you want to pre-fill the car_id in the form if not already set
            if (!data.car_id) {
                setData('car_id', foundCar.id.toString());
            }
        }
    }
  }, [carId, cars, data.car_id, setData]);


  const calculateDays = (start_date, end_date) => {
    if (start_date && end_date) {
      const pickupDate = new Date(start_date);
      const returnDate = new Date(end_date);
      const timeDifference = returnDate - pickupDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    }
    return 0;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === 'end_date' && data.start_date && new Date(value) <= new Date(data.start_date)) {
      alert('Return date must be after pickup date');
      return;
    }

    if (name === 'start_date' && data.end_date && new Date(value) >= new Date(data.end_date)) {
      alert('Pickup date must be before return date');
      return;
    }

    setData(name, value);
  };

  useEffect(() => {
    if (data.start_date && data.end_date) {
      const days = calculateDays(data.start_date, data.end_date);
      setData('days', days);
      if (selectedCar) {
        setData('total_price', days * (selectedCar.price_per_day || 0));
      }
    } else {
      setData('days', 0);
      setData('total_price', 0);
    }
  }, [data.start_date, data.end_date, selectedCar, setData]);


  // --- useEffect for fetching PICKUP location suggestions ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.pickup_location.length < 2) {
        setPickupLocationSuggestions([]);
        setIsPickupSuggestionsOpen(false);
        return;
      }
      setIsLoadingPickupSuggestions(true);
      try {
        // Ensure this endpoint exists and returns an array of strings
        const res = await fetch(`/locations?query=${encodeURIComponent(data.pickup_location)}`);
        const suggestions = await res.json();
        setPickupLocationSuggestions(suggestions);
        setIsPickupSuggestionsOpen(suggestions.length > 0);
      } catch (err) {
        console.error("Error fetching pickup locations:", err);
        setPickupLocationSuggestions([]);
      } finally {
        setIsLoadingPickupSuggestions(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [data.pickup_location]);

  // --- useEffect for fetching DROPOFF location suggestions ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (data.dropoff_location.length < 2) {
        setDropoffLocationSuggestions([]);
        setIsDropoffSuggestionsOpen(false);
        return;
      }
      setIsLoadingDropoffSuggestions(true);
      try {
        // Ensure this endpoint exists and returns an array of strings
        const res = await fetch(`/locations?query=${encodeURIComponent(data.dropoff_location)}`);
        const suggestions = await res.json();
        setDropoffLocationSuggestions(suggestions);
        setIsDropoffSuggestionsOpen(suggestions.length > 0);
      } catch (err) {
        console.error("Error fetching dropoff locations:", err);
        setDropoffLocationSuggestions([]);
      } finally {
        setIsLoadingDropoffSuggestions(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [data.dropoff_location]);


  // --- useEffect for handling click outside for suggestion lists ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickupSuggestionRef.current && !pickupSuggestionRef.current.contains(event.target)) {
        setIsPickupSuggestionsOpen(false);
      }
      if (dropoffSuggestionRef.current && !dropoffSuggestionRef.current.contains(event.target)) {
        setIsDropoffSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationInputChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handlePickupLocationSelect = (location) => {
    setData('pickup_location', location);
    setIsPickupSuggestionsOpen(false);
  };

  const handleDropoffLocationSelect = (location) => {
    setData('dropoff_location', location);
    setIsDropoffSuggestionsOpen(false);
  };

  const clearLocationField = (fieldName) => {
    setData(fieldName, '');
    if (fieldName === 'pickup_location') {
      setPickupLocationSuggestions([]);
      setIsPickupSuggestionsOpen(false);
    } else if (fieldName === 'dropoff_location') {
      setDropoffLocationSuggestions([]);
      setIsDropoffSuggestionsOpen(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.start_date || !data.end_date || data.days <= 0) {
      alert('Please select valid pickup and return dates');
      return;
    }

    if (!data.car_id) {
      alert('Please select a vehicle'); // Or handle if car not found/selected
      return;
    }

    if (!data.pickup_location || !data.dropoff_location) {
      alert('Please select pickup and dropoff locations');
      return;
    }

    try {
      let userId = null;
      const bookingData = { ...data }; // Create a mutable copy

      const registrationResponse = await axios.post(route('register'), {
        email: data.email,
        password: data.password,
        name: data.name,
        user_type: data.user_type, // Ensure 'guest' is a valid user_type on your backend
        phone: data.phone
      });
      
      userId = registrationResponse.data.user_id; // Adjust based on your API response
      bookingData.user_id = userId; // Add user_id to the booking data

      post(route('car-bookings.store'), {
        data: bookingData, // Pass the potentially modified bookingData
        onSuccess: () => {
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

  return (
    <div className="bg-gray dark:bg-[#1B1B1B] dark:text-white py-6 px-4 rounded-lg relative z-10 dark:shadow-none">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Pickup Location - Modified */}
            <div className="field-group" ref={pickupSuggestionRef}>
              <label htmlFor="pickup_location" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Pickup Location
              </label>
              <div className="field-input relative"> {/* Ensure field-input and icon styles are available */}
                <input
                  type="text"
                  id="pickup_location"
                  name="pickup_location"
                  className="w-full p-3 pl-10 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md appearance-none outline-none dark:text-white"
                  value={data.pickup_location}
                  onChange={handleLocationInputChange}
                  placeholder="Search pickup location"
                  autoComplete="off"
                  onFocus={() => {
                    if (pickupLocationSuggestions.length > 0) setIsPickupSuggestionsOpen(true);
                  }}
                  required
                />
                {data.pickup_location && !isLoadingPickupSuggestions && (
                  <X className="clear-icon lucide-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600" size={20} onClick={() => clearLocationField('pickup_location')} />
                )}
                {isLoadingPickupSuggestions && (
                  <Loader2 className="loader-icon lucide-icon absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" size={20} />
                )}
              </div>
              {isPickupSuggestionsOpen && pickupLocationSuggestions.length > 0 && (
                <ul className="suggestions-list absolute z-10 w-full bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {pickupLocationSuggestions.map((loc, i) => (
                    <li 
                      key={`pickup-${i}-${loc}`} // Ensure unique key
                      onClick={() => handlePickupLocationSelect(loc)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              )}
              {errors.pickup_location && <div className="text-red-500 text-sm mt-1">{errors.pickup_location}</div>}
            </div>

            {/* Dropoff Location - Modified */}
            <div className="field-group" ref={dropoffSuggestionRef}>
              <label htmlFor="dropoff_location" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Dropoff Location
              </label>
              <div className="field-input relative">
                <input
                  type="text"
                  id="dropoff_location"
                  name="dropoff_location"
                  className="w-full p-3 pl-10 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md appearance-none outline-none dark:text-white"
                  value={data.dropoff_location}
                  onChange={handleLocationInputChange}
                  placeholder="Search dropoff location"
                  autoComplete="off"
                  onFocus={() => {
                    if (dropoffLocationSuggestions.length > 0) setIsDropoffSuggestionsOpen(true);
                  }}
                  required
                />
                {data.dropoff_location && !isLoadingDropoffSuggestions && (
                  <X className="clear-icon lucide-icon absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600" size={20} onClick={() => clearLocationField('dropoff_location')} />
                )}
                {isLoadingDropoffSuggestions && (
                  <Loader2 className="loader-icon lucide-icon absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" size={20} />
                )}
              </div>
              {isDropoffSuggestionsOpen && dropoffLocationSuggestions.length > 0 && (
                <ul className="suggestions-list absolute z-10 w-full bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {dropoffLocationSuggestions.map((loc, i) => (
                    <li 
                      key={`dropoff-${i}-${loc}`} // Ensure unique key
                      onClick={() => handleDropoffLocationSelect(loc)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              )}
              {errors.dropoff_location && <div className="text-red-500 text-sm mt-1">{errors.dropoff_location}</div>}
            </div>

            {/* Pickup Date */}
            <div>
              <label htmlFor="start_date" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Pickup Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="w-full p-3 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md appearance-none outline-none dark:text-white"
                value={data.start_date}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {errors.start_date && <div className="text-red-500 text-sm mt-1">{errors.start_date}</div>}
            </div>

            {/* Return Date */}
            <div>
              <label htmlFor="end_date" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Return Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                className="w-full p-3 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-700 rounded-md appearance-none outline-none dark:text-white"
                value={data.end_date}
                onChange={handleDateChange}
                min={data.start_date || new Date().toISOString().split('T')[0]}
                required
              />
              {errors.end_date && <div className="text-red-500 text-sm mt-1">{errors.end_date}</div>}
            </div>
          </div>

          {/* Rental Duration */}
          {data.days > 0 && (
            <div className="text-center font-medium dark:text-white">
              Your rental: <span className="font-bold">{data.days} day{data.days !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Total Price */}
          {data.total_price > 0 && selectedCar && (
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="text-xl font-bold text-heading dark:text-white">Total Price</span>
              <span className="text-xl font-bold text-heading dark:text-white">${data.total_price.toFixed(2)}</span>
            </div>
          )}

          {/* Registration Toggle */}
          <div className="flex items-center justify-between mb-4 bg-white dark:bg-[#2D2D2D] p-3 rounded-md">
            <span className="font-medium dark:text-white">I am a:</span>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="userStatus"
                  value="registered"
                  checked={data.is_registered}
                  onChange={() => setData({ ...data, is_registered: true, user_type: 'registered_user' })} // or appropriate type
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 dark:text-white">Registered User</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="userStatus"
                  value="new"
                  checked={!data.is_registered}
                  onChange={() => setData({ ...data, is_registered: false, user_type: 'guest' })}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 dark:text-white">New User</span>
              </label>
            </div>
          </div>

          {/* User Info */}
          <div className="grid gap-4">
            <h3 className="text-lg font-bold mt-2 mb-2 dark:text-white">Customer Information</h3>
            
            {!data.is_registered && (
              <>
                <div>
                  <label htmlFor="name" className="block text-xl font-medium text-heading dark:text-white mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    placeholder="Full Name" 
                    value={data.name} 
                    onChange={(e) => setData('name', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D] dark:text-white"
                    required={!data.is_registered} 
                  />
                   {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                name="email"
                placeholder="Email" 
                value={data.email} 
                onChange={(e) => setData('email', e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D] dark:text-white"
                required 
              />
              {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
            </div>

            {/* Conditionally show password if new user or for login */}
            {(!data.is_registered || (data.is_registered /* && some_condition_for_login_password_if_needed */)) && (
                <div>
                <label htmlFor="password" className="block text-xl font-medium text-heading dark:text-white mb-2">
                    Password
                </label>
                <input 
                    type="password" 
                    id="password"
                    name="password"
                    placeholder="Password" 
                    value={data.password} 
                    onChange={(e) => setData('password', e.target.value)} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D] dark:text-white"
                    required={!data.is_registered} // Password is required for new users
                />
                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                </div>
            )}
            
            <div>
              <label htmlFor="phone" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Phone
              </label>
              <input 
                type="text" 
                id="phone"
                name="phone"
                placeholder="Phone" 
                value={data.phone} 
                onChange={(e) => setData('phone', e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D] dark:text-white"
                required
              />
              {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label htmlFor="message" className="block text-xl font-medium text-heading dark:text-white mb-2">
                Additional Requests
              </label>
              <textarea 
                id="message"
                name="message"
                placeholder="Do you have any specific requests?" 
                value={data.message} 
                onChange={(e) => setData('message', e.target.value)} 
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-[#2D2D2D] dark:text-white"
                rows="3"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mt-4 disabled:opacity-50"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Book Your Car'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarBookingForm;