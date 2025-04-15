import React from "react";
import { useForm } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const EditPayment = ({ payment, users, errors }) => {
  const { data, setData, put, processing } = useForm({
    user_id: payment.user_id,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("payments.update", payment.id));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Edit Payment</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">User</label>
            <select value={data.user_id} onChange={(e) => setData("user_id", e.target.value)}
              className="w-full border px-3 py-2 rounded">
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id}</p>}
          </div>

          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded" disabled={processing}>
            {processing ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditPayment;
