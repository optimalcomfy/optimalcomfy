import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Create = () => {
  const { data, setData, post, errors } = useForm({
    name: '',
    api_url: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('loanProviders.store'));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Create Loan Provider</h1>
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
            <label className="block text-sm font-medium text-gray-700">Api_url</label>
            <input
              type="text"
              value={data.api_url}
              onChange={(e) => setData('api_url', e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.api_url && <div className="text-sm text-red-500 mt-1">{errors.api_url}</div>}
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

          <button
            type="submit"
            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href={route('loanProviders.index')} className="text-indigo-600 hover:text-indigo-800">
            Back to loan providers
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
