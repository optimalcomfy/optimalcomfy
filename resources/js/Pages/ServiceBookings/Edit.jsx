import React from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const EditServiceBooking = ({ serviceBooking, users, services, bookings, errors }) => {
  const { data, setData, put, processing } = useForm({
    user_id: serviceBooking.user_id,
    booking_id: serviceBooking.booking_id,
    service_id: serviceBooking.service_id,
    quantity: serviceBooking.quantity,
    status: serviceBooking.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("serviceBookings.update", serviceBooking.id));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Edit Service Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={data.status} onChange={(e) => setData("status", e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditServiceBooking;
