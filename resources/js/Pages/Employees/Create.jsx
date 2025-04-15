import React from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';  

const Create = () => {
    const { companies, users, auth } = usePage().props; 
    const roleId = auth.user?.role_id;

    const companyOptions = companies.map(company => ({
        value: company.id,
        label: company.name
    }));

    const userOptions = users.map(user => ({
      value: user.id,
      label: user.name
    }));

    const { data, setData, post, errors } = useForm({
      salary: '',
      loan_limit: '',
      user_id: '',
      company_id: roleId === 2 ? auth.user?.company_id : '',
      approved: '',   
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('employees.store'));
    };

    const handleCompanyChange = (selectedOption) => {
        setData('company_id', selectedOption ? selectedOption.value : ''); 
    };

    const handleUserChange = (selectedOption) => {
        setData('user_id', selectedOption ? selectedOption.value : ''); 
    };

    const handleApprovalChange = (e) => {
        setData('approved', e.target.value);
    };

    return (
        <Layout>
            <div className="max-w-2xl bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-semibold mb-6">Create Employee</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Salary</label>
                        <input
                            type="number"
                            step="any"
                            value={data.salary}
                            onChange={(e) => setData('salary', e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.salary && <div className="text-sm text-red-500 mt-1">{errors.salary}</div>}
                    </div>

                    {/* Phone Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Loan limit</label>
                        <input
                            type="number"
                            step="any"
                            value={data.loan_limit}
                            onChange={(e) => setData('loan_limit', e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.loan_limit && <div className="text-sm text-red-500 mt-1">{errors.loan_limit}</div>}
                    </div>


                    {/* Company Select (React Select) */}
                    {roleId === 1 &&
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <Select
                            options={companyOptions}
                            value={companyOptions.find(option => option.value === data.company_id)}  // Set selected option
                            onChange={handleCompanyChange}
                            className="mt-1 block w-full py-2 rounded-md focus:outline-none"
                            placeholder="Select a company"
                        />
                        {errors.company_id && <div className="text-sm text-red-500 mt-1">{errors.company_id}</div>}
                    </div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">User</label>
                        <Select
                            options={userOptions}
                            value={userOptions.find(option => option.value === data.user_id)} 
                            onChange={handleUserChange}
                            className="mt-1 w-full py-2 rounded-md focus:outline-none"
                            placeholder="Select a user"
                        />
                        {errors.user_id && <div className="text-sm text-red-500 mt-1">{errors.user_id}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Approved</label>
                        <select
                        value={data.approved}
                        onChange={handleApprovalChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                        <option value="">Select approval...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                        </select>
                        {errors.approved && <div className="text-sm text-red-500 mt-1">{errors.approved}</div>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Create Employee
                    </button>
                </form>

                {/* Link to Go Back */}
                <div className="mt-6 text-center">
                    <Link href={route('employees.index')} className="text-indigo-600 hover:text-indigo-800">
                        Back to Employees
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Create;
