import React, { useState, useEffect } from 'react';
import { useForm, usePage, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Select from 'react-select';

const EditLoan = ({ errors }) => {
  const { loan, employees } = usePage().props; 

  const { data, setData, put, processing } = useForm({
    amount: loan.amount,
    status: loan.status,
    disbursed_at: loan.disbursed_at,
    employee_id: loan.employee_id,
    loan_provider_id: loan.loan_provider_id
  });


  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (loan.employee_id) {
      const defaultEmployee = employees.find((c) => c.id === loan?.employee_id);
      setSelectedEmployee(defaultEmployee);
    }
  }, [loan, employees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('loans.update', { loan: loan.id })); 
  };

  const handleEmployeeChange = (selectedOption) => {
    setData('employee_id', selectedOption ? selectedOption.value : '');
    setSelectedEmployee(selectedOption);
  };

  return (
    <Layout>
      <div className="max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Edit Loan</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                  type="number"
                  step="any"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.amount && <div className="text-sm text-red-500 mt-1">{errors.amount}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              options={employees.map((employee) => ({
                value: employee.id,
                label: employee.user?.name
              }))}
              placeholder="Select a employee"
            />
            {errors.employee_id && <div className="text-sm text-red-500 mt-1">{errors.employee_id}</div>}
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={processing}
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </form>
        <Link href={route('loans.index')} className="mt-4 inline-block text-sm text-blue-600">Back to Loans</Link>
      </div>
    </Layout>
  );
};

export default EditLoan;
