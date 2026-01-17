import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Car, Phone, Mail, Clock, Check, X, Eye, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Layout from "@/Layouts/layout/layout.jsx";

const CarBookingsHostRequests = () => {
  const { bookings, pagination, flash } = usePage().props;
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleConfirmBooking = async (bookingId) => {
    setProcessingId(bookingId);
    
    try {
      await router.post(route('car-bookings.confirm', bookingId), {}, {
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'Booking Confirmed!',
            text: 'The booking has been confirmed. Guest has been notified to complete payment.',
            confirmButtonColor: '#10b981',
          });
        },
        onError: (errors) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errors.message || 'Failed to confirm booking',
            confirmButtonColor: '#ef4444',
          });
        }
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Reason Required',
        text: 'Please provide a reason for rejecting this booking.',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    setProcessingId(selectedBooking.id);
    
    try {
      await router.post(route('car-bookings.reject', selectedBooking.id), {
        reason: rejectReason
      }, {
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'Booking Rejected',
            text: 'The booking request has been rejected. Guest has been notified.',
            confirmButtonColor: '#10b981',
          });
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedBooking(null);
        },
        onError: (errors) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errors.message || 'Failed to reject booking',
            confirmButtonColor: '#ef4444',
          });
        }
      });
    } catch (error) {
      console.error('Error rejecting booking:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Layout>
    <div className="">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={route('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Car Booking Requests</h1>
              <p className="text-gray-600">Review and manage booking requests for your cars</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.created_at);
                    const now = new Date();
                    return bookingDate.getMonth() === now.getMonth() && 
                           bookingDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {bookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0).toLocaleString()}
                </p>
              </div>
              <Car className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
            <p className="text-sm text-gray-600">These bookings require your confirmation</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-600">You don't have any car booking requests at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const days = calculateDays(booking.start_date, booking.end_date);
                
                return (
                  <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-rose-100 rounded-lg flex items-center justify-center">
                              <Car className="w-8 h-8 text-orange-500" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                Request #{booking.number}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(booking.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-1">{booking.car?.name}</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{booking.user?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                  {days} day{days !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{booking.guest_phone || 'Not provided'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{booking.car?.license_plate}</span>
                              </div>
                            </div>
                            
                            {booking.guest_message && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Guest message:</span> {booking.guest_message}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex items-center gap-4">
                              <div className="text-lg font-bold text-gray-900">
                                KES {parseFloat(booking.total_price).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                KES {(parseFloat(booking.total_price) / days).toLocaleString()} per day
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 lg:w-auto">
                        <Link
                          href={route('car-bookings.show', booking.id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4" />
                          View Details
                        </Link>
                        
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={processingId === booking.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === booking.id ? (
                            <Loader2 className="h-4 animate-spin" />
                          ) : (
                            <Check className="h-4" />
                          )}
                          {processingId === booking.id ? 'Processing...' : 'Approve Booking'}
                        </button>
                        
                        <button
                          onClick={() => openRejectModal(booking)}
                          disabled={processingId === booking.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <X className="h-4" />
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.total > pagination.per_page && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagination.from}</span> to{' '}
              <span className="font-medium">{pagination.to}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex gap-2">
              {pagination.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    link.active
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                  preserveScroll
                >
                  {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Booking Request</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject booking #{selectedBooking.number} for {selectedBooking.car?.name}?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this booking request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedBooking(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={processingId === selectedBooking.id}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectBooking}
                  disabled={processingId === selectedBooking.id || !rejectReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {processingId === selectedBooking.id ? (
                    <>
                      <Loader2 className="h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Reject Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default CarBookingsHostRequests;