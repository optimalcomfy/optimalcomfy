import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const CreateServiceBooking = ({ users, services, bookings, errors }) => {
  const { data, setData, post, processing } = useForm({
    user_id: "",
    booking_id: "",
    service_id: "",
    quantity: 1,
    total_price: "",
    status: "pending",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("serviceBookings.store"));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Create Service Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User</label>
            <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Booking</label>
            <select value={data.booking_id} onChange={(e) => setData("booking_id", e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="">Select Booking</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>Booking #{booking.id}</option>
              ))}
            </select>
            {errors.booking_id && <p className="text-red-500 text-sm">{errors.booking_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Service</label>
            <select value={data.service_id} onChange={(e) => setData("service_id", e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            {errors.service_id && <p className="text-red-500 text-sm">{errors.service_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input type="number" value={data.quantity} onChange={(e) => setData("quantity", e.target.value)}
              className="w-full border px-3 py-2 rounded" min="1" />
            {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-peach text-white py-2 rounded" disabled={processing}>
            {processing ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateServiceBooking;
