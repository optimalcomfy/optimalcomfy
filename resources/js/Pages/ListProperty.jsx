import { useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'
import { Button } from 'primereact/button';
import { FaCar, FaHome, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';

export default function ListProperty({ auth, laravelVersion, phpVersion }) {

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="List Your Property - Ristay" />
          <HomeLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              {/* Header Section */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-[#0d3c46] text-white rounded-full w-16 h-16 flex items-center justify-center mr-4">
                    <h1 className="text-3xl font-bold text-[#da5029]">R</h1>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-[#0d3c46]">Ristay</h1>
                    <p className="text-lg text-[#da5029] font-medium">Your Ride. Your Stay.</p>
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-[#0d3c46] mb-6">Start Earning with Ristay</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Choose how you'd like to share with travelers. List your vehicle for rides or your property for stays -
                  we make it simple to connect and earn.
                </p>
              </div>

              {/* Options Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Ride Option */}
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#0d3c46]"></div>
                  <div className="p-4 lg:p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#0d3c46] p-3 rounded-xl mr-4">
                        <FaCar className="text-white text-2xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0d3c46]">List Your Ride</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-lg">
                      Turn your vehicle into an earning opportunity. Perfect for car owners looking to provide reliable transportation services.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <div className="bg-[#0d3c46] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Reach travelers needing transportation across Kenya</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#0d3c46] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Set your own schedule, rates, and service areas</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#0d3c46] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Secure payments with our trusted partners</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#0d3c46] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">24/7 support and insurance coverage</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        href={route('main-cars.create')}
                        className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#0d3c46] text-white rounded-xl hover:bg-[#0a2f38] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                      >
                        List Your Vehicle
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stay Option */}
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#da5029]"></div>
                  <div className="p-4 lg:p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#da5029] p-3 rounded-xl mr-4">
                        <FaHome className="text-white text-2xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#0d3c46]">List Your Stay</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-lg">
                      Welcome travelers to your space. Ideal for homeowners, apartment owners, or property managers with available accommodation.
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start">
                        <div className="bg-[#da5029] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Connect with guests seeking unique accommodations</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#da5029] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Full control over availability, pricing, and house rules</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#da5029] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Guaranteed payments with our secure system</span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-[#da5029] text-white rounded-full p-1 mt-1 mr-3">
                          <FaArrowRight className="text-xs" />
                        </div>
                        <span className="text-gray-700">Verified guest profiles and review system</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        href={route('properties.create')}
                        className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#da5029] text-white rounded-xl hover:bg-[#c34623] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
                      >
                        List Your Property
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-gradient-to-r from-[#0d3c46] to-[#1a5c6b] rounded-2xl p-4 lg:p-8 mb-12 text-white">
                <div className="flex items-start">
                  <FaQuestionCircle className="text-white text-2xl mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-[#da5029]">Not Sure Which to Choose?</h3>
                    <p className="text-white/90 mb-6 text-lg">
                      Here's a quick guide to help you decide the best option for your needs:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold text-lg mb-3 border-b border-white/30 pb-2 text-[#da5029]">Perfect for Rides if:</h4>
                        <ul className="space-y-2 text-white/90">
                          <li className="flex items-start">
                            <span>You have a reliable, well-maintained vehicle</span>
                          </li>
                          <li className="flex items-start">
                            <span>Flexible schedule for driving opportunities</span>
                          </li>
                          <li className="flex items-start">
                            <span>Valid license, insurance, and required documents</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-3 border-b border-white/30 pb-2 text-[#da5029]">Ideal for Stays if:</h4>
                        <ul className="space-y-2 text-white/90">
                          <li className="flex items-start">
                            <span>You have extra space or a vacant property</span>
                          </li>
                          <li className="flex items-start">
                            <span>Can provide basic amenities and comfort</span>
                          </li>
                          <li className="flex items-start">
                            <span>Property is in a desirable or accessible location</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="text-center border-t border-gray-200 pt-12">
                <p className="text-gray-600 mb-4">
                  Ready to start your hosting journey? Choose an option above or
                </p>
                <p className="text-sm text-gray-500">
                  Questions? Contact us at <a href="mailto:support@ristay.co.ke" className="text-[#da5029] hover:underline font-medium">support@ristay.co.ke</a> or call <span className="text-[#0d3c46] font-medium">07 69 88 00 88</span>
                </p>
              </div>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
