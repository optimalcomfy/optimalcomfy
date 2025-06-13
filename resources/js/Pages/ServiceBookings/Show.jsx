import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const ShowServiceBooking = ({ serviceBooking }) => {
  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Service Booking Details</h1>
        <p><strong>User:</strong> {serviceBooking.user.name}</p>
        <p><strong>Service:</strong> {serviceBooking.service.name}</p>
        <p><strong>Quantity:</strong> {serviceBooking.quantity}</p>
        <p><strong>Status:</strong> {serviceBooking.status}</p>

        <Link href={route("serviceBookings.index")} className="mt-4 inline-block text-peach">Back to Service Bookings</Link>
      </div>
    </Layout>
  );
};

export default ShowServiceBooking;
