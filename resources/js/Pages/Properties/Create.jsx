import React, { useState, useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { Plus, MapPin, ChevronRight, ChevronLeft, Home, Bed, Check } from 'lucide-react';

const PropertyCreateWizard = ({ errors, amenities }) => {
  const { company } = usePage().props;
  const [step, setStep] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [variations, setVariations] = useState([]);
  const [images, setImages] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRooms, setTotalRooms] = useState(1);
  const [hasVariations, setHasVariations] = useState(false);
  const [newVariation, setNewVariation] = useState({
    type: "",
    price: "",
    rooms: 1
  });

  // Main form data
  const { data, setData } = useForm({
    property_name: "",
    type: "",
    amount: "",
    price_per_night: "",
    max_adults: "",
    max_children: "",
    total_rooms: 1,
    status: "available",
    location: "",
    amenities: [],
    variations: [],
    images: [],
    // Additional property details
    wifi_password: "",
    cook: "",
    cleaner: "",
    emergency_contact: "",
    key_location: "",
    apartment_name: "",
    block: "",
    house_number: "",
    lock_box_location: "",
    wifi_name: ""
  });

  // Calculate pricing
  useEffect(() => {
    if (data.amount && company.percentage) {
      const amount = parseFloat(data.amount);
      const platformFee = amount * (company.percentage / 100);
      const earnings = amount + platformFee;
      setData('price_per_night', earnings.toFixed(2));
    } else {
      setData('price_per_night', "");
    }
  }, [data.amount, company.percentage]);

  // Location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (data.location.length < 3) {
        setLocationSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setLocationSuggestions(result);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location) fetchLocationSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location]);

  // Reset variations when checkbox is unchecked or total_rooms changes
  useEffect(() => {
    if (!hasVariations) {
      setVariations([]);
    }
  }, [hasVariations, data.total_rooms]);

  const handleLocationSelect = (suggestion) => {
    setData('location', suggestion);
    setLocationSuggestions([]);
  };

  // Property types
  const propertyTypes = [
    "Entire Apartment", "Entire House", "Private Room", "Shared Room", "Villa",
    "Cabin", "Cottage", "Treehouse", "Boat", "Tent", "Tiny House", "Bungalow",
    "Farm Stay", "Hostel", "Guesthouse", "Lighthouse", "Luxury Villa", "Penthouse",
  ];

  // Validate form before submission
  const validateForm = () => {
    const requiredFields = {
      property_name: data.property_name,
      type: data.type,
      location: data.location,
      amount: data.amount,
      max_adults: data.max_adults
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        alert(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    if (images.length < 3) {
      alert('Please upload at least 3 images');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Prepare all data
      const formData = new FormData();
      
      // Add basic property data (excluding arrays/objects)
      const basicData = {
        property_name: data.property_name,
        type: data.type,
        amount: data.amount,
        price_per_night: data.price_per_night,
        max_adults: data.max_adults,
        max_children: data.max_children,
        total_rooms: data.total_rooms,
        status: data.status,
        location: data.location,
        wifi_password: data.wifi_password,
        cook: data.cook,
        cleaner: data.cleaner,
        emergency_contact: data.emergency_contact,
        key_location: data.key_location,
        apartment_name: data.apartment_name,
        block: data.block,
        house_number: data.house_number,
        lock_box_location: data.lock_box_location,
        wifi_name: data.wifi_name
      };

      // Add basic data to formData
      Object.keys(basicData).forEach(key => {
        if (basicData[key] !== null && basicData[key] !== undefined) {
          formData.append(key, basicData[key]);
        }
      });

      // Add amenities as array (not JSON string)
      selectedAmenities.forEach(amenityId => {
        formData.append('amenities[]', amenityId);
      });

      // ONLY add variations if hasVariations is true OR if there are custom variations
      if (hasVariations || variations.length > 0) {
        const finalVariations = [...variations];

        // Add variations as array items
        finalVariations.forEach((variation, index) => {
          formData.append(`variations[${index}][type]`, variation.type);
          formData.append(`variations[${index}][price]`, variation.price);
          formData.append(`variations[${index}][rooms]`, variation.rooms);
        });
      }
      // If hasVariations is false and no custom variations, don't send variations at all

      // Add images
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Submit all data at once
      await router.post(route('properties.store'), formData, {
        forceFormData: true,
        onSuccess: () => {
          // Redirect happens from backend
        },
        onError: (errors) => {
          console.log('Submission errors:', errors);
        }
      });

    } catch (error) {
      console.error('Error submitting property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload for gallery
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  // Handle amenity selection
  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId) 
        : [...prev, amenityId]
    );
  };

  // Handle variation management
  const addVariation = () => {
    if (!newVariation.type || !newVariation.price) return;
    
    setVariations([...variations, {
      type: newVariation.type,
      price: parseFloat(newVariation.price) || 0,
      rooms: parseInt(newVariation.rooms) || 1
    }]);
    
    setNewVariation({
      type: "",
      price: "",
      rooms: 1
    });
  };

  const removeVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create Property Listing</h1>
        
        {/* Progress Steps */}
        <div className="flex mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div 
              key={stepNumber}
              className={`flex-1 border-b-2 pb-2 text-center ${step >= stepNumber ? 'border-blue-500 text-blue-500' : 'border-gray-300'}`}
            >
              {['Basic Info', 'Details', 'Amenities', 'Gallery'][stepNumber - 1]}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Property Name*</label>
                  <input
                    type="text"
                    value={data.property_name}
                    onChange={(e) => setData("property_name", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Property Type*</label>
                  <select
                    value={data.type}
                    onChange={(e) => setData("type", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  >
                    <option value="">Select type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Total Bedrooms*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.total_rooms}
                    onChange={(e) => {
                      const rooms = parseInt(e.target.value) || 1;
                      setData("total_rooms", rooms);
                      setTotalRooms(rooms);
                    }}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                
                {/* ADD MAX ADULTS INPUT */}
                <div>
                  <label className="block text-sm font-medium mb-1">Max Adults*</label>
                  <input
                    type="number"
                    min="1"
                    value={data.max_adults}
                    onChange={(e) => setData("max_adults", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>
                
                {/* ADD MAX CHILDREN INPUT */}
                <div>
                  <label className="block text-sm font-medium mb-1">Max Children</label>
                  <input
                    type="number"
                    min="0"
                    value={data.max_children}
                    onChange={(e) => setData("max_children", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location*
                  </label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData("location", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                      <ul className="max-h-60 overflow-auto py-1">
                        {locationSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleLocationSelect(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nightly Rate (KES)*</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData("amount", parseFloat(e.target.value) || 0)}
                    className="w-full border px-4 py-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Guest Price (KES)</label>
                  <input
                    type="number"
                    value={data.price_per_night}
                    readOnly
                    className="w-full border bg-gray-100 px-4 py-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center"
                disabled={!data.property_name || !data.type || !data.location || !data.amount || !data.max_adults}
              >
                Next: Property Details <ChevronRight className="ml-2" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Property Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Apartment/Building Name</label>
                  <input
                    type="text"
                    value={data.apartment_name}
                    onChange={(e) => setData("apartment_name", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Block</label>
                  <input
                    type="text"
                    value={data.block}
                    onChange={(e) => setData("block", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">House Number</label>
                  <input
                    type="text"
                    value={data.house_number}
                    onChange={(e) => setData("house_number", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Key Location</label>
                  <input
                    type="text"
                    value={data.key_location}
                    onChange={(e) => setData("key_location", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    placeholder="Where can guests find the keys?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lock Box Location</label>
                  <input
                    type="text"
                    value={data.lock_box_location}
                    onChange={(e) => setData("lock_box_location", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    placeholder="If applicable"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">WiFi Name</label>
                  <input
                    type="text"
                    value={data.wifi_name}
                    onChange={(e) => setData("wifi_name", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">WiFi Password</label>
                  <input
                    type="text"
                    value={data.wifi_password}
                    onChange={(e) => setData("wifi_password", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cook/Chef Available</label>
                  <input
                    type="text"
                    value={data.cook}
                    onChange={(e) => setData("cook", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    placeholder="Name and contact if available"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cleaner Available</label>
                  <input
                    type="text"
                    value={data.cleaner}
                    onChange={(e) => setData("cleaner", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    placeholder="Name and contact if available"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={data.emergency_contact}
                    onChange={(e) => setData("emergency_contact", e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg"
                    placeholder="Local contact for emergencies"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Room Rental Options</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Standard Option</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>The entire property will be available for KES {data.price_per_night} per night.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={hasVariations}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasVariations(checked);
                      // Clear variations when unchecked
                      if (!checked) {
                        setVariations([]);
                      }
                    }}
                    className="h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Offer partial bookings (rent individual rooms)?</span>
                </label>
              </div>

              {hasVariations && (
                <div className="space-y-6">
                  {totalRooms > 1 && (
                    <>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Bed className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Suggested Room Options</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Based on your property at KES {data.price_per_night} per night:</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: data.total_rooms - 1 }, (_, i) => i + 1).map(rooms => (
                          <div key={rooms} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setVariations([...variations, {
                                type: `${rooms} Bedroom${rooms > 1 ? 's' : ''}`,
                                price: (data.price_per_night * (rooms / data.total_rooms)).toFixed(2),
                                rooms: rooms
                              }]);
                            }}>
                            <div className="flex items-center">
                              <Bed className="h-5 w-5 text-gray-500 mr-2" />
                              <span className="font-medium">{rooms} Bedroom{rooms > 1 ? 's' : ''}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              KES {(data.price_per_night * (rooms / data.total_rooms)).toFixed(2)}/night
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Custom Room Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={newVariation.type}
                          onChange={(e) => setNewVariation({...newVariation, type: e.target.value})}
                          className="w-full border px-4 py-2 rounded-lg"
                          placeholder="e.g. Master Suite"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Bedrooms</label>
                        <input
                          type="number"
                          min="1"
                          max={data.total_rooms - 1}
                          value={newVariation.rooms}
                          onChange={(e) => setNewVariation({...newVariation, rooms: parseInt(e.target.value) || 1})}
                          className="w-full border px-4 py-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newVariation.price}
                          onChange={(e) => setNewVariation({...newVariation, price: e.target.value})}
                          className="w-full border px-4 py-2 rounded-lg"
                          placeholder="KES"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addVariation}
                      className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      disabled={!newVariation.type || !newVariation.price}
                    >
                      Add Custom Option
                    </button>
                  </div>

                  {variations.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Selected Room Options</h3>
                      <div className="space-y-3">
                        {variations.map((variation, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                            <div>
                              <span className="font-medium">{variation.type}</span>
                              <div className="text-sm text-gray-600">
                                {variation.rooms} bedroom{variation.rooms > 1 ? 's' : ''} • KES {variation.price}/night
                              </div>
                            </div>
                            <button
                              onClick={() => removeVariation(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              >
                Next: Amenities <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Select Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{amenity.name}</span>
                  </label>
                </div>
              ))}
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
              >
                Next: Gallery <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Gallery */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Property Images</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload Images (Minimum 3)</label>
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
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                onClick={() => setStep(3)}
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
                    Creating Property...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" /> Create Property
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

export default PropertyCreateWizard;