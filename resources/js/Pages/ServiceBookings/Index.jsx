import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexServiceBookings = ({ serviceBookings }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Service Bookings</h1>
        <Link href={route("serviceBookings.create")} className="mb-4 inline-block bg-blue-peach text-white px-4 py-2 rounded">
          Add Service Booking
        </Link>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Service</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceBookings.map(booking => (
              <tr key={booking.id}>
                <td className="border px-4 py-2">{booking.user?.name}</td>
                <td className="border px-4 py-2">{booking.service?.name}</td>
                <td className="border px-4 py-2">{booking.quantity}</td>
                <td className="border px-4 py-2">{booking.status}</td>
                <td className="border px-4 py-2">
                  <Link href={route("serviceBookings.show", booking.id)} className="text-blue-peach mr-2">View</Link>
                  <Link href={route("serviceBookings.edit", booking.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexServiceBookings;
