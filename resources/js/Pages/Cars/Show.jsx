import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import CarGallery from './components/CarGallery';
import CarFeature from './components/CarFeature';
import CarMap from './components/CarMap';
import { Calendar, Truck, Package } from 'lucide-react';

const ShowCar = ({ car }) => {
  const [activeTab, setActiveTab] = useState("details");
  const { auth, features } = usePage().props;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <Layout>
      <div className="w-full mx-2 p-4 sm:p-6 bg-white rounded-lg shadow-md sm:max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-xl sm:text-3xl font-semibold break-words">
            {car.name} - {car.license_plate}
          </h1>
          <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
            car.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {car.is_available ? 'Available' : 'Not Available'}
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-6 min-w-max">
            {["details", "features", "gallery", "map"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 sm:px-4 sm:py-2 font-medium text-xs sm:text-sm ${
                  activeTab === tab
                    ? "border-b-2 border-indigo-600 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-3 text-sm sm:text-base">
            {/* Basic Information */}
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Brand:</span>
              <span>{car.brand}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Model:</span>
              <span>{car.model}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Year:</span>
              <span>{car.year}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Mileage:</span>
              <span>{car.mileage} km</span>
            </div>
            
            {/* Technical Specifications */}
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Body Type:</span>
              <span>{car.body_type}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Fuel Type:</span>
              <span>{car.fuel_type}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Transmission:</span>
              <span>{car.transmission}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Drive Type:</span>
              <span>{car.drive_type}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Engine Capacity:</span>
              <span>{car.engine_capacity} cc</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Fuel Economy:</span>
              <span>{car.fuel_economy}</span>
            </div>
            
            {/* Physical Characteristics */}
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Seats:</span>
              <span>{car.seats}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Doors:</span>
              <span>{car.doors}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Luggage Capacity:</span>
              <span>{car.luggage_capacity} bags</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Exterior Color:</span>
              <span>{car.exterior_color}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Interior Color:</span>
              <span>{car.interior_color}</span>
            </div>

            {/* Rental Details Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-gray-800">
                <Package className="h-5 mr-2 text-blue-600" />
                Rental Details
              </h3>
              
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium flex items-center">
                    <Calendar className="h-4 mr-1 text-blue-500" />
                    Minimum Rental Days:
                  </span>
                  <span className="font-semibold">{car.minimum_rental_days} day{car.minimum_rental_days > 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium flex items-center">
                    <Truck className="h-4 mr-1 text-green-500" />
                    Delivery Service:
                  </span>
                  <span className={`font-semibold ${car.delivery_toggle ? 'text-green-600' : 'text-gray-500'}`}>
                    {car.delivery_toggle ? 'Available' : 'Not Available'}
                  </span>
                </div>
                
                {car.delivery_toggle && car.delivery_fee && (
                  <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 font-medium">Delivery Fee:</span>
                    <span className="font-semibold">KES {formatCurrency(car.delivery_fee)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Pricing</h3>
              
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Your Earnings/Day:</span>
                  <span className="font-semibold">KES {formatCurrency(car.amount)}</span>
                </div>
                <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">Customer Price/Day:</span>
                  <span className="font-semibold">KES {formatCurrency(car.platform_price)}</span>
                </div>
                
                {/* Daily Rate Calculation */}
                {car.amount && car.platform_price && (
                  <div className="bg-blue-50 p-3 rounded-lg mt-2">
                    <p className="text-xs text-blue-700">
                      Daily rate includes platform fee. Customer pays KES {formatCurrency(car.platform_price)} 
                      per day, you earn KES {formatCurrency(car.amount)}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Location:</span>
              <span className="text-right">{car.location_address}</span>
            </div>

            {/* Booking Settings */}
            <div className="flex justify-between border-b border-gray-200 pb-2 gap-2 sm:gap-4">
              <span className="text-sm sm:text-base text-gray-600">Booking Type:</span>
              <span className="text-sm sm:text-base font-medium text-gray-800">
                {car.default_available ? 
                  "Instant Booking (Confirmed automatically)" : 
                  "Request to Book (Needs host confirmation)"
                }
              </span>
            </div>
            
            {car.description && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-gray-600 font-medium mb-2">Description:</p>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">{car.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "features" && (
          <CarFeature car={car} features={features} />
        )}

        {activeTab === "gallery" && (
          <CarGallery car={car} />
        )}

        {activeTab === "map" && (
          <CarMap car={car} />
        )}

        {/* Back Link */}
        <div className="mt-6 text-center sm:text-left">
          <Link 
            href={route('main-cars.index')} 
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center text-sm sm:text-base"
          >
            <span className="mr-1 sm:mr-2">&larr;</span> Back to Cars List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCar;