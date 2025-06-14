import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaHome, FaMoneyBillWave, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const BookingShow = () => {
  const { booking } = usePage().props;
  
  // Calculate number of nights
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return (
    <Layout>
      <div className="max-w-7xl p-4">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link
            href={route('bookings.index')}
            className="flex items-center text-peachDark mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Bookings
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Booking Confirmation</h1>
        </div>

        {/* Success banner */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your booking status at <span className="font-medium">{booking.property.property_name}</span> is {booking.status}!
                Booking ID: <span className="font-mono font-bold">#{booking.id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Booking summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3">
                  <img 
                    className="h-48 w-full object-cover md:h-full" 
                    src={`/storage/${booking.property.initial_gallery[0]?.image}` || '/images/default-property.jpg'} 
                    alt={booking.property.property_name}
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="uppercase tracking-wide text-sm text-peachDark font-semibold">
                    {booking.property.type}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {booking.property.property_name}
                  </h2>
                  <div className="mt-2 flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{booking.property.location}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaUser className="inline mr-2" /> Guest Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{booking.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{booking.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{booking.user.address}, {booking.user.city}, {booking.user.country}</p>
                </div>
              </div>
            </div>

            {/* Host details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaHome className="inline mr-2" /> Host Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Host Name</p>
                  <p className="font-medium">{booking.property.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium">{booking.property.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.property.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Payment summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaMoneyBillWave className="inline mr-2" /> Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{nights} night{nights !== 1 ? 's' : ''} × {booking.property.price_per_night}</span>
                  <span className="font-medium">KES {parseFloat(booking.property.price_per_night) * nights}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total</span>
                  <span>KES {booking.total_price}</span>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-peachDark">
                      Payment Status: <span className={`font-bold ${booking.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaCalendarAlt className="inline mr-2" /> Booking Timeline
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Booking confirmed on <time dateTime={booking.created_at}>{new Date(booking.created_at).toLocaleDateString()}</time></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-peachDark flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Check-in on <time dateTime={booking.check_in_date}>{new Date(booking.check_in_date).toLocaleDateString()}</time></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Help section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have any questions about your booking, please contact our customer support.
              </p>
              <a  href={`tel:${booking.user?.contact_phone}`} className="px-8 py-2 text-center justify-center flex items-center w-full bg-peachDark hover:bg-blue-700 text-white rounded-md transition duration-150">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingShow;