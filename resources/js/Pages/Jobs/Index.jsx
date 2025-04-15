import React, { useState } from 'react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FileText, Plus, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Swal from 'sweetalert2';

const Index = () => {
  const { jobs, flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { delete: destroy } = useForm();

  const handleDelete = (jobId) => {
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
        destroy(route('jobs.destroy', jobId), {
          onSuccess: () => {},
          onError: (err) => console.error('Delete error:', err),
        });
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);
    
    router.get(route('jobs.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Job Listings Report`, 14, 20);
    const columns = ["Title", "Company", "Location", "Type", "Salary Range"];
    const rows = jobs.map(job => [
      job.title, 
      job.company_name, 
      job.location, 
      job.job_type, 
      `$${job.salary_min} - $${job.salary_max}`
    ]);
    
    doc.autoTable({ head: [columns], body: rows, startY: 30 });
    doc.save("jobs_report.pdf");
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Job Listings</h1>
          <div className="flex gap-2">
            <Link href={route('jobs.create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Post Job
            </Link>
            <button onClick={generatePDF} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <FileText className="w-4 h-4 mr-2" /> PDF
            </button>
          </div>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Search jobs..."
        />
        {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
        
        {flash?.success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-900">
            <strong>Success: </strong>{flash.success}
          </div>
        )}

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg mt-4">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Job Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Salary</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4">{job.title}</td>
                    <td className="px-6 py-4">{job.company_name}</td>
                    <td className="px-6 py-4">{job.location}</td>
                    <td className="px-6 py-4">{job.job_type}</td>
                    <td className="px-6 py-4">${job.salary_min} - ${job.salary_max}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('jobs.show', job.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </Link>
                        <button onClick={() => handleDelete(job.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
