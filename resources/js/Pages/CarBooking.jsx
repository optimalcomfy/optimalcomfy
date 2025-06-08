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
                        className="padding40 rounded-5 shadow-soft"
                        style={{backgroundColor: '#ffffff'}}
                      >
                        {/* Replace the old form with our new React component */}
                        <CarBookingForm />
                      </div>
                    </div>
                  </div>
                  <div className="spacer-double" />
                  <div className="row text-light">
                    <div className="col-lg-12">
                      <div className="container-timeline text-black">
                        <ul>
                          <li>
                            <h4 className="text-black">Choose a vehicle</h4>
                            <p>
                              Unlock unparalleled adventures and memorable journeys with our
                              vast fleet of vehicles tailored to suit every need, taste, and
                              destination.
                            </p>
                          </li>
                          <li>
                            <h4 className="text-black">Pick location &amp; date</h4>
                            <p>
                              Pick your ideal location and date, and let us take you on a
                              journey filled with convenience, flexibility, and
                              unforgettable experiences.
                            </p>
                          </li>
                          <li>
                            <h4 className="text-black">Make a booking</h4>
                            <p>
                              Secure your reservation with ease, unlocking a world of
                              possibilities and embarking on your next adventure with
                              confidence.
                            </p>
                          </li>
                          <li>
                            <h4 className="text-black">Sit back &amp; relax</h4>
                            <p>
                              Hassle-free convenience as we take care of every detail,
                              allowing you to unwind and embrace a journey filled comfort.
                            </p>
                          </li>
                        </ul>
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