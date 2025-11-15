import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import { LayoutContext, LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main';
import CarExtendPayForm from "@/Components/CarExtendPayForm";

export default function CarExtendBooking({ auth, laravelVersion, phpVersion, extension_data }) {
  const { flash, pagination } = usePage().props;

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Extend Car Rental" />
          <HomeLayout>
            <div className="no-bottom no-top py-10" id="content">
              <section
                id="section-hero"
                aria-label="section"
                className="no-top py-10"
              >
                <div className="container lg:py-24">
                  <div className="row align-items-center">
                    <div className="col-lg-12 xs:-mt-4 lg:-mt-20 sm-mt-0">
                      <div className="spacer-single sm-hide" />
                      <div
                        id="booking_form_wrap"
                        className="rounded-5 shadow-soft"
                        style={{backgroundColor: '#ffffff'}}
                      >
                        <CarExtendPayForm extension_data={extension_data} />
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
