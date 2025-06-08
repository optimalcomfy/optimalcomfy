import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import { LayoutContext, LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import CarBookingForm from "@/Components/CarBookingForm"; // Import the new component
import '../../css/main';

export default function CarBooking({ auth, laravelVersion, phpVersion }) {
  const { flash, pagination } = usePage().props;
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Car Booking" />
          <HomeLayout>
            <div className="no-bottom no-top py-10" id="content">
              <section
                id="section-hero"
                aria-label="section"
                className="no-top py-10"
              >
                <div className="container py-24">
                  <div className="row align-items-center">
                    <div className="col-lg-12 xs:-mt-4 lg:-mt-20 sm-mt-0">
                      <div className="spacer-single sm-hide" />
                      <div
                        id="booking_form_wrap"
                        className="rounded-5 shadow-soft"
                        style={{backgroundColor: '#ffffff'}}
                      >
                        {/* Replace the old form with our new React component */}
                        <CarBookingForm />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}