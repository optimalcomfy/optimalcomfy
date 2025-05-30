import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const BookingsIndex = () => {
  const { bookings } = usePage().props;

  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Bookings</h1>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Property</th>
                <th className="px-4 py-2 border">Check-in</th>
                <th className="px-4 py-2 border">Check-out</th>
                <th className="px-4 py-2 border">Total Price</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2 border">{booking.user.name}</td>
                  <td className="px-4 py-2 border">{booking.property.property_name}</td>
                  <td className="px-4 py-2 border">{booking.check_in_date}</td>
                  <td className="px-4 py-2 border">{booking.check_out_date}</td>
                  <td className="px-4 py-2 border">{booking.total_price}</td>
                  <td className="px-4 py-2 border">
                    <span 
                      className={`px-2 py-1 rounded text-white ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    <Link 
                      href={route('bookings.show', { booking: booking.id })} 
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

// Function to handle delete (You need to implement this in Laravel)
const handleDelete = (id) => {
  if (confirm('Are you sure you want to delete this booking?')) {
    Inertia.delete(route('bookings.destroy', { booking: id }));
  }
};

export default BookingsIndex;
