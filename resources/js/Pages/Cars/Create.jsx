import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, MapPin, ChevronRight, ChevronLeft, Car, Check, Truck } from 'lucide-react';
import Select from 'react-select';

const RideCreateWizard = ({ errors, features, categories }) => {
  const { company } = usePage().props;
  const [step, setStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Main form data
  const { data, setData } = useForm({
    car_category_id: "",
    name: "",
    license_plate: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    body_type: "",
    seats: "",
    doors: "",
    luggage_capacity: "",
    fuel_type: "",
    engine_capacity: "",
    transmission: "",
    drive_type: "",
    fuel_economy: "",
    exterior_color: "",
    interior_color: "",
    host_earnings: "",
    price_per_day: "",
    minimum_rental_days: 1, // Added missing field
    delivery_toggle: false, // Added missing field
    delivery_fee: "", // Added missing field
    description: "",
    is_available: 1,
    location_address: "",
    latitude: "",
    longitude: "",
    features: [],
    images: []
  });

  // Calculate pricing
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

  // Location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (data.location_address.length < 3) {
        setLocationSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location_address)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setLocationSuggestions(result);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location_address) fetchLocationSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location_address]);

  const handleLocationSelect = (suggestion) => {
    setData('location_address', suggestion);
    setLocationSuggestions([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare all data
      const formData = new FormData();
      
      // Add basic ride data
      Object.keys(data).forEach(key => {
        if (key !== 'images') {
          formData.append(key, data[key]);
        }
      });

      // Add features
      formData.append('features', JSON.stringify(selectedFeatures));

      // Add images
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Submit all data at once
      await router.post(route('main-cars.store'), formData, {
        forceFormData: true,
        onSuccess: () => {
          // Redirect happens from backend
        }
      });

    } catch (error) {
      console.error('Error submitting ride:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload for gallery
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  // Handle feature selection
  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId) 
        : [...prev, featureId]
    );
  };

  // Category options for select
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  // Body type options
  const bodyTypes = [
    "Sedan", "SUV", "Hatchback", "Coupe", "Convertible",
    "Wagon", "Minivan", "Pickup Truck", "Sports Car", "Luxury"
  ];

  // Fuel type options
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

  // Transmission options
  const transmissionTypes = ["Automatic", "Manual", "CVT", "Dual-Clutch"];

  // Drive type options
  const driveTypes = ["FWD", "RWD", "AWD", "4WD"];

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create Ride Listing</h1>
        
        {/* Progress Steps */}
        <div className="flex mb-8">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div 
              key={stepNumber}
              className={`flex-1 border-b-2 pb-2 text-center ${step >= stepNumber ? 'border-blue-500 text-blue-500' : 'border-gray-300'}`}
            >
              {['Basic Info', 'Specs', 'Rental Details', 'Features', 'Gallery'][stepNumber - 1]}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ride Category*</label>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find(option => option.value === data.car_category_id)}
                    onChange={(selected) => setData('car_category_id', selected?.value || '')}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Select category"
                  />
                  {errors.car_category_id && <p className="text-red-500 text-sm">{errors.car_category_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ride Name*</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">License Plate*</label>
                  <input
                    type="text"
                    value={data.license_plate}
                    onChange={(e) => setData("license_plate", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.license_plate && <p className="text-red-500 text-sm">{errors.license_plate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Brand*</label>
                  <input
                    type="text"
                    value={data.brand}
                    onChange={(e) => setData("brand", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Model*</label>
                  <input
                    type="text"
                    value={data.model}
                    onChange={(e) => setData("model", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.model && <p className="text-red-500 text-sm">{errors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Year*</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={data.year}
                    onChange={(e) => setData("year", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.year && <p className="text-red-500 text-sm">{errors.year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mileage (km)*</label>
                  <input
                    type="number"
                    min="0"
                    value={data.mileage}
                    onChange={(e) => setData("mileage", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.mileage && <p className="text-red-500 text-sm">{errors.mileage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Body Type*</label>
                  <select
                    value={data.body_type}
                    onChange={(e) => setData("body_type", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  >
                    <option value="">Select body type</option>
                    {bodyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.body_type && <p className="text-red-500 text-sm">{errors.body_type}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
                disabled={!data.car_category_id || !data.name || !data.license_plate || !data.brand || !data.model || !data.year || !data.mileage || !data.body_type}
              >
                Next: Specifications <ChevronRight className="ml-2" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Specifications */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Ride Specifications</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Seats*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.seats}
                    onChange={(e) => setData("seats", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.seats && <p className="text-red-500 text-sm">{errors.seats}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Doors*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.doors}
                    onChange={(e) => setData("doors", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.doors && <p className="text-red-500 text-sm">{errors.doors}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Luggage Capacity (bags)*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.luggage_capacity}
                    onChange={(e) => setData("luggage_capacity", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.luggage_capacity && <p className="text-red-500 text-sm">{errors.luggage_capacity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Type*</label>
                  <select
                    value={data.fuel_type}
                    onChange={(e) => setData("fuel_type", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  >
                    <option value="">Select fuel type</option>
                    {fuelTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.fuel_type && <p className="text-red-500 text-sm">{errors.fuel_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Engine Capacity (cc)*</label>
                  <input
                    type="number"
                    min="0"
                    value={data.engine_capacity}
                    onChange={(e) => setData("engine_capacity", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.engine_capacity && <p className="text-red-500 text-sm">{errors.engine_capacity}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Transmission*</label>
                  <select
                    value={data.transmission}
                    onChange={(e) => setData("transmission", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  >
                    <option value="">Select transmission</option>
                    {transmissionTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.transmission && <p className="text-red-500 text-sm">{errors.transmission}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Drive Type*</label>
                  <select
                    value={data.drive_type}
                    onChange={(e) => setData("drive_type", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  >
                    <option value="">Select drive type</option>
                    {driveTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.drive_type && <p className="text-red-500 text-sm">{errors.drive_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Economy (km/l)*</label>
                  <input
                    type="text"
                    value={data.fuel_economy}
                    onChange={(e) => setData("fuel_economy", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                    placeholder="e.g. 12-15"
                  />
                  {errors.fuel_economy && <p className="text-red-500 text-sm">{errors.fuel_economy}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Exterior Color*</label>
                  <input
                    type="text"
                    value={data.exterior_color}
                    onChange={(e) => setData("exterior_color", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.exterior_color && <p className="text-red-500 text-sm">{errors.exterior_color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Interior Color*</label>
                  <input
                    type="text"
                    value={data.interior_color}
                    onChange={(e) => setData("interior_color", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.interior_color && <p className="text-red-500 text-sm">{errors.interior_color}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
                disabled={!data.seats || !data.doors || !data.luggage_capacity || !data.fuel_type || 
                          !data.engine_capacity || !data.transmission || !data.drive_type || 
                          !data.fuel_economy || !data.exterior_color || !data.interior_color}
              >
                Next: Rental Details <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rental Details (New Step) */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Rental Details</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Desired Earnings (KES)*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.host_earnings}
                    onChange={(e) => setData("host_earnings", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.host_earnings && <p className="text-red-500 text-sm">{errors.host_earnings}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Price (KES)</label>
                  <input
                    type="number"
                    value={data.price_per_day}
                    readOnly
                    className="w-full border bg-gray-100 px-4 py-2 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Includes platform fee of {company.percentage}%</p>
                  {errors.price_per_day && <p className="text-red-500 text-sm">{errors.price_per_day}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Rental Days*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.minimum_rental_days}
                    onChange={(e) => setData("minimum_rental_days", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {errors.minimum_rental_days && <p className="text-red-500 text-sm">{errors.minimum_rental_days}</p>}
                  <p className="text-xs text-gray-500 mt-1">Minimum number of days for rental</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <label className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={data.delivery_toggle}
                          onChange={(e) => {
                            setData('delivery_toggle', e.target.checked);
                            if (!e.target.checked) {
                              setData('delivery_fee', '');
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`block w-12 h-6 rounded-full ${data.delivery_toggle ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white h-4 rounded-full transition-transform ${data.delivery_toggle ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <div className="flex items-center">
                        <Truck className="h-4 mr-2" />
                        <span className="font-medium">Offer Delivery</span>
                      </div>
                    </label>
                  </div>

                  {data.delivery_toggle && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Fee (KES)*</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.delivery_fee}
                        onChange={(e) => setData("delivery_fee", e.target.value)}
                        className="w-full border px-4 py-2 rounded-lg"
                        placeholder="Enter delivery fee"
                        required={data.delivery_toggle}
                      />
                      {errors.delivery_fee && <p className="text-red-500 text-sm">{errors.delivery_fee}</p>}
                      <p className="text-xs text-gray-500 mt-1">Fee for delivering the car to customer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description*</label>
              <textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full border px-4 py-2 rounded-lg"
                rows="4"
                required
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
                disabled={!data.host_earnings || !data.description || !data.minimum_rental_days || 
                          (data.delivery_toggle && !data.delivery_fee)}
              >
                Next: Features <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Features */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Select Features</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                      className="h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{feature.name}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Location</h3>
              
              <div className="relative">
                <label className="block text-sm mb-2">
                  <div className="flex text-left gap-4 items-center">
                    <MapPin className="h-4 mr-1" />
                    <span>Location address*</span>
                  </div>
                </label>
                <input
                  type="text"
                  className="w-full p-2 rounded border border-gray-300"
                  placeholder="Search for a location..."
                  value={data.location_address}
                  onChange={(e) => setData("location_address", e.target.value)}
                  required
                />
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                    <ul className="max-h-60 overflow-auto py-1">
                      {locationSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleLocationSelect(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {errors.location_address && <p className="text-red-500 text-sm">{errors.location_address}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={data.is_available}
                  onChange={e => setData('is_available', e.target.checked ? 1 : 0)}
                  className="h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <span>Available for Rent</span>
              </label>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
              >
                Next: Gallery <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Gallery */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Ride Images</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload Images (Minimum 3)*</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload files</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        multiple
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Selected Images ({images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(4)}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <ChevronLeft className="mr-2" /> Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 flex items-center"
                disabled={isLoading || images.length < 3}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Ride...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" /> Create Ride
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RideCreateWizard;