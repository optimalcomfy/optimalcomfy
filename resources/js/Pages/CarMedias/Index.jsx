import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const IndexcarMedias = ({ carMedias }) => {
  return (
    <Layout>
      <div className="max-w-full bg-white p-8 rounded-lg shadow-md mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Car Media</h1>
          <Link 
            href={route('car-medias.create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Media
          </Link>
        </div>

        {/* Car Media Table */}
        <div className="overflow-hidden bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Media URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Media Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carMedias.map((media) => (
                <tr key={media.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{media.image}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{media.media_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{media.car ? media.car.name : 'No Car Assigned'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <Link href={route('car-media.edit', media.id)} className="text-indigo-600 hover:text-indigo-800">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default IndexcarMedias;
