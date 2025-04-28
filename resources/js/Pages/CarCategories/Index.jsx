import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const IndexCarCategories = () => {
  const { carCategories } = usePage().props;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Car Categories</h1>
          <Link
            href={route('car-categories.create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add New Category
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">#</th>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Slug</th>
                <th className="p-3 border-b">Description</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carCategories.length > 0 ? (
                carCategories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{index + 1}</td>
                    <td className="p-3 border-b">{category.name}</td>
                    <td className="p-3 border-b">{category.slug}</td>
                    <td className="p-3 border-b">{category.description}</td>
                    <td className="p-3 border-b text-center space-x-2">
                      <Link
                        href={route('car-categories.edit', { id: category.id })}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Edit
                      </Link>
                      {/* Optional: delete button if you want */}
                      {/* <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 border-b text-center" colSpan="5">
                    No car categories found.
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

export default IndexCarCategories;
