import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Shield, Loader2, Check, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import Layout from "@/Layouts/layout/layout.jsx";

const CarBookingPay = () => {
  const { booking, auth, company } = usePage().props;
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const calculateDays = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
  };

  const days = calculateDays();
  
  // Calculate final amount with referral discount
  let finalAmount = parseFloat(booking.total_price);
  if (booking.referral_code && company) {
    const discount = finalAmount * (company.booking_referral_percentage / 100);
    finalAmount = finalAmount - discount;
  }
  finalAmount = Math.ceil(finalAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone && paymentMethod === 'mpesa') {
      Swal.fire({
        icon: 'error',
        title: 'Phone Required',
        text: 'Please enter your phone number for M-Pesa payment.',
        confirmButtonColor: '#f97316',
      });
      return;
    }

    setProcessing(true);

    try {
      await router.post(route('car-bookings.process-payment', booking.id), {
        payment_method: paymentMethod,
        phone: phone
      }, {
        onSuccess: (response) => {
          if (paymentMethod === 'pesapal' && response.props.redirect_url) {
            window.open(response.props.redirect_url, 'pesapal_payment', 'width=800,height=600,scrollbars=yes');
            
            Swal.fire({
              icon: 'success',
              title: 'Redirecting to Pesapal',
              text: 'Please complete your payment in the new window.',
              confirmButtonColor: '#f97316',
            });
          } else if (paymentMethod === 'mpesa') {
            Swal.fire({
              icon: 'success',
              title: 'Payment Initiated',
              text: 'Please complete the M-Pesa payment on your phone.',
              confirmButtonColor: '#10b981',
            }).then(() => {
              window.location.href = route('dashboard');
            });
          }
        },
        onError: (errors) => {
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: errors.payment || 'Payment processing failed. Please try again.',
            confirmButtonColor: '#ef4444',
          });
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
    <div className="">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={route('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600">Complete payment to confirm your car booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Confirmation Alert */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 text-green-800">
                  <Check className="h-5" />
                  <div>
                    <p className="font-medium">Booking Approved!</p>
                    <p className="text-sm">Your booking request has been approved by the host. Please complete payment to confirm.</p>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Car</p>
                    <p className="font-medium">{booking.car.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">License Plate</p>
                    <p className="font-medium">{booking.car.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pickup Date</p>
                    <p className="font-medium">{formatDate(booking.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Return Date</p>
                    <p className="font-medium">{formatDate(booking.end_date)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* M-Pesa Option */}
                  <div
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      paymentMethod === 'mpesa'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('mpesa')}
                  >
                    <div className="flex items-center gap-3">
                      <img src="/image/mpesa.jpg" className="h-8" alt="M-Pesa" />
                      <div>
                        <p className="font-medium">M-Pesa</p>
                        <p className="text-sm text-gray-600">Pay with mobile money</p>
                      </div>
                    </div>
                  </div>

                  {/* Pesapal Option */}
                  <div
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      paymentMethod === 'pesapal'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('pesapal')}
                  >
                    <div className="flex items-center gap-3">
                      <img src="/image/pesapal.png" className="h-8" alt="Pesapal" />
                      <div>
                        <p className="font-medium">Pesapal</p>
                        <p className="text-sm text-gray-600">Pay with card or bank</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Number for M-Pesa */}
              {paymentMethod === 'mpesa' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex gap-1">
                    <div className="border rounded-tl-lg px-3 border-gray-300 rounded-bl-lg flex items-center pointer-events-none text-gray-500 bg-gray-50">
                      +254
                    </div>
                    <input
                      type="tel"
                      value={phone.replace(/^254/, '')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPhone('254' + value);
                      }}
                      placeholder="712345678"
                      pattern="[0-9]{9}"
                      maxLength="9"
                      required
                      inputMode="numeric"
                      className="pl-2 w-full px-4 py-3 rounded-tr-lg border-gray-300 rounded-br-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter your 9-digit phone number after 254</p>
                </div>
              )}

              {/* Security Badge */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 text-blue-800">
                  <Shield className="h-5" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-sm">Your payment is protected with encryption</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5" />
                      {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Pay with Pesapal'}
                    </>
                  )}
                </button>
                
                {paymentMethod === 'pesapal' && (
                  <p className="text-sm text-gray-600 text-center mt-3">
                    You will be redirected to Pesapal to complete your payment securely.
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="font-medium">
                    KES {(parseFloat(booking.total_price) / days).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                
                {booking.referral_code && company && (
                  <div className="flex justify-between text-green-600">
                    <span>Referral Discount ({company.booking_referral_percentage}%)</span>
                    <span>- KES {(parseFloat(booking.total_price) * (company.booking_referral_percentage / 100)).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>KES {finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3 text-amber-800">
                  <AlertCircle className="h-5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="space-y-1">
                      <li>• Booking will be confirmed after successful payment</li>
                      <li>• 48-hour cancellation policy applies</li>
                      <li>• Refunds processed within 5-7 business days</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Need help with payment? Contact support at{' '}
                  <a href="mailto:support@ristay.com" className="text-orange-500 hover:underline">
                    support@ristay.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default CarBookingPay;