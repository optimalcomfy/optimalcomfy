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
import { FaFilePdf } from 'react-icons/fa';

export default function PrivacyPolicy({ auth, laravelVersion, phpVersion }) {

  const handleDownload = () => {
    // Replace with your actual PDF file path
    const pdfUrl = '/assets/Ristay Privacy Policy.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Ristay Privacy Policy.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Ristay Privacy Policy" />
          <HomeLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              {/* Header Section */}
              <div className="text-center mb-8 relative">
                <div className="absolute top-0 right-0">
                  <Button 
                    label="Download PDF" 
                    icon={<FaFilePdf className="mr-2" />}
                    onClick={handleDownload}
                    className="p-button-outlined p-button-secondary"
                  />
                </div>
                <div className="flex items-center justify-center mb-4">
                  <h1 className="text-4xl font-bold mr-2">R</h1>
                  <div>
                    <h1 className="text-4xl font-bold">Ristay</h1>
                    <p className="text-lg">Your Ride. Your Stay.</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600">07 69 88 00 88 | 07 41 57 47 97</p>
                  <p className="text-gray-600">support@ristay.co.ke</p>
                  <p className="text-gray-600">ristay.co.ke</p>
                </div>
                <h2 className="text-2xl font-bold mb-2">Ristay Connect Limited – Privacy Policy</h2>
                <div className="flex justify-center gap-8 mb-6">
                  <p className="text-gray-600"><strong>Effective Date:</strong> June 25, 2025</p>
                  <p className="text-gray-600"><strong>Platform:</strong> www.ristay.co.ke</p>
                </div>
              </div>

              {/* Privacy Policy Content */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-bold mb-4">1. Overview</h3>
                  <p className="mb-4">
                    At Ristay, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you interact with our platform, mobile services, and partner systems.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">2. Information We Collect</h3>
                  <p className="mb-2">We may collect the following categories of information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> Name, phone number, email address, and profile picture</li>
                    <li><strong>Identification Info:</strong> KYC data (e.g., national ID or passport for verification)</li>
                    <li><strong>Transaction Data:</strong> Booking history, payment confirmations, and wallet activity</li>
                    <li><strong>Location Data:</strong> For enabling features such as map listings or geotagging</li>
                    <li><strong>Communication Logs:</strong> WhatsApp, email, and app messages exchanged on Ristay</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">3. How We Use Your Data</h3>
                  <p className="mb-2">We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Facilitate bookings, payments, and communication between guests and hosts/car owners</li>
                    <li>Verify identity and prevent fraud</li>
                    <li>Improve customer experience and platform features</li>
                    <li>Send booking confirmations, reminders, and support messages</li>
                    <li>Comply with legal obligations and security protocols</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">4. Data Sharing</h3>
                  <p className="mb-2">We may share your data with:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Payment processors:</strong> (e.g., PesaPal, Co-op, NCBA Loop, Safaricom B2C, Cryptix)</li>
                    <li><strong>Verification providers:</strong> for KYC and fraud prevention</li>
                    <li><strong>Ristay staff or agents:</strong> involved in dispute resolution or guest support</li>
                    <li><strong>Legal authorities:</strong> if required by law or to protect our users</li>
                  </ul>
                  <p className="font-medium">We do not sell your personal information to third parties.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">5. Data Retention</h3>
                  <p>
                    We retain user data for as long as necessary to fulfill legal, contractual, or operational purposes. You may request deletion of your data, subject to booking or compliance history.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">6. Security Measures</h3>
                  <p>
                    We use encryption, access restrictions, and monitoring systems to protect your personal data. While we take all reasonable precautions, no system is 100% secure.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">7. Your Rights</h3>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Access or correct your personal data</li>
                    <li>Request data deletion (where applicable)</li>
                    <li>Withdraw consent for marketing communications</li>
                  </ul>
                  <p>To exercise your rights, contact: <a href="mailto:support@ristay.co.ke" className="text-blue-600">support@ristay.co.ke</a></p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">8. Cookies & Analytics</h3>
                  <p className="mb-4">
                    We may use cookies and tracking tools (e.g., Google Analytics) to understand user behavior and improve the platform. You can control cookie settings through your browser.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">9. Policy Updates</h3>
                  <p>
                    Ristay may update this Privacy Policy periodically. Continued use of the platform means you accept the latest version, which will always be available at: <a href="https://www.ristay.co.ke" className="text-blue-600">www.ristay.co.ke</a>
                  </p>
                </section>

                {/* Footer */}
                <div className="text-center mt-12">
                  <p className="text-xl font-bold">Your Ride. Your Stay. Your Ristay.</p>
                </div>
              </div>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}