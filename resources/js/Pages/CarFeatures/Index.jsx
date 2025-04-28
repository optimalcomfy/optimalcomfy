import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const IndexCarFeature = () => {
  const { carFeatures } = usePage().props;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Car Features</h1>
          <Link
            href={route('car-features.create')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            Add New Feature
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 border-b text-left text-sm font-medium text-gray-700">#</th>
                <th className="py-3 px-6 border-b text-left text-sm font-medium text-gray-700">Feature Name</th>
                <th className="py-3 px-6 border-b text-left text-sm font-medium text-gray-700">Car</th>
                <th className="py-3 px-6 border-b text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carFeatures.length > 0 ? (
                carFeatures.map((feature, index) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 border-b">{index + 1}</td>
                    <td className="py-4 px-6 border-b">{feature.feature_name}</td>
                    <td className="py-4 px-6 border-b">{feature.car?.name || '-'}</td>
                    <td className="py-4 px-6 border-b text-center space-x-2">
                      <Link
                        href={route('car-features.show', feature.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <Link
                        href={route('car-features.edit', feature.id)}
                        className="text-indigo-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500">
                    No car features found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default IndexCarFeature;
