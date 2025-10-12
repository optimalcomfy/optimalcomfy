import { useEffect, useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export default function PaymentPending({ auth, laravelVersion, phpVersion }) {
    const { booking: initialBooking, message, company } = usePage().props;
    const [booking, setBooking] = useState(initialBooking);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useRef(null);

    // Calculate final amount based on referral discount
    const calculateFinalAmount = (booking, company) => {
        if (booking?.referral_code) {
            const totalPrice = parseFloat(booking.total_price) || 0;
            const referralPercentage = parseFloat(company?.booking_referral_percentage) || 0;

            const discountAmount = totalPrice * (referralPercentage / 100);
            return totalPrice - discountAmount;
        }

        return parseFloat(booking?.total_price) || 0;
    }

    const finalAmount = calculateFinalAmount(booking);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const checkPaymentStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(route('booking.payment.status', { booking: booking.id }));
            const data = await response.json();

            if (!response.ok) throw new Error('Failed to check payment status');

            setBooking(prev => ({ ...prev, ...data }));

            if (data.paid) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Payment Successful',
                    detail: 'Your payment has been processed!',
                    life: 3000
                });
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = route('bookings.show', booking.id);
                }, 3000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to check payment status. Please try again.',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkPaymentStatus();

        const interval = setInterval(() => {
            checkPaymentStatus();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Payment Pending" />
                <HomeLayout>
                    <Toast ref={toast} position="top-right" />

                    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white shadow rounded-lg p-6">
                            {message && (
                                <div className="mb-4 p-4 bg-peachDark text-white rounded">
                                    {message}
                                </div>
                            )}

                            <h1 className="text-2xl font-bold mb-4">Payment Pending</h1>

                            <div className="space-y-4">
                                {/* Price Breakdown */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3">Payment Summary</h3>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Original Amount:</span>
                                            <span>{formatCurrency(booking.total_price)}</span>
                                        </div>

                                        {/* Show referral discount if applicable */}
                                        {booking.referral_code && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Referral Discount ({company?.booking_referral_percentage || 0}%):</span>
                                                <span>- {formatCurrency(booking.total_price * (company?.booking_referral_percentage || 0) / 100)}</span>
                                            </div>
                                        )}

                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Final Amount:</span>
                                                <span>{formatCurrency(finalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Referral information */}
                                    {booking.referral_code && (
                                        <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                            <p className="text-sm text-green-700">
                                                ✅ Referral code applied: <strong>{booking.referral_code}</strong>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`px-2 py-1 rounded ml-2 ${
                                        booking.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {booking.status}
                                    </span>
                                    {isLoading && <ProgressSpinner style={{width: '20px', height: '20px'}} className="ml-2" />}
                                </div>

                                <div>
                                    <span className="font-semibold">Last Updated:</span>
                                    <span> {new Date(booking.updated_at).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded">
                                <p className="mb-2">Please complete the M-Pesa payment on your phone.</p>
                                <p className="font-semibold text-lg mb-2">Amount to pay: {formatCurrency(finalAmount)}</p>
                                <p>Status will auto-refresh every 15 seconds.</p>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button
                                    onClick={checkPaymentStatus}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-[#ffd975] hover:text-white rounded hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <ProgressSpinner style={{width: '16px', height: '16px'}} />
                                            Checking...
                                        </>
                                    ) : 'Check Payment Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}
