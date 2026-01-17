import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaUser, 
    FaHome, 
    FaMoneyBillWave, 
    FaCheck, 
    FaTimes,
    FaClock,
    FaArrowLeft
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const HostRequests = () => {
    const { bookings, pagination, auth, flash } = usePage().props;
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleConfirmBooking = (bookingId) => {
        Swal.fire({
            title: 'Confirm Booking Request',
            text: 'Are you sure you want to approve this booking request? The guest will be asked to complete payment.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve booking',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('bookings.confirm', bookingId), {}, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        Swal.fire(
                            'Booking Approved!',
                            'The guest has been notified to complete payment.',
                            'success'
                        );
                    },
                    onError: (errors) => {
                        Swal.fire(
                            'Error!',
                            errors.message || 'There was an error confirming the booking.',
                            'error'
                        );
                    }
                });
            }
        });
    };

    const handleRejectBooking = (booking) => {
        Swal.fire({
            title: 'Reject Booking Request',
            html: `
                <p>Please provide a reason for rejecting this booking request:</p>
                <textarea id="reject-reason" class="swal2-textarea mt-3" placeholder="Enter reason here (required)" rows="4" required></textarea>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Reject Booking',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const reason = Swal.getPopup().querySelector('#reject-reason').value;
                if (!reason || reason.trim() === '') {
                    Swal.showValidationMessage('Please provide a rejection reason');
                    return false;
                }
                return reason;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('bookings.reject', booking.id), {
                    reason: result.value
                }, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        Swal.fire(
                            'Booking Rejected!',
                            'The guest has been notified of the rejection.',
                            'success'
                        );
                    },
                    onError: (errors) => {
                        Swal.fire(
                            'Error!',
                            errors.message || 'There was an error rejecting the booking.',
                            'error'
                        );
                    }
                });
            }
        });
    };

    // Show success/error messages from flash
    React.useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Success!',
                text: flash.success,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        }
        if (flash?.error) {
            Swal.fire({
                title: 'Error!',
                text: flash.error,
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    return (
        <Layout>
            <div className="max-w-7xl py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 sm:px-0 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Booking Requests</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Review and respond to booking requests for your properties
                            </p>
                        </div>
                        <Link
                            href={route('dashboard')}
                            className="flex items-center text-peachDark hover:text-peachLight"
                        >
                            <FaArrowLeft className="mr-2" /> Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Booking Requests List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <FaClock className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You don't have any pending booking requests at the moment.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {bookings.map((booking) => {
                                const nights = calculateNights(booking.check_in_date, booking.check_out_date);
                                const createdAt = new Date(booking.created_at);
                                const timeAgo = Math.floor((new Date() - createdAt) / (1000 * 60 * 60));
                                
                                return (
                                    <li key={booking.id} className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <FaUser className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="flex items-center">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {booking.user.name}
                                                            </p>
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Pending
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FaHome className="mr-1" />
                                                                {booking.property.property_name}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FaCalendarAlt className="mr-1" />
                                                                {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)} ({nights} nights)
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FaMoneyBillWave className="mr-1" />
                                                                KES {parseFloat(booking.total_price).toFixed(2)}
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <FaClock className="mr-1" />
                                                                Requested {timeAgo} hour{timeAgo !== 1 ? 's' : ''} ago
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <FaCheck className="mr-1" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectBooking(booking)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <FaTimes className="mr-1" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Guest Message */}
                                        {booking.guest_message && (
                                            <div className="mt-4 pl-14">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-gray-900">Guest Message:</p>
                                                    <p className="text-sm text-gray-600 mt-1">{booking.guest_message}</p>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {bookings.length > 0 && (
                    <div className="mt-4 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{pagination.from}</span> to{' '}
                                    <span className="font-medium">{pagination.to}</span> of{' '}
                                    <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                {pagination.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => router.get(link.url)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            link.active
                                            ? 'z-10 bg-peachDark border-peachDark text-white'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HostRequests;