// resources/js/Pages/PaymentCancelled.jsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';

const PaymentCancelled = ({ booking, message, booking_type = 'property' }) => {
    const getBookingTypeName = () => {
        return booking_type === 'car' ? 'car rental' : 'property booking';
    };

    const getRetryRoute = () => {
        if (booking_type === 'car') {
            return route('car-bookings.create');
        } else {
            return route('bookings.create');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Payment Cancelled" />
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Payment Cancelled
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {message || `Your ${getBookingTypeName()} payment was cancelled.`}
                    </p>
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <p>Booking ID: <span className="font-mono">{booking?.number}</span></p>
                    <p>Status: <span className="font-medium text-red-500">Cancelled</span></p>
                </div>

                <div className="space-y-3">
                    <Link
                        href={getRetryRoute()}
                        className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-lg transition-all duration-200 inline-block text-center"
                    >
                        Try Again
                    </Link>

                    <Link
                        href={route('home')}
                        className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 inline-block text-center"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelled;
