import React, { useState } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Eye, EyeOff } from 'lucide-react'; // Make sure you have this installed or use your preferred icon set

const EditUser = ({ errors }) => {
  const { user } = usePage().props;

  const { data, setData, put, processing } = useForm({
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('users.update', { user: user.id }));
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Edit User</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
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

          {/* Email Input */}
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

          {/* Phone Input */}
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

          {/* Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
            <input
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="mt-1 block w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 right-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            {errors.password && <div className="text-sm text-red-500 mt-1">{errors.password}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={processing}
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>

        <Link href={route('users.index')} className="mt-4 inline-block text-sm text-blue-600">
          Back to Users
        </Link>
      </div>
    </Layout>
  );
};

export default EditUser;
