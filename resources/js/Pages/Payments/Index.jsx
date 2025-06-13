import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const IndexPayments = ({ payments }) => {
  return (
    <Layout>
      <div className="w-full mr-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold mb-4">Payments</h1>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Method</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td className="border px-4 py-2">{payment.id}</td>
                <td className="border px-4 py-2">{payment.user?.name || "N/A"}</td>
                <td className="border px-4 py-2">${payment.amount}</td>
                <td className="border px-4 py-2">{payment.method}</td>
                <td className="border px-4 py-2">{payment.status}</td>
                <td className="border px-4 py-2">
                  <Link href={route("payments.show", payment.id)} className="text-blue-peach mr-2">View</Link>
                  <Link href={route("payments.edit", payment.id)} className="text-green-500 mr-2">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default IndexPayments;
