import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const FoodIndex = () => {
  const { foods } = usePage().props;

  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Food Menu</h1>
          <Link 
            href={route('foods.create')} 
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add New Food
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">#</th>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Category</th>
                <th className="border p-3 text-left">Price (KES)</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.length > 0 ? (
                foods.map((food, index) => (
                  <tr key={food.id} className="border hover:bg-gray-100">
                    <td className="border p-3">{index + 1}</td>
                    <td className="border p-3">{food.name}</td>
                    <td className="border p-3">{food.category}</td>
                    <td className="border p-3">KES {food.price}</td>
                    <td className="border p-3 flex gap-2">
                      <Link 
                        href={route('foods.show', food.id)} 
                        className="text-peach hover:underline"
                      >
                        View
                      </Link>
                      <Link 
                        href={route('foods.edit', food.id)} 
                        className="text-yellow-500 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-500">
                    No food items found.
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

export default FoodIndex;
