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
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Company Details</h1>

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
          </div>

          <div className="card">
            <div className="flex justify-center">
              <nav className="flex overflow-x-auto items-center p-1 space-x-1 rtl:space-x-reverse text-sm text-gray-600 bg-gray-500/5 rounded-xl dark:bg-gray-500/20">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    type="button"
                    className={`flex whitespace-nowrap items-center h-8 px-5 font-medium rounded-lg outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-inset ${
                      activeTab === tab ? "text-yellow-600 shadow bg-white dark:text-white dark:bg-yellow-600" : "hover:text-gray-800 focus:text-yellow-600 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              {activeTab === "Employees" && <p>List of Employees</p>}
              {activeTab === "Loans" && <p>List of Loans</p>}
              {activeTab === "Approved Loans" && <p>Approved Loans</p>}
              {activeTab === "Pending Loans" && <p>Pending Loans</p>}
              {activeTab === "Declined Loans" && <p>Declined Loans</p>}
              {activeTab === "Repayments" && <p>Loan Repayments</p>}
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
