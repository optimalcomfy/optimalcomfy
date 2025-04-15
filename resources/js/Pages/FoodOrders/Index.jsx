import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const FoodOrdersIndex = ({ foodOrders }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold">Food Orders</h1>
        <Link href={route('foodOrders.create')} className="block my-3 text-blue-500">Create New Order</Link>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>User</th>
              <th>Booking</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodOrders.map(order => (
              <tr key={order.id} className="border-t">
                <td>{order.user.name}</td>
                <td>{order.booking_id}</td>
                <td>${order.total_price}</td>
                <td>{order.status}</td>
                <td>
                  <Link href={route('foodOrders.edit', order.id)} className="text-blue-500">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default FoodOrdersIndex;
