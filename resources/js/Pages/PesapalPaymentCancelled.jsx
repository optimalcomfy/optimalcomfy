import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main';
import { Button } from 'primereact/button';

export default function PesapalPaymentCancelled({ auth, laravelVersion, phpVersion }) {
    const { error, company } = usePage().props;

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Payment Cancelled" />
                <HomeLayout>
                    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            {/* Cancelled Icon */}
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <i className="pi pi-times text-4xl text-red-600"></i>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>

                            <div className="space-y-4 mb-6">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                )}

                                <p className="text-lg text-gray-700">
                                    Your payment was not completed. You can try again or contact support if you need assistance.
                                </p>

                                <p className="text-gray-600">
                                    No amount has been deducted from your account.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    label="Try Again"
                                    icon="pi pi-refresh"
                                    onClick={() => window.history.back()}
                                    className="p-button-warning"
                                />
                                <Button
                                    label="Back to Home"
                                    icon="pi pi-home"
                                    onClick={() => window.location.href = route('home')}
                                    className="p-button-secondary"
                                />
                                <Button
                                    label="Contact Support"
                                    icon="pi pi-envelope"
                                    onClick={() => window.location.href = 'mailto:' + (company?.email || 'support@example.com')}
                                    className="p-button-help"
                                />
                            </div>
                        </div>
                    </div>
                </HomeLayout>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}
