import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main';
import { Button } from 'primereact/button';

export default function PesapalPaymentFailed({ auth, laravelVersion, phpVersion }) {
    const { booking, error, company } = usePage().props;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Payment Failed" />
                <HomeLayout>
                    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            {/* Failure Icon */}
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <i className="pi pi-times text-4xl text-red-600"></i>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h1>

                            <div className="space-y-4 mb-6">
                                <p className="text-lg text-gray-700">
                                    {error || 'Your payment was not completed successfully.'}
                                </p>

                                {booking && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Booking Details</h3>
                                        <p><strong>Booking ID:</strong> {booking?.number}</p>
                                        <p><strong>Amount:</strong> {formatCurrency(booking?.total_price)}</p>
                                        <p><strong>Property:</strong> {booking?.property?.title}</p>
                                        <p><strong>Status:</strong> <span className="text-red-600 font-semibold">Payment Failed</span></p>
                                    </div>
                                )}

                                <p className="text-gray-600">
                                    Please try again or contact support if the problem persists.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    label="Back to Home"
                                    icon="pi pi-home"
                                    onClick={() => window.location.href = route('home')}
                                    className="p-button-secondary"
                                />
                            </div>
                        </div>
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}
