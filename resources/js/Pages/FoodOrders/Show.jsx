import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const ShowFoodOrder = ({ foodOrder }) => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold">Food Order Details</h1>

        <div className="mt-4">
          <p><strong>User:</strong> {foodOrder.user.name}</p>
          <p><strong>Booking ID:</strong> {foodOrder.booking_id}</p>
          <p><strong>Total Price:</strong> ${foodOrder.total_price}</p>
          <p><strong>Status:</strong> {foodOrder.status}</p>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Ordered Items</h2>
        <ul className="mt-2 border-t pt-2">
          {foodOrder.food_order_items.length > 0 ? (
            foodOrder.food_order_items.map(item => (
              <li key={item.id} className="py-2">
                <p><strong>Food:</strong> {item.food.name}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Price:</strong> ${item.price}</p>
              </li>
            ))
          ) : (
            <p>No food items in this order.</p>
          )}
        </ul>

        <div className="mt-6 flex gap-4">
          <Link href={route('foodOrders.edit', foodOrder.id)} className="text-peach">Edit</Link>
          <Link href={route('foodOrders.index')} className="text-gray-500">Back to Orders</Link>
        </div>
      </div>
    </Layout>
  );
};

export default ShowFoodOrder;
