import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ShowCar = ({ car }) => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Car Details</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-medium">Name: {car.name}</h2>
            <p className="text-gray-600">Brand: {car.brand}</p>
            <p className="text-gray-600">Model: {car.model}</p>
            <p className="text-gray-600">Year: {car.year}</p>
            <p className="text-gray-600">Mileage: {car.mileage} km</p>
            <p className="text-gray-600">Fuel Type: {car.fuel_type}</p>
            <p className="text-gray-600">Transmission: {car.transmission}</p>
            <p className="text-gray-600">Location: {car.location_address}</p>
            <p className="text-gray-600">Price per day: {car.price_per_day}</p>
            <p className="text-gray-600">Description: {car.description}</p>
            <p className="text-gray-600">Availability: {car.is_available ? 'Available' : 'Not Available'}</p>
          </div>

          {/* Car Features */}
          <div>
            <h3 className="text-lg font-medium">Features:</h3>
            <ul className="list-disc pl-5">
              {car.features.map(feature => (
                <li key={feature.id} className="text-gray-600">{feature.feature_name}</li>
              ))}
            </ul>
          </div>

          {/* Car Images */}
          {car.media.length > 0 && (
            <div>
              <h3 className="text-lg font-medium">Car Media:</h3>
              <div className="grid grid-cols-3 gap-4">
                {car.media.map(media => (
                  <div key={media.id} className="w-full">
                    <img src={media.media_url} alt={`Car image ${media.id}`} className="w-full h-auto rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href={route('cars.index')} className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Cars List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCar;
