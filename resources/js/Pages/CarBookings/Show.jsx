import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const CarBookingShow = () => {
  const { booking } = usePage().props;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4">Car Booking Details</h1>

        {/* Booking Info */}
        <div className="space-y-4">
          <p><strong>User:</strong> {booking.user?.name || '-'}</p>
          <p><strong>Car:</strong> {booking.car?.name || '-'}</p>
          <p><strong>Start Date:</strong> {booking.start_date}</p>
          <p><strong>End Date:</strong> {booking.end_date}</p>
          <p><strong>Pickup Location:</strong> {booking.pickup_location}</p>
          <p><strong>Dropoff Location:</strong> {booking.dropoff_location}</p>
          <p><strong>Total Price:</strong> ${booking.total_price}</p>
          <p><strong>Special Requests:</strong> {booking.special_requests || 'None'}</p>
          <p><strong>Status:</strong> 
            <span className={`px-2 py-1 ml-2 rounded text-white ${
              booking.status === 'confirmed'
                ? 'bg-green-500'
                : booking.status === 'pending'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}>
              {booking.status}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <Link
            href={route('car-bookings.edit', { booking: booking.id })}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Edit Booking
          </Link>
          <Link
            href={route('car-bookings.index')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Car Bookings
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default CarBookingShow;
