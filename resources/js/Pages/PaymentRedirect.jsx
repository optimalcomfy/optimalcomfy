// resources/js/Pages/PaymentRedirect.jsx
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';

const PaymentRedirect = ({
    success,
    redirect_url,
    booking_id,
    message,
    payment_method,
    booking_type = 'property'
}) => {
    const [countdown, setCountdown] = useState(5);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (success && redirect_url) {
            // Start countdown before redirect
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Redirect to Pesapal payment page
                        window.location.href = redirect_url;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else if (!redirect_url) {
            setError('No redirect URL provided. Please contact support.');
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

    const handleManualRedirect = () => {
        if (redirect_url) {
            window.location.href = redirect_url;
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

                    {countdown > 0 && redirect_url && (
                        <p className="text-sm text-orange-600 mb-2">
                            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </p>
                    )}
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p>Booking ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{booking_id}</span></p>
                    <p>Payment Method: <span className="font-medium text-gray-700">{getPaymentMethodName()}</span></p>
                    <p>Booking Type: <span className="font-medium text-gray-700 capitalize">{getBookingTypeName()}</span></p>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                        <p className="text-red-700 text-sm">
                            {error}
                        </p>
                    </div>
                )}

                {!redirect_url && !error && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                        <p className="text-yellow-700 text-sm">
                            Preparing payment gateway. Please wait...
                        </p>
                    </div>
                )}

                {redirect_url && (
                    <div className="mt-4">
                        <button
                            onClick={handleManualRedirect}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Click here if not redirected automatically
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Secure connection to {getPaymentMethodName()}...
                    </p>
                </div>

                {/* Security Badge */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Secure Payment Gateway</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRedirect;
