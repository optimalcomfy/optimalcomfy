import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';  

const Create = () => {
    const { companies } = usePage().props; 

    const companyOptions = companies.map(company => ({
        value: company.id,
        label: company.name
    }));

    const { data, setData, post, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        role_id: 2, 
        password: '1234boys',  
        company_id: '', 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleCompanyChange = (selectedOption) => {
        setData('company_id', selectedOption ? selectedOption.value : ''); 
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

                    {/* Company Select (React Select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <Select
                            options={companyOptions}
                            value={companyOptions.find(option => option.value === data.company_id)}  // Set selected option
                            onChange={handleCompanyChange}
                            className="mt-1 block w-full py-2"
                            placeholder="Select a company"
                        />
                        {errors.company_id && <div className="text-sm text-red-500 mt-1">{errors.company_id}</div>}
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
