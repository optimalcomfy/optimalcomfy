import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { 
  FaArrowLeft, 
  FaCreditCard, 
  FaPhone, 
  FaSpinner, 
  FaCheck, 
  FaShieldAlt, 
  FaBolt, 
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHome,
  FaMoneyBillWave
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const PayBooking = () => {
    const { booking, auth, company } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [phone, setPhone] = useState(booking.guest_phone || auth.user?.phone || '');

    // Calculate referral discount if applicable
    const calculateReferralDiscount = () => {
        if (!booking.referral_code || !company) return 0;
        return (booking.total_price * company.booking_referral_percentage) / 100;
    };

    const referralDiscount = calculateReferralDiscount();
    const finalAmount = Math.ceil(booking.total_price - referralDiscount);
    
    // Calculate nights
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24)));

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);

        if (paymentMethod === 'mpesa' && !phone) {
            Swal.fire({
                icon: 'error',
                title: 'Phone Required',
                text: 'Please enter your phone number for M-Pesa payment.',
            });
            setProcessing(false);
            return;
        }

        try {
            const formData = {
                payment_method: paymentMethod,
                phone: paymentMethod === 'mpesa' ? phone : null,
            };

            router.post(route('bookings.process-payment', booking.id), formData, {
                preserveScroll: true,
                onSuccess: (response) => {
                    if (response.props.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Initiated',
                            text: 'Payment has been successfully initiated.',
                        });
                    }
                },
                onError: (errors) => {
                    let errorMessage = 'Payment processing failed.';
                    
                    if (errors.payment) {
                        errorMessage = errors.payment;
                    } else if (errors.phone) {
                        errorMessage = errors.phone;
                    }
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Failed',
                        text: errorMessage,
                    });
                },
            });
        } catch (error) {
            console.error('Payment error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Layout>
            <Head title={`Pay for Booking ${booking.number}`} />
            
            <div className="max-w-7xl p-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-center mb-6 gap-4">
                    <Link
                        href={route('bookings.show', booking.id)}
                        className="flex items-center text-peachDark mr-4"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Booking
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Complete Payment for Booking</h1>
                    <p className="text-gray-600 text-lg">Booking #{booking.number}</p>
                </div>

                {booking.status === 'Paid' && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
                        <div className="flex items-center gap-3">
                            <FaCheck className="h-5 text-green-500" />
                            <div>
                                <p className="font-medium text-green-800">Payment Already Processed</p>
                                <p className="text-green-700">This booking has already been paid for.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Payment Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Select Payment Method
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* M-Pesa Option */}
                                    <div
                                        className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${paymentMethod === 'mpesa' 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setPaymentMethod('mpesa')}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FaPhone className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-xl">M-Pesa</h3>
                                                <p className="text-sm text-gray-600">Pay via Mobile Money</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'mpesa' && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <div className="flex gap-1">
                                                    <div className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50">
                                                        +254
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        value={phone.replace(/^254/, '')}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            setPhone('254' + value);
                                                        }}
                                                        className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        placeholder="712345678"
                                                        maxLength="9"
                                                        inputMode="numeric"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the phone number you'll use for M-Pesa
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pesapal Option */}
                                    <div
                                        className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${paymentMethod === 'pesapal' 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setPaymentMethod('pesapal')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <FaCreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-xl">Pesapal</h3>
                                                <p className="text-sm text-gray-600">Credit/Debit Card, Bank Transfer</p>
                                            </div>
                                        </div>
                                        {paymentMethod === 'pesapal' && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                                <p className="text-sm text-green-700">
                                                    You'll be redirected to Pesapal's secure payment page.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Security Note */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <FaShieldAlt className="h-5 w-5 text-blue-600" />
                                        <div className="text-sm">
                                            <p className="font-medium text-blue-800">Secure Payment</p>
                                            <p className="text-blue-700 mt-1">
                                                All payments are encrypted and processed securely.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handlePayment}
                                disabled={processing || (paymentMethod === 'mpesa' && !phone) || booking.status === 'Paid'}
                                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                    booking.status === 'Paid' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-peachDark hover:bg-peachDarker'
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : booking.status === 'Paid' ? (
                                    <>
                                        <FaCheck className="h-5 w-5" />
                                        Already Paid
                                    </>
                                ) : (
                                    <>
                                        <FaCreditCard className="h-5 w-5" />
                                        {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Pay with Pesapal'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                            {/* Status Banner */}
                            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FaClock className="h-4 w-4 text-yellow-600" />
                                    <p className="text-sm font-medium text-yellow-800">
                                        Payment Required to Confirm Booking
                                    </p>
                                </div>
                            </div>

                            {/* Property Info */}
                            <div className="flex gap-4 mb-6">
                                {booking.property?.initial_gallery?.[0] && (
                                    <img
                                        src={`/storage/${booking.property.initial_gallery[0].image}`}
                                        alt={booking.property.property_name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-xl">
                                        {booking.property?.property_name}
                                    </h3>
                                    <div className="mt-2 flex items-center text-gray-600 text-sm">
                                        <FaMapMarkerAlt className="mr-1" />
                                        <span>{booking.property?.location}</span>
                                    </div>
                                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs">
                                        {nights} night{nights !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-xl">
                                    <FaCalendarAlt /> Booking Dates
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Check-in</span>
                                        <span className="text-sm font-medium">
                                            {new Date(booking.check_in_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Check-out</span>
                                        <span className="text-sm font-medium">
                                            {new Date(booking.check_out_date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 border-t border-gray-200 pt-6">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-xl">
                                    <FaMoneyBillWave /> Price Details
                                </h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Base Price</span>
                                        <span>KES {booking.total_price.toLocaleString()}</span>
                                    </div>
                                    
                                    {referralDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Referral Discount</span>
                                            <span>- KES {referralDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Amount</span>
                                        <span className="font-bold text-lg">KES {finalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                                <p className="text-sm text-blue-700 mb-3">
                                    Having trouble with payment? Contact our support team.
                                </p>
                                <a
                                    href={`tel:${company?.phone || '+254700000000'}`}
                                    className="inline-block w-full text-center py-2 bg-peachDark text-white rounded-lg hover:bg-peachDarker transition-colors text-sm font-medium"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PayBooking;