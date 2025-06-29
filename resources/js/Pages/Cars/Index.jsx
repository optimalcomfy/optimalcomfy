import React, { useState } from 'react';
import { usePage, Link, router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Swal from 'sweetalert2';
import { Filter, X } from 'lucide-react';

const CarsIndex = () => {
  const { cars, pagination, flash, auth } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const roleId = parseInt(auth.user?.role_id);

  const {
    delete: destroy,
  } = useForm();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setLoading(true);

    router.get(route('main-cars.index'), { search: e.target.value }, {
      preserveState: true,
      onFinish: () => setLoading(false),
    });
  };

  const handleDelete = (carId) => {
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
        destroy(route('main-cars.destroy', carId), {
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
        {/* Header Section */}
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
              Rides List
            </h1>
            <div className="w-full sm:w-auto">
              <Link 
                href={route('main-cars.create')} 
                className="inline-flex items-center px-4 py-2 bg-peachDark text-white rounded-md hover:bg-peachDarker transition-colors"
              >
                Add New Ride
              </Link>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-peach"
              placeholder="Search rides..."
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

        {/* Cars Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">License plate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Price/Day</th>
                {roleId === 1 &&
                <>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Platform charges</th>
                </>}
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pagination.data?.length > 0 ? (
                pagination.data.map((car) => (
                  <tr key={car.id}>
                    <td className="px-6 py-4 whitespace-wrap">{car.name}</td>
                    <td className="px-6 py-4 whitespace-wrap">{car.license_plate || '-'}</td>
                    <td className="px-6 py-4 whitespace-wrap">{car.brand}</td>
                    <td className="px-6 py-4 whitespace-wrap">{car.model}</td>
                    <td className="px-6 py-4 whitespace-wrap">{car.year}</td>
                    <td className="px-6 py-4 whitespace-wrap">{car.price_per_day}</td>
                    {roleId === 1 &&
                    <>
                    <td className="px-6 py-4 whitespace-wrap">KES {car.platform_price}</td>
                    <td className="px-6 py-4 whitespace-wrap">KES {car.platform_charges}</td>
                    </>}
                    <td className="px-6 py-4 whitespace-wrap text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={route('main-cars.show', car.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View
                        </Link>
                        <Link
                          href={route('main-cars.edit', car.id)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">No rides found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="my-6 flex justify-center">
            <div className="flex items-center gap-2">
              {/* Previous Page Link */}
              {pagination.prev_page_url ? (
                <Link
                  href={pagination.prev_page_url}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                      preserveState
                    >
                      {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                    </Link>
                  ) : (
                    <span
                      className={`px-4 py-2 rounded-lg ${
                        link.active
                          ? 'bg-blue-600 text-white'
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
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

export default CarsIndex;