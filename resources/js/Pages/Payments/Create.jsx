import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const CreatePayment = ({ users, bookings, foodOrders, serviceBookings, errors }) => {
  const { data, setData, post, processing } = useForm({
    user_id: "",
    booking_id: "",
    food_order_id: "",
    service_booking_id: "",
    amount: "",
    method: "",
    status: "pending",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("payments.store"));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Create Payment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User</label>
            <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)}
              className="w-full border px-3 py-2 rounded">
              <option value="">Select User</option>
              {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
            {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input type="number" value={data.amount} onChange={(e) => setData("amount", e.target.value)}
              className="w-full border px-3 py-2 rounded" />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePayment;
