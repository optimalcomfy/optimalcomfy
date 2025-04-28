import React from 'react';
import { Link, usePage, Inertia } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const CarBookingsIndex = () => {
  const { bookings } = usePage().props;

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      Inertia.delete(route('car-bookings.destroy', { booking: id }));
    }
  };

  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Car Bookings</h1>

        {/* Add New Booking Button */}
        <div className="mb-4">
          <Link 
            href={route('car-bookings.create')} 
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Add New Car Booking
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Car</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">End Date</th>
                <th className="px-4 py-2 border">Pickup Location</th>
                <th className="px-4 py-2 border">Dropoff Location</th>
                <th className="px-4 py-2 border">Total Price</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="px-4 py-2 border">{booking.user?.name || '-'}</td>
                  <td className="px-4 py-2 border">{booking.car?.name || '-'}</td>
                  <td className="px-4 py-2 border">{booking.start_date}</td>
                  <td className="px-4 py-2 border">{booking.end_date}</td>
                  <td className="px-4 py-2 border">{booking.pickup_location}</td>
                  <td className="px-4 py-2 border">{booking.dropoff_location}</td>
                  <td className="px-4 py-2 border">${booking.total_price}</td>
                  <td className="px-4 py-2 border">
                    <span 
                      className={`px-2 py-1 rounded text-white ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-500' 
                          : booking.status === 'pending' 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <Link 
                      href={route('car-bookings.edit', { booking: booking.id })} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={route('car-bookings.show', { booking: booking.id })} 
                      className="text-green-600 hover:text-green-800"
                    >
                      View
                    </Link>
                    <button 
                      onClick={() => handleDelete(booking.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default CarBookingsIndex;
