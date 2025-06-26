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

export default function TermsAndConditions({ auth, laravelVersion, phpVersion }) {

  const handleDownload = () => {
    // Replace with your actual PDF file path
    const pdfUrl = '/assets/Ristay Terms & Conditions.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Ristay Terms & Conditions.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Ristay Terms & Conditions" />
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
                  <p className="text-gray-600">support@ristay.co.ke</p>
                  <p className="text-gray-600">07 69 88 00 88 | 07 41 57 47 97</p>
                </div>
                <h2 className="text-2xl font-bold mb-2">Ristay Connect Limited - Terms & Conditions</h2>
                <div className="flex justify-center gap-8 mb-6">
                  <p className="text-gray-600"><strong>Effective Date:</strong> June 25, 2025</p>
                  <p className="text-gray-600"><strong>Platform:</strong> www.ristay.co.ke</p>
                </div>
              </div>

              {/* Terms Content */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-bold mb-4">1. Introduction & Scope</h3>
                  <p className="mb-4">
                    By accessing or using Ristay, you agree to these Terms & Conditions. Ristay Connect Limited ("Ristay", "we", "us") operates a digital marketplace that connects guests with independent hosts (for stays) and car owners (for rides). We are not the provider of any property or vehicle listed on the platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">2. Account Registration</h3>
                  <p>
                    To book or list on Ristay, users must create an account and provide accurate, current information. Each user is responsible for maintaining the confidentiality and security of their account credentials.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">3. Platform Role & Listings</h3>
                  <p className="mb-4">
                    Ristay does not verify property ownership. Listings may be created by hosts, agents, or authorized parties. However, we verify listings against platform standards (e.g., photo checks, KYC, reviews) and may tag listings as "Ristay Verified" to increase guest confidence.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">4. Booking & Payments</h3>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Bookings are made via the Ristay platform or secure payment links.</li>
                    <li>All payments are processed through licensed third-party providers (e.g., PesaPal, Co-op, NCBA Loop, Safaricom B2C, Cryptix).</li>
                    <li>Ristay collects booking fees and disburses host/owner payouts after check-in.</li>
                  </ul>
                  <div className="pl-6">
                    <p className="font-semibold">Commission Rates:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>15% on bookings made through the platform</li>
                      <li>18% on Ristay-managed listings</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">5. Cancellations & Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Each listing follows the host's selected cancellation policy (flexible, moderate, or strict).</li>
                    <li>Refunds are issued based on that policy.</li>
                    <li>Ristay's service fee may be non-refundable.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">6. Host & Car Owner Responsibilities</h3>
                  <p className="mb-2">Hosts and car owners agree to:</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Ensure listings remain accurate and updated</li>
                    <li>Keep properties or vehicles clean, safe, and guest-ready</li>
                    <li>Respond promptly to guest inquiries and bookings</li>
                    <li>Provide clear check-in instructions or meet guests where required</li>
                    <li>Keep their availability calendar updated, including blocking out dates for offline or external bookings (e.g., Airbnb)</li>
                  </ul>
                  <p>Ristay is not responsible for misrepresentation or guest issues arising from outdated listing information.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">7. Guest Responsibilities</h3>
                  <p className="mb-2">Guests must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Treat all properties and vehicles with care and respect</li>
                    <li>Follow host/owner rules and communicate proactively</li>
                    <li>Avoid illegal use, parties, or damaging behavior</li>
                    <li>Observe check-in and check-out times</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">8. Disclaimers & Liability</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ristay is a connector, not the owner, operator, or insurer of listings.</li>
                    <li>We are not liable for disputes, injuries, damage, or losses during bookings.</li>
                    <li>Ristay may assist with disputes but does not guarantee resolutions or reimbursements.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-4">9. Modifications to Terms</h3>
                  <p>
                    Ristay may update these Terms from time to time. Continued use of the platform signifies acceptance of any changes. The latest version will always be available on www.ristay.co.ke.
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