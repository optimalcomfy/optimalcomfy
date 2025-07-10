import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaMoneyBillWave, FaCheckCircle, FaArrowLeft, FaCarSide, FaGasPump, FaCogs, FaTachometerAlt, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CarBookingShow = () => {
  const { carBooking: booking, auth } = usePage().props;
  const roleId = parseInt(auth.user?.role_id);
  // Calculate number of days
  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // Car features mapping (would need actual feature data)
  const featureIcons = {
    'AC': <FaCarSide className="text-blue-500" />,
    'Automatic': <FaCogs className="text-purple-500" />,
    'Manual': <FaCogs className="text-green-500" />,
    '4WD': <FaCar className="text-red-500" />,
    'GPS': <FaMapMarkerAlt className="text-yellow-500" />,
    'Bluetooth': <FaTachometerAlt className="text-indigo-500" />,
    'Petrol': <FaGasPump className="text-orange-500" />,
    'Diesel': <FaGasPump className="text-gray-500" />,
  };

  const handleCheckIn = () => {
    const toMysqlDatetime = () => {
      const date = new Date();
      return date.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
    };

    Swal.fire({
      title: 'Confirm Check-In',
      text: 'Are you sure you want to check in this car rental?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, check in'
    }).then((result) => {
      if (result.isConfirmed) {
        router.put(route('car-bookings.update', booking.id), {
          checked_in: toMysqlDatetime(),
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Checked In!',
              'Car rental has been successfully checked in.',
              'success'
            );
          },
          onError: () => {
            Swal.fire(
              'Error!',
              'There was an error checking in the car rental.',
              'error'
            );
          }
        });
      }
    });
  };

  const handleCheckOut = () => {
    const toMysqlDatetime = () => {
      const date = new Date();
      return date.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
    };

    Swal.fire({
      title: 'Confirm Check-Out',
      text: 'Are you sure you want to check out this car rental?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, check out'
    }).then((result) => {
      if (result.isConfirmed) {
        router.put(route('car-bookings.update', booking.id), {
          checked_out: toMysqlDatetime(),
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Checked Out!',
              'Car rental has been successfully checked out.',
              'success'
            );
          },
          onError: () => {
            Swal.fire(
              'Error!',
              'There was an error checking out the car rental.',
              'error'
            );
          }
        });
      }
    });
  };

  const getBookingStatus = () => {
    if (booking.checked_out) return 'checked_out';
    if (booking.checked_in) return 'checked_in';
    return 'confirmed';
  };

  const bookingStatus = getBookingStatus();

  return (
    <Layout>
      <div className="max-w-7xl p-4">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          {roleId !== 4 &&
          <Link
            href={route('car-bookings.index')}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Bookings
          </Link>}
          <h1 className="text-3xl font-bold text-gray-800">Car Rental Details</h1>
        </div>

        {/* Status banner with check-in/out buttons */}
        <div className={`mb-6 rounded-r p-4 border-l-4 ${
          bookingStatus === 'checked_in' ? 'bg-blue-50 border-blue-500' :
          bookingStatus === 'checked_out' ? 'bg-purple-50 border-purple-500' :
          'bg-green-50 border-green-500'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className={`h-5 w-5 ${
                  bookingStatus === 'checked_in' ? 'text-blue-500' :
                  bookingStatus === 'checked_out' ? 'text-purple-500' :
                  'text-green-500'
                }`} />
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <span className="font-medium">{booking.car.brand} {booking.car.model} ({booking.car.license_plate})</span> - 
                  Status: <span className="font-bold capitalize">{bookingStatus}</span>
                </p>
              </div>
            </div>
            {roleId !== 3 &&
            <div className="flex space-x-2">
              {!booking.checked_in && !booking.checked_out && (
                <button
                  onClick={handleCheckIn}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  <FaSignInAlt className="mr-2" /> Check In
                </button>
              )}
              {booking.checked_in && !booking.checked_out && (
                <button
                  onClick={handleCheckOut}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  <FaSignOutAlt className="mr-2" /> Check Out
                </button>
              )}
            </div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Booking summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3 bg-gray-100 flex items-center justify-center">
                  {booking.car.initial_gallery.length > 0 ? (
                    <img 
                      className="h-48 w-full object-cover md:h-full" 
                      src={`/storage/${booking.car.initial_gallery[0].image}`} 
                      alt={`${booking.car.brand} ${booking.car.model}`}
                    />
                  ) : (
                    <FaCar className="h-32 w-32 text-gray-400" />
                  )}
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
                    {booking.car.category?.name || 'SUV'}
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {booking.car.brand} {booking.car.model} ({booking.car.year})
                  </h2>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-gray-600">
                      <FaTachometerAlt className="mr-1" />
                      <span>{booking?.car?.mileage?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaGasPump className="mr-1" />
                      <span className="capitalize">{booking.car.fuel_type}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-1" />
                      <span>{booking.car.seats} seats</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCar className="mr-1" />
                      <span className="capitalize">{booking.car.exterior_color}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Pick-up Date</p>
                      <p className="font-medium">{startDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Drop-off Date</p>
                      <p className="font-medium">{endDate.toLocaleDateString('en-US', { 
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

            {/* Location details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaMapMarkerAlt className="inline mr-2" /> Pickup & Drop-off Locations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{booking.pickup_location}</p>
                  <p className="text-sm text-gray-600 mt-1">{booking.car.location_address}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Drop-off Location</p>
                  <p className="font-medium">{booking.dropoff_location}</p>
                  <p className="text-sm text-gray-600 mt-1">Same as pickup location</p>
                </div>
              </div>
            </div>

            {/* Special requests */}
            {booking.special_requests && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  Special Requests
                </h3>
                <p className="text-gray-700">{booking.special_requests}</p>
              </div>
            )}

            {/* Car features */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                Car Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {booking.car.car_features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div className="text-lg">
                      <i className={`${feature?.feature?.icon} w-5 text-black`}></i>
                    </div>
                    <span className="text-sm font-medium">Feature {feature.feature?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Payment summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaMoneyBillWave className="inline mr-2" /> Rental Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{days} day{days !== 1 ? 's' : ''} × {booking.car.platform_price}</span>
                  <span className="font-medium">KES {parseFloat(booking.car.platform_price) * days}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">KES 0.00</span>
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
                    <p className="text-sm text-blue-700">
                      Payment Status: <span className={`font-bold ${booking.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Host details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaUser className="inline mr-2" /> Host Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Host Name</p>
                  <p className="font-medium">{booking.car.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium">{booking.car.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{booking.car.user.email}</p>
                </div>
              </div>
            </div>

            {/* Rental timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                <FaCalendarAlt className="inline mr-2" /> Rental Timeline
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
                            <p className="text-sm text-gray-500">Booking confirmed on <time dateTime={booking.created_at}>{new Date(booking.created_at).toLocaleString()}</time></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {booking.checked_in && (
                    <li>
                      <div className="relative pb-8">
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <FaSignInAlt className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Checked in on <time dateTime={booking.checked_in}>{new Date(booking.checked_in).toLocaleString()}</time></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  {booking.checked_out && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                              <FaSignOutAlt className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">Checked out on <time dateTime={booking.checked_out}>{new Date(booking.checked_out).toLocaleString()}</time></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Help section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                Need Assistance?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact us if you need help with your rental or have any questions.
              </p>
              <a href={`tel:${booking.user?.contact_phone}`} className="px-8 py-2 text-center justify-center flex items-center w-full bg-peachDark hover:bg-blue-700 text-white rounded-md transition duration-150">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarBookingShow;