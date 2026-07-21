import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";

const Approval = () => {
  const { repaymentFailure, auth, repayment } = usePage().props;
  
  // Determine if the repayment was successful
  const isSuccess = repayment.status === 'Approved';
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Alert Card */}
        <div className={`rounded-lg border-l-4 p-6 shadow-lg ${
          isSuccess 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          {/* Alert Icon and Title */}
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 ${
              isSuccess ? 'text-green-400' : 'text-red-400'
            }`}>
              {isSuccess ? (
                // Success Icon
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                // Error Icon
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-4">
              <h2 className={`text-xl font-bold ${
                isSuccess ? 'text-green-800' : 'text-red-800'
              }`}>
                {isSuccess ? 'Disbursement Successful!' : 'Disbursement Failed'}
              </h2>
            </div>
          </div>

          {/* Alert Message */}
          <div className={`mb-6 ${
            isSuccess ? 'text-green-700' : 'text-red-700'
          }`}>
            <p className="text-base leading-relaxed">
              {repaymentFailure}
            </p>
          </div>

          {/* Repayment Details Summary */}
          <div className={`bg-white rounded-md p-4 mb-6 border ${
            isSuccess ? 'border-green-200' : 'border-red-200'
          }`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Repayment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Repayment #:</span>
                <span className="ml-2 text-gray-800">{repayment.number}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Amount:</span>
                <span className="ml-2 text-gray-800">{repayment.amount}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  isSuccess 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {repayment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={route('repayments.index')}
              className="inline-flex items-center justify-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              <svg className="h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Repayments
            </Link>
            
            {!isSuccess && (
              <a
                href="mailto:support@centiflow.com"
                className="inline-flex items-center justify-center px-6 py-3 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium"
              >
                <svg className="h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Approval;