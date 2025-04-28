import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const ShowCarFeature = ({ carFeature }) => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
        <h1 className="text-3xl font-semibold mb-6">Car Feature Details</h1>

        <div className="space-y-6">
          {/* Feature Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Feature Name</label>
            <p className="mt-1 text-gray-800">{carFeature.feature_name}</p>
          </div>

          {/* Car Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car</label>
            <p className="mt-1 text-gray-800">{carFeature.car?.name || 'No car assigned'}</p>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Link
              href={route('car-features.index')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Back to Car Features
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCarFeature;
