// resources/js/Pages/PaymentRedirect.jsx
import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

const PaymentRedirect = ({ success, redirect_url, booking_id, message, payment_method, booking_type = 'property' }) => {
    useEffect(() => {
        if (success && redirect_url) {
            // Redirect to Pesapal payment page
            window.location.href = redirect_url;
        }
    }, [success, redirect_url]);

    const getPaymentMethodName = () => {
        switch (payment_method) {
            case 'pesapal':
                return 'Pesapal';
            case 'mpesa':
                return 'M-Pesa';
            default:
                return 'payment';
        }
    };

    const getBookingTypeName = () => {
        switch (booking_type) {
            case 'car':
                return 'car rental';
            case 'property':
            default:
                return 'property booking';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title={`Redirecting to ${getPaymentMethodName()}`} />
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                <div className="mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Redirecting to {getPaymentMethodName()}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {message || `Please wait while we redirect you to complete your ${getBookingTypeName()} payment...`}
                    </p>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                    <p>Booking ID: <span className="font-mono">{booking_id}</span></p>
                    <p>Payment Method: <span className="font-medium">{getPaymentMethodName()}</span></p>
                </div>

                {!redirect_url && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-yellow-700 text-sm">
                            Unable to redirect automatically. Please check your payment method and try again.
                        </p>
                    </div>
                )}

                <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Preparing secure payment gateway...</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentRedirect;
