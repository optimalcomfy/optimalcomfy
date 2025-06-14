import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditCarBooking = ({ carBooking }) => {
  const { cars } = usePage().props; // Make sure 'cars' and 'users' are passed from backend

  const { data, setData, put, errors, processing } = useForm({
    user_id: carBooking.user_id || '',
    car_id: carBooking.car_id || '',
    start_date: carBooking.start_date || '',
    end_date: carBooking.end_date || '',
    total_price: carBooking.total_price || '',
    pickup_location: carBooking.pickup_location || '',
    dropoff_location: carBooking.dropoff_location || '',
    status: carBooking.status || 'pending',
    special_requests: carBooking.special_requests || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('car-bookings.update', { car_booking: carBooking.id }));
  };

  const carOptions = cars.map(car => ({ value: car.id, label: car.name }));

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Edit Car carBooking</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Car Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Car</label>
            <Select
              options={carOptions}
              value={carOptions.find(option => option.value === data.car_id)}
              onChange={(selected) => setData('car_id', selected ? selected.value : '')}
              placeholder="Select a car"
            />
            {errors.car_id && <div className="text-sm text-red-500 mt-1">{errors.car_id}</div>}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
              type="date"
              value={data.start_date}
              onChange={(e) => setData('start_date', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.start_date && <div className="text-sm text-red-500 mt-1">{errors.start_date}</div>}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input 
              type="date"
              value={data.end_date}
              onChange={(e) => setData('end_date', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.end_date && <div className="text-sm text-red-500 mt-1">{errors.end_date}</div>}
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

          {/* Pickup Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
            <input 
              type="text"
              value={data.pickup_location}
              onChange={(e) => setData('pickup_location', e.target.value)}
              placeholder="Enter pickup location"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.pickup_location && <div className="text-sm text-red-500 mt-1">{errors.pickup_location}</div>}
          </div>

          {/* Dropoff Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Drop-off Location</label>
            <input 
              type="text"
              value={data.dropoff_location}
              onChange={(e) => setData('dropoff_location', e.target.value)}
              placeholder="Enter drop-off location"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
            {errors.dropoff_location && <div className="text-sm text-red-500 mt-1">{errors.dropoff_location}</div>}
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

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Special Requests</label>
            <textarea
              value={data.special_requests}
              onChange={(e) => setData('special_requests', e.target.value)}
              placeholder="Any special requests?"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
              rows="4"
            />
            {errors.special_requests && <div className="text-sm text-red-500 mt-1">{errors.special_requests}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={processing}
          >
            {processing ? 'Updating...' : 'Update Car carBooking'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('car-bookings.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Car car bookings
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default EditCarBooking;
