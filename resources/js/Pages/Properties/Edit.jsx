import React, { useState, useEffect } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
import { 
  MapPin, 
  Wifi, 
  Key, 
  Utensils, 
  Sparkles, 
  Phone, 
  CheckCircle, 
  Clock,
  DoorClosed,
  Bed,
  Bath,
  Users,
  Baby,
  Home
} from 'lucide-react';

const EditProperty = ({ property, errors }) => {
  const [existingImages, setExistingImages] = useState(
    property.gallery?.map(path => ({ path, url: `/storage/${path}`, removed: false })) || []
  );
  const [newImages, setNewImages] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { company } = usePage().props;
  const [hostEarnings, setHostEarnings] = useState(0);

  const { data, setData, processing } = useForm({
    property_name: property.property_name,
    type: property.type,
    amount: property.amount,
    price_per_night: property.price_per_night,
    max_adults: property.max_adults,
    max_children: property.max_children,
    total_rooms: property.total_rooms || 1,
    rooms: property.rooms || 1, // Added missing field
    beds: property.beds || 1, // Added missing field
    baths: property.baths || 1, // Added missing field
    status: property.status,
    location: property.location || "",
    wifi_password: property.wifi_password || "",
    cook: property.cook || "",
    cleaner: property.cleaner || "",
    emergency_contact: property.emergency_contact || "",
    key_location: property.key_location || "",
    apartment_name: property.apartment_name || "",
    block: property.block || "",
    house_number: property.house_number || "",
    lock_box_location: property.lock_box_location || "",
    wifi_name: property.wifi_name || "",
    default_available: property.default_available || false,
  });

  // Calculate host earnings whenever amount changes
  useEffect(() => {
    if (data.amount && company.percentage) {
      const amount = parseFloat(data.amount);
      const platformFee = amount * (company.percentage / 100);
      const earnings = amount + platformFee;
      setHostEarnings(earnings);
      setData('price_per_night', earnings.toFixed(2));
    } else {
      setHostEarnings(0);
      setData('price_per_night', "");
    }
  }, [data.amount, company.percentage]);

  // Update total_rooms when rooms or beds change
  useEffect(() => {
    const bedsValue = parseInt(data.beds) || 0;
    const roomsValue = parseInt(data.rooms) || 0;
    const totalRoomsValue = Math.max(bedsValue, roomsValue);
    setData('total_rooms', totalRoomsValue);
  }, [data.beds, data.rooms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    router.post(route('properties.update', { property: property.id }), formData, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const propertyTypes = [
    "Entire Apartment", "Entire House", "Private Room", "Shared Room", "Villa",
    "Cabin", "Cottage", "Treehouse", "Boat", "Tent", "Tiny House", "Bungalow",
    "Farm Stay", "Hostel", "Guesthouse", "Lighthouse", "Luxury Villa", "Penthouse",
  ];

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (data.location.length < 3) {
        setLocationSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setLocationSuggestions(result);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location) {
        fetchLocationSuggestions();
      } else {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location]);

  const handleLocationSelect = (suggestion) => {
    setData('location', suggestion);
    setLocationSuggestions([]);
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Property Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={data.property_name}
                  onChange={(e) => setData("property_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                />
                {errors.property_name && <p className="text-red-500 text-sm mt-1">{errors.property_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <MapPin className="h-4 mr-2" />
                    <span>Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Search for a location..."
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-9">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  </div>
                )}

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
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Property Details Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Property Details</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DoorClosed className="h-4 mr-1 text-blue-500" />
                    Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={data.rooms}
                    onChange={(e) => setData("rooms", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                  {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Bed className="h-4 mr-1 text-green-500" />
                    Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={data.beds}
                    onChange={(e) => setData("beds", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                  {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Bath className="h-4 mr-1 text-purple-500" />
                    Baths
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={data.baths}
                    onChange={(e) => setData("baths", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  />
                  {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths}</p>}
                </div>
              </div>

              {/* Capacity Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Users className="h-4 mr-1 text-orange-500" />
                    Max Adults
                  </label>
                  <input
                    type="number"
                    value={data.max_adults}
                    onChange={(e) => setData("max_adults", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                    min="1"
                  />
                  {errors.max_adults && <p className="text-red-500 text-sm mt-1">{errors.max_adults}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Baby className="h-4 mr-1 text-pink-500" />
                    Max Children
                  </label>
                  <input
                    type="number"
                    value={data.max_children}
                    onChange={(e) => setData("max_children", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                    min="0"
                  />
                  {errors.max_children && <p className="text-red-500 text-sm mt-1">{errors.max_children}</p>}
                </div>
              </div>

              {/* Property Summary */}
              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <DoorClosed className="h-4" />
                    </div>
                    <div className="text-sm font-semibold">{data.rooms}</div>
                    <div className="text-xs text-gray-600">Rooms</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <Bed className="h-4" />
                    </div>
                    <div className="text-sm font-semibold">{data.beds}</div>
                    <div className="text-xs text-gray-600">Beds</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center text-purple-600 mb-1">
                      <Bath className="h-4" />
                    </div>
                    <div className="text-sm font-semibold">{data.baths}</div>
                    <div className="text-xs text-gray-600">Baths</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center text-orange-600 mb-1">
                      <Users className="h-4" />
                    </div>
                    <div className="text-sm font-semibold">{data.max_adults}</div>
                    <div className="text-xs text-gray-600">Adults</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Pricing Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Desired Earnings (KES)</label>
                <input
                  type="number"
                  value={data.amount}
                  onChange={(e) => setData("amount", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Price (KES)</label>
                <input
                  type="number"
                  value={data.price_per_night}
                  readOnly
                  className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-lg cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Includes platform fee of {company.percentage}%</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-md border border-gray-200 mt-4">
              <div className="flex justify-between text-sm font-medium text-gray-800">
                <span>You'll receive per night:</span>
                <span className="text-green-600">KES {data.amount}</span>
              </div>
            </div>
          </div>

          {/* Booking Settings Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Booking Settings</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="default_available"
                      name="default_available"
                      type="checkbox"
                      checked={data.default_available}
                      onChange={(e) => setData('default_available', e.target.checked)}
                      className="h-4 text-green-600 focus:ring-green-500 border-gray-500 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="default_available" className="font-medium text-gray-700">
                      Enable Instant Booking
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Allow guests to book and pay immediately without waiting for your approval.
                      Uncheck this box if you want to manually approve each booking request.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-md border ${data.default_available ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start">
                  {data.default_available ? (
                    <>
                      <CheckCircle className="h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Instant Booking Enabled</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your property is set to "Confirmed - Ready for automatic booking and payment."
                          Guests can complete bookings immediately without waiting for your approval.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Request to Book Enabled</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Your property is set to "Needs host confirmation before payment."
                          You must manually approve each booking request before guests can pay.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>
                  <span className="font-medium">Note:</span> This setting controls whether guests can book immediately 
                  or need to wait for your approval. Changing this setting affects all future bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Wifi className="h-4 mr-2" />
                    <span>WiFi Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.wifi_name}
                  onChange={(e) => setData("wifi_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Wifi className="h-4 mr-2" />
                    <span>WiFi Password</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.wifi_password}
                  onChange={(e) => setData("wifi_password", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="h-4 mr-2" />
                    <span>Apartment Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.apartment_name}
                  onChange={(e) => setData("apartment_name", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Building or complex name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="h-4 mr-2" />
                    <span>Block</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.block}
                  onChange={(e) => setData("block", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Block number or letter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="h-4 mr-2" />
                    <span>House Number</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.house_number}
                  onChange={(e) => setData("house_number", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="House/Unit number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="h-4 mr-2" />
                    <span>Lock Box Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.lock_box_location}
                  onChange={(e) => setData("lock_box_location", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Location of lock box (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Key className="h-4 mr-2" />
                    <span>Key Location</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.key_location}
                  onChange={(e) => setData("key_location", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Where guests can find the keys"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Utensils className="h-4 mr-2" />
                    <span>Cook Available</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.cook}
                  onChange={(e) => setData("cook", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Name or details (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Sparkles className="h-4 mr-2" />
                    <span>Cleaner Available</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.cleaner}
                  onChange={(e) => setData("cleaner", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Name or details (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Phone className="h-4 mr-2" />
                    <span>Emergency Contact</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={data.emergency_contact}
                  onChange={(e) => setData("emergency_contact", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-peach focus:border-transparent"
                  placeholder="Contact person in case of emergencies"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center"
              disabled={processing}
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Property Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProperty;