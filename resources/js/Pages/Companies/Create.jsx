import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Create = () => {
  const { data, setData, post, errors } = useForm({
    name: '',
    industry: '',
    address: '',
    email: '',
    phone: '',
    percentage: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('companies.store'));
  };

  return (
    <Layout>
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create Company</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && <div className="text-sm text-red-500 mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <input
              type="text"
              value={data.industry}
              onChange={(e) => setData('industry', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.industry && <div className="text-sm text-red-500 mt-1">{errors.industry}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.address && <div className="text-sm text-red-500 mt-1">{errors.address}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && <div className="text-sm text-red-500 mt-1">{errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.phone && <div className="text-sm text-red-500 mt-1">{errors.phone}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Loan percentage</label>
            <input
              type="text"
              value={data.percentage}
              onChange={(e) => setData('percentage', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.percentage && <div className="text-sm text-red-500 mt-1">{errors.percentage}</div>}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('companies.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to Companies
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
