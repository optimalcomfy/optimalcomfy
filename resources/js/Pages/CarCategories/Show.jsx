import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const ShowCarCategory = () => {
  const { carCategory } = usePage().props;

  return (
    <Layout>
      <div className="max-w-3xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Car Category Details</h1>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <h2 className="text-gray-700 font-bold">Name:</h2>
            <p className="mt-1 text-lg">{carCategory.name}</p>
          </div>

          {/* Slug */}
          <div>
            <h2 className="text-gray-700 font-bold">Slug:</h2>
            <p className="mt-1 text-lg">{carCategory.slug}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-gray-700 font-bold">Description:</h2>
            <p className="mt-1 text-lg">{carCategory.description}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Link
            href={route('car-categories.edit', { id: carCategory.id })}
            className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          >
            Edit Category
          </Link>
          <Link
            href={route('car-categories.index')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowCarCategory;
