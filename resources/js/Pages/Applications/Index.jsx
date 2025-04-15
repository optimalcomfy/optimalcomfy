import React, { useState } from 'react';
import { Link, usePage,router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FileText, FileSpreadsheet, Plus, Filter, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Index = () => {
  const { applications, flash, pagination, auth } = usePage().props; // Assuming pagination data is passed
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const roleId = auth.user?.role_id;

    const {
      delete: destroy,
    } = useForm();

  // Function to handle delete confirmation
  const handleDelete = (applicationId) => {
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
        destroy(route('applications.destroy', applicationId), {
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

    router.get(route('applications.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoUrl = '/images/logo/logo.png';
    doc.addImage(logoUrl, 'PNG', 10, 10, 80, 30);
    doc.setFontSize(14);
    doc.text(`applications Report`, 14, 50);
    
    const columns = ["User", "Message", "Is read"];
    
    const rows = applications.map(data => [
      data.user?.name, 
      data.message, 
      data.is_read
    ]);
    
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 60,
    });
    
    doc.save("applications_reports.pdf");
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(applications.map((data) => ({
      Name: data.user?.name,
      Message: data.message,
      IsRead: data.is_read
    })));
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'applications');
    XLSX.writeFile(wb, 'applications_report.xlsx');
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
                Applications Directory
              </h1>
              
              <div className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={generatePDF}
                  disabled={applications.length === 0}
                  className="flex cursor-pointer items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2 my-auto" />
                  <span className='my-auto'>
                    PDF
                  </span>
                </button>
                <button
                  onClick={generateExcel}
                  disabled={applications.length === 0}
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
              placeholder="Search applications..."
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

        {/* applications Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{application.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{application.user?.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{application.user?.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{application.job?.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{application.job?.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('jobs.show', application.job?.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View job
                        </Link>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleDelete(application.id); // Call SweetAlert2 on delete
                          }}
                          className="inline"
                        >
                          <button type="submit" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No applications found.</td>
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
