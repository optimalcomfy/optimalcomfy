// resources/js/Pages/PaymentRedirect.jsx
import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

const PaymentRedirect = ({ success, redirect_url, booking_id, message, payment_method }) => {
    useEffect(() => {
        if (success && redirect_url) {
            // Redirect to Pesapal payment page
            window.location.href = redirect_url;
        }
    }, [success, redirect_url]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Head title="Redirecting to Payment" />
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Redirecting to Payment
                </h2>
                <p className="text-gray-600 mb-4">
                    {message || 'Please wait while we redirect you to the payment gateway...'}
                </p>
                <p className="text-sm text-gray-500">
                    Booking ID: {booking_id}
                </p>
                {!redirect_url && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-700">
                            Unable to redirect. Please try again.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentRedirect;
