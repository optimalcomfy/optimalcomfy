import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ loan }) => {
  return (
    <Layout>
      <div className="max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Loan Details</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <strong className="text-gray-600">Loan Number:</strong> 
            <span className="text-gray-800">{loan.number}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Name:</strong> 
            <span className="text-gray-800">{loan.employee?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Principle:</strong> 
            <span className="text-gray-800">{loan.amount}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Loan Provider:</strong> 
            <span className="text-gray-800">{loan.loan_provider?.name}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Email:</strong> 
            <span className="text-gray-800">{loan.employee?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Phone:</strong> 
            <span className="text-gray-800">{loan.employee?.user?.phone}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Current balance:</strong> 
            <span className="text-gray-800">{loan.currentBalance}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Loan due:</strong> 
            <span className="text-gray-800">{loan.eventualPay}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Status:</strong> 
            <span className="text-gray-800">{loan.status}</span>
          </div>
        </div>

        <div className="mt-8 text-left">
          <Link 
            href={route('loans.index')} 
            className="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Back to Loans
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Show;
