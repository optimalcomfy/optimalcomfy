import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
import { FileText, FileSpreadsheet, Plus, Filter, X, Check, XCircle } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import * as XLSX from 'xlsx';

import DateRangePicker from 'react-daterange-picker';
import 'react-daterange-picker/dist/css/react-calendar.css';

const Index = () => {
  const { loans, flash, pagination, auth, params } = usePage().props; 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const roleId = auth.user?.role_id;
  const [selectedLoans, setSelectedLoans] = useState([]);
  const status = params?.status || 'All';

  // Function to handle delete confirmation
  const handleDelete = (loanId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Use Inertia.delete for making the delete request
        destroy(route('loans.destroy', loanId), {
          onSuccess: () => {
            // Optionally you can handle success actions here
          },
          onError: (err) => {
            console.error('Delete error:', err);
          },
        });
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);

    router.get(route('loans.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

    const generatePDF = () => {
      const doc = new jsPDF();
      const logoUrl = '/images/logo/logo.png';
      doc.addImage(logoUrl, 'PNG', 10, 10, 80, 30);
      doc.setFontSize(14);
      doc.text(`Loans Report`, 14, 50);
      
      const columns = ["Loan number", "Employee name", "Principle","Loan due", "Status", "Loan provider"];
      
      const rows = loans.map(data => [
        data.number, 
        data.employee?.user?.name, 
        data.amount, 
        data.eventualPay,
        data.status,
        data.loan_provider?.name
      ]);
      
      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 60,
      });
      
      doc.save("loans_reports.pdf");
    };
  
    const generateExcel = () => {
      const ws = XLSX.utils.json_to_sheet(loans.map((data) => ({
        Loan_Number:data.number, 
        Employee_Name:data.employee?.user?.name, 
        Principle:data.amount, 
        Loan_due: eventualPay,
        Status:data.status,
        Loan_Provider:data.loan_provider?.name
      })));
    
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Loans');
      XLSX.writeFile(wb, 'loans_report.xlsx');
    };

    const handleSelectLoan = (id) => {
      setSelectedLoans((prev) =>
        prev.includes(id) ? prev.filter((loanId) => loanId !== id) : [...prev, id]
      );
    };
  
    const handleSelectAll = () => {
      if (selectedLoans.length === loans.length) {
        setSelectedLoans([]);
      } else {
        setSelectedLoans(loans.map((loan) => loan.id));
      }
    };
  
    const handleBulkAction = () => {
      if (selectedLoans.length === 0) {
        Swal.fire('No loans selected', 'Please select at least one loan.', 'warning');
        return;
      }
  
      Swal.fire({
        title: 'Are you sure?',
        text: `This will mark ${selectedLoans.length} loan(s) as Paid and create repayment records.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, mark as Paid!',
      }).then((result) => {
        if (result.isConfirmed) {
          router.post(route('loans.bulkUpdate'), { loanIds: selectedLoans }, {
            onSuccess: () => {
              Swal.fire('Success', 'Loans marked as Paid successfully!', 'success');
              setSelectedLoans([]);
            },
            onError: (err) => {
              console.error('Bulk update error:', err);
              Swal.fire('Error', 'Failed to update loans.', 'error');
            },
          });
        }
      });
    };


  return (
    <Layout>
      <div className="w-full">
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden mb-4">
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mobileFiltersOpen ? (
                <>
                  <X className="w-5 h-5 mr-2" /> Close Filters
                </>
              ) : (
                <>
                  <Filter className="w-5 h-5 mr-2" /> Open Filters
                </>
              )}
            </button>
          </div>

          {/* Top Section - Responsive */}
          <div className={`
            ${mobileFiltersOpen ? 'block' : 'hidden'} 
            lg:block bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4
          `}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900 w-full sm:w-auto my-auto">
              {status} Loans Directory
              </h1>
              
              <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                <Link
                  href={route('loans.create')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto flex items-center'>
                  Request for a loan
                  </span>
                </Link>
                <button
                  onClick={generatePDF}
                  disabled={loans.length === 0}
                  className="flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                    PDF
                  </span>
                </button>
                <button
                  onClick={generateExcel}
                  disabled={loans.length === 0}
                  className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                    Excel
                  </span>
                </button>
                {roleId === 1 &&
                <button
                  onClick={handleBulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mark as Paid
                </button>}
              </div>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search loans..."
            />
            {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
          </div>
        </div>
      
        {/* Flash Message */}
        {flash?.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
            <strong className="font-semibold">Success: </strong>
            {flash.success}
          </div>
        )}

        {/* Loans Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                {roleId === 1 &&
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLoans.length === loans.length}
                    onChange={handleSelectAll}
                  />
                </th>}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Loan number</th>
                {roleId !== 3 &&
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Employee Name</th>}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Principle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Loan due</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Current balance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Loan provider</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <tr key={loan.id}>
                      {roleId === 1 &&
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLoans.includes(loan.id)}
                        onChange={() => handleSelectLoan(loan.id)}
                      />
                    </td>}
                    <td className="px-6 py-4 whitespace-nowrap">{loan.number}</td>
                    {roleId !== 3 &&
                    <td className="px-6 py-4 whitespace-nowrap">{loan.employee?.user?.name}</td>}
                    <td className="px-6 py-4 whitespace-nowrap">{loan.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{loan.eventualPay}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{loan.currentBalance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{loan.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{loan.loan_provider?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('loans.show', loan.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </Link>
                        {roleId === 1 &&
                        <>
                          <Link
                            href={route('loans.edit', loan.id)}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                          >
                            Edit
                          </Link>
                          {roleId === 1 &&
                          <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleDelete(loan.id); 
                              }}
                              className="inline"
                            >
                              <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                                Delete
                              </button>
            
                          </form>}
                          </>
                        }
                        <>
                        {((loan.status === 'Pending' || loan.status === 'Declined') && roleId !== 3) && (
                          <Link
                            href={route('loans.approval', loan.id)}
                            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                          >
                            Approve
                          </Link>)}
                        </>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No loans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > pagination.per_page && (
          <div className="mt-6 flex justify-center">
            <div className="inline-flex gap-2">
              {pagination.prev_page_url && (
                <Link
                  href={pagination.prev_page_url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Previous
                </Link>
              )}
              {pagination.next_page_url && (
                <Link
                  href={pagination.next_page_url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;