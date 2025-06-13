import React, { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';
import { Plus, Logs, MapPin, Star as StarIcon } from 'lucide-react';

const CreateCar = () => {
  const { categories, features } = usePage().props;

  const { data, setData, post, errors, processing } = useForm({
    car_category_id: '',
    name: '',
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
                <button type="button" onClick={nextStep} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
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
                  ['Year', 'year'],
                  ['Mileage', 'mileage'],
                  ['Body Type', 'body_type'],
                  ['Seats', 'seats'],
                  ['Doors', 'doors'],
                  ['Luggage Capacity', 'luggage_capacity'],
                  ['Fuel Type', 'fuel_type'],
                  ['Engine Capacity', 'engine_capacity'],
                  ['Transmission', 'transmission'],
                  ['Drive Type', 'drive_type'],
                  ['Fuel Economy', 'fuel_economy'],
                  ['Exterior Color', 'exterior_color'],
                  ['Interior Color', 'interior_color'],
                  ['Price Per Day', 'price_per_day'],
                ].map(([label, key]) => (
                  <div className="min-w-full" key={key}>
                    <label className="block text-sm font-medium">{label}</label>
                    <input
                      type={['year', 'mileage', 'seats', 'doors', 'luggage_capacity', 'engine_capacity', 'price_per_day'].includes(key) ? 'number' : 'text'}
                      className="w-full border rounded-md px-3 py-2"
                      value={data[key]}
                      onChange={e => setData(key, e.target.value)}
                      placeholder={label}
                    />
                    {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
                  </div>
                ))}
              </div>
              <div>
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
              <div className="flex justify-between mt-4">
                <button type="button" onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">Previous</button>
                <button type="button" onClick={nextStep} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Next</button>
              </div>
            </>
          )}

          {/* Step 3: Location_address & Availability */}
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
          <Link href={route('main-cars.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Rides List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCar;
