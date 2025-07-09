import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import CarGallery from './components/CarGallery';
import CarFeature from './components/CarFeature';
import CarMap from './components/CarMap';

const ShowCar = ({ car }) => {
  const [activeTab, setActiveTab] = useState("details");
  const { auth, features } = usePage().props;

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
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Fuel Type:</span>
              <span>{car.fuel_type}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Transmission:</span>
              <span>{car.transmission}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Location:</span>
              <span className="text-right">{car.location_address}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Price/Day:</span>
              <span className="font-semibold">KES {car.amount}</span>
            </div>
            <div className="flex flex-wrap justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-600 font-medium">Customer Price/Day:</span>
              <span className="font-semibold">KES {car.price_per_day}</span>
            </div>
            {car.description && (
              <div className="pt-2">
                <p className="text-gray-600 font-medium">Description:</p>
                <p className="mt-1">{car.description}</p>
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