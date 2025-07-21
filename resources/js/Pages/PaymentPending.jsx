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
    const { booking: initialBooking, message } = usePage().props;
    const [booking, setBooking] = useState(initialBooking);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useRef(null);

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
                                <div>
                                    <span className="font-semibold">Amount:</span>
                                    <span> {formatCurrency(booking.total_price)}</span>
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
                                
                                <Link 
                                    href={route('bookings.show', booking.id)} 
                                    className="px-4 py-2 bg-[#0d3c46] text-white rounded hover:bg-gray-700"
                                >
                                    View Booking Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}