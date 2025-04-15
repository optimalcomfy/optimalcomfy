import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ company }) => {
  return (
    <Layout>
      <div className="max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Company Details</h1>
        
        <div className="space-y-4">
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
