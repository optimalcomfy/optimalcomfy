import React, { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';
import { Plus, Logs, MapPin, Star as StarIcon } from 'lucide-react';

const CreateCar = () => {
  const { categories, features, company } = usePage().props;

  const { data, setData, post, errors, processing } = useForm({
    car_category_id: '',
    name: '',
    license_plate: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    body_type: '',
    seats: '',
    doors: '',
    luggage_capacity: '',
    fuel_type: '',
    engine_capacity: '',
    transmission: '',
    drive_type: '',
    fuel_economy: '',
    exterior_color: '',
    interior_color: '',
    host_earnings: '',
    price_per_day: '',
    description: '',
    is_available: true,
    location_address: '',
    latitude: '',
    longitude: '',
    features: [],
  });

  const [locationAddressSuggestions, setlocationAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [step, setStep] = useState(1);

  // Calculate prices whenever host_earnings changes
  useEffect(() => {
    if (data.host_earnings && company.percentage) {
      const earnings = parseFloat(data.host_earnings);
      const platformFee = earnings * (company.percentage / 100);
      const customerPrice = earnings + platformFee;
      setData('price_per_day', customerPrice.toFixed(2));
    } else {
      setData('price_per_day', "");
    }
  }, [data.host_earnings, company.percentage]);

  const categoryOptions = categories.map(category => ({
    value: category.id, label: category.name
  }));

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('main-cars.store'));
  };

  useEffect(() => {
    const fetchlocationAddressSuggestions = async () => {
      if (data.location_address.length < 3) {
        setlocationAddressSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location_address)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setlocationAddressSuggestions(result);
      } catch (error) {
        console.error('Error fetching location address suggestions:', error);
        setlocationAddressSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location_address) {
        fetchlocationAddressSuggestions();
      } else {
        setlocationAddressSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location_address]);

  const handleLocation_addressSelect = (suggestion) => {
    setData('location_address', suggestion);
    setlocationAddressSuggestions([]);
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Create New Ride</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium">Ride Category</label>
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find(option => option.value === data.car_category_id)}
                  onChange={(selected) => setData('car_category_id', selected?.value || '')}
                  placeholder="Select category"
                />
                {errors.car_category_id && <p className="text-red-500 text-sm">{errors.car_category_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Ride Name</label>
                <input type="text" className="w-full border rounded-md px-3 py-2"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  placeholder="Ride Name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">License plate</label>
                <input type="text" className="w-full border rounded-md px-3 py-2"
                  value={data.license_plate}
                  onChange={e => setData('license_plate', e.target.value)}
                  placeholder="License plate"
                />
                {errors.license_plate && <p className="text-red-500 text-sm">{errors.license_plate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Brand</label>
                <input type="text" className="w-full border rounded-md px-3 py-2"
                  value={data.brand}
                  onChange={e => setData('brand', e.target.value)}
                  placeholder="Brand"
                />
                {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Model</label>
                <input type="text" className="w-full border rounded-md px-3 py-2"
                  value={data.model}
                  onChange={e => setData('model', e.target.value)}
                  placeholder="Model"
                />
                {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Next
                </button>
              </div>
            </>
          )}

          {/* Step 2: Specs */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Year', 'year', 'number'],
                  ['Mileage', 'mileage', 'number'],
                  ['Body Type', 'body_type', 'text'],
                  ['Seats', 'seats', 'number'],
                  ['Doors', 'doors', 'number'],
                  ['Luggage Capacity', 'luggage_capacity', 'number'],
                  ['Fuel Type', 'fuel_type', 'text'],
                  ['Engine Capacity', 'engine_capacity', 'number'],
                  ['Transmission', 'transmission', 'text'],
                  ['Drive Type', 'drive_type', 'text'],
                  ['Fuel Economy', 'fuel_economy', 'text'],
                  ['Exterior Color', 'exterior_color', 'text'],
                  ['Interior Color', 'interior_color', 'text'],
                ].map(([label, key, type]) => (
                  <div className="min-w-full" key={key}>
                    <label className="block text-sm font-medium">{label}</label>
                    <input
                      type={type}
                      className="w-full border rounded-md px-3 py-2"
                      value={data[key]}
                      onChange={e => setData(key, e.target.value)}
                      placeholder={label}
                    />
                    {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
                  </div>
                ))}

                {/* Pricing Section */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Pricing Details</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Desired Earnings (KES)</label>
                    <input
                      type="number"
                      value={data.host_earnings}
                      onChange={(e) => setData("host_earnings", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your desired earnings per day"
                    />
                    {errors.host_earnings && <p className="text-red-500 text-sm mt-1">{errors.host_earnings}</p>}
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {data.host_earnings ? `KES ${(data.host_earnings * (company.percentage / 100)).toFixed(2)}` : 'KES 0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-800">
                      <span>You'll receive:</span>
                      <span className="text-green-600">KES {data.host_earnings || '0.00'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Price (KES)</label>
                    <input
                      type="number"
                      value={data.price_per_day}
                      readOnly
                      className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">This is the price customers will pay per day after platform fees</p>
                    {errors.price_per_day && <p className="text-red-500 text-sm mt-1">{errors.price_per_day}</p>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder="Enter description"
                    rows="4"
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
                <button type="button" onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Next</button>
              </div>
            </>
          )}

          {/* Step 3: Location & Availability */}
          {step === 3 && (
            <>
              <div className="relative">
                <label className="block text-sm mb-2">
                  <div className="flex text-left gap-4 items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Location address</span>
                  </div>
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded border border-gray-300"
                  placeholder="Search for a location_address..."
                  value={data.location_address}
                  onChange={(e) => setData("location_address", e.target.value)}
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                )}
                {locationAddressSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    <ul className="max-h-60 overflow-auto py-1">
                      {locationAddressSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleLocation_addressSelect(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {errors.location_address && <p className="text-red-500 text-sm">{errors.location_address}</p>}
              </div>
              <div className="mt-4">
                <label className="flex items-center space-x-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={data.is_available}
                    onChange={e => setData('is_available', e.target.checked)}
                  />
                  <span>Available for Rent</span>
                </label>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={processing}>
                  {processing ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link href={route('main-cars.index')} className="text-blue-600 hover:text-blue-800">
            Back to Rides List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCar;