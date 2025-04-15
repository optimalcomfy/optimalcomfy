import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const ShowFoodOrderItem = ({ foodOrderItem }) => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold">Food Order Item Details</h1>

        <div className="mt-4">
          <p><strong>Food Order ID:</strong> {foodOrderItem.food_order_id}</p>
          <p><strong>Food:</strong> {foodOrderItem.food.name}</p>
          <p><strong>Quantity:</strong> {foodOrderItem.quantity}</p>
          <p><strong>Price per Item:</strong> ${foodOrderItem.price}</p>
          <p><strong>Total Price:</strong> ${foodOrderItem.total_price}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={route('foodOrderItems.edit', foodOrderItem.id)} className="text-blue-500">Edit</Link>
          <Link href={route('foodOrderItems.index')} className="text-gray-500">Back to Order Items</Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowFoodOrderItem;
