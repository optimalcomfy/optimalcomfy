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
      <div className="max-w-4xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Car: {car.name}</h1>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {car.is_available ? 'Available' : 'Not Available'}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-6">
            {["details", "features", "gallery", "map"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm ${
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
          <div className="space-y-2">
            <p><strong>Brand:</strong> {car.brand}</p>
            <p><strong>Model:</strong> {car.model}</p>
            <p><strong>Year:</strong> {car.year}</p>
            <p><strong>Mileage:</strong> {car.mileage} km</p>
            <p><strong>Fuel Type:</strong> {car.fuel_type}</p>
            <p><strong>Transmission:</strong> {car.transmission}</p>
            <p><strong>Location:</strong> {car.location_address}</p>
            <p><strong>Price/Day:</strong> KES {car.price_per_day}</p>
            <p><strong>Description:</strong> {car.description}</p>
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
        <div className="mt-6 text-center">
          <Link href={route('main-cars.index')} className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
            <span className="mr-2">&larr;</span> Back to Cars List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCar;
