import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
const CarBookingsIndex = () => {
  const { carBookings } = usePage().props;

  const handleDelete = (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          // Use Inertia.delete for making the delete request
          destroy(route('car-bookings.destroy', id), {
            onSuccess: () => {
              // Optionally you can handle success actions here
            },
            onError: (err) => {
              console.error('Delete error:', err);
            },
          });
        }
      });
    };

  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold mb-6">Car Bookings</h1>
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
              {carBookings.map((booking) => (
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
              {carBookings.length === 0 && (
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
