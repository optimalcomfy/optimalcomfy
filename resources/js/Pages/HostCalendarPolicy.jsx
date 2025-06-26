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
import CarRideForm from "@/Components/CarRideForm";
import { Button } from 'primereact/button';
import { FaFilePdf } from 'react-icons/fa';

export default function RentNow({ auth, laravelVersion, phpVersion }) {

  const handleDownload = () => {
    // Replace with your actual PDF file path
    const pdfUrl = '/assets/Ristay Host Calendar Policy.docx';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Ristay Host Calendar Policy.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Ristay Host Calendar & Booking Policy" />
          <HomeLayout>
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Ristay Host Calendar & Booking Policy</h1>
                <Button 
                  label="Download Document" 
                  icon={<FaFilePdf className="mr-2" />}
                  onClick={handleDownload}
                  className="p-button-outlined p-button-secondary"
                />
              </div>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Booking Visibility & Availability</h2>
                <p className="mb-4">As a host on Ristay, you agree that all listings made available on the platform reflect accurate availability.</p>
                <p className="mb-4">To protect guest experience and platform trust, you must ensure that:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Your calendar reflects all booked or blocked dates accurately.</li>
                  <li>You notify Ristay immediately when a unit is booked outside the platform.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Blocking Dates for Offline Bookings</h2>
                <p className="mb-4">If your property or vehicle is booked directly (offline), you must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Inform the Ristay team via your host dashboard or WhatsApp channel</li>
                  <li>Provide:
                    <ul className="list-circle pl-6 mt-2">
                      <li className="mb-1">Booking dates</li>
                      <li className="mb-1">Time of check-in/check-out (if ride)</li>
                      <li>Optional: guest/driver name or basic info for coordination</li>
                    </ul>
                  </li>
                </ul>
                <p className="mb-2">Ristay will mark the listing as:</p>
                <p className="font-medium mb-4">🔒 "Unavailable – Blocked due to external booking"</p>
                <p className="text-red-600">Failure to report may result in double bookings, which can trigger penalties.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Double Booking Penalty Policy</h2>
                <p className="mb-4">To maintain reliability:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Listings that are booked on Ristay but unavailable due to unreported offline bookings will be flagged.</li>
                  <li className="mb-2">First occurrence: Warning + calendar block</li>
                  <li className="mb-2">Second occurrence: Temporary listing suspension</li>
                  <li>Repeated offenses: Permanent removal from platform + contract review</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Future Syncing Tools</h2>
                <p className="mb-4">Ristay is working to integrate calendar syncing with platforms like:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Google Calendar</li>
                  <li className="mb-2">Airbnb (via iCal)</li>
                  <li>WhatsApp-based automated calendar updates</li>
                </ul>
                <p>This will give you more control and help eliminate booking conflicts in real time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Responsibility as a Host</h2>
                <p className="mb-4">Ristay gives you full visibility and freedom — but trust is key. Keeping your calendar accurate helps us guarantee the best guest experience every time.</p>
              </section>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}