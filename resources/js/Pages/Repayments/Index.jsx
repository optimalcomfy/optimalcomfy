import React, { useState } from 'react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
import { FileText, FileSpreadsheet, Plus, Filter, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import * as XLSX from 'xlsx';

const Index = () => {
  const { repayments, flash, pagination, auth } = usePage().props; // Assuming pagination data is passed
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const roleId = auth.user?.role_id;

  const {
    delete: destroy,
  } = useForm();

  // Function to handle delete confirmation
  const handleDelete = (repaymentId) => {
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
        destroy(route('repayments.destroy', repaymentId), {
          onSuccess: () => {
            // Optionally you can handle success actions here
          },
          onError: (err) => {
            // Optionally handle errors
            console.error('Delete error:', err);
          },
        });
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);

    router.get(route('repayments.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoUrl = '/images/logo/logo.png';
    doc.addImage(logoUrl, 'PNG', 10, 10, 80, 30);
    doc.setFontSize(14);
    doc.text(`Repayments Report`, 14, 50);
    
    const columns = ["Loan number", "Employee name", "Amount", "Status", "Loan provider"];
    
    const rows = loans.map(data => [
      data.number, 
      data.employee?.user?.name, 
      data.amount, 
      data.status,
      data.loan_provider?.name
    ]);
    
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 60,
    });
    
    doc.save("repayments_reports.pdf");
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(loans.map((data) => ({
      Loan_Number:data.number, 
      Employee_Name:data.employee?.user?.name, 
      Amount:data.amount, 
      Status:data.status,
      Loan_Provider:data.loan_provider?.name
    })));
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loans');
    XLSX.writeFile(wb, 'repayments_report.xlsx');
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
                Repayments Directory
              </h1>
              
              <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                {roleId === 1 &&
                <Link
                  href={route('repayments.create')}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                  Create
                  </span>
                </Link>}
                <button
                  onClick={generatePDF}
                  disabled={repayments.length === 0}
                  className="flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                    PDF
                  </span>
                </button>
                <button
                  onClick={generateExcel}
                  disabled={repayments.length === 0}
                  className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                    Excel
                  </span>
                </button>
              </div>
          </div>

            {/* Search Input */}
            <div className="mt-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search repayments..."
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

        {/* Repayments Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Repayment Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Loan amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {repayments.length > 0 ? (
                repayments.map((repayment) => (
                  <tr key={repayment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{repayment.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{repayment?.loan?.employee?.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{repayment?.loan?.employee?.company?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{repayment?.loan?.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{repayment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('repayments.show', repayment.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </Link>
                        {roleId === 1 &&
                        <Link
                          href={route('repayments.edit', repayment.id)}
                          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
                        >
                          Edit
                        </Link>}
                        {roleId === 1 &&
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleDelete(repayment.id); // Call SweetAlert2 on delete
                          }}
                          className="inline"
                        >
                          <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                            Delete
                          </button>
                        </form>}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No repayments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > pagination.per_page && (
          <div className="my-6 flex justify-center">
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
