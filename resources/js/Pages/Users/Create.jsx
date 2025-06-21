import React, { useState } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Eye, EyeOff } from 'lucide-react'; // Use `lucide-react` or change to your preferred icon lib

const Create = () => {
    const { data, setData, post, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        role_id: 4,
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <Layout>
            <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-semibold mb-6">Create User</h1>
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

                    {/* Password Input */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
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
                        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Create User
                    </button>
                </form>

                {/* Link to Go Back */}
                <div className="mt-6 text-center">
                    <Link href={route('users.index')} className="text-indigo-600 hover:text-indigo-800">
                        Back to Users
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Create;
