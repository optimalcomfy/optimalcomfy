import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const CreateFoodOrder = ({ users, bookings }) => {
  const { data, setData, post, processing, errors } = useForm({
    user_id: '',
    booking_id: '',
    total_price: '',
    status: 'pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('foodOrders.store'));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-xl font-bold">Create Food Order</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <select 
              value={data.user_id} 
              onChange={(e) => setData('user_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500">{errors.user_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Booking</label>
            <select 
              value={data.booking_id} 
              onChange={(e) => setData('booking_id', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Booking</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {`Booking #${booking.id} (User: ${booking.user.name})`}
                </option>
              ))}
            </select>
            {errors.booking_id && <p className="text-red-500">{errors.booking_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <input 
              type="number" 
              value={data.total_price}
              onChange={(e) => setData('total_price', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            {errors.total_price && <p className="text-red-500">{errors.total_price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              value={data.status} 
              onChange={(e) => setData('status', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && <p className="text-red-500">{errors.status}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={processing}>
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateFoodOrder;
