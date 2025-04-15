import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const IndexFoodOrderItems = ({ foodOrderItems }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Food Order Items</h1>
        <Link href={route('foodOrderItems.create')} className="px-4 py-2 bg-green-500 text-white rounded">Add New</Link>

        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Food Order</th>
              <th className="border border-gray-300 px-4 py-2">Food</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Total Price</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodOrderItems.map(item => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                <td className="border border-gray-300 px-4 py-2">{item.food_order_id}</td>
                <td className="border border-gray-300 px-4 py-2">{item.food.name}</td>
                <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2">${item.price}</td>
                <td className="border border-gray-300 px-4 py-2">${item.total_price}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link href={route('foodOrderItems.edit', item.id)} className="text-blue-500">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexFoodOrderItems;
