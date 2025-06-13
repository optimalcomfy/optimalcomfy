import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

const ShowPayment = ({ payment }) => {
  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-lg font-bold">Payment Details</h1>
        <p><strong>User:</strong> {payment.user?.name || "N/A"}</p>
        <p><strong>Amount:</strong> ${payment.amount}</p>
        <p><strong>Method:</strong> {payment.method}</p>
        <p><strong>Status:</strong> {payment.status}</p>

        <Link href={route("payments.index")} className="mt-4 inline-block text-peach">Back to Payments</Link>
      </div>
    </Layout>
  );
};

export default ShowPayment;
