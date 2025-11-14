import { Head, usePage } from "@inertiajs/react";
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main';
import { Button } from 'primereact/button';

export default function PesapalPaymentSuccess({ auth, laravelVersion, phpVersion }) {
    const { booking, company, booking_type = 'property' } = usePage().props;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getBookingDetails = () => {
        if (booking_type === 'car') {
            return {
                title: booking?.car?.name,
                type: 'Car',
                viewRoute: 'car-bookings.show',
                viewParam: booking?.id
            };
        } else {
            return {
                title: booking?.property?.property_name || booking?.property?.title,
                type: 'Property',
                viewRoute: 'bookings.show',
                viewParam: booking?.id
            };
        }
    };

    const details = getBookingDetails();

    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <Head title="Payment Successful" />
                <HomeLayout>
                    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            {/* Success Icon */}
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <i className="pi pi-check text-4xl text-green-600"></i>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>

                            <div className="space-y-4 mb-6">
                                <p className="text-lg text-gray-700">
                                    Thank you for your payment. Your {details.type.toLowerCase()} booking has been confirmed.
                                </p>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Booking Details</h3>
                                    <p><strong>Booking ID:</strong> {booking?.number}</p>
                                    <p><strong>Amount Paid:</strong> {formatCurrency(booking?.total_price)}</p>
                                    <p><strong>{details.type}:</strong> {details.title}</p>
                                    {booking_type === 'car' && booking?.car && (
                                        <p><strong>License Plate:</strong> {booking.car.license_plate}</p>
                                    )}
                                    <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Confirmed</span></p>
                                </div>

                                <p className="text-gray-600">
                                    A confirmation email has been sent to your email address.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    label={`View ${details.type} Booking Details`}
                                    icon="pi pi-eye"
                                    onClick={() => window.location.href = route(details.viewRoute, details.viewParam)}
                                    className="p-button-success"
                                />
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
