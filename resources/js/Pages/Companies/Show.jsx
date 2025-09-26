import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ company }) => {
  const [activeTab, setActiveTab] = useState("Employees");

  const tabs = [
    "Employees",
    "Loans",
    "Approved Loans",
    "Pending Loans",
    "Declined Loans",
    "Repayments"
  ];

  return (
    <Layout>
      <div className="max-w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Ristay information</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 card">
            <div className="flex justify-between">
              <strong className="text-gray-600">Name:</strong>
              <span className="text-gray-800">{company.name}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Industry:</strong>
              <span className="text-gray-800">{company.industry}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Address:</strong>
              <span className="text-gray-800">{company.address}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Email:</strong>
              <span className="text-gray-800">{company.email}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Phone:</strong>
              <span className="text-gray-800">{company.phone}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Platform rate:</strong>
              <span className="text-gray-800">{company.percentage}%</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Referral percentage rate:</strong>
              <span className="text-gray-800">{company.referral_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Booking Referral percentage rate:</strong>
              <span className="text-gray-800">{company.booking_referral_percentage}%</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-left">
          <Link
            href={route('companies.index')}
            className="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Back to Companies
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Show;
