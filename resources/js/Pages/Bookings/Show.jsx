import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const BookingShow = () => {
  const { booking } = usePage().props;

  return (
    <Layout>
      <div className="max-w-4xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4">Booking Details</h1>

        {/* Booking Info */}
        <div className="space-y-4">
          <p><strong>User:</strong> {booking.user.name}</p>
          <p><strong>Property:</strong> {booking.property.property_name}</p>
          <p><strong>Check-in Date:</strong> {booking.check_in_date}</p>
          <p><strong>Check-out Date:</strong> {booking.check_out_date}</p>
          <p><strong>Total Price:</strong> {booking.total_price}</p>
          <p><strong>Status:</strong> 
            <span className={`px-2 py-1 ml-2 rounded text-white ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {booking.status}
            </span>
          </p>
        </div>

        {/* Payment History (if applicable) */}
        {booking.payments && booking.payments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Payments</h2>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Method</th>
                </tr>
              </thead>
              <tbody>
                {booking.payments.map((payment) => (
                  <tr key={payment.id} className="border-t">
                    <td className="px-4 py-2 border">{payment.amount}</td>
                    <td className="px-4 py-2 border">{payment.date}</td>
                    <td className="px-4 py-2 border">{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <Link
            href={route('bookings.index')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default BookingShow;
