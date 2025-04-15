import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditBooking = ({ booking }) => {
  const { users, rooms } = usePage().props;

  const { data, setData, put, errors, processing } = useForm({
    user_id: booking.user_id,
    room_id: booking.room_id,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    total_price: booking.total_price,
    status: booking.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('bookings.update', { booking: booking.id }));
  };

  const userOptions = users.map(user => ({ value: user.id, label: user.name }));
  const roomOptions = rooms.map(room => ({ value: room.id, label: room.name }));

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Edit Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* User Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <Select
              options={userOptions}
              value={userOptions.find(option => option.value === data.user_id)}
              onChange={(selected) => setData('user_id', selected ? selected.value : '')}
              placeholder="Select a user"
            />
            {errors.user_id && <div className="text-sm text-red-500 mt-1">{errors.user_id}</div>}
          </div>

          {/* Room Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <Select
              options={roomOptions}
              value={roomOptions.find(option => option.value === data.room_id)}
              onChange={(selected) => setData('room_id', selected ? selected.value : '')}
              placeholder="Select a room"
            />
            {errors.room_id && <div className="text-sm text-red-500 mt-1">{errors.room_id}</div>}
          </div>

          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
            <input 
              type="date" 
              value={data.check_in_date} 
              onChange={(e) => setData('check_in_date', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.check_in_date && <div className="text-sm text-red-500 mt-1">{errors.check_in_date}</div>}
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
            <input 
              type="date" 
              value={data.check_out_date} 
              onChange={(e) => setData('check_out_date', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.check_out_date && <div className="text-sm text-red-500 mt-1">{errors.check_out_date}</div>}
          </div>

          {/* Total Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <input 
              type="number" 
              value={data.total_price} 
              onChange={(e) => setData('total_price', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.total_price && <div className="text-sm text-red-500 mt-1">{errors.total_price}</div>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              value={data.status} 
              onChange={(e) => setData('status', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && <div className="text-sm text-red-500 mt-1">{errors.status}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={processing}
          >
            {processing ? 'Updating...' : 'Update Booking'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('bookings.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Bookings
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default EditBooking;
