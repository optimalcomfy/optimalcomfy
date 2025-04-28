import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const ShowCarMedia = ({ carMedia }) => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Car Media Details</h1>
          <Link 
            href={route('car-media.index')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Media List
          </Link>
        </div>

        {/* Car Media Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Media URL</h3>
            <p className="text-gray-600">{carMedia.media_url}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Media Type</h3>
            <p className="text-gray-600">{carMedia.media_type}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Car</h3>
            <p className="text-gray-600">{carMedia.car ? carMedia.car.name : 'No Car Assigned'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCarMedia;
