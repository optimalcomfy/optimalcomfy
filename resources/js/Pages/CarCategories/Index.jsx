import React, { useState } from 'react';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
import { Filter, X, Edit, Trash2, Plus } from 'lucide-react';

const Indexcategories = () => {
  const { categories, pagination, flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { delete: destroy } = useForm();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);

    router.get(route('car-categories.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const handleDelete = (categoryId) => {
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
        destroy(route('car-categories.destroy', categoryId), {
          onSuccess: () => {
            // Optionally handle success
          },
          onError: (err) => {
            console.error('Delete error:', err);
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
              Ride Categories
            </h1>
            <div className="w-full sm:w-auto">
              <Link 
                href={route('car-categories.create')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Category
              </Link>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search categories..."
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

        {/* Categories Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagination.data?.length > 0 ? (
                pagination.data.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-wrap font-medium">{category.name}</td>
                    <td className="px-6 py-4 whitespace-wrap text-gray-500">{category.slug}</td>
                    <td className="px-6 py-4 whitespace-wrap">{category.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-wrap text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="my-6 overflow-x-auto flex justify-center">
            <div className="flex items-center gap-2">
              {/* Previous Page Link */}
              {pagination.prev_page_url ? (
                <Link
                  href={pagination.prev_page_url}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                  preserveState
                >
                  Previous
                </Link>
              ) : (
                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Previous
                </span>
              )}

              {/* Page Numbers */}
              {pagination.links.map((link, index) => (
                <React.Fragment key={index}>
                  {link.url ? (
                    <Link
                      href={link.url}
                      className={`px-4 py-2 rounded-lg ${
                        link.active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                      }`}
                      preserveState
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </Link>
                  ) : (
                    <span
                      className={`px-4 py-2 rounded-lg ${
                        link.active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-400'
                      }`}
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </span>
                  )}
                </React.Fragment>
              ))}

              {/* Next Page Link */}
              {pagination.next_page_url ? (
                <Link
                  href={pagination.next_page_url}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                  preserveState
                >
                  Next
                </Link>
              ) : (
                <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Indexcategories;