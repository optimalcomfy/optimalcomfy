import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ repayment }) => {
  return (
    <Layout>
      <div className="max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Repayment Details</h1>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <strong className="text-gray-600">Repayment Number:</strong>
            <span className="text-gray-800">{repayment.number}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Employee Name:</strong>
            <span className="text-gray-800">{repayment?.loan?.employee?.user?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Company Name:</strong>
            <span className="text-gray-800">{repayment?.loan?.employee?.company?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Loan Amount:</strong>
            <span className="text-gray-800">{repayment?.loan?.amount || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Repayment Amount:</strong>
            <span className="text-gray-800">{repayment.amount}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Company Phone:</strong>
            <span className="text-gray-800">{repayment?.loan?.employee?.company?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-gray-600">Company Email:</strong>
            <span className="text-gray-800">{repayment?.loan?.employee?.company?.email || 'N/A'}</span>
          </div>
        </div>

        <div className="mt-8 text-left">
          <Link 
            href={route('repayments.index')} 
            className="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Back to Repayments
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Show;
