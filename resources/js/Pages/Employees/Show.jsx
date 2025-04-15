import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Show = ({ employee, user, company }) => {

  const [previews] = useState({
      id_front: employee?.id_front ? `/storage/${employee?.id_front}` : null,
      id_back: employee?.id_back ? `/storage/${employee?.id_back}` : null,
      passport_front: employee?.passport_front ? `/storage/${employee?.passport_front}` : null,
      passport_front: employee?.passport_front ? `/storage/${employee?.passport_front}` : null
  });

  return (
    <Layout>
      <div className="max-w-full bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-left mb-6">Employee Details</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 card">
            {previews.passport_front && (
                <div className="card relative flex flex-col">
                    <img
                        src={previews.passport_front}
                        alt="ID Front"
                        className="w-full h-[20vh] object-cover rounded-md"
                    />
                    <p>Passport photo</p>
                </div>
            )}
            <div className="flex justify-between">
              <strong className="text-gray-600">Name:</strong> 
              <span className="text-gray-800">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Salary:</strong> 
              <span className="text-gray-800">{employee.salary}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Loan limit:</strong> 
              <span className="text-gray-800">{employee.loan_limit}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Email:</strong> 
              <span className="text-gray-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Phone:</strong> 
              <span className="text-gray-800">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">ID number:</strong> 
              <span className="text-gray-800">{employee.id_number}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Company:</strong> 
              <span className="text-gray-800">{company.name}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Approved:</strong> 
              <span className="text-gray-800">{employee.approved}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Unpaid loans:</strong> 
              <span className="text-gray-800">{employee.unpaid_loans_count}</span>
            </div>
            <div className="flex justify-between">
              <strong className="text-gray-600">Total loan balance:</strong> 
              <span className="text-gray-800">{employee.total_loan_balance}</span>
            </div>
          </div>

          <div className="card">
              <div className="flex flex-col lg:flex-row gap-4">
                  {previews.id_front && (
                      <div className="card relative flex flex-col">
                          <img
                              src={previews.id_front}
                              alt="ID Front"
                              className="w-full h-[20vh] object-cover rounded-md"
                          />
                          <p>ID front</p>
                      </div>
                  )}
                  {previews.id_back && (
                      <div className="card relative flex flex-col">
                          <img
                              src={previews.id_back}
                              alt="ID Back"
                              className="w-full h-[20vh] object-cover rounded-md"
                          />
                          <p>ID back</p>
                      </div>
                  )}
              </div>
          </div>
        </div>

        <div className="mt-8 text-left">
          <Link 
            href={route('employees.index')} 
            className="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Back to Employees
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Show;
